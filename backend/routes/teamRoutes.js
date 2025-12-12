const express = require('express');
const router = express.Router();
const { 
  registerTeam, 
  getMyTeam, 
  updateTeam, 
  uploadDocument, 
  getTeamDocuments, 
  downloadDocument, 
  deleteDocument 
} = require('../controllers/teamController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Route: /api/teams/register
// 1. protect: Checks if user is logged in
// 2. upload.single: Handles the file upload
// 3. registerTeam: The controller logic
router.post('/register', protect, upload.single('idCard'), registerTeam);

// Route: /api/teams/me
// Gets the team data for the dashboard
router.get('/me', protect, getMyTeam);

// Route: /api/teams/:id - Update team information
router.put('/:id', protect, updateTeam);

// Route: /api/teams/:id/documents - Upload team document
router.post('/:id/documents', protect, upload.single('document'), uploadDocument);

// Route: /api/teams/:id/documents - Get team documents
router.get('/:id/documents', protect, getTeamDocuments);

// Route: /api/teams/:id/documents/:docId/download - Download specific document
router.get('/:id/documents/:docId/download', protect, downloadDocument);

// Route: /api/teams/:id/documents/:docId - Delete specific document
router.delete('/:id/documents/:docId', protect, deleteDocument);

module.exports = router;