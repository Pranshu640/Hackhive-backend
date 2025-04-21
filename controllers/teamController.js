const Team = require('../models/Team');
const User = require('../models/User');

// Get team details
exports.getTeamDetails = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('team');

    if (!user.team) {
      return res.status(404).json({
        status: 'fail',
        message: 'You are not part of any team'
      });
    }

    const team = await Team.findById(user.team._id)
      .populate({
        path: 'members',
        select: 'name email skills projects competitiveExperience'
      });

    res.status(200).json({
      status: 'success',
      data: { team }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Update team details
exports.updateTeamDetails = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('team');

    if (!user.team) {
      return res.status(404).json({
        status: 'fail',
        message: 'You are not part of any team'
      });
    }

    const { name, description } = req.body;
    const updatedTeam = await Team.findByIdAndUpdate(
      user.team._id,
      { name, description },
      { new: true, runValidators: true }
    ).populate({
      path: 'members',
      select: 'name email skills projects competitiveExperience'
    });

    res.status(200).json({
      status: 'success',
      data: { team: updatedTeam }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};