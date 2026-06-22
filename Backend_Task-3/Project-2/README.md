# Task 3 / Project 2 — Data Analytics API

Analytics API built with **Express + Mongoose + MongoDB** that uses the
**MongoDB aggregation pipeline** (`$match`, `$group`, `$project`, `$sort`) to
compute summaries — counts and sums grouped by category, month, and author —
with optional filters (author, category, date range).

## Tech Stack

- Node.js + Express
- MongoDB + Mongoose (aggregation pipeline)
- dotenv

## Project Structure

```
Project-2/
├── config/db.js
├── controllers/
│   ├── recordController.js     # create / seed / list records
│   └── analyticsController.js  # aggregation pipelines
├── middleware/errorHandler.js
├── models/Record.js            # title, category, author, amount, date
├── routes/
│   ├── recordRoutes.js
│   └── analyticsRoutes.js
├── utils/buildMatch.js         # builds $match from query params
├── .env / .env.example
├── package.json
└── server.js
```

## Setup

1. `npm install`
2. Ensure **MongoDB is running locally**.
3. Copy `.env.example` to `.env`:
   ```
   PORT=5007
   MONGO_URI=mongodb://localhost:27017/syntecxhub_analytics
   ```
4. `npm start`  (or `npm run dev`)

Server runs at `http://localhost:5007`.

## Record Model

| Field    | Type   | Notes                                  |
|----------|--------|----------------------------------------|
| title    | String | required                               |
| category | String | lowercased, default `general`, indexed |
| author   | String | default `anonymous`, indexed           |
| amount   | Number | default 0, used for sums/avg           |
| date     | Date   | event date (for per-month grouping)    |

## Endpoints

Base URL: `http://localhost:5007`

| Method | Route                       | Description                               |
|--------|-----------------------------|-------------------------------------------|
| GET    | `/`                         | Health check                              |
| POST   | `/records`                  | Create one record                         |
| POST   | `/records/seed`             | Bulk insert (array or `{ records: [...] }`)|
| GET    | `/records`                  | List records (filterable)                 |
| GET    | `/analytics/by-category`    | Count + sum/avg amount per category       |
| GET    | `/analytics/by-month`       | Count + sum per `YYYY-MM`                 |
| GET    | `/analytics/by-author`      | Count + sum per author                    |
| GET    | `/analytics/summary`        | Overall totals (count/sum/avg/min/max)    |

### Filters (apply to all analytics + `/records`)

| Param      | Example              | Description                  |
|------------|----------------------|------------------------------|
| `author`   | `?author=john`       | Filter by author             |
| `category` | `?category=work`     | Filter by category           |
| `from`     | `?from=2024-01-01`   | Records on/after this date   |
| `to`       | `?to=2024-12-31`     | Records on/before this date  |

These build a `$match` stage that runs **before** `$group`, so you can combine
filtering with aggregation, e.g.:
```
GET /analytics/by-category?author=john&from=2024-01-01&to=2024-12-31
```

### Pipeline examples

**By category** (`$match` → `$group` → `$project` → `$sort`):
```js
[
  { $match: { author: 'john' } },
  { $group: { _id: '$category', count: { $sum: 1 }, totalAmount: { $sum: '$amount' }, avgAmount: { $avg: '$amount' } } },
  { $project: { _id: 0, category: '$_id', count: 1, totalAmount: 1, avgAmount: { $round: ['$avgAmount', 2] } } },
  { $sort: { count: -1 } }
]
```

**By month** groups on `{ $year: '$date' }` / `{ $month: '$date' }` and projects a
`YYYY-MM` `period` label.

### Quick start

```bash
# seed sample data
curl -X POST http://localhost:5007/records/seed -H "Content-Type: application/json" -d '[
  {"title":"A","category":"work","author":"john","amount":100,"date":"2024-01-10"},
  {"title":"B","category":"personal","author":"alice","amount":50,"date":"2024-02-05"}
]'

# analytics
curl http://localhost:5007/analytics/by-category
curl "http://localhost:5007/analytics/by-month?author=john"
```

---

_Environment: Node 24, npm 11._
