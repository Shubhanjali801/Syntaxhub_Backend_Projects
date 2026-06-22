# Task 1 / Project 3 — File/Image Upload API

REST API for uploading **images** built with **Express + Multer + Mongoose +
MongoDB**. Files are stored on disk in `uploads/`, and their metadata
(filename, path, URL, mimetype, size) is saved to MongoDB. Uploads are
restricted to **images only** (JPEG, PNG, GIF) with a **5 MB** size limit.

## Tech Stack

- Node.js + Express
- Multer (multipart/form-data handling)
- MongoDB + Mongoose
- dotenv for configuration

## Project Structure

```
Project-3/
├── config/
│   └── db.js               # MongoDB connection
├── controllers/
│   └── fileController.js   # upload / list / get / delete logic
├── middleware/
│   ├── upload.js           # multer config (images only, 5MB, disk storage)
│   └── errorHandler.js     # 404 + multer/mongoose error handling
├── models/
│   └── File.js             # file metadata schema
├── routes/
│   └── fileRoutes.js       # /upload, /files routes
├── uploads/                # uploaded files stored here (git-ignored)
├── .env                    # PORT, MONGO_URI (not committed)
├── .env.example
├── package.json
└── server.js               # app entry point
```

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Make sure **MongoDB is running locally** (default `mongodb://localhost:27017`).
3. Copy `.env.example` to `.env` and adjust if needed:
   ```
   PORT=5002
   MONGO_URI=mongodb://localhost:27017/syntecxhub_files
   ```
4. Start the server:
   ```bash
   npm start      # or: npm run dev  (auto-restart on changes)
   ```

Server runs at `http://localhost:5002`.

## File Model

| Field        | Type   | Description                          |
|--------------|--------|--------------------------------------|
| filename     | String | stored (unique) filename on disk     |
| originalName | String | original uploaded filename           |
| path         | String | absolute path on disk                |
| url          | String | public URL to access the file        |
| mimetype     | String | e.g. `image/png`                     |
| size         | Number | bytes                                |
| createdAt    | Date   | auto (timestamps)                    |

## Endpoints

Base URL: `http://localhost:5002`

| Method | Route               | Description                          | Success |
|--------|---------------------|--------------------------------------|---------|
| GET    | `/`                 | Health check                         | 200     |
| POST   | `/upload`           | Upload an image (field name `image`) | 201     |
| GET    | `/files`            | List all uploaded files              | 200     |
| GET    | `/files/:id`        | Get file metadata + URL              | 200     |
| DELETE | `/files/:id`        | Delete file (disk + DB)              | 200     |
| GET    | `/uploads/:filename`| Serve the raw image file (static)    | 200     |

### Upload rules

- Field name: **`image`** (`multipart/form-data`)
- Allowed types: **JPEG, PNG, GIF**
- Max size: **5 MB**

### Status codes

- `201` — file uploaded
- `200` — successful read/delete/serve
- `400` — no file, invalid type, file too large, or invalid id
- `404` — file not found
- `500` — server error

### Example requests

Upload an image:
```bash
curl -X POST http://localhost:5002/upload \
  -F "image=@/path/to/photo.png"
```

Sample response:
```json
{
  "success": true,
  "data": {
    "_id": "65b...",
    "filename": "1718000000000-123456789.png",
    "originalName": "photo.png",
    "path": "C:\\...\\uploads\\1718000000000-123456789.png",
    "url": "http://localhost:5002/uploads/1718000000000-123456789.png",
    "mimetype": "image/png",
    "size": 20480,
    "createdAt": "2026-06-22T10:00:00.000Z"
  }
}
```

Get metadata:
```bash
curl http://localhost:5002/files/<id>
```

View the image in a browser:
```
http://localhost:5002/uploads/<filename>
```

Delete:
```bash
curl -X DELETE http://localhost:5002/files/<id>
```

---

_Environment: Node 24, npm 11._
