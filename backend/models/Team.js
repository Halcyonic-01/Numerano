const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  teamName: { type: String, required: true },
  organization: { type: String, required: true },
  teamId: { type: String, required: true, unique: true },
  leader: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{ 
    name: { type: String, required: true },
    email: { type: String, required: true }
  }], 
  idCardUrl: { type: String, required: true },
  isIdVerified: { type: Boolean, default: false },
  status: { type: String, default: 'pending', enum: ['pending', 'approved', 'rejected'] },
  documents: [{
    _id: { type: String, required: true },
    filename: { type: String, required: true },
    originalName: { type: String, required: true },
    size: { type: Number, required: true },
    mimetype: { type: String, required: true },
    uploadDate: { type: Date, default: Date.now },
    path: { type: String, required: true }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Team', teamSchema);