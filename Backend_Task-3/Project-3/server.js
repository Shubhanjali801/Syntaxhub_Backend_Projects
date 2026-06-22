const express = require('express');
require('dotenv').config();

const connectDB = require('./config/db');
const articleRoutes = require('./routes/articleRoutes');
const searchRoutes = require('./routes/searchRoutes');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

// Middleware
app.use(express.json());

// Health check
app.get('/', (req, res) => {
  res.json({ success: true, message: 'Text Search API is running' });
});

// Routes
app.use('/articles', articleRoutes);
app.use('/search', searchRoutes);

// Error handling (must be last)
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5008;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
