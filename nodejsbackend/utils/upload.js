const multer=require('multer')
const path=require('path')

//Set storage engine 
const storage=multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,'uploads/') //Save files in the upload folder 

    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`); // Unique filename
      },


})


// Initialize upload
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
    fileFilter: (req, file, cb) => {
      const filetypes = /jpeg|jpg|png|gif/;
      const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
      const mimetype = filetypes.test(file.mimetype);
  
      if (extname && mimetype) {
        cb(null, true);
      } else {
        cb(new Error('Only images (jpeg, jpg, png, gif) are allowed!'));
      }
    },
  });
  
  module.exports = upload;