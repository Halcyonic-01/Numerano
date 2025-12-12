const { GoogleGenerativeAI } = require("@google/generative-ai");

// --- CONFIGURATION & FINE-TUNING ---

// 1. Initialize Gemini API
// Ensure GEMINI_API_KEY is in your .env file
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// 2. Select the Model
// 'gemini-pro' is best for text-based chat interactions.
const model = genAI.getGenerativeModel({ model: "gemini-pro"});

// 3. Define the "System Context" (The Fine-tuning)
// This tells the bot its role, knowledge base, and tone constraints.
const hackathonSystemContext = `
INSTRUCTIONS:
You are "HackBot", the official AI support assistant for our Hackathon Platform.
Your role is to guide users through the registration process and answer event-related questions.

YOUR KNOWLEDGE BASE:
1.  **Platform Goal:** We help teams register for an upcoming hackathon.
2.  **The Registration Flow (Crucial):** Tell users the steps are:
    * Step 1: Sign Up for an account and Log In.
    * Step 2: Go to the dashboard to register a team.
    * Step 3: Provide a unique Team Name and list member emails.
    * Step 4: The Team Leader MUST upload a clear ID card image for verification.
3.  **Verification Info:** Tell them we use automated ID verification. If the image is blurry, it might require manual review, which takes longer.
4.  **Tone:** Be enthusiastic, encouraging, polite, and professional. Keep answers concise.
5.  **CONSTRAINTS:** You must ONLY answer questions related to the hackathon, registration, team formation, or general programming concepts. If a user asks about unrelated topics (like the weather, politics, or cooking recipes), politely decline by saying, "I am tuned only to answer questions related to the hackathon event."
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
    
    // We start a chat session. To establish the "persona", we feed the
    // system context as the very first user prompt history, and a dummy model response.
    // This tricks the model into adopting the persona for the subsequent message.
    const chat = model.startChat({
        history: [
            {
                role: "user",
                parts: [{ text: hackathonSystemContext + "\n\nIntroduce yourself." }],
            },
            {
                role: "model",
                parts: [{ text: "Hello! I am HackBot, your official hackathon assistant. I'm here to help you register your team and answer any questions about the event process. Let's get hacking!" }],
            },
        ],
        generationConfig: {
            maxOutputTokens: 300, // Limit response length to keep it concise
            temperature: 0.7, // A balance between creative and deterministic responses
        },
    });

    // Send the actual user's message to the chat session
    const result = await chat.sendMessage(message);
    const response = await result.response;
    const botReply = response.text();

    // Simple safety check for empty responses
    if (!botReply) {
        throw new Error("Received empty response from AI service");
    }

    res.json({ reply: botReply });

  } catch (error) {
    // Enhanced error logging for debugging AI issues
    console.error("Gemini Chat API Error Details:", error);
    
    // Check for specific Google API errors (like quota limits or safety blocks)
    if (error.message && error.message.includes("SAFETY")) {
        res.status(400);
        return next(new Error("Your message triggered our safety filters. Please rephrase."));
    }
    
    res.status(503); // Service Unavailable is often more accurate for API failures
    // Don't expose ugly API errors to the frontend user
    next(new Error('Our chatbot is currently experiencing high traffic. Please try again later.'));
  }
};