/*
const multer = require('multer');
const path = require('path'); // Import the path module


// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {

    cb(null, path.join(__dirname, '../../uploads/')); // Use path.join for cross-platform compatibility
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

const uploadImage = (req, res) => {
 
  res.json({ imageUrl: `/uploads/${req.file.filename}` });
  
};

module.exports = {
  upload,
  uploadImage
};

*/

const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads/'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);

    // User ID (fallback to "guest" if not logged in)
    const userId = req.user?.userId || 'guest';

    // Human-friendly timestamp: YYYYMMDD-HHMMSS
    const now = new Date();
    const timestamp = now.toISOString().replace(/[-:T.Z]/g, '').slice(0, 14);
    // Example: 20250927-154530

    // Short UUID (take first 8 chars)
    const shortUuid = uuidv4().split('-')[0];

    // Final filename
    const fileName = `${userId}-${timestamp}-${shortUuid}${ext}`;

    cb(null, fileName);
  }
});

const upload = multer({ storage });

const uploadImage = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  res.json({
    success: true,
    message: 'File uploaded successfully',
    file: {
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      filename: req.file.filename,
      url: `/uploads/${req.file.filename}`
    }
  });
};

module.exports = {
  upload,
  uploadImage
};
