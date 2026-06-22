const express = require('express');
require('dotenv').config();

const connectDB = require('./config/db');
const recordRoutes = require('./routes/recordRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

// Middleware
app.use(express.json());

// Health check
app.get('/', (req, res) => {
  res.json({ success: true, message: 'Data Analytics API is running' });
});

// Routes
app.use('/records', recordRoutes);
app.use('/analytics', analyticsRoutes);

// Error handling (must be last)
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5007;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
