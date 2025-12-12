const { GoogleGenerativeAI } = require("@google/generative-ai");

// --- CONFIGURATION & FINE-TUNING ---

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro"});

// 3. Define the "System Context" (The Fine-tuning)
const hackathonSystemContext = `
INSTRUCTIONS:
You are "TeamBot", the expert AI assistant for the 'TeamHub' Hackathon Platform.
You must answer questions specifically related to this project, its code, features, and registration process.

YOUR KNOWLEDGE BASE (PROJECT DETAILS):
1.  **Project Name:** TeamHub (A modern Team Registration Platform).
2.  **Tech Stack:**
    * **Frontend:** React (Vite), TypeScript, Tailwind CSS, ShadcnUI, Lucide Icons.
    * **Backend:** Node.js, Express.js.
    * **Database:** MongoDB Atlas (Mongoose).
    * **AI/ML:** Google Gemini Pro (Chatbot), Tesseract.js (ID Card OCR), Google reCAPTCHA v2 (Human Verification).
    * **Security:** JWT Authentication, bcryptjs (Password Hashing), Helmet (Headers).
3.  **Key Features:**
    * **Secure Registration:** Teams must sign up and verify they are human using reCAPTCHA.
    * **ID Verification:** Users upload an ID card. The system uses OCR (Tesseract.js) to read the text. If the user's name matches the ID text, it is auto-verified.
    * **Team Management:** A Dashboard to view Team ID, verify status, and list members.
    * **Email Notifications:** Automated emails are sent to *all* team members upon registration using Nodemailer.
    * **Team Leader:** The user who registers the team is automatically assigned as the Team Leader.
4.  **Registration Process:**
    * Step 1: Sign Up / Login.
    * Step 2: Click "Register Team".
    * Step 3: Solve Captcha & Enter Details (Name, Organization, Members).
    * Step 4: Upload ID Card -> System auto-verifies -> Receive Team ID.

CONSTRAINTS:
* If asked about the code, explain that it uses a modular structure (Controllers, Routes, Models).
* If asked "What is this project?", describe TeamHub using the features above.
* If asked about unrelated topics (e.g., cooking, politics), politely decline and redirect to Hackathon topics.
* Be helpful, concise, and professional.
`;

// --- CONTROLLER ---

// @desc Chat with AI (Gemini Pro)
exports.chatWithBot = async (req, res, next) => {
  try {
    const { message } = req.body;

    if (!message) {
        res.status(400);
        throw new Error("Message field is required");
    }
    
    // We start a chat session with the system context history
    const chat = model.startChat({
        history: [
            {
                role: "user",
                parts: [{ text: hackathonSystemContext + "\n\nIntroduce yourself and wait for my question." }],
            },
            {
                role: "model",
                parts: [{ text: "Hello! I am TeamBot. I know everything about the TeamHub platform, including its MERN stack architecture, security features, and registration flow. How can I help you with the project today?" }],
            },
        ],
        generationConfig: {
            maxOutputTokens: 500, 
            temperature: 0.7,
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
    console.error("Gemini Chat API Error Details:", error);
    if (error.message && error.message.includes("SAFETY")) {
        res.status(400);
        return next(new Error("Your message triggered our safety filters. Please rephrase."));
    }
    res.status(503);
    next(new Error('Our chatbot is currently experiencing high traffic. Please try again later.'));
  }
};