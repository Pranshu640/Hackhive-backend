const express = require('express');
const { protect } = require('../controllers/authController');
const {
  createProject,
  getProject,
  getTeamProject,
  getAllProjects
} = require('../controllers/projectController');

const router = express.Router();

// Public routes
router.get('/all', getAllProjects);
router.get('/:id', getProject);

// Protected routes
router.use(protect);
router.post('/', createProject);
router.get('/team', getTeamProject);

module.exports = router;