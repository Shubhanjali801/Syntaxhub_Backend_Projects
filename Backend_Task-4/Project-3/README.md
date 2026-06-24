# Task 4 / Project 3 — Scheduled Tasks API

A **scheduled jobs API** built on **Express + Mongoose + MongoDB + node-cron**.
Background jobs run on cron schedules — **delete stale records** and **send a daily
email summary** (mocked). Every run is wrapped with timing + error catching and
recorded in a `joblogs` collection. Admins can **list** the registered jobs, **trigger**
any of them manually, and read the **execution history** (success / failure).

## Tech Stack

- Node.js + Express
- MongoDB + Mongoose
- node-cron (job scheduling)
- bcryptjs + jsonwebtoken
- dotenv

## Project Structure

```
Project-3/
├── config/db.js
├── controllers/
│   ├── authController.js     # signup / login / me
│   ├── recordController.js   # create/list/delete records (job input data)
│   └── jobController.js      # list jobs, trigger manually, read logs
├── jobs/
│   ├── deleteStaleRecords.js # job: remove expired/old records
│   ├── sendEmailSummary.js   # job: compose + (mock) send summary
│   ├── registry.js           # catalogue: name + schedule + handler
│   └── scheduler.js          # registers jobs with node-cron
├── middleware/
│   ├── authMiddleware.js     # protect (JWT, blocks blocked users)
│   ├── authorize.js          # authorize(...roles) RBAC
│   └── errorHandler.js
├── models/
│   ├── User.js
│   ├── Record.js             # the resource jobs operate on
│   └── JobLog.js             # one row per job execution
├── routes/
│   ├── authRoutes.js
│   ├── recordRoutes.js       # auth required
│   └── jobRoutes.js          # admin only
├── utils/
│   ├── generateToken.js
│   └── runJob.js             # instrument + log a single job run
├── .env / .env.example
├── package.json
└── server.js
```

## Setup

1. `npm install`
2. Ensure **MongoDB is running locally**.
3. Copy `.env.example` to `.env`:
   ```
   PORT=5011
   MONGO_URI=mongodb://localhost:27017/syntecxhub_scheduler
   JWT_SECRET=change_this_to_a_long_random_secret
   JWT_EXPIRES_IN=1h
   ADMIN_SECRET=super_admin_bootstrap_secret
   CRON_DELETE_STALE=0 * * * *
   CRON_EMAIL_SUMMARY=0 8 * * *
   ENABLE_SCHEDULER=true
   STALE_RECORD_DAYS=30
   SUMMARY_EMAIL=admin@example.com
   ```
4. `npm start`  (or `npm run dev`)

Server runs at `http://localhost:5011`. On boot it connects to MongoDB, registers
the cron jobs, then starts the HTTP server. You'll see `Scheduled "<job>" with cron "<expr>"`
in the logs.

## The jobs

| Job                  | Default schedule | What it does                                                        |
|----------------------|------------------|---------------------------------------------------------------------|
| `deleteStaleRecords` | `0 * * * *` (hourly) | Deletes records whose `expiresAt` has passed, or (if no expiry) that are older than `STALE_RECORD_DAYS`. |
| `sendEmailSummary`   | `0 8 * * *` (daily 08:00) | Counts records and "sends" a summary to `SUMMARY_EMAIL`. Mocked — logged to console, no real SMTP. |

Schedules are read from env (`CRON_DELETE_STALE`, `CRON_EMAIL_SUMMARY`) so intervals
are configurable. Invalid cron expressions are skipped with a warning instead of
crashing startup. Set `ENABLE_SCHEDULER=false` to register no cron timers — jobs
stay triggerable via the API. Each run is logged to `JobLog` with status
(`running`/`success`/`failure`), duration, the result payload, or the error message.

## Endpoints

Base URL: `http://localhost:5011`

| Method | Route                 | Access | Description                              |
|--------|-----------------------|--------|------------------------------------------|
| POST   | `/auth/signup`        | public | Register (admin via secret)              |
| POST   | `/auth/login`         | public | Login → JWT                              |
| GET    | `/auth/me`            | auth   | Current user profile                     |
| POST   | `/records`            | auth   | Create a record (`expiresAt` optional)   |
| GET    | `/records`            | auth   | List records (`?status=`, `?stale=true`) |
| DELETE | `/records/:id`        | auth   | Delete a record                          |
| GET    | `/jobs`               | admin  | List jobs + their last run               |
| POST   | `/jobs/:name/run`     | admin  | Trigger a job now (manual run)           |
| GET    | `/jobs/logs`          | admin  | Execution history (`?job=`, `?status=`)  |

### Status codes

- `200` success · `201` created · `400` invalid input/id ·
  `401` missing/invalid token · `403` forbidden (role/blocked/expired) ·
  `404` not found · `500` job run failed (the failure is also recorded in its log)

### Example flow

```bash
# bootstrap admin + login
curl -X POST http://localhost:5011/auth/signup -H "Content-Type: application/json" -d '{
  "username":"admin1","email":"admin1@example.com","password":"secret123",
  "role":"admin","adminSecret":"super_admin_bootstrap_secret"
}'
TOKEN=$(curl -s -X POST http://localhost:5011/auth/login -H "Content-Type: application/json" \
  -d '{"identifier":"admin1@example.com","password":"secret123"}' | jq -r .token)

# create a record that is already stale (past expiry)
curl -X POST http://localhost:5011/records -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"old","expiresAt":"2000-01-01T00:00:00Z"}'

# list jobs, trigger the cleanup manually, then read the log
curl http://localhost:5011/jobs -H "Authorization: Bearer $TOKEN"
curl -X POST http://localhost:5011/jobs/deleteStaleRecords/run -H "Authorization: Bearer $TOKEN"
curl "http://localhost:5011/jobs/logs?job=deleteStaleRecords" -H "Authorization: Bearer $TOKEN"
```

---

_Environment: Node 24, npm 11._
