# Task 4 / Project 1 — Role-Based User Management API

User management API with **role-based access control** built on
**Express + Mongoose + MongoDB + JWT**. Users have a `role` (`user` / `admin`).
Admin-only routes are protected by a role-check middleware that reads the role
from the authenticated user. Admins can list, block/unblock, promote/demote, and
delete users. Every admin action is recorded in an **audit log**.

## Tech Stack

- Node.js + Express
- MongoDB + Mongoose
- bcryptjs + jsonwebtoken
- dotenv

## Project Structure

```
Project-1/
├── config/db.js
├── controllers/
│   ├── authController.js    # signup / login / me
│   └── adminController.js   # user management + audit log
├── middleware/
│   ├── authMiddleware.js    # protect (JWT, blocks blocked users)
│   ├── authorize.js         # authorize(...roles) RBAC
│   └── errorHandler.js
├── models/
│   ├── User.js              # role, isBlocked
│   └── AuditLog.js
├── routes/
│   ├── authRoutes.js
│   └── adminRoutes.js
├── utils/
│   ├── generateToken.js
│   └── audit.js
├── .env / .env.example
├── package.json
└── server.js
```

## Setup

1. `npm install`
2. Ensure **MongoDB is running locally**.
3. Copy `.env.example` to `.env`:
   ```
   PORT=5009
   MONGO_URI=mongodb://localhost:27017/syntecxhub_rbac
   JWT_SECRET=change_this_to_a_long_random_secret
   JWT_EXPIRES_IN=1h
   ADMIN_SECRET=super_admin_bootstrap_secret
   ```
4. `npm start`  (or `npm run dev`)

Server runs at `http://localhost:5009`.

## Roles & bootstrapping an admin

- New signups default to `role: "user"`.
- To create the **first admin**, sign up with `role: "admin"` **and** the matching
  `adminSecret` (the `ADMIN_SECRET` env value). After that, existing admins can
  promote others via `/admin/users/:id/promote`.

## Endpoints

Base URL: `http://localhost:5009`

| Method | Route                          | Access | Description                  |
|--------|--------------------------------|--------|------------------------------|
| POST   | `/auth/signup`                 | public | Register (admin via secret)  |
| POST   | `/auth/login`                  | public | Login → JWT                  |
| GET    | `/auth/me`                     | auth   | Current user profile         |
| GET    | `/admin/users`                 | admin  | List users (`?role=`,`?blocked=`) |
| GET    | `/admin/users/:id`             | admin  | Get a user                   |
| PATCH  | `/admin/users/:id/block`       | admin  | Block a user                 |
| PATCH  | `/admin/users/:id/unblock`     | admin  | Unblock a user               |
| PATCH  | `/admin/users/:id/promote`     | admin  | Promote to admin             |
| PATCH  | `/admin/users/:id/demote`      | admin  | Demote to user               |
| DELETE | `/admin/users/:id`             | admin  | Delete a user                |
| GET    | `/admin/audit`                 | admin  | View admin action audit log  |

### Access control & safeguards

- `protect` verifies the JWT; **blocked users are rejected (403)** everywhere.
- `authorize('admin')` returns **403** if a non-admin hits an admin route.
- Admins **cannot block, demote, or delete their own account** (avoids lockout).

### Status codes

- `200` success · `201` created · `400` invalid input/id/self-action ·
  `401` missing/invalid token · `403` forbidden (role/blocked/expired) ·
  `404` user not found · `409` duplicate

### Example flow

```bash
# bootstrap admin
curl -X POST http://localhost:5009/auth/signup -H "Content-Type: application/json" -d '{
  "username":"admin1","email":"admin1@example.com","password":"secret123",
  "role":"admin","adminSecret":"super_admin_bootstrap_secret"
}'

# login -> token, then manage users
TOKEN=$(curl -s -X POST http://localhost:5009/auth/login -H "Content-Type: application/json" \
  -d '{"identifier":"admin1@example.com","password":"secret123"}' | jq -r .token)
curl http://localhost:5009/admin/users -H "Authorization: Bearer $TOKEN"
```

---

_Environment: Node 24, npm 11._
