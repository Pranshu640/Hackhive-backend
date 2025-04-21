const express = require('express');
const { protect } = require('../controllers/authController');
const router = express.Router();

// Import Gemini service
const { generateContent } = require('../services/gemini');
const { generateRoadmap } = require('../services/geminiroadmap');

// Protect all routes
router.use(protect);

// Generate ideas using Gemini
router.post('/generate-ideas', async (req, res) => {
  try {
    const { team, projectRequirements } = req.body;

    // Format the prompt for Gemini
    const prompt = `Given a team with the following members and their skills:\n\n${team.map(member => 
      `- ${member.name}: ${member.skills}`
    ).join('\n')}\n\nProject Requirements: ${projectRequirements}\n\nGenerate 5 innovative project ideas that best utilize the team's skills and meet the project requirements. For each idea, provide:\n1. Project title\n2. Brief description\n3. Key features\n4. How it leverages team members' skills`;

    // Generate content using Gemini
    const response = await generateContent(prompt);

    res.status(200).json({
      status: 'success',
      data: { ideas: response }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
});

// Generate project roadmap using Gemini
router.post('/generate-roadmap', async (req, res) => {
  try {
    const { idea } = req.body;
    const roadmap = await generateRoadmap(idea, req.user.id);

    res.status(200).json({
      status: 'success',
      data: { roadmap }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
});

module.exports = router;