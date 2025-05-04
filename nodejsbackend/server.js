const express = require("express");
const cors = require("cors");
require("dotenv").config();
const path = require("path");

const profileRoutes = require("./routes/profileRoutes"); // Adjust path
const questionRoutes = require("./routes/questionAnswerRoutes");
const searchRoutes = require("./routes/searchRoutes");
const courseRoutes = require("./routes/courseRoutes");
const authRoutes = require("./routes/authRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const studentRoutes = require("./routes/studentRoutes");
const statsRoutes = require("./routes/statsRoutes");
const dashboardDataRoutes =require('./routes/dashboardDataRoutes')
const reportRoutes=require('./routes/reportRoutes');

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
        : ["http://localhost:5173", "http://localhost:3000", "*"]; // Development origins

    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: "GET,POST,PUT,DELETE",
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

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
