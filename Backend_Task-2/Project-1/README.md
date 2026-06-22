# Task 2 / Project 1 — User Authentication System

Authentication API built with **Express + Mongoose + MongoDB**. Users sign up
with a username/email + password (hashed with **bcrypt**), log in to receive a
**JWT**, and access protected routes by sending that token. Token expiry and
invalid-credential cases are handled explicitly.

## Tech Stack

- Node.js + Express
- MongoDB + Mongoose
- bcryptjs (password hashing)
- jsonwebtoken (JWT)
- dotenv

## Project Structure

```
Project-1/
├── config/
│   └── db.js                 # MongoDB connection
├── controllers/
│   └── authController.js     # signup / login / me
├── middleware/
│   ├── authMiddleware.js     # JWT verification (protect)
│   └── errorHandler.js       # 404 + centralized errors
├── models/
│   └── User.js               # User schema, password hashing, compare method
├── routes/
│   └── authRoutes.js         # /auth routes
├── utils/
│   └── generateToken.js      # JWT signing helper
├── .env                      # PORT, MONGO_URI, JWT_SECRET, JWT_EXPIRES_IN
├── .env.example
├── package.json
└── server.js
```

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Make sure **MongoDB is running locally** (default `mongodb://localhost:27017`).
3. Copy `.env.example` to `.env` and set a strong `JWT_SECRET`:
   ```
   PORT=5003
   MONGO_URI=mongodb://localhost:27017/syntecxhub_auth
   JWT_SECRET=change_this_to_a_long_random_secret
   JWT_EXPIRES_IN=1h
   ```
4. Start the server:
   ```bash
   npm start      # or: npm run dev
   ```

Server runs at `http://localhost:5003`.

## User Model

| Field    | Type   | Rules                                   |
|----------|--------|-----------------------------------------|
| username | String | required, unique, min 3 chars           |
| email    | String | required, unique, valid email           |
| password | String | required, min 6 chars, **hashed**, hidden by default |

The password is hashed in a Mongoose `pre('save')` hook and is never returned in
responses (`select: false`).

## Endpoints

Base URL: `http://localhost:5003`

| Method | Route           | Auth      | Description                       | Success |
|--------|-----------------|-----------|-----------------------------------|---------|
| GET    | `/`             | —         | Health check                      | 200     |
| POST   | `/auth/signup`  | —         | Register a new user               | 201     |
| POST   | `/auth/login`   | —         | Log in, receive a JWT             | 200     |
| GET    | `/auth/me`      | Bearer    | Get the current user's profile    | 200     |

### Auth header for protected routes

```
Authorization: Bearer <token>
```

### Status codes

- `201` — user registered
- `200` — login / profile success
- `400` — missing/invalid fields
- `401` — invalid credentials, missing token, or **invalid** token
- `403` — **expired** token
- `409` — duplicate email/username
- `500` — server error

### Example requests

Signup:
```bash
curl -X POST http://localhost:5003/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"username":"asha","email":"asha@example.com","password":"secret123"}'
```

Login (accepts `email`, `username`, or `identifier`):
```bash
curl -X POST http://localhost:5003/auth/login \
  -H "Content-Type: application/json" \
  -d '{"identifier":"asha@example.com","password":"secret123"}'
```

Access protected route:
```bash
curl http://localhost:5003/auth/me \
  -H "Authorization: Bearer <token-from-login>"
```

---

_Environment: Node 24, npm 11._
