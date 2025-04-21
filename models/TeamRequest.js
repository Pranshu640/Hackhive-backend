const mongoose = require('mongoose');

const teamRequestSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Ensure a user can't send multiple pending requests to the same receiver
teamRequestSchema.index({ sender: 1, receiver: 1 }, { unique: true });

const TeamRequest = mongoose.model('TeamRequest', teamRequestSchema);
module.exports = TeamRequest;