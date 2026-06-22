# Task 1 / Project 1 — User CRUD API

REST API for Create, Read, Update, Delete operations on a **User** resource,
built with **Express + Mongoose + MongoDB**. Input is validated with Mongoose
schema validators and the API returns appropriate HTTP status codes.

## Tech Stack

- Node.js + Express
- MongoDB + Mongoose
- dotenv for configuration

## Project Structure

```
Project-1/
├── config/
│   └── db.js              # MongoDB connection
├── controllers/
│   └── userController.js  # CRUD logic
├── middleware/
│   └── errorHandler.js    # 404 + centralized error handling
├── models/
│   └── User.js            # User schema + validators
├── routes/
│   └── userRoutes.js      # /users routes
├── .env                   # PORT, MONGO_URI (not committed)
├── .env.example
├── package.json
└── server.js              # app entry point
```

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Make sure **MongoDB is running locally** (default `mongodb://localhost:27017`).
3. Copy `.env.example` to `.env` and adjust if needed:
   ```
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/_users
   ```
4. Start the server:
   ```bash
   npm start      # or: npm run dev  (auto-restart on changes)
   ```

Server runs at `http://localhost:5000`.

## User Model

| Field     | Type   | Rules                                      |
|-----------|--------|--------------------------------------------|
| name      | String | required, min 2 chars                      |
| email     | String | required, unique, valid email format       |
| age       | Number | optional, 0–120                            |
| createdAt | Date   | auto (timestamps)                          |
| updatedAt | Date   | auto (timestamps)                          |

## Endpoints

Base URL: `http://localhost:5000`

| Method | Route         | Description        | Success |
|--------|---------------|--------------------|---------|
| GET    | `/`           | Health check       | 200     |
| POST   | `/users`      | Create a user      | 201     |
| GET    | `/users`      | List all users     | 200     |
| GET    | `/users/:id`  | Get user by id     | 200     |
| PUT    | `/users/:id`  | Update a user      | 200     |
| DELETE | `/users/:id`  | Delete a user      | 200     |

### Status codes

- `201` — user created
- `200` — successful read/update/delete
- `400` — validation error or invalid id
- `404` — user not found
- `409` — duplicate email
- `500` — server error

### Example requests

Create a user:
```bash
curl -X POST http://localhost:5000/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Asha","email":"asha@example.com","age":24}'
```

Get all users:
```bash
curl http://localhost:5000/users
```

Update a user:
```bash
curl -X PUT http://localhost:5000/users/<id> \
  -H "Content-Type: application/json" \
  -d '{"age":25}'
```

Delete a user:
```bash
curl -X DELETE http://localhost:5000/users/<id>
```

### Sample response

```json
{
  "success": true,
  "data": {
    "_id": "65b...",
    "name": "Asha",
    "email": "asha@example.com",
    "age": 24,
    "createdAt": "2026-06-22T10:00:00.000Z",
    "updatedAt": "2026-06-22T10:00:00.000Z"
  }
}
```

---

_Environment: Node 24, npm 11._
