const Admin = require('../models/Admin');
const Team = require('../models/Team');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/emailService');

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// @desc Admin Signup
exports.adminSignup = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: 'Admin with this email already exists' });
    }

    // Create admin
    const admin = await Admin.create({ name, email, password });

    // Generate token
    const token = generateToken(admin._id);

    res.status(201).json({
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      token,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Admin Login
exports.adminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find admin
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isPasswordCorrect = await admin.comparePassword(password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Update last login
    admin.lastLogin = new Date();
    await admin.save();

    // Generate token
    const token = generateToken(admin._id);

    res.json({
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      token,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get Admin Profile
exports.getAdminProfile = async (req, res, next) => {
  try {
    const admin = await Admin.findById(req.admin.id).select('-password');
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }
    res.json(admin);
  } catch (error) {
    next(error);
  }
};

// @desc Get All Teams for Review
exports.getAllTeams = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    let filter = {};
    if (status) {
      filter.status = status;
    }

    const teams = await Team.find(filter)
      .populate('leader', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Team.countDocuments(filter);

    res.json({
      teams,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get Team Details
exports.getTeamDetails = async (req, res, next) => {
  try {
    const team = await Team.findById(req.params.id).populate('leader', 'name email');
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    res.json(team);
  } catch (error) {
    next(error);
  }
};

// @desc Approve Team
exports.approveTeam = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { comments } = req.body;

    const team = await Team.findById(id).populate('leader', 'name email');
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    team.status = 'approved';
    team.adminComments = comments || 'Team approved by admin';
    team.reviewedBy = req.admin.id;
    team.reviewedAt = new Date();
    await team.save();

    // Send approval email to team leader and members
    const approvalEmailHtml = `
      <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h1 style="color: #22c55e;">🎉 Team Approved!</h1>
        <p>Congratulations! Your team <strong>${team.teamName}</strong> has been approved.</p>
        <br/>
        <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; margin: 15px 0;">
          <h3>Team Details:</h3>
          <p><strong>Team ID:</strong> <span style="background: #eee; padding: 5px 10px; border-radius: 5px;">${team.teamId}</span></p>
          <p><strong>Organization:</strong> ${team.organization}</p>
          <p><strong>Status:</strong> <span style="color: #22c55e;">✅ APPROVED</span></p>
        </div>
        ${comments ? `<p><strong>Admin Comments:</strong> ${comments}</p>` : ''}
        <br/>
        <p>You can now access all platform features and participate in the hackathon!</p>
        <p>Good luck with your project!</p>
      </div>
    `;

    // Send emails to team leader and all members
    const emailPromises = [team.leader.email, ...team.members.map(m => m.email)]
      .filter(email => email)
      .map(email => sendEmail(
        email, 
        `Team ${team.teamName} Approved - Numerano`, 
        approvalEmailHtml
      ));

    await Promise.all(emailPromises);

    res.json({ message: 'Team approved successfully', team });
  } catch (error) {
    next(error);
  }
};

// @desc Reject Team
exports.rejectTeam = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason, comments } = req.body;

    const team = await Team.findById(id).populate('leader', 'name email');
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    team.status = 'rejected';
    team.rejectionReason = reason;
    team.adminComments = comments;
    team.reviewedBy = req.admin.id;
    team.reviewedAt = new Date();
    await team.save();

    // Send rejection email
    const rejectionEmailHtml = `
      <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h1 style="color: #ef4444;">Team Registration Update</h1>
        <p>We regret to inform you that your team <strong>${team.teamName}</strong> registration requires revision.</p>
        <br/>
        <div style="background: #fef2f2; padding: 15px; border-radius: 8px; margin: 15px 0;">
          <h3>Reason for Revision:</h3>
          <p><strong>${reason}</strong></p>
          ${comments ? `<p><strong>Additional Comments:</strong> ${comments}</p>` : ''}
        </div>
        <br/>
        <p>Please review the feedback and update your registration accordingly.</p>
        <p>You can re-submit your application after making the necessary changes.</p>
        <br/>
        <p>If you have any questions, please contact our support team.</p>
      </div>
    `;

    // Send emails to team leader and all members
    const emailPromises = [team.leader.email, ...team.members.map(m => m.email)]
      .filter(email => email)
      .map(email => sendEmail(
        email, 
        `Team ${team.teamName} Registration - Action Required`, 
        rejectionEmailHtml
      ));

    await Promise.all(emailPromises);

    res.json({ message: 'Team rejected successfully', team });
  } catch (error) {
    next(error);
  }
};

// @desc Get Dashboard Stats
exports.getDashboardStats = async (req, res, next) => {
  try {
    const totalTeams = await Team.countDocuments();
    const pendingTeams = await Team.countDocuments({ status: 'pending' });
    const approvedTeams = await Team.countDocuments({ status: 'approved' });
    const rejectedTeams = await Team.countDocuments({ status: 'rejected' });
    const verifiedTeams = await Team.countDocuments({ isIdVerified: true });

    // Recent teams (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentTeams = await Team.countDocuments({ 
      createdAt: { $gte: sevenDaysAgo } 
    });

    res.json({
      totalTeams,
      pendingTeams,
      approvedTeams,
      rejectedTeams,
      verifiedTeams,
      recentTeams
    });
  } catch (error) {
    next(error);
  }
};