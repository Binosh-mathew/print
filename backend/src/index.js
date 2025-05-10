const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const checkMaintenance = require('./middleware/checkMaintenance');

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Import routes
const authRoutes = require('./routes/auth');
const orderRoutes = require('./routes/orders');
const storeRoutes = require('./routes/stores');
const messageRoutes = require('./routes/messages');
const platformStatsRoutes = require('./routes/platformStats');
const loginActivityRoutes = require('./routes/loginActivity');
const userRoutes = require('./routes/users');
const developerRoutes = require('./routes/developers');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/orders', checkMaintenance, orderRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/messages', checkMaintenance, messageRoutes);
app.use('/api/platform-stats', platformStatsRoutes);
app.use('/api/login-activity', loginActivityRoutes);
app.use('/api/users', checkMaintenance, userRoutes);
app.use('/api/developers', developerRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 