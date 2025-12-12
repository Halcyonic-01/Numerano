const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads folder exists
const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadDir);
  },
  filename(req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const fileFilter = (req, file, cb) => {
    // Allow images for ID cards and documents (PDF, DOC, DOCX, TXT) for team documents
    if (!file.mimetype.match(/\/(jpg|jpeg|png|pdf|msword|vnd\.openxmlformats-officedocument\.wordprocessingml\.document|plain)$/)) {
        return cb(new Error('File type not supported. Please upload JPG, PNG, PDF, DOC, DOCX, or TXT files.'), false);
    }
    cb(null, true);
};

const upload = multer({ 
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter
});

module.exports = upload;