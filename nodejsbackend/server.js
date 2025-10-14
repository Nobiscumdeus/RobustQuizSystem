require('module-alias').addAliases({
  '@middlewares': __dirname + '/middlewares',
  '@controllers': __dirname + '/controllers',
  '@database': __dirname + '/database',
  '@routes':__dirname + '/routes',
  '@utils':__dirname + '/utils',
  '@config':__dirname + '/config',
});
const path = require("path");
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');

const swaggerDocument = YAML.load(path.join(__dirname, './docs/swagger.yaml'));




const express = require("express");
const cors = require("cors");
require("dotenv").config();


//importing helmet and rate limiting 
const helmet = require('helmet');
const rateLimit =require('express-rate-limit')



const profileRoutes = require('@routes/auth/profileRoutes');
const questionRoutes = require('@routes/examiner/questionAnswerRoutes');
const searchRoutes = require('@routes/shared/searchRoutes');
const courseRoutes = require('@routes/examiner/courseRoutes');
const authRoutes = require('@routes/auth/authRoutes');
const uploadRoutes = require('@routes/shared/uploadRoutes');
const studentRoutes = require('@routes/examiner/studentRoutes');
const statsRoutes = require('@routes/admin/statsRoutes');
const dashboardDataRoutes = require('@routes/admin/dashboardDataRoutes');
const reportRoutes = require('@routes/admin/reportRoutes');
const examRoutes = require('@routes/student/examRoutes');
const examinerRoutes = require('@routes/examiner/examinerRoutes');



// Initialize the app
const app = express();
app.use(express.json()); // Middleware to parse incoming JSON requests
app.use(express.urlencoded({ extended: true })); // Middleware to parse URL-encoded data

// Set up port
const PORT = process.env.PORT || 5000;

// CORS configuration
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins =
      process.env.NODE_ENV === "production"
        ? ["https://your-production-site.com", "*"]
        : ["http://localhost:5173", "http://localhost:3000", "http://localhost:5000","*"]; // Development origins

    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: "GET,POST,PUT,DELETE,PATCH",
  //allowedHeaders: 'Content-Type,Authorization',  // Allow Authorization heade
  allowedHeaders: ["Content-Type", "Authorization"], // Allow these headers
};
app.use(cors(corsOptions)); // Enable CORS
// Serve static files from the uploads directory

// Serve static files
app.use("/uploads", express.static(path.join(__dirname, "/uploads")));
// Serve static files from the 'uploads' folder
//app.use('/uploads', express.static('uploads'));

//Authentication routes
app.use(authRoutes);

// Profile Routes
app.use(profileRoutes);

//Question routes
app.use(questionRoutes);

//Search Routes
app.use(searchRoutes);

//Upload Routes
app.use(uploadRoutes);

//Student routes
app.use(studentRoutes);

//Course routes
app.use(courseRoutes);

//Stats routes
app.use(statsRoutes);

//dashboard data routes
app.use(dashboardDataRoutes)

//report routes
app.use(reportRoutes)

//Exam routes
app.use(examRoutes)

//helmet newly added for security 
app.use(helmet())


//Rate limiting 
const limiter=rateLimit({
  windowMs:15*60*1000, //15 minutes 
  max:100 //limit each IP to 100 requests per windowMS
})
app.use(limiter)

//the examiner route
app.use(examinerRoutes)

// Basic route to check if the API is running
app.get("/", (req, res) => {
  res.send("CHASFAT QUIZ API is running !!!");
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

app.use((req, res, next) => {
  console.log("Request Body:", req.body);
  next();
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
