const Team = require('../models/Team');
const { nanoid } = require('nanoid');
const axios = require('axios');
const sendEmail = require('../utils/emailService');
const Tesseract = require('tesseract.js');
const fs = require('fs');
const path = require('path');

// @desc Register Team
exports.registerTeam = async (req, res, next) => {
  try {
    // 1. Extract data including organization
    const { teamName, organization, members, captchaToken } = req.body;
    
    // 2. Human Verification (reCAPTCHA)
    // Note: If testing locally with a dummy token, you might want to skip this check or use a test key.
    if (captchaToken !== 'dummy-token-or-real-token') {
        const verificationUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${captchaToken}`;
        const captchaResponse = await axios.post(verificationUrl);
        
        if (!captchaResponse.data.success) {
          res.status(400);
          throw new Error('Captcha verification failed. Are you a robot?');
        }
    }

    // 3. ID Card Upload Handling
    if (!req.file) {
      res.status(400);
      throw new Error('ID Card image is required');
    }
    
    const filePath = path.join(__dirname, '..', req.file.path);

    // 4. ID Verification (OCR Check)
    let isVerified = false;
    try {
      const { data: { text } } = await Tesseract.recognize(filePath, 'eng');
      console.log("OCR Text Detected:", text);
      
      // Check if ID contains user's name
      if (text.toLowerCase().includes(req.user.name.toLowerCase())) {
        isVerified = true;
      }
    } catch (err) {
      console.error("OCR Failed:", err);
      // Proceeding with unverified status rather than crashing
    }

    // 5. Generate Unique Team ID
    const teamId = `TM-${nanoid(6).toUpperCase()}`;

    // 6. Save to DB
    const team = await Team.create({
      teamName,
      organization, // Save the organization
      teamId,
      leader: req.user._id,
      members: JSON.parse(members), // Parse the JSON string from FormData
      idCardUrl: req.file.path,
      isIdVerified: isVerified
    });

    // 7. Send Confirmation Email
    const emailHtml = `
      <h1>Team Registered Successfully!</h1>
      <p>Your Team ID is: <strong>${teamId}</strong></p>
      <p>Organization: ${organization}</p>
      <p>ID Verification Status: <strong>${isVerified ? 'Verified' : 'Pending Manual Review'}</strong></p>
    `;
    
    await sendEmail(req.user.email, 'Hackathon Team Registration', emailHtml);

    res.status(201).json(team);

  } catch (error) {
    // Cleanup file if error occurs
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    next(error);
  }
};

// @desc Get Team for Logged In User
exports.getMyTeam = async (req, res, next) => {
    try {
        // Find the team where the leader is the logged-in user
        const team = await Team.findOne({ leader: req.user._id });
        
        if (!team) {
            // It's okay if they haven't registered yet, just return null or 404
            return res.status(404).json({ message: "No team found" });
        }
        
        res.json(team);
    } catch (error) {
        next(error);
    }
};