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
    
    // Validate team size limit
    const parsedMembers = JSON.parse(members);
    if (parsedMembers && parsedMembers.length > 4) {
      res.status(400);
      throw new Error('Maximum team size is 4 members including the leader');
    }
    
    // 1. Human Verification - FIXED
    if (!captchaToken) {
      res.status(400);
      throw new Error('Captcha token is required');
    }

    // Verify reCAPTCHA with Google
    try {
      const verificationUrl = `https://www.google.com/recaptcha/api/siteverify`;
      const captchaResponse = await axios.post(verificationUrl, null, {
        params: {
          secret: process.env.RECAPTCHA_SECRET_KEY,
          response: captchaToken
        }
      });
      
      console.log('reCAPTCHA verification:', captchaResponse.data);
      
      if (!captchaResponse.data.success) {
        res.status(400);
        throw new Error('Captcha verification failed. Are you a robot?');
      }
    } catch (error) {
      console.error('reCAPTCHA error:', error.message);
      res.status(400);
      throw new Error('Captcha verification failed. Please try again.');
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

    // Create ID card document entry for the documents array
    const idCardDocument = {
      _id: new Date().getTime().toString(),
      filename: req.file.filename,
      originalName: `ID Card - ${req.file.originalname}`,
      size: req.file.size,
      mimetype: req.file.mimetype,
      uploadDate: new Date(),
      path: req.file.path
    };

    const team = await Team.create({
      teamName,
      organization,
      teamId,
      leader: req.user._id, // Logged in user is the Leader
      members: parsedMembers,
      idCardUrl: req.file.path,
      isIdVerified: isVerified,
      documents: [idCardDocument] // Add ID card as the first document
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
        // Check if user exists from auth middleware
        if (!req.user) {
            return res.status(401).json({ message: "Not authorized" });
        }

        const team = await Team.findOne({ leader: req.user._id });
        if (!team) {
            return res.status(404).json({ message: "No team found" });
        }
        res.json(team);
    } catch (error) {
        console.error('Get team error:', error);
        next(error);
    }
};

// @desc Update Team Information
exports.updateTeam = async (req, res, next) => {
    try {
        const { teamName, organization, members } = req.body;
        const teamId = req.params.id;

        // Validate team size limit
        if (members && members.length > 4) {
            return res.status(400).json({ message: "Maximum team size is 4 members including the leader" });
        }

        // Find team and verify user is the leader
        const team = await Team.findById(teamId);
        if (!team) {
            return res.status(404).json({ message: "Team not found" });
        }

        if (team.leader.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Only team leader can update team information" });
        }

        // Find newly added members by comparing old and new member lists
        const oldMemberEmails = team.members.map(member => member.email);
        const newMembers = members.filter(member => !oldMemberEmails.includes(member.email));

        // Update team information
        const updatedTeam = await Team.findByIdAndUpdate(
            teamId,
            {
                teamName,
                organization,
                members
            },
            { new: true }
        );

        // Send welcome emails to newly added members
        if (newMembers.length > 0) {
            const welcomeEmailHtml = `
                <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                    <h1 style="color: #4F46E5;">Welcome to Team ${teamName}!</h1>
                    <p>You have been added to the team by the team leader: <strong>${req.user.name}</strong></p>
                    <br/>
                    <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 15px 0;">
                        <h3>Team Information:</h3>
                        <p><strong>Team Name:</strong> ${teamName}</p>
                        <p><strong>Team ID:</strong> <span style="background: #eee; padding: 5px 10px; border-radius: 5px;">${team.teamId}</span></p>
                        <p><strong>Organization:</strong> ${organization}</p>
                        <p><strong>Team Leader:</strong> ${req.user.name} (${req.user.email})</p>
                        <p><strong>Verification Status:</strong> ${team.isIdVerified ? '<span style="color:green">✅ Verified</span>' : '<span style="color:orange">⏳ Pending Verification</span>'}</p>
                    </div>
                    <br/>
                    <h3>What's Next?</h3>
                    <ul>
                        <li>You can now access the team dashboard with your login credentials</li>
                        <li>View team documents and collaborate with your teammates</li>
                        <li>Use the Team ID above for any official communications</li>
                        <li>Contact your team leader for any questions or concerns</li>
                    </ul>
                    <br/>
                    <p>Welcome aboard and good luck with your hackathon journey!</p>
                    <p style="color: #666; font-size: 12px;">If you believe this is an error, please contact your team leader immediately.</p>
                </div>
            `;

            // Send welcome emails to all newly added members
            const emailPromises = newMembers.map(member => 
                sendEmail(
                    member.email, 
                    `Welcome to Team ${teamName} - You've Been Added!`, 
                    welcomeEmailHtml
                )
            );

            try {
                await Promise.all(emailPromises);
                console.log(`Welcome emails sent to ${newMembers.length} new member(s)`);
            } catch (emailError) {
                console.error('Error sending welcome emails:', emailError);
                // Don't fail the team update if email sending fails
            }
        }

        res.json(updatedTeam);
    } catch (error) {
        next(error);
    }
};

// @desc Upload Team Document
exports.uploadDocument = async (req, res, next) => {
    try {
        const teamId = req.params.id;
        
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        // Find team and verify user is the leader
        const team = await Team.findById(teamId);
        if (!team) {
            return res.status(404).json({ message: "Team not found" });
        }

        if (team.leader.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Only team leader can upload documents" });
        }

        const document = {
            _id: new Date().getTime().toString(), // Simple ID generation
            filename: req.file.filename,
            originalName: req.file.originalname,
            size: req.file.size,
            mimetype: req.file.mimetype,
            uploadDate: new Date(),
            path: req.file.path
        };

        // Add document to team
        if (!team.documents) {
            team.documents = [];
        }
        team.documents.push(document);
        await team.save();

        res.status(201).json(document);
    } catch (error) {
        // Clean up uploaded file if error
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        next(error);
    }
};

// @desc Get Team Documents
exports.getTeamDocuments = async (req, res, next) => {
    try {
        const teamId = req.params.id;

        // Find team and verify user is a member or leader
        const team = await Team.findById(teamId);
        if (!team) {
            return res.status(404).json({ message: "Team not found" });
        }

        // Check if user is team leader or member
        const isLeader = team.leader.toString() === req.user._id.toString();
        const isMember = team.members.some(member => member.email === req.user.email);

        if (!isLeader && !isMember) {
            return res.status(403).json({ message: "Access denied" });
        }

        res.json(team.documents || []);
    } catch (error) {
        next(error);
    }
};

// @desc Download Team Document
exports.downloadDocument = async (req, res, next) => {
    try {
        const { id: teamId, docId } = req.params;

        // Find team and verify user access
        const team = await Team.findById(teamId);
        if (!team) {
            return res.status(404).json({ message: "Team not found" });
        }

        // Check if user is team leader or member
        const isLeader = team.leader.toString() === req.user._id.toString();
        const isMember = team.members.some(member => member.email === req.user.email);

        if (!isLeader && !isMember) {
            return res.status(403).json({ message: "Access denied" });
        }

        // Find document
        const document = team.documents?.find(doc => doc._id === docId);
        if (!document) {
            return res.status(404).json({ message: "Document not found" });
        }

        const filePath = path.join(__dirname, '..', document.path);
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ message: "File not found on server" });
        }

        res.download(filePath, document.originalName);
    } catch (error) {
        next(error);
    }
};

// @desc Delete Team Document
exports.deleteDocument = async (req, res, next) => {
    try {
        const { id: teamId, docId } = req.params;

        // Find team and verify user is the leader
        const team = await Team.findById(teamId);
        if (!team) {
            return res.status(404).json({ message: "Team not found" });
        }

        if (team.leader.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Only team leader can delete documents" });
        }

        // Find and remove document
        const documentIndex = team.documents?.findIndex(doc => doc._id === docId);
        if (documentIndex === -1 || documentIndex === undefined) {
            return res.status(404).json({ message: "Document not found" });
        }

        const document = team.documents[documentIndex];
        const filePath = path.join(__dirname, '..', document.path);

        // Remove document from database
        team.documents.splice(documentIndex, 1);
        await team.save();

        // Delete file from filesystem
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        res.json({ message: "Document deleted successfully" });
    } catch (error) {
        next(error);
    }
};