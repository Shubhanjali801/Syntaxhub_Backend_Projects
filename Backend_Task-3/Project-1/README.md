# Task 3 / Project 1 — Notes App Backend

A notes backend built with **Express + Mongoose + MongoDB + JWT**. Each note
belongs to a user (reference), and **only the owner can access their notes**.
Demonstrates Mongoose **populate** in both directions, plus **archive** and
**soft-delete** for notes.

## Tech Stack

- Node.js + Express
- MongoDB + Mongoose
- bcryptjs + jsonwebtoken (auth / ownership)
- dotenv

## Project Structure

```
Project-1/
├── config/db.js
├── controllers/
│   ├── authController.js   # signup / login / me (user + notes)
│   └── noteController.js   # owner-only CRUD + archive + soft-delete
├── middleware/
│   ├── authMiddleware.js   # JWT protect
│   └── errorHandler.js
├── models/
│   ├── User.js             # + virtual populate "notes"
│   └── Note.js             # user ref, isArchived, isDeleted
├── routes/
│   ├── authRoutes.js
│   └── noteRoutes.js
├── utils/generateToken.js
├── .env / .env.example
├── package.json
└── server.js
```

## Setup

1. `npm install`
2. Ensure **MongoDB is running locally**.
3. Copy `.env.example` to `.env`, set a strong `JWT_SECRET`:
   ```
   PORT=5006
   MONGO_URI=mongodb://localhost:27017/syntecxhub_notes
   JWT_SECRET=change_this_to_a_long_random_secret
   JWT_EXPIRES_IN=1h
   ```
4. `npm start`  (or `npm run dev`)

Server runs at `http://localhost:5006`.

## Models

**User**: `username` (unique), `email` (unique), `password` (hashed, hidden),
plus a virtual `notes` (populate User → Notes).

**Note**: `title` (req), `content` (req), `category` (default `general`),
`user` (ObjectId ref → User), `isArchived` (bool), `isDeleted` (soft-delete bool).

## Endpoints

Base URL: `http://localhost:5006` — all `/notes` routes require
`Authorization: Bearer <token>`.

| Method | Route                  | Description                                   | Success |
|--------|------------------------|-----------------------------------------------|---------|
| POST   | `/auth/signup`         | Register                                      | 201     |
| POST   | `/auth/login`          | Login → JWT                                   | 200     |
| GET    | `/auth/me`             | Current user **with their notes** (populate)  | 200     |
| POST   | `/notes`               | Create a note (owned by current user)         | 201     |
| GET    | `/notes`               | List my notes (`?archived=`, `?category=`)    | 200     |
| GET    | `/notes/:id`           | Single note (owner only, **author populated**)| 200     |
| PUT    | `/notes/:id`           | Update (owner only)                           | 200     |
| PATCH  | `/notes/:id/archive`   | Archive/unarchive (`{ "archived": true }`)    | 200     |
| DELETE | `/notes/:id`           | Soft-delete (owner only)                      | 200     |

### Ownership & soft-delete

- Every note query is scoped to `user = <current user>` and `isDeleted = false`.
  A note that doesn't belong to you returns **404** (no information leak).
- `DELETE` sets `isDeleted = true` (the document is kept, just hidden).
- Archived notes stay in the DB; filter them with `?archived=true|false`.

### Status codes

- `201` create · `200` success · `400` invalid input/id · `401` missing/invalid
  token · `403` expired token · `404` not found / not owner · `409` duplicate user

### Example flow

```bash
# 1. signup + login
curl -X POST http://localhost:5006/auth/signup -H "Content-Type: application/json" \
  -d '{"username":"asha","email":"asha@example.com","password":"secret123"}'
TOKEN=$(curl -s -X POST http://localhost:5006/auth/login -H "Content-Type: application/json" \
  -d '{"identifier":"asha@example.com","password":"secret123"}' | jq -r .token)

# 2. create + list notes
curl -X POST http://localhost:5006/notes -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Note 1","content":"hello","category":"work"}'
curl http://localhost:5006/notes -H "Authorization: Bearer $TOKEN"
```

---

_Environment: Node 24, npm 11._
