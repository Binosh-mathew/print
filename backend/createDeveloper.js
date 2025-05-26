require('dotenv').config();
const mongoose = require('mongoose');
const Developer = require('./src/models/Developer');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Developer credentials to create
const newDeveloper = {
  username: 'developer',
  email: 'developer@example.com',
  password: 'Developer@123', // This will be hashed automatically by the pre-save hook
  role: 'developer'
};

// Create the developer
async function createDeveloper() {
  try {
    // Check if developer already exists
    const existingDeveloper = await Developer.findOne({ 
      $or: [
        { username: newDeveloper.username },
        { email: newDeveloper.email }
      ]
    });

    if (existingDeveloper) {
      console.log('Developer with this username or email already exists');
      process.exit(0);
    }

    // Create new developer
    const developer = new Developer(newDeveloper);
    await developer.save();
    
    console.log('Developer created successfully:');
    console.log({
      username: developer.username,
      email: developer.email,
      role: developer.role,
      id: developer._id
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating developer:', error);
    process.exit(1);
  }
}

createDeveloper();
