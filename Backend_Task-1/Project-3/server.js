const path = require('path');
const express = require('express');
require('dotenv').config();

const connectDB = require('./config/db');
const fileRoutes = require('./routes/fileRoutes');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

// Middleware
app.use(express.json());

// Serve uploaded files statically at /uploads/<filename>
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check
app.get('/', (req, res) => {
  res.json({ success: true, message: 'File/Image Upload API is running' });
});

// Routes
app.use('/', fileRoutes);

// Error handling (must be last)
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5002;

// Connect to DB, then start the server
connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
