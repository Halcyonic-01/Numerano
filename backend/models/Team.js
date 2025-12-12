const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  teamName: { type: String, required: true },
  organization: { type: String, required: true }, // Added organization field
  teamId: { type: String, required: true, unique: true },
  leader: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  // Updated members to match the object structure sent by frontend
  members: [{ 
    name: { type: String, required: true },
    email: { type: String, required: true }
  }], 
  idCardUrl: { type: String, required: true },
  isIdVerified: { type: Boolean, default: false },
  status: { type: String, default: 'pending', enum: ['pending', 'approved', 'rejected'] }
}, { timestamps: true });

module.exports = mongoose.model('Team', teamSchema);