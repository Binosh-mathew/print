require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Import routes
const authRoutes = require('./routes/auth');
const orderRoutes = require('./routes/orders');
const storeRoutes = require('./routes/stores');
const platformStatsRoutes = require('./routes/platformStats');
const loginActivityRoutes = require('./routes/loginActivity');
const adminsRoutes = require('./routes/admins');
const messagesRoutes = require('./routes/messages');
const usersRoutes = require('./routes/users');
const systemRoutes = require('./routes/system');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/platform-stats', platformStatsRoutes);
app.use('/api/login-activity', loginActivityRoutes);
app.use('/api/admins', adminsRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/system', systemRoutes);

// Routes
app.get('/', (req, res) => {
  res.send('Welcome to the Print Shop Backend');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 