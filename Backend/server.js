
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const orderRoutes = require('./routes/orders');
const userRoutes = require('./routes/users');

// Load environment variables
dotenv.config();

const app = express();

// CORS configuration with more permissive settings for development
app.use(cors({
  origin: '*', // Allow all origins in development
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' })); // Increase limit for file uploads

// Enhanced debug middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  if (req.method === 'POST' || req.method === 'PUT') {
    console.log('Request body:', JSON.stringify(req.body, null, 2).substring(0, 500));
  }
  next();
});

// Add request timeout middleware
app.use((req, res, next) => {
  // Set a timeout for all requests (30 seconds)
  req.setTimeout(30000, () => {
    res.status(408).json({ message: 'Request timeout' });
  });
  next();
});

// Routes
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);

// Simple health check route
app.get('/', (req, res) => {
  res.send('PrintSpark API is running');
});

// Health check route for API
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    message: 'API is operational',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Internal server error', error: err.message });
});

// MongoDB connection status monitoring
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

mongoose.connection.on('connected', () => {
  console.log('MongoDB connected');
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Connect to MongoDB
const connectDB = require('./config/db');
connectDB();
