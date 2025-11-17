const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Please provide a title'],
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
    maxlength: 1000
  },
  propertyType: {
    type: String,
    enum: ['apartment', 'house', 'condo', 'townhouse', 'studio'],
    required: true
  },
  rentAmount: {
    type: Number,
    required: [true, 'Please provide rent amount']
  },
  location: {
    address: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    zipCode: {
      type: String,
      required: true
    }
  },
  amenities: [{
    type: String
  }],
  roomDetails: {
    bedrooms: {
      type: Number,
      required: true
    },
    bathrooms: {
      type: Number,
      required: true
    },
    furnished: {
      type: Boolean,
      default: false
    },
    availableFrom: {
      type: Date,
      required: true
    }
  },
  preferences: {
    gender: {
      type: String,
      enum: ['male', 'female', 'other', 'no-preference']
    },
    smoking: {
      type: String,
      enum: ['yes', 'no', 'no-preference']
    },
    pets: {
      type: String,
      enum: ['yes', 'no', 'negotiable']
    }
  },
  images: [{
    type: String
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Listing', listingSchema);