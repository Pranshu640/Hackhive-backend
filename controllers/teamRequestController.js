const TeamRequest = require('../models/TeamRequest');
const User = require('../models/User');
const Team = require('../models/Team');

// Search users
exports.searchUsers = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({
        status: 'fail',
        message: 'Search query is required'
      });
    }

    const users = await User.find({
      $and: [
        { _id: { $ne: req.user.id } },
        {
          $or: [
            { name: { $regex: query, $options: 'i' } },
            { email: { $regex: query, $options: 'i' } }
          ]
        }
      ]
    }).select('name email skills');

    res.status(200).json({
      status: 'success',
      data: { users }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Send team request
exports.sendTeamRequest = async (req, res) => {
  try {
    const { receiverId } = req.body;
    
    // Check if request already exists
    const existingRequest = await TeamRequest.findOne({
      sender: req.user.id,
      receiver: receiverId,
      status: 'pending'
    });

    if (existingRequest) {
      return res.status(400).json({
        status: 'fail',
        message: 'Team request already sent to this user'
      });
    }

    const teamRequest = await TeamRequest.create({
      sender: req.user.id,
      receiver: receiverId
    });

    res.status(201).json({
      status: 'success',
      data: { teamRequest }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Get received team requests
exports.getReceivedRequests = async (req, res) => {
  try {
    const requests = await TeamRequest.find({
      receiver: req.user.id,
      status: 'pending'
    }).populate('sender', 'name email');

    res.status(200).json({
      status: 'success',
      data: { requests }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Handle team request (accept/reject)
exports.handleTeamRequest = async (req, res) => {
  try {
    const { requestId, action } = req.body;
    
    if (!['accepted', 'rejected'].includes(action)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid action. Must be either "accepted" or "rejected"'
      });
    }

    const teamRequest = await TeamRequest.findOne({
      _id: requestId,
      receiver: req.user.id,
      status: 'pending'
    }).populate('sender', 'name email');

    if (!teamRequest) {
      return res.status(404).json({
        status: 'fail',
        message: 'Team request not found or already handled'
      });
    }

    teamRequest.status = action;
    await teamRequest.save();

    if (action === 'accepted') {
      // Check if either user is already in a team
      const [sender, receiver] = await Promise.all([
        User.findById(teamRequest.sender._id).select('team'),
        User.findById(req.user.id).select('team')
      ]);

      if (sender.team || receiver.team) {
        return res.status(400).json({
          status: 'fail',
          message: 'One or both users are already in a team'
        });
      }

      // Create a new team with both users
      const team = await Team.create({
        name: `${teamRequest.sender.name}'s Team`,
        members: [teamRequest.sender._id, req.user.id],
        description: `Team formed by ${teamRequest.sender.name} and ${req.user.name}`
      });

      // Update both users with team reference
      await User.updateMany(
        { _id: { $in: [teamRequest.sender._id, req.user.id] } },
        { team: team._id }
      );

      // Populate team details
      await team.populate({
        path: 'members',
        select: 'name email skills projects competitiveExperience'
      });

      teamRequest._doc.team = team;
    }

    if (!teamRequest) {
      return res.status(404).json({
        status: 'fail',
        message: 'Team request not found or already handled'
      });
    }

    res.status(200).json({
      status: 'success',
      data: { teamRequest }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};