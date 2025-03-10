const express = require('express');
const cors = require('cors');
require('dotenv').config();
const path=require('path');

const profileRoutes = require("./routes/profileRoutes");  // Adjust path
const questionRoutes=require("./routes/questionAnswerRoutes"); 

// Import Prisma client and controllers
const authController = require('./controllers/authController'); // Import auth controller
const studentController =require('./controllers/studentController'); //Importing student controller 
const { upload, uploadImage } = require('./controllers/imageUploadController');
const courseController = require('./controllers/courseController'); // Assuming you saved the functions in courseController.js


//const authenticate=require('./middlewares/auth')
const { authenticate } = require('./middlewares/auth'); // Import authenticate middleware


// Initialize the app
const app = express();
app.use(express.json()); // Middleware to parse incoming JSON requests
app.use(express.urlencoded({ extended: true })); // Middleware to parse URL-encoded data

// Set up port
const PORT = process.env.PORT || 5000;

// CORS configuration
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = process.env.NODE_ENV === 'production' ? 
      ['https://your-production-site.com', '*'] : 
      ['http://localhost:5173', 'http://localhost:3000', '*']; // Development origins

    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: 'GET,POST,PUT,DELETE',
  //allowedHeaders: 'Content-Type,Authorization',  // Allow Authorization heade
  allowedHeaders: ['Content-Type', 'Authorization'] // Allow these headers
};
app.use(cors(corsOptions)); // Enable CORS
// Serve static files from the uploads directory


// Serve static files
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));
// Serve static files from the 'uploads' folder
//app.use('/uploads', express.static('uploads'));

// Profile Routes 
app.use(profileRoutes);

//Question routes
app.use(questionRoutes);





// Define routes and map them to controller functions
app.post('/register', authController.register);
app.post('/login', authController.login);
app.post('/logout', authController.logout);
//Endpoint for image upload 
app.post('/upload',upload.single('image'),uploadImage);


app.post('/student-register',authenticate,studentController.registerStudent);

//Endpoints for students and courses and exams 

// Routes for course and exam management
app.post('/courses', courseController.createCourse);
app.get('/courses/:examinerId', courseController.getCoursesByExaminer);

app.post('/exams', courseController.createExam);
app.get('/exams/:examinerId', courseController.getExamsByExaminer);

app.get('/courses-exams/:examinerId', courseController.getCoursesAndExamsForRegistration);


// Basic route to check if the API is running
app.get('/', (req, res) => {
  res.send('CHASFAT QUIZ API is running !!!');
});



//module.exports = router;


// Global error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

app.use((req, res, next) => {
  console.log('Request Body:', req.body);
  next();
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
