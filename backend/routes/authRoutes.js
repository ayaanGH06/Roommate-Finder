const express = require('express');
const router = express.Router();
const { register, login, getMe, updateProfile, getUserProfile } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/update-profile', protect, updateProfile);
router.get('/user/:id', getUserProfile);

module.exports = router;