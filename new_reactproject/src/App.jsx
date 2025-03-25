import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Header from "./components/ChasfatAcademy/Header";
import Home from "./components/ChasfatAcademy/Home";
import AboutPage from "./components/ChasfatAcademy/About";
import Contact from "./components/ChasfatAcademy/Contact";
import Onboarding from "./pages/ChasfatAcademy/Onboarding";
import RegistrationForm from "./pages/ChasfatAcademy/RegistrationForm";
import LoginForm from "./pages/ChasfatAcademy/LoginForm";
import Manage from "./pages/ChasfatAcademy/Manage";
import TrialQuizDemo from "./pages/ChasfatAcademy/TrialQuizDemoEnhanced";
import StudentRegistration from "./pages/ChasfatAcademy/StudentRegistration";
import ImageUploadQuestion from "./pages/ChasfatAcademy/ImageUploadQuestion";
import CreateExam from "./pages/ChasfatAcademy/CreateExam";
import UserProfile from "./pages/ChasfatAcademy/UserProfile";
import RegisterStudentsForm from "./pages/ChasfatAcademy/RegisterStudentsForm";
import ExamCreation from "./pages/ChasfatAcademy/ExamCreation";
import CreateCourse from "./pages/ChasfatAcademy/CreateCourse";
import CreateQuestionForm from "./pages/ChasfatAcademy/CreateQuestionForm";
import { AnimatePresence } from "framer-motion";
import { useState, useEffect } from 'react';
import AdminPanel from "./pages/ChasfatAcademy/AdminPanel";

import CalculatorModal from "./utility/ChasfatAcademy/CalculatorModal";
import Monitor from "./pages/ChasfatAcademy/Monitor";
import MonitorDashboard from "./pages/ChasfatAcademy/MonitorDashboard";



function App() {
  const [darkMode, setDarkMode] = useState(false);

  // Check if dark mode is saved in local storage
  useEffect(() => {
    const savedTheme = localStorage.getItem("darkMode");
    if (savedTheme) {
      setDarkMode(savedTheme === "true");
    }
  }, []);

  // Toggle dark mode and save to local storage
  const toggleDarkMode = () => {
    setDarkMode((prevMode) => {
      const newMode = !prevMode;
      localStorage.setItem("darkMode", newMode);  // Save dark mode state to localStorage
      return newMode;
    });
  };

  return (
    <div className={`min-h-screen w-full antialiased ${darkMode ? "dark" : ""}`}>
      <Router>
        <Header darkMode={darkMode} toggleDarkMode={toggleDarkMode} />

        {/* AnimatePresence needs the correct Router context to work */}
        <AnimatePresence mode="wait" exitBeforeEnter>
          <RoutesWrapper />
        </AnimatePresence>
      </Router>
    </div>
  );
}

function RoutesWrapper() {
  const location = useLocation(); // useLocation should be used inside RoutesWrapper or child components

  return (
    <Routes location={location} key={location.key}>
     
      <Route path="/" element={<Home />} /> 
      
      <Route path="/about" element={<AboutPage />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/register" element={<RegistrationForm />} />
      <Route path="/login" element={<LoginForm />} />
      <Route path="/student" element={<StudentRegistration />} />
      <Route path="/bulk" element={<RegisterStudentsForm />} />
      <Route path="/course" element={<CreateCourse />} />
      <Route path="/exam" element={<ExamCreation />} />
      <Route path="/profile" element={<UserProfile />} />
      <Route path="/editprofile" element={<UserProfile />} />
      <Route path="/admin_panel" element={<AdminPanel/>} />
    
      {/* Protected Pages */}
      <Route path="/manage" element={<Manage />} />
      <Route path="/welcome" element={<Onboarding />} />
      <Route path="/quiz_demo" element={<TrialQuizDemo />} />
      <Route path="/image_upload" element={<ImageUploadQuestion />} />
      <Route path="/create_exam" element={<CreateExam />} />
      <Route path="/create_question" element={<CreateQuestionForm />} />
      <Route path="/calculator" element={<CalculatorModal />} />
      <Route path="/monitor" element={<Monitor/>} />
      <Route path="/monitor_dashboard" element={<MonitorDashboard/>} />
      
    </Routes>
  );
}

export default App;
