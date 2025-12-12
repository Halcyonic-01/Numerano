const Groq = require("groq-sdk");
require('dotenv').config();

// --- CONFIGURATION ---

// Check if API key exists
if (!process.env.GROQ_API_KEY) {
    console.error('GROQ_API_KEY is not set in environment variables');
}

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// Groq model configuration
const GROQ_MODEL = "llama-3.3-70b-versatile"; // Fast and accurate model for chat

// --- SYSTEM CONTEXT ---
const hackathonSystemContext = `You are "TeamBot", the expert AI assistant for the 'Numerano' Hackathon Platform.
You must answer questions specifically related to this project, its features, and processes.

PROJECT OVERVIEW:
Numerano is a comprehensive team registration and management platform for hackathons with advanced verification and collaboration features.

TECH STACK:
* Frontend: React 18, TypeScript, Vite, Tailwind CSS, ShadcnUI, Lucide Icons
* Backend: Node.js, Express.js, JWT Authentication
* Database: MongoDB Atlas with Mongoose ODM
* AI/ML: Groq AI (You!), Tesseract.js OCR, Google reCAPTCHA v2
* Email: Nodemailer with automated notifications
* File Upload: Multer with 5MB limit (PDF, DOC, DOCX, JPG, PNG, TXT)
* Security: bcryptjs, Helmet, CORS, rate limiting

KEY FEATURES:
1. **User Authentication**: Secure signup/login with JWT tokens, password hashing with bcryptjs, protected routes and role-based access.

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

RESPONSE GUIDELINES:
* Answer only Numerano-related questions
* Provide accurate technical information about the platform
* If asked about unrelated topics, politely redirect to Numerano features
* Be helpful, concise, and professional
* Include specific details about processes and limitations when relevant
* Use emojis sparingly for better engagement
* Format responses with bullet points and numbered lists for clarity`;

// --- CONTROLLER ---

exports.chatWithBot = async (req, res) => {
  try {
    const { message } = req.body;

    // 1. Input Validation
    if (!message) {
      return res.status(400).json({ error: "Message field is required" });
    }

    // 2. Fallback Check: If key is missing/invalid, use local responses
    if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY.length < 20) {
      console.warn("Groq API key missing. Using fallback.");
      return res.json({ reply: getFallbackResponse(message.toLowerCase()) });
    }

    // 3. AI Request to Groq
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: hackathonSystemContext },
        { role: "user", content: message }
      ],
      model: GROQ_MODEL,
      temperature: 0.7, // Balanced between creativity and accuracy
      max_tokens: 1000, // Maximum response length
      top_p: 1,
      stream: false
    });

    const botReply = chatCompletion.choices[0]?.message?.content;

    if (!botReply) {
      throw new Error("Empty response from Groq API");
    }

    // 4. Send Success Response
    res.json({ reply: botReply });

  } catch (error) {
    console.error("Groq Chat API Error:", error.message);
    
    // 5. Error Fallback: Ensure the user always gets an answer
    const fallback = getFallbackResponse(req.body.message?.toLowerCase() || "");
    res.json({ reply: fallback });
  }
};

// --- FALLBACK LOGIC ---
function getFallbackResponse(message) {
  const responses = {
    'register': '🎯 To register your team:\n1. Click "Register Team" from dashboard\n2. Complete reCAPTCHA\n3. Enter details (max 4 members)\n4. Upload ID card\n5. Get your Team ID!',
    'team': '👥 Numerano supports teams of up to 4 members. Only leaders can manage members and docs.',
    'document': '📄 Supported formats: PDF, DOC, DOCX, JPG, PNG, TXT (max 5MB). Only leaders can upload/delete.',
    'verification': '✅ We use OCR technology. If your name matches the ID card text, you are auto-verified. Otherwise, manual review takes 24-48 hours.',
    'login': '🔐 Check your email/password. If issues persist, contact support@numerano.com.',
    'dashboard': '📊 Dashboard shows: Team ID, Member list, Verification status, and Documents.',
    'help': '🤖 I can help with Registration, Documents, Platform features, and Support. What do you need?',
    'hello': '👋 Hi! I am TeamBot for Numerano. How can I help you with your hackathon team today?'
  };

  for (const [keyword, response] of Object.entries(responses)) {
    if (message.includes(keyword)) return response;
  }

  return '👋 I am TeamBot. I can help with Numerano registration, teams, and documents. What is your question?';
}