# Task 2 / Project 2 — Blog API with Pagination & Filtering

REST API for **Blog Post** resources built with **Express + Mongoose + MongoDB**.
Full CRUD plus **pagination**, **filtering** (by tag, author, date range) and
**sorting** (newest / oldest).

## Tech Stack

- Node.js + Express
- MongoDB + Mongoose
- dotenv

## Project Structure

```
Project-2/
├── config/
│   └── db.js              # MongoDB connection
├── controllers/
│   └── postController.js  # CRUD + filter/sort/paginate logic
├── middleware/
│   └── errorHandler.js    # 404 + centralized error handling
├── models/
│   └── Post.js            # Post schema + validators
├── routes/
│   └── postRoutes.js      # /posts routes
├── .env                   # PORT, MONGO_URI (not committed)
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
3. Copy `.env.example` to `.env` and adjust if needed:
   ```
   PORT=5004
   MONGO_URI=mongodb://localhost:27017/syntecxhub_blog
   ```
4. Start the server:
   ```bash
   npm start      # or: npm run dev
   ```

Server runs at `http://localhost:5004`.

## Post Model

| Field     | Type     | Rules                              |
|-----------|----------|------------------------------------|
| title     | String   | required, min 2 chars              |
| body      | String   | required                           |
| author    | String   | required, indexed                  |
| tags      | [String] | optional, lowercased, indexed      |
| createdAt | Date     | auto (timestamps)                  |
| updatedAt | Date     | auto (timestamps)                  |

## Endpoints

Base URL: `http://localhost:5004`

| Method | Route         | Description              | Success |
|--------|---------------|--------------------------|---------|
| GET    | `/`           | Health check             | 200     |
| POST   | `/posts`      | Create a post            | 201     |
| GET    | `/posts`      | List (filter/sort/page)  | 200     |
| GET    | `/posts/:id`  | Get a post by id         | 200     |
| PUT    | `/posts/:id`  | Update a post            | 200     |
| DELETE | `/posts/:id`  | Delete a post            | 200     |

### Query parameters for `GET /posts`

| Param    | Example              | Description                              |
|----------|----------------------|------------------------------------------|
| `tag`    | `?tag=node`          | Filter by tag (case-insensitive)         |
| `author` | `?author=john`       | Filter by author                         |
| `from`   | `?from=2024-01-01`   | Created on/after this date               |
| `to`     | `?to=2024-12-31`     | Created on/before this date              |
| `sort`   | `?sort=oldest`       | `newest` (default) or `oldest`           |
| `page`   | `?page=1`            | Page number (default 1)                  |
| `limit`  | `?limit=10`          | Items per page (default 10, max 100)     |

Combine freely, e.g.:
```
GET /posts?tag=node&author=john&from=2024-01-01&sort=newest&page=1&limit=10
```

List responses include pagination metadata:
```json
{ "success": true, "count": 10, "total": 42, "page": 1, "pages": 5, "data": [ ... ] }
```

### Status codes

- `201` — post created
- `200` — successful read/update/delete
- `400` — validation error or invalid id
- `404` — post not found
- `500` — server error

### Example requests

Create:
```bash
curl -X POST http://localhost:5004/posts \
  -H "Content-Type: application/json" \
  -d '{"title":"Hello","body":"World","author":"john","tags":["node","backend"]}'
```

Filter + paginate + sort:
```bash
curl "http://localhost:5004/posts?tag=node&author=john&sort=newest&page=1&limit=5"
```

---

_Environment: Node 24, npm 11._
