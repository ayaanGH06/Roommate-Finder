const express = require('express');

const router = express.Router();
const {
  getAllListings,
  getListing,
  createListing,
  updateListing,
  deleteListing,
  getMyListings
} = require('../controllers/listingController');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const { getMatches, searchListings } = require('../controllers/matchingController');
const { protect } = require('../middleware/auth');

// Public routes
router.get('/', getAllListings);
router.get('/search', searchListings);
router.get('/:id', getListing);

// Protected routes
router.post('/', protect, createListing);
router.get('/user/me', protect, getMyListings);
router.get('/matches/me', protect, getMatches);
router.put('/:id', protect, updateListing);
router.delete('/:id', protect, deleteListing);
router.post('/:id/upload-images', protect, upload.array('images', 5), require('../controllers/listingController').uploadImages);

module.exports = router;