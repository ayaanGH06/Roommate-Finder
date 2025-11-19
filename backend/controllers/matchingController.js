const Listing = require('../models/Listing');
const User = require('../models/User');

// Calculate compatibility score between user and listing
const calculateCompatibility = (user, listing) => {
  let score = 0;
  let maxScore = 0;

  // Budget compatibility (30 points)
  maxScore += 30;
  if (listing.rentAmount >= user.budget.min && listing.rentAmount <= user.budget.max) {
    score += 30;
  } else if (listing.rentAmount < user.budget.min) {
    const diff = user.budget.min - listing.rentAmount;
    const range = user.budget.max - user.budget.min;
    score += Math.max(0, 30 - (diff / range) * 30);
  } else {
    const diff = listing.rentAmount - user.budget.max;
    const range = user.budget.max - user.budget.min;
    score += Math.max(0, 30 - (diff / range) * 30);
  }

  // Location compatibility (20 points)
  maxScore += 20;
  if (user.location && listing.location) {
    if (user.location.city?.toLowerCase() === listing.location.city?.toLowerCase()) {
      score += 20;
    } else if (user.location.state?.toLowerCase() === listing.location.state?.toLowerCase()) {
      score += 10;
    }
  }

  // Preferences compatibility (50 points total)
  if (listing.preferences && user.preferences) {
    // Gender preference (15 points)
    maxScore += 15;
    if (listing.preferences.gender === 'no-preference' || 
        user.preferences.gender === 'no-preference' ||
        listing.preferences.gender === user.preferences.gender) {
      score += 15;
    }

    // Smoking preference (15 points)
    maxScore += 15;
    if (listing.preferences.smoking === 'no-preference') {
      score += 15;
    } else if (listing.preferences.smoking === user.preferences.smoking) {
      score += 15;
    } else if (user.preferences.smoking === 'occasionally') {
      score += 8;
    }

    // Pets preference (10 points)
    maxScore += 10;
    if (listing.preferences.pets === 'negotiable') {
      score += 10;
    } else if (listing.preferences.pets === user.preferences.pets) {
      score += 10;
    } else if (listing.preferences.pets === 'no' && user.preferences.pets === 'no') {
      score += 10;
    }

    // Lifestyle compatibility (10 points)
    maxScore += 10;
    if (user.preferences.lifestyle && listing.preferences.lifestyle) {
      const lifestyleMatch = {
        'quiet': { 'quiet': 10, 'moderate': 5, 'social': 2, 'party': 0 },
        'moderate': { 'quiet': 5, 'moderate': 10, 'social': 7, 'party': 3 },
        'social': { 'quiet': 2, 'moderate': 7, 'social': 10, 'party': 7 },
        'party': { 'quiet': 0, 'moderate': 3, 'social': 7, 'party': 10 }
      };
      score += lifestyleMatch[user.preferences.lifestyle]?.[listing.preferences.lifestyle] || 0;
    }
  }

  // Calculate percentage
  const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
  
  return {
    score: percentage,
    breakdown: {
      budget: Math.round((30 / maxScore) * 100),
      location: Math.round((20 / maxScore) * 100),
      preferences: Math.round((50 / maxScore) * 100)
    }
  };
};

// @desc    Get matched listings for current user
// @route   GET /api/listings/matches
// @access  Private
exports.getMatches = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const listings = await Listing.find({ 
      isActive: true,
      user: { $ne: req.user.id } // Exclude own listings
    })
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    // Calculate compatibility for each listing
    const matchedListings = listings.map(listing => {
      const compatibility = calculateCompatibility(user, listing);
      return {
        ...listing.toObject(),
        compatibility
      };
    });

    // Sort by compatibility score
    matchedListings.sort((a, b) => b.compatibility.score - a.compatibility.score);

    res.json({
      success: true,
      count: matchedListings.length,
      data: matchedListings
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Search and filter listings
// @route   GET /api/listings/search
// @access  Public
exports.searchListings = async (req, res) => {
  
  try {
    const {
      city,
      state,
      minRent,
      maxRent,
      propertyType,
      bedrooms,
      bathrooms,
      furnished,
      pets,
      smoking,
      availableFrom
    } = req.query;

    // Build query
    // Build query
const query = { isActive: true };

// Exclude current user's listings if authenticated
if (req.user) {
  query.user = { $ne: req.user.id };
}

    if (city) {
      query['location.city'] = new RegExp(city, 'i');
    }

    if (state) {
      query['location.state'] = new RegExp(state, 'i');
    }

    if (minRent || maxRent) {
      query.rentAmount = {};
      if (minRent) query.rentAmount.$gte = parseInt(minRent);
      if (maxRent) query.rentAmount.$lte = parseInt(maxRent);
    }

    if (propertyType) {
      query.propertyType = propertyType;
    }

    if (bedrooms) {
      query['roomDetails.bedrooms'] = parseInt(bedrooms);
    }

    if (bathrooms) {
      query['roomDetails.bathrooms'] = parseInt(bathrooms);
    }

    if (furnished !== undefined) {
      query['roomDetails.furnished'] = furnished === 'true';
    }

    if (pets) {
      query['preferences.pets'] = pets;
    }

    if (smoking) {
      query['preferences.smoking'] = smoking;
    }

    if (availableFrom) {
      query['roomDetails.availableFrom'] = { $lte: new Date(availableFrom) };
    }

    const listings = await Listing.find(query)
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    // If user is authenticated, add compatibility scores
    let results = listings;
    if (req.user) {
      const user = await User.findById(req.user.id);
      results = listings.map(listing => {
        const compatibility = calculateCompatibility(user, listing);
        return {
          ...listing.toObject(),
          compatibility
        };
      });
      results.sort((a, b) => b.compatibility.score - a.compatibility.score);
    }

    res.json({
      success: true,
      count: results.length,
      data: results
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = exports;