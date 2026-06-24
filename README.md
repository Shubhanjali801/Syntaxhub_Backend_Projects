# Syntecxhub Backend Projects

Backend development internship projects for **Syntecxhub**. This repository
collects **4 weekly tasks**, each containing **3 projects** (12 in total), built
with **Node.js, Express, and MongoDB (Mongoose)**. The projects progress from
basic REST CRUD through authentication, aggregation/search, and on to
role-based access control, audit trails, and scheduled jobs.

> Internship requirement: complete at least one project per task. This repo
> implements **all three projects in every task**.

## Tech Stack

- **Node.js + Express** — HTTP server & routing
- **MongoDB + Mongoose** — database & ODM (schemas, validation, aggregation, text search)
- **JWT (jsonwebtoken)** + **bcryptjs** — authentication & password hashing
- **Multer** — file/image uploads (Task 1/3, Task 2/3)
- **node-cron** — scheduled jobs (Task 4/3)
- **dotenv** — environment configuration
- **nodemon** — dev auto-reload

## Repository Layout

```
Syntaxhub_Backend_Projects/
├── Backend_Task-1/   # REST CRUD fundamentals
│   ├── Project-1/    # User CRUD API
│   ├── Project-2/    # Product CRUD (filter / sort / paginate)
│   └── Project-3/    # File / Image Upload API
├── Backend_Task-2/   # Auth & data APIs
│   ├── Project-1/    # User Authentication (JWT)
│   ├── Project-2/    # Blog API (pagination & filtering)
│   └── Project-3/    # Profile Picture Upload (file metadata on user)
├── Backend_Task-3/   # Querying & search
│   ├── Project-1/    # Notes App Backend (owner-only, soft-delete)
│   ├── Project-2/    # Data Analytics API (aggregation pipeline)
│   └── Project-3/    # Text Search API ($text + regex)
├── Backend_Task-4/   # Access control, auditing, automation
│   ├── Project-1/    # Role-Based User Management (RBAC)
│   ├── Project-2/    # Activity Log / Audit Trail API
│   └── Project-3/    # Scheduled Tasks API (node-cron)
└── *.pdf             # Task briefs
```

Each project is **self-contained** with its own `package.json`, `.env`,
`README.md`, and Postman collection, and follows the same MVC-style structure:

```
Project-X/
├── config/db.js          # Mongo connection
├── models/               # Mongoose schemas
├── controllers/          # request handlers (business logic)
├── routes/               # Express routers
├── middleware/           # error handling, auth, uploads
├── utils/                # helpers (tokens, etc.)  [where applicable]
├── server.js             # app entry point
├── .env / .env.example
├── package.json
├── README.md
└── postman_collection.json
```

## Projects at a Glance

| Task | Project | Name | Port | Highlights |
|------|---------|------|------|------------|
| 1 | 1 | User CRUD API | `5000` | CRUD, schema validation, status codes |
| 1 | 2 | Product CRUD API | `5001` | Filtering, sorting, pagination |
| 1 | 3 | File / Image Upload API | `5002` | Multer disk storage, image-only, 5 MB cap |
| 2 | 1 | User Authentication | `5003` | bcrypt hashing, JWT, protected routes |
| 2 | 2 | Blog API | `5004` | Pagination + tag/author/date filtering |
| 2 | 3 | Profile Picture Upload | `5005` | Embedded file metadata, replace-on-upload |
| 3 | 1 | Notes App Backend | `5006` | Ownership scoping, populate, soft-delete |
| 3 | 2 | Data Analytics API | `5007` | Aggregation (`$match`/`$group`/`$project`) |
| 3 | 3 | Text Search API | `5008` | `$text` index + relevance, regex fallback |
| 4 | 1 | Role-Based User Management | `5009` | RBAC middleware, admin block/promote, audit |
| 4 | 2 | Activity Log / Audit Trail | `5010` | Sensitive-action logging, filterable, admin-only |
| 4 | 3 | Scheduled Tasks API | `5011` | node-cron jobs, manual triggers, run logs |

Each project's own `README.md` documents its models, endpoints, query
parameters, and example requests in full.

## Running a Project

Every project runs the same way. From a project folder, e.g.
`Backend_Task-4/Project-3`:

```bash
npm install                 # install dependencies
cp .env.example .env        # then edit values as needed
npm start                   # start with nodemon  (or: npm run dev)
```

Each project listens on its own port (see the table above), so several can run
side by side. A `GET /` health check on each confirms it's up.

### Environment configuration

Projects read configuration from a local `.env` (git-ignored). Copy the
provided `.env.example` and fill in your values. Common variables:

| Variable | Used by | Purpose |
|----------|---------|---------|
| `PORT` | all | HTTP port |
| `MONGO_URI` | all | MongoDB connection string (local or Atlas) |
| `JWT_SECRET` / `JWT_EXPIRES_IN` | auth projects (T2/P1, T3/P1, T4/*) | JWT signing |
| `ADMIN_SECRET` | T4/* | bootstrap the first admin via signup |

The default `MONGO_URI` points at a local MongoDB
(`mongodb://localhost:27017/...`); a MongoDB Atlas URI works as a drop-in
replacement.

## Conventions Across Projects

- **Consistent JSON envelope** — responses use `{ success, message?, data? }`;
  list endpoints add `count` / pagination metadata (`total`, `page`, `pages`).
- **Centralized error handling** — a shared `errorHandler` maps Mongoose
  `ValidationError`/`CastError`/duplicate-key (`11000`) to clean `400`/`409`
  responses; a `notFound` handler returns `404` for unknown routes.
- **Meaningful status codes** — `200/201` success, `400` bad input,
  `401/403` auth/role, `404` missing, `409` duplicate, `500` server error.
- **Security** — passwords hashed with bcrypt and never returned
  (`select: false`); protected routes require a `Bearer <JWT>`; admin-only
  routes are gated by role middleware; secrets live in `.env` (never committed).
- **Testing** — each project ships a Postman collection (and, for newer tasks,
  an environment file) covering the full request flow.

## Author

**Shubhanjali** — Backend Developer

---

_Environment: Node 24, npm 11._
