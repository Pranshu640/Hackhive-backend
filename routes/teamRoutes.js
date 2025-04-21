const express = require('express');
const { protect } = require('../controllers/authController');
const {
  getTeamDetails,
  updateTeamDetails
} = require('../controllers/teamController');

const router = express.Router();

// Protect all routes after this middleware
router.use(protect);

// Team routes
router.get('/details', getTeamDetails);
router.patch('/update', updateTeamDetails);

module.exports = router;