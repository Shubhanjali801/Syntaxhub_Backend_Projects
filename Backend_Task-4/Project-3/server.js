const express = require('express');
require('dotenv').config();

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const recordRoutes = require('./routes/recordRoutes');
const jobRoutes = require('./routes/jobRoutes');
const startScheduler = require('./jobs/scheduler');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

// Middleware
app.use(express.json());

// Health check
app.get('/', (req, res) => {
  res.json({ success: true, message: 'Scheduled Tasks API is running' });
});

// Routes
app.use('/auth', authRoutes);
app.use('/records', recordRoutes);
app.use('/jobs', jobRoutes);

// Error handling (must be last)
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5011;

// Connect to DB first, then start the cron scheduler and the HTTP server.
connectDB().then(() => {
  startScheduler();
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
