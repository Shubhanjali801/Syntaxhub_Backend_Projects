const express = require('express');
require('dotenv').config();

const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

// Middleware
app.use(express.json());

// Health check
app.get('/', (req, res) => {
  res.json({ success: true, message: 'User CRUD API is running' });
});

// Routes
app.use('/users', userRoutes);

// Error handling (must be last)
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Connect to DB, then start the server
connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
