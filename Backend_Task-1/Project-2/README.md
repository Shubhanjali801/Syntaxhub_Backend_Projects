# Task 1 / Project 2 — Product CRUD API

REST API for **Product** resources built with **Express + Mongoose + MongoDB**.
Supports full CRUD plus **filtering** (category, price range), **sorting**, and
**pagination** via query parameters.

## Tech Stack

- Node.js + Express
- MongoDB + Mongoose
- dotenv for configuration

## Project Structure

```
Project-2/
├── config/
│   └── db.js                 # MongoDB connection
├── controllers/
│   └── productController.js  # CRUD + filter/sort/paginate logic
├── middleware/
│   └── errorHandler.js       # 404 + centralized error handling
├── models/
│   └── Product.js            # Product schema + validators
├── routes/
│   └── productRoutes.js      # /products routes
├── .env                      # PORT, MONGO_URI (not committed)
├── .env.example
├── package.json
└── server.js                 # app entry point
```

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Make sure **MongoDB is running locally** (default `mongodb://localhost:27017`).
3. Copy `.env.example` to `.env` and adjust if needed:
   ```
   PORT=5001
   MONGO_URI=mongodb://localhost:27017/syntecxhub_products
   ```
4. Start the server:
   ```bash
   npm start      # or: npm run dev  (auto-restart on changes)
   ```

Server runs at `http://localhost:5001`.

## Product Model

| Field       | Type   | Rules                          |
|-------------|--------|--------------------------------|
| name        | String | required, min 2 chars          |
| price       | Number | required, >= 0                 |
| description | String | optional                       |
| category    | String | optional, lowercased, indexed  |
| createdAt   | Date   | auto (timestamps)              |
| updatedAt   | Date   | auto (timestamps)              |

## Endpoints

Base URL: `http://localhost:5001`

| Method | Route            | Description              | Success |
|--------|------------------|--------------------------|---------|
| GET    | `/`              | Health check             | 200     |
| POST   | `/products`      | Create a product         | 201     |
| GET    | `/products`      | List (filter/sort/page)  | 200     |
| GET    | `/products/:id`  | Get product by id        | 200     |
| PUT    | `/products/:id`  | Update a product         | 200     |
| DELETE | `/products/:id`  | Delete a product         | 200     |

### Query parameters for `GET /products`

| Param      | Example                | Description                                  |
|------------|------------------------|----------------------------------------------|
| `category` | `?category=electronics`| Filter by category (case-insensitive)        |
| `minPrice` | `?minPrice=100`        | Minimum price (inclusive)                    |
| `maxPrice` | `?maxPrice=500`        | Maximum price (inclusive)                    |
| `page`     | `?page=1`              | Page number (default 1)                      |
| `limit`    | `?limit=10`            | Items per page (default 10, max 100)         |
| `sort`     | `?sort=price_asc`      | `newest` (default), `oldest`, `price_asc`, `price_desc` |

Combine freely, e.g.:
```
GET /products?category=electronics&minPrice=100&maxPrice=500&page=1&limit=10&sort=price_asc
```

List responses include pagination metadata:
```json
{ "success": true, "count": 10, "total": 42, "page": 1, "pages": 5, "data": [ ... ] }
```

### Status codes

- `201` — product created
- `200` — successful read/update/delete
- `400` — validation error or invalid id
- `404` — product not found
- `500` — server error

### Example requests

Create:
```bash
curl -X POST http://localhost:5001/products \
  -H "Content-Type: application/json" \
  -d '{"name":"Laptop","price":1200,"description":"14-inch","category":"electronics"}'
```

Filter + paginate:
```bash
curl "http://localhost:5001/products?category=electronics&minPrice=500&maxPrice=2000&page=1&limit=5"
```

---

_Environment: Node 24, npm 11._
