const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A team must have a name'],
    trim: true,
    unique: true
  },
  members: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'A team must have members']
    }
  ],
  teamSkills: [{
    type: String,
    trim: true
  }],
  description: {
    type: String,
    trim: true,
    default: ''
  },
  maxMembers: {
    type: Number,
    default: 4
  },
  projects: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Project'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Populate members when querying teams
teamSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'members',
    select: 'name email skills'
  });
  next();
});

// Update team skills whenever members change
teamSchema.pre('save', async function(next) {
  if (this.isModified('members')) {
    const User = mongoose.model('User');
    const members = await User.find({ _id: { $in: this.members } });
    const allSkills = members.reduce((skills, member) => {
      return [...skills, ...member.skills];
    }, []);
    this.teamSkills = [...new Set(allSkills)];
  }
  next();
});

const Team = mongoose.model('Team', teamSchema);

module.exports = Team;