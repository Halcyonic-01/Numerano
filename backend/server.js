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
const adminRoutes = require('./routes/adminRoutes');

// Load env from backend/.env explicitly
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Warn if critical env vars are missing
if (!process.env.MONGO_URI) {
  console.warn('MONGO_URI is not set. Check backend/.env');
}
if (!process.env.JWT_SECRET) {
  console.warn('JWT_SECRET is not set. Check backend/.env');
}

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

// --- 1. CORS MUST BE FIRST ---
// 'origin: true' allows the request origin automatically (dynamic allowing)
app.use(cors({
  origin: true, 
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// --- 2. THEN OTHER MIDDLEWARE ---
app.use(express.json());
app.use(helmet());
app.use(morgan('dev'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- 3. MOUNT ROUTES ---
app.use('/api/auth', authRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/admin', adminRoutes);

// Health Check
app.get('/', (req, res) => res.send('API is running...'));

// Error Handling Middleware (Must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));