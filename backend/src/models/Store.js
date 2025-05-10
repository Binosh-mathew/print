const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'maintenance'],
    default: 'active'
  },
  maintenance: {
    isEnabled: {
      type: Boolean,
      default: false
    },
    message: {
      type: String,
      default: 'This store is currently under maintenance. Please try again later.'
    },
    startTime: {
      type: Date
    },
    endTime: {
      type: Date
    },
    reason: {
      type: String
    }
  },
  admin: {
    username: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true
    },
    password: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active'
    }
  },
  pricing: {
    blackAndWhite: {
      type: Number,
      default: 1.0
    },
    color: {
      type: Number,
      default: 2.0
    },
    paperSizes: {
      A4: {
        type: Number,
        default: 0.0
      },
      A3: {
        type: Number,
        default: 1.0
      },
      Letter: {
        type: Number,
        default: 0.0
      },
      Legal: {
        type: Number,
        default: 0.5
      }
    },
    paperTypes: {
      Normal: {
        type: Number,
        default: 0.0
      },
      Glossy: {
        type: Number,
        default: 1.0
      },
      Matte: {
        type: Number,
        default: 0.5
      }
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
storeSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Store', storeSchema); 