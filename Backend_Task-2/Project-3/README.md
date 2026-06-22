# Task 2 / Project 3 — File Upload API with Metadata (User Profile Pictures)

Extends file upload to a **user profile system**. Each user document can hold a
**profile picture** whose metadata (filename, URL, mimetype, size) is stored on
the user. Users can upload, replace, view, and delete their picture. Built with
**Express + Multer + Mongoose + MongoDB**. Uploads are restricted to **images
only** (JPEG, PNG, GIF) with a **5 MB** limit.

## Tech Stack

- Node.js + Express
- Multer (multipart/form-data)
- MongoDB + Mongoose
- dotenv

## Project Structure

```
Project-3/
├── config/
│   └── db.js               # MongoDB connection
├── controllers/
│   └── userController.js   # user + profile-picture logic
├── middleware/
│   ├── upload.js           # multer (images only, 5MB)
│   └── errorHandler.js     # 404 + multer/mongoose errors
├── models/
│   └── User.js             # User with embedded profilePicture metadata
├── routes/
│   └── userRoutes.js       # /users routes
├── uploads/                # uploaded files (git-ignored)
├── .env                    # PORT, MONGO_URI (not committed)
├── .env.example
├── package.json
└── server.js
```

## Setup

1. `npm install`
2. Ensure **MongoDB is running locally** (default `mongodb://localhost:27017`).
3. Copy `.env.example` to `.env`:
   ```
   PORT=5005
   MONGO_URI=mongodb://localhost:27017/syntecxhub_profiles
   ```
4. `npm start`  (or `npm run dev`)

Server runs at `http://localhost:5005`.

## User Model

| Field          | Type   | Description                              |
|----------------|--------|------------------------------------------|
| name           | String | required, min 2 chars                    |
| email          | String | required, unique, valid email            |
| profilePicture | Object | embedded metadata, or `null`             |

`profilePicture` metadata: `filename`, `originalName`, `path`, `url`,
`mimetype`, `size`, `uploadedAt`.

## Endpoints

Base URL: `http://localhost:5005`

| Method | Route                    | Description                              | Success |
|--------|--------------------------|------------------------------------------|---------|
| GET    | `/`                      | Health check                             | 200     |
| POST   | `/users`                 | Create a user                            | 201     |
| GET    | `/users/:id`             | Get a user (incl. picture metadata)      | 200     |
| POST   | `/users/:id/picture`     | Upload/replace picture (field `image`)   | 200     |
| GET    | `/users/:id/picture`     | Get picture URL + metadata               | 200     |
| DELETE | `/users/:id/picture`     | Delete picture (disk + clear field)      | 200     |
| GET    | `/uploads/:filename`     | Serve the raw image (static)             | 200     |

### Upload rules

- Field name: **`image`** (`multipart/form-data`)
- Allowed types: **JPEG, PNG, GIF**; Max size: **5 MB**
- Uploading a new picture **replaces** the old one (old file removed from disk)

### Status codes

- `201` — user created
- `200` — get / upload / delete success
- `400` — no file, invalid type, file too large, or invalid id
- `404` — user (or picture) not found
- `409` — duplicate email
- `500` — server error

### Example requests

Create a user:
```bash
curl -X POST http://localhost:5005/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Asha","email":"asha@example.com"}'
```

Upload a picture:
```bash
curl -X POST http://localhost:5005/users/<id>/picture \
  -F "image=@/path/to/photo.png"
```

Get picture metadata / delete:
```bash
curl http://localhost:5005/users/<id>/picture
curl -X DELETE http://localhost:5005/users/<id>/picture
```

View the image in a browser: `http://localhost:5005/uploads/<filename>`

---

_Environment: Node 24, npm 11._
