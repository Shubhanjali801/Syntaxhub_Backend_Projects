const express = require('express');
require('dotenv').config();

const connectDB = require('./config/db');
const postRoutes = require('./routes/postRoutes');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

// Middleware
app.use(express.json());

// Health check
app.get('/', (req, res) => {
  res.json({ success: true, message: 'Blog API is running' });
});

// Routes
app.use('/posts', postRoutes);

// Error handling (must be last)
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5004;

// Connect to DB, then start the server
connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
