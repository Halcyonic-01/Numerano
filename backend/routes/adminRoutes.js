const express = require('express');
const router = express.Router();
const {
  adminSignup,
  adminLogin,
  getAdminProfile,
  getAllTeams,
  getTeamDetails,
  approveTeam,
  rejectTeam,
  getDashboardStats
} = require('../controllers/adminController');
const { adminProtect } = require('../middleware/adminMiddleware');

// Authentication routes
router.post('/signup', adminSignup);
router.post('/login', adminLogin);

// Protected admin routes
router.get('/profile', adminProtect, getAdminProfile);
router.get('/dashboard/stats', adminProtect, getDashboardStats);

// Team management routes
router.get('/teams', adminProtect, getAllTeams);
router.get('/teams/:id', adminProtect, getTeamDetails);
router.put('/teams/:id/approve', adminProtect, approveTeam);
router.put('/teams/:id/reject', adminProtect, rejectTeam);

module.exports = router;