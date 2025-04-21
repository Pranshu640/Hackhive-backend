const Project = require('../models/Project');
const Team = require('../models/Team');
const User = require('../models/User');
const mongoose = require('mongoose');

// Get all projects
exports.getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find()
      .populate({
        path: 'team',
        select: 'name members',
        populate: {
          path: 'members',
          select: 'name email skills'
        }
      })
      .populate({
        path: 'createdBy',
        select: 'name email'
      });

    res.status(200).json({
      status: 'success',
      data: {
        projects
      }
    });
  } catch (err) {
    console.error('Error fetching all projects:', err);
    res.status(500).json({
      status: 'fail',
      message: 'Error fetching projects'
    });
  }
};

// Create a new project/idea
exports.createProject = async (req, res) => {
  try {
    console.log('Creating project with data:', req.body);
    const user = await User.findById(req.user.id);
    
    // Check if user is in a team
    if (req.body.team) {
      const team = await Team.findById(req.body.team);
      console.log('Team found:', team ? team._id : 'No team found');
      
      if (!team) {
        return res.status(404).json({
          status: 'fail',
          message: 'Team not found'
        });
      }
      
      // Check if user is a member of the team
      const isTeamMember = team.members.some(member => member._id.toString() === req.user.id);
      console.log('Is user a team member:', isTeamMember);
      
      if (!isTeamMember) {
        return res.status(403).json({
          status: 'fail',
          message: 'You are not a member of this team'
        });
      }
    }
    
    // Create the project
    const project = await Project.create({
      ...req.body,
      createdBy: req.user.id
    });
    
    console.log('Project created:', project._id);
    
    // If associated with a team, add project to team's projects array
    if (req.body.team) {
      const updatedTeam = await Team.findByIdAndUpdate(req.body.team, {
        $push: { projects: project._id }
      }, { new: true });
      
      console.log('Team updated with project reference:', updatedTeam._id);
    }
    
    res.status(201).json({
      status: 'success',
      data: { project }
    });
  } catch (err) {
    console.error('Error creating project:', err);
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Get project details
exports.getProject = async (req, res) => {
  try {
    console.log('Getting project with ID:', req.params.id);
    
    // Check if the id is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      console.log('Invalid ObjectId format');
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid project ID format'
      });
    }
    
    const project = await Project.findById(req.params.id)
      .populate({
        path: 'team',
        select: 'name members',
        populate: {
          path: 'members',
          select: 'name email skills'
        }
      })
      .populate({
        path: 'createdBy',
        select: 'name email'
      });
    
    console.log('Project found:', project ? project._id : 'No project found');
    
    if (!project) {
      return res.status(404).json({
        status: 'fail',
        message: 'Project not found'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: { project }
    });
  } catch (err) {
    console.error('Error getting project details:', err);
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Get team's project
exports.getTeamProject = async (req, res) => {
  try {
    console.log('Getting team project for user:', req.user.id);
    const user = await User.findById(req.user.id).populate('team');
    
    if (!user.team) {
      console.log('User is not part of any team');
      return res.status(404).json({
        status: 'fail',
        message: 'You are not part of any team'
      });
    }
    
    console.log('User team found:', user.team._id);
    
    const team = await Team.findById(user.team._id).populate({
      path: 'projects',
      populate: [
        {
          path: 'team',
          select: 'name members',
          populate: {
            path: 'members',
            select: 'name email skills'
          }
        },
        {
          path: 'createdBy',
          select: 'name email'
        }
      ]
    });
    
    if (!team.projects || team.projects.length === 0) {
      console.log('Team has no projects');
      return res.status(404).json({
        status: 'fail',
        message: 'This team has no projects yet'
      });
    }
    
    console.log('Team projects found:', team.projects.length);
    
    // Return all team projects
    const projects = team.projects
      .populate({
        path: 'team',
        select: 'name members',
        populate: {
          path: 'members',
          select: 'name email skills'
        }
      })
      .populate({
        path: 'createdBy',
        select: 'name email'
      });
    
    res.status(200).json({
      status: 'success',
      data: { projects }
    });
  } catch (err) {
    console.error('Error getting team project:', err);
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};