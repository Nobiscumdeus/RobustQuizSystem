const multer = require('multer');
const path = require('path'); // Import the path module

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {

    cb(null, path.join(__dirname, '../uploads/')); // Use path.join for cross-platform compatibility
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

const uploadImage = (req, res) => {
    //const filePath = `/uploads/${req.file.filename}`;
  res.json({ imageUrl: `/uploads/${req.file.filename}` });
  
};

module.exports = {
  upload,
  uploadImage
};