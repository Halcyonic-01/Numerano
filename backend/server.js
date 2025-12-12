const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoose = require('mongoose');
const path = require('path');

// Middleware Import
const { errorHandler } = require('./middleware/errorMiddleware');

// Route Imports
const authRoutes = require('./routes/authRoutes');
const teamRoutes = require('./routes/teamRoutes');
const chatRoutes = require('./routes/chatRoutes');

dotenv.config();

// Connect DB (Atlas)
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Atlas Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};
connectDB();

const app = express();

// Global Middleware
app.use(express.json());
app.use(cors({
  // Allow BOTH common Vite ports to be safe
  origin: ["http://localhost:8080", "http://localhost:5173"], 
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"], // Explicitly allow methods
  allowedHeaders: ["Content-Type", "Authorization"] // Explicitly allow headers
}));
app.use(helmet());
app.use(morgan('dev'));
// Serve uploaded files statically so frontend can display them if needed
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- MOUNT ROUTES ---
app.use('/api/auth', authRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/chat', chatRoutes);

// Health Check
app.get('/', (req, res) => res.send('API is running...'));

// Error Handling Middleware (Must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));