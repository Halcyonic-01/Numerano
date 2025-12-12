const { GoogleGenerativeAI } = require("@google/generative-ai");

// --- CONFIGURATION & FINE-TUNING ---

// Check if API key exists
if (!process.env.GEMINI_API_KEY) {
    console.error('GEMINI_API_KEY is not set in environment variables');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro"});

// Updated system context with comprehensive project information
const hackathonSystemContext = `
INSTRUCTIONS:
You are "TeamBot", the expert AI assistant for the 'Numerano' Hackathon Platform.
You must answer questions specifically related to this project, its features, and processes.

PROJECT OVERVIEW:
Numerano is a comprehensive team registration and management platform for hackathons with advanced verification and collaboration features.

TECH STACK:
* Frontend: React 18, TypeScript, Vite, Tailwind CSS, ShadcnUI, Lucide Icons
* Backend: Node.js, Express.js, JWT Authentication
* Database: MongoDB Atlas with Mongoose ODM
* AI/ML: Google Gemini Pro (You!), Tesseract.js OCR, Google reCAPTCHA v2
* Email: Nodemailer with automated notifications
* File Upload: Multer with 5MB limit (PDF, DOC, DOCX, JPG, PNG, TXT)
* Security: bcryptjs, Helmet, CORS, rate limiting

KEY FEATURES:
1. **User Authentication**:
   - Secure signup/login with JWT tokens
   - Password hashing with bcryptjs
   - Protected routes and role-based access

2. **Team Registration Process**:
   - Step 1: Human verification with reCAPTCHA
   - Step 2: Team details (name, organization, members)
   - Step 3: ID card upload with OCR verification
   - Step 4: Automatic team ID generation (format: TM-XXXXXX)
   - Maximum team size: 4 members including leader

3. **ID Verification System**:
   - Upload ID card (JPG, PNG, PDF)
   - Tesseract.js OCR extracts text from image
   - Auto-verification if user name matches ID text
   - Manual review for failed auto-verification

4. **Team Management Dashboard**:
   - View team information and unique team ID
   - Team member management (add/remove by leader only)
   - Document upload and management system
   - Real-time verification status
   - Team statistics and activity tracking

5. **Document Management**:
   - Upload team documents (ID cards, certificates, etc.)
   - Leader-only upload/delete permissions
   - All members can view/download documents
   - Secure file storage with original filename preservation

6. **Email Notification System**:
   - Welcome emails to all team members upon registration
   - Notification emails when new members are added
   - Professional HTML email templates with team details

7. **Security Features**:
   - JWT token-based authentication
   - File type and size validation
   - Protected API endpoints
   - CORS configuration for cross-origin requests

REGISTRATION WORKFLOW:
1. User signs up/logs in to platform
2. Clicks "Register Team" from dashboard
3. Completes reCAPTCHA verification
4. Enters team name, organization, and member details
5. Uploads leader's ID card for verification
6. System processes OCR and generates unique team ID
7. Confirmation emails sent to all team members
8. Team appears on dashboard with verification status

TEAM MANAGEMENT:
- Only team leaders can edit team information
- Leaders can add/remove members (max 4 total)
- New members receive welcome emails automatically
- All team members can access documents
- Team ID is used for all official communications

FILE MANAGEMENT:
- Supported formats: PDF, DOC, DOCX, JPG, PNG, TXT
- Maximum file size: 5MB per upload
- Files stored securely on server filesystem
- Access controlled through API authentication

CONSTRAINTS:
* Answer only Numerano-related questions
* Provide accurate technical information about the platform
* If asked about unrelated topics, politely redirect to Numerano features
* Be helpful, concise, and professional
* Include specific details about processes and limitations when relevant
`;

// --- CONTROLLER ---

// @desc Chat with AI (Gemini Pro) with Fallback
exports.chatWithBot = async (req, res, next) => {
  try {
    const { message } = req.body;

    if (!message) {
        res.status(400);
        throw new Error("Message field is required");
    }

    // If no API key, use fallback responses
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY.length < 20) {
        const fallbackResponse = getFallbackResponse(message.toLowerCase());
        return res.json({ reply: fallbackResponse });
    }
    
    // Start chat session with comprehensive system context
    const chat = model.startChat({
        history: [
            {
                role: "user",
                parts: [{ text: hackathonSystemContext + "\n\nIntroduce yourself briefly and ask how you can help." }],
            },
            {
                role: "model",
                parts: [{ text: "Hello! I'm TeamBot, your AI assistant for the Numerano platform. I can help you with team registration, document management, platform features, technical questions, and troubleshooting. What would you like to know about Numerano today?" }],
            },
        ],
        generationConfig: {
            maxOutputTokens: 800, // Increased for more detailed responses
            temperature: 0.8, // Slightly more creative responses
        },
    });

    const result = await chat.sendMessage(message);
    const response = await result.response;
    const botReply = response.text();

    if (!botReply) {
        throw new Error("Received empty response from AI service");
    }

    res.json({ reply: botReply });

  } catch (error) {
    console.error("Gemini Chat API Error:", error);
    
    // Fallback to predefined responses on any error
    const fallbackResponse = getFallbackResponse(req.body.message?.toLowerCase() || "");
    return res.json({ reply: fallbackResponse });
  }
};

// Fallback response function
function getFallbackResponse(message) {
    const responses = {
        'register': 'To register your team:\n1. Click "Register Team" from dashboard\n2. Complete reCAPTCHA verification\n3. Enter team details (max 4 members)\n4. Upload your ID card\n5. Get your unique Team ID!',
        'team': 'Numerano supports teams of up to 4 members including the leader. Only team leaders can add/remove members and manage documents.',
        'document': 'You can upload documents like ID cards, certificates, etc. Supported formats: PDF, DOC, DOCX, JPG, PNG, TXT (max 5MB). Only team leaders can upload/delete documents.',
        'verification': 'We use OCR technology to automatically verify your ID card. If your name matches the ID text, you\'ll be auto-verified. Otherwise, manual review is required.',
        'login': 'Having trouble logging in? Make sure you\'re using the correct email and password. If you forgot your password, contact support.',
        'dashboard': 'Your dashboard shows team information, member list, verification status, and document management. Team leaders have additional editing permissions.',
        'support': 'For technical support, you can:\n• Use this chat widget\n• Contact our support team\n• Check the help documentation\n• Review team guidelines'
    };

    // Find matching response
    for (const [keyword, response] of Object.entries(responses)) {
        if (message.includes(keyword)) {
            return response;
        }
    }

    // Default response
    return 'Hello! I\'m TeamBot for Numerano. I can help you with:\n• Team registration process\n• Document management\n• Platform features\n• Technical support\n\nWhat specific question do you have about Numerano?';
}