const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 6,
    select: false
  },
  preferences: {
    gender: {
      type: String,
      enum: ['male', 'female', 'other', 'no-preference']
    },
    smoking: {
      type: String,
      enum: ['yes', 'no', 'occasionally']
    },
    pets: {
      type: String,
      enum: ['yes', 'no', 'negotiable']
    },
    cleanliness: {
      type: String,
      enum: ['very-clean', 'clean', 'moderate', 'relaxed']
    },
    lifestyle: {
      type: String,
      enum: ['quiet', 'moderate', 'social', 'party']
    }
  },
  budget: {
    min: {
      type: Number,
      default: 0
    },
    max: {
      type: Number,
      default: 100000
    }
  },
  location: {
    city: String,
    state: String,
    zipCode: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);