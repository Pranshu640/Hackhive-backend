const express = require('express');
const { protect } = require('../controllers/authController');
const {
  searchUsers,
  sendTeamRequest,
  getReceivedRequests,
  handleTeamRequest
} = require('../controllers/teamRequestController');

const router = express.Router();

// Protect all routes after this middleware
router.use(protect);

router.get('/search', searchUsers);
router.post('/send', sendTeamRequest);
router.get('/received', getReceivedRequests);
router.post('/handle', handleTeamRequest);

module.exports = router;