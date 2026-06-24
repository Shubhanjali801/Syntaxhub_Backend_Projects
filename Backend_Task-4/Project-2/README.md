# Task 4 / Project 2 — Activity Log / Audit Trail API

An **audit trail API** built on **Express + Mongoose + MongoDB + JWT**. Whenever a
sensitive action happens (user create/update/delete, block/unblock, login) the API
records **who** did **what**, to **which** resource, and **when** — in a dedicated
MongoDB `auditlogs` collection. Each log can be **linked back to the original
resource** (dynamic `refPath`). The log-fetching endpoints are **admin-only** and
support filtering by **user, action, status, target, and date range**, with paging.

## Tech Stack

- Node.js + Express
- MongoDB + Mongoose
- bcryptjs + jsonwebtoken
- dotenv

## Project Structure

```
Project-2/
├── config/db.js
├── controllers/
│   ├── authController.js     # signup / login / me  (CREATE_USER, LOGIN logged)
│   ├── userController.js     # sensitive user actions (update/block/delete) — each logged
│   └── auditController.js    # fetch logs with filters + paging, single log, stats
├── middleware/
│   ├── authMiddleware.js     # protect (JWT, blocks blocked users)
│   ├── authorize.js          # authorize(...roles) RBAC
│   └── errorHandler.js
├── models/
│   ├── User.js               # role, isBlocked
│   └── AuditLog.js           # actor / action / target (refPath) / changes / when
├── routes/
│   ├── authRoutes.js
│   ├── userRoutes.js         # admin-only
│   └── auditRoutes.js        # admin-only
├── utils/
│   ├── generateToken.js
│   └── audit.js              # logAction() helper (who/what/which + request context)
├── .env / .env.example
├── package.json
└── server.js
```

## Setup

1. `npm install`
2. Ensure **MongoDB is running locally**.
3. Copy `.env.example` to `.env`:
   ```
   PORT=5010
   MONGO_URI=mongodb://localhost:27017/syntecxhub_audit
   JWT_SECRET=change_this_to_a_long_random_secret
   JWT_EXPIRES_IN=1h
   ADMIN_SECRET=super_admin_bootstrap_secret
   ```
4. `npm start`  (or `npm run dev`)

Server runs at `http://localhost:5010`.

## What gets logged

Every audit entry stores: `actor` + `actorUsername` (who), `action` + `status`
(what), `targetModel` + `target` + `targetLabel` (which resource — `target` is a
dynamic reference back to the original document), an optional `changes` diff
(`{ before, after }`), plus `ip` / `method` / `path` and `createdAt` (when).

Recorded actions: `CREATE_USER`, `UPDATE_USER`, `DELETE_USER`, `BLOCK_USER`,
`UNBLOCK_USER`, `LOGIN`.

## Bootstrapping an admin

- New signups default to `role: "user"`.
- To create the **first admin**, sign up with `role: "admin"` **and** the matching
  `adminSecret` (the `ADMIN_SECRET` env value).

## Endpoints

Base URL: `http://localhost:5010`

| Method | Route                     | Access | Description                          |
|--------|---------------------------|--------|--------------------------------------|
| POST   | `/auth/signup`            | public | Register (admin via secret) → logs `CREATE_USER` |
| POST   | `/auth/login`             | public | Login → JWT → logs `LOGIN`           |
| GET    | `/auth/me`                | auth   | Current user profile                 |
| GET    | `/users`                  | admin  | List users                           |
| GET    | `/users/:id`              | admin  | Get a user                           |
| PATCH  | `/users/:id`              | admin  | Update user → logs `UPDATE_USER`     |
| PATCH  | `/users/:id/block`        | admin  | Block user → logs `BLOCK_USER`       |
| PATCH  | `/users/:id/unblock`      | admin  | Unblock user → logs `UNBLOCK_USER`   |
| DELETE | `/users/:id`              | admin  | Delete user → logs `DELETE_USER`     |
| GET    | `/audit`                  | admin  | Fetch logs (filters + paging)        |
| GET    | `/audit/stats`            | admin  | Counts grouped by action             |
| GET    | `/audit/:id`              | admin  | Single log (actor/target expanded)   |

### Fetching logs — query parameters (`GET /audit`)

| Param         | Example                       | Effect                                  |
|---------------|-------------------------------|-----------------------------------------|
| `user`        | `?user=<userId>`              | Filter by actor (who)                   |
| `action`      | `?action=DELETE_USER`         | Filter by action (what)                 |
| `status`      | `?status=SUCCESS`             | Filter by outcome                       |
| `targetModel` | `?targetModel=User`           | Filter by resource type                 |
| `target`      | `?target=<docId>`             | Logs for one specific resource          |
| `from` / `to` | `?from=2026-06-01&to=2026-06-24` | Date range on `createdAt` (`to` is inclusive of the whole day) |
| `page`/`limit`| `?page=2&limit=20`            | Pagination (limit max 100)              |
| `populate`    | `?populate=true`              | Expand `actor` and `target` references  |

### Access control & safeguards

- `protect` verifies the JWT; **blocked users are rejected (403)** everywhere.
- `authorize('admin')` returns **403** if a non-admin hits `/users` or `/audit`.
- Admins **cannot block or delete their own account** (avoids lockout).
- Audit writes are best-effort — a logging failure never breaks the main request.

### Status codes

- `200` success · `201` created · `400` invalid input/id/date ·
  `401` missing/invalid token · `403` forbidden (role/blocked/expired) ·
  `404` not found · `409` duplicate

### Example flow

```bash
# bootstrap admin
curl -X POST http://localhost:5010/auth/signup -H "Content-Type: application/json" -d '{
  "username":"admin1","email":"admin1@example.com","password":"secret123",
  "role":"admin","adminSecret":"super_admin_bootstrap_secret"
}'

# login -> token
TOKEN=$(curl -s -X POST http://localhost:5010/auth/login -H "Content-Type: application/json" \
  -d '{"identifier":"admin1@example.com","password":"secret123"}' | jq -r .token)

# perform a sensitive action (creates an audit entry)
curl -X DELETE http://localhost:5010/users/<userId> -H "Authorization: Bearer $TOKEN"

# read the audit trail, filtered
curl "http://localhost:5010/audit?action=DELETE_USER&populate=true" -H "Authorization: Bearer $TOKEN"
```

---

_Environment: Node 24, npm 11._
