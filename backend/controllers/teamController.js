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
    const { teamName, members, captchaToken } = req.body;
    
    // 1. Human Verification (reCAPTCHA)
    const verificationUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${captchaToken}`;
    const captchaResponse = await axios.post(verificationUrl);
    
    if (!captchaResponse.data.success) {
      res.status(400);
      throw new Error('Captcha verification failed. Are you a robot?');
    }

    // 2. ID Card Upload Handling
    if (!req.file) {
      res.status(400);
      throw new Error('ID Card image is required');
    }
    
    const filePath = path.join(__dirname, '..', req.file.path);

    // 3. ID Verification (OCR Check)
    // We check if the uploaded ID contains the Leader's name as a basic verification step
    let isVerified = false;
    try {
      const { data: { text } } = await Tesseract.recognize(filePath, 'eng');
      console.log("OCR Text Detected:", text);
      
      // Simple logic: Does ID contain user's name?
      // In production, use AWS Rekognition for facial match or specific ID regex
      if (text.toLowerCase().includes(req.user.name.toLowerCase())) {
        isVerified = true;
      }
    } catch (err) {
      console.error("OCR Failed:", err);
      // Proceeding with unverified status rather than crashing
    }

    // 4. Generate Unique Team ID
    const teamId = `TM-${nanoid(6).toUpperCase()}`;

    // 5. Save to DB
    const team = await Team.create({
      teamName,
      teamId,
      leader: req.user._id,
      members: JSON.parse(members), // Expecting array string
      idCardUrl: req.file.path,
      isIdVerified: isVerified
    });

    // 6. Send Confirmation Email
    const emailHtml = `
      <h1>Team Registered Successfully!</h1>
      <p>Your Team ID is: <strong>${teamId}</strong></p>
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