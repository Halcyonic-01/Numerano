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
    const { teamName, organization, members, captchaToken } = req.body;
    
    // 1. Human Verification
    if (captchaToken !== 'dummy-token-or-real-token') {
        const verificationUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${captchaToken}`;
        const captchaResponse = await axios.post(verificationUrl);
        if (!captchaResponse.data.success) {
          res.status(400);
          throw new Error('Captcha verification failed. Are you a robot?');
        }
    }

    // 2. ID Card Upload Check
    if (!req.file) {
      res.status(400);
      throw new Error('ID Card image is required');
    }
    
    const filePath = path.join(__dirname, '..', req.file.path);

    // 3. ID Verification (OCR)
    let isVerified = false;
    try {
      const { data: { text } } = await Tesseract.recognize(filePath, 'eng');
      console.log("OCR Text Detected:", text);
      if (text.toLowerCase().includes(req.user.name.toLowerCase())) {
        isVerified = true;
      }
    } catch (err) {
      console.error("OCR Failed:", err);
    }

    // 4. Create Team ID & Save
    const teamId = `TM-${nanoid(6).toUpperCase()}`;
    const parsedMembers = JSON.parse(members); // Ensure this is parsed

    const team = await Team.create({
      teamName,
      organization,
      teamId,
      leader: req.user._id, // Logged in user is the Leader
      members: parsedMembers,
      idCardUrl: req.file.path,
      isIdVerified: isVerified
    });

    // 5. Send Email to ALL Members
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h1 style="color: #4F46E5;">Team Registered Successfully!</h1>
        <p><strong>Team Name:</strong> ${teamName}</p>
        <p><strong>Team ID:</strong> <span style="background: #eee; padding: 5px 10px; border-radius: 5px;">${teamId}</span></p>
        <p><strong>Organization:</strong> ${organization}</p>
        <p><strong>Leader:</strong> ${req.user.name}</p>
        <p><strong>Verification Status:</strong> ${isVerified ? '<span style="color:green">Verified</span>' : '<span style="color:orange">Pending Review</span>'}</p>
        <br/>
        <p>Welcome to the Hackathon! Use your Team ID for all future correspondence.</p>
      </div>
    `;

    // Collect all emails (Leader + Members)
    const emailRecipients = [req.user.email]; // Start with leader
    if (Array.isArray(parsedMembers)) {
        parsedMembers.forEach(member => {
            if (member.email && !emailRecipients.includes(member.email)) {
                emailRecipients.push(member.email);
            }
        });
    }

    // Send emails in parallel
    const emailPromises = emailRecipients.map(email => 
        sendEmail(email, `Team Registration Confirmed: ${teamName}`, emailHtml)
    );
    await Promise.all(emailPromises);

    res.status(201).json(team);

  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    next(error);
  }
};

// @desc Get Team for Logged In User
exports.getMyTeam = async (req, res, next) => {
    try {
        const team = await Team.findOne({ leader: req.user._id });
        if (!team) {
            return res.status(404).json({ message: "No team found" });
        }
        res.json(team);
    } catch (error) {
        next(error);
    }
};