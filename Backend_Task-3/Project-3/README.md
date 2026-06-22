# Task 3 / Project 3 — Text Search API

Search API built with **Express + Mongoose + MongoDB**. Supports **full-text
search** (`$text`) and a **regex** fallback over `title`/`body`, returns results
**sorted by relevance**, and can combine the search with **tag/author filters**.

## Tech Stack

- Node.js + Express
- MongoDB + Mongoose (text index + `$text` / `$meta: textScore`)
- dotenv

## Project Structure

```
Project-3/
├── config/db.js
├── controllers/
│   ├── articleController.js   # create / seed / list
│   └── searchController.js    # /search (text + regex)
├── middleware/errorHandler.js
├── models/Article.js          # title, body, author, tags + text index
├── routes/
│   ├── articleRoutes.js
│   └── searchRoutes.js
├── .env / .env.example
├── package.json
└── server.js
```

## Setup

1. `npm install`
2. Ensure **MongoDB is running locally**.
3. Copy `.env.example` to `.env`:
   ```
   PORT=5008
   MONGO_URI=mongodb://localhost:27017/syntecxhub_search
   ```
4. `npm start`  (or `npm run dev`)

Server runs at `http://localhost:5008`.

## Article Model

| Field  | Type     | Notes                                   |
|--------|----------|-----------------------------------------|
| title  | String   | required, **text-indexed (weight 5)**   |
| body   | String   | required, **text-indexed (weight 1)**   |
| author | String   | default `anonymous`, indexed            |
| tags   | [String] | lowercased, indexed                     |

Text index:
```js
articleSchema.index(
  { title: 'text', body: 'text' },
  { weights: { title: 5, body: 1 }, name: 'TextSearchIndex' }
);
```
Title matches rank higher than body matches.

## Endpoints

Base URL: `http://localhost:5008`

| Method | Route             | Description                                  |
|--------|-------------------|----------------------------------------------|
| GET    | `/`               | Health check                                 |
| POST   | `/articles`       | Create an article                            |
| POST   | `/articles/seed`  | Bulk insert (array or `{ articles: [...] }`) |
| GET    | `/articles`       | List all articles                            |
| GET    | `/search`         | Search (see below)                           |

### `GET /search` query params

| Param    | Example                | Description                                       |
|----------|------------------------|---------------------------------------------------|
| `q`      | `?q=node`              | **Required.** Search text                          |
| `mode`   | `?mode=regex`          | `text` (default, `$text`) or `regex`              |
| `tag`    | `?tag=express`         | Combine with a tag filter                         |
| `author` | `?author=john`         | Combine with an author filter                     |
| `limit`  | `?limit=20`            | Max results (default 20, max 100)                 |

- **text mode** uses `{ $text: { $search: q } }` and sorts by
  `{ score: { $meta: 'textScore' } }` (relevance). Multi-word queries match any
  of the words.
- **regex mode** does a case-insensitive regex over `title`/`body` (useful for
  partial/substring matches that `$text` won't catch).

Response shape:
```json
{ "success": true, "mode": "text", "query": "node", "count": 2, "data": [ ... ] }
```

### Examples

```bash
# seed
curl -X POST http://localhost:5008/articles/seed -H "Content-Type: application/json" -d '[
  {"title":"Intro to Node.js","body":"JavaScript runtime","author":"john","tags":["node"]},
  {"title":"React Basics","body":"Components","author":"alice","tags":["react"]}
]'

# relevance search
curl "http://localhost:5008/search?q=node"

# search + filters
curl "http://localhost:5008/search?q=node&author=john&tag=express"

# regex (substring) search
curl "http://localhost:5008/search?q=java&mode=regex"
```

---

_Environment: Node 24, npm 11._
