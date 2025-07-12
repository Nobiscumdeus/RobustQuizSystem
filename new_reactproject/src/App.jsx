import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";


import Header from "./components/ChasfatAcademy/shared/Header";
import Home from "./components/ChasfatAcademy/Home";
import AboutPage from "./components/ChasfatAcademy/shared/About";
import Contact from "./components/ChasfatAcademy/shared/Contact";
import Onboarding from "./components/ChasfatAcademy/pages/Onboarding";
import RegistrationForm from "./components/ChasfatAcademy/pages/auth/RegistrationForm";

import LoginForm from "./components/ChasfatAcademy/pages/auth/LoginForm";
import Manage from "./components/ChasfatAcademy/pages/Manage";
import TrialQuizDemo from "./components/ChasfatAcademy/pages/TrialQuizDemoEnhanced";


import StudentRegistration from "./components/ChasfatAcademy/pages/StudentRegistration";
import ImageUploadQuestion from "./components/ChasfatAcademy/pages/ImageUploadQuestion";

import CreateExam from "./components/ChasfatAcademy/pages/admin/exams/CreateExam";
import ExamCreation from "./components/ChasfatAcademy/pages/admin/exams/ExamCreation";
//import UserProfile from "./components/ChasfatAcademy/pages/UserProfile";
import UserProfile from "./components/ChasfatAcademy/pages/UserProfile";


import RegisterStudentsForm from "./components/ChasfatAcademy/pages/admin/registration/RegisterStudentsForm";

import CreateCourse from "./components/ChasfatAcademy/pages/admin/courses/CreateCourse";

import CreateQuestionForm from "./components/ChasfatAcademy/pages/admin/questions/CreateQuestionForm";
import { AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import AdminPanel from "./components/ChasfatAcademy/pages/AdminPanel";

import CalculatorModal from "./components/ChasfatAcademy/utility/CalculatorModal";

import ViewExamPage from "./components/ChasfatAcademy/pages/admin/exams/ViewExamPage";

import EditExamPage from "./components/ChasfatAcademy/pages/admin/exams/EditExamPage";

import EditCoursePage from "./components/ChasfatAcademy/pages/admin/courses/EditCoursePage";

import ViewCoursePage from "./components/ChasfatAcademy/pages/admin/courses/ViewCoursePage";



import EditStudentPage from "./components/ChasfatAcademy/pages/admin/students/EditStudentPage";

import ViewStudentPage from "./components/ChasfatAcademy/pages/admin/students/ViewStudentPage";

import Reports from "./components/ChasfatAcademy/pages/Reports";

import AuthWrapper from "./components/ChasfatAcademy/pages/AuthWrapper";

//toastify package
import { ToastContainer } from "react-toastify";

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
      localStorage.setItem("darkMode", newMode); // Save dark mode state to localStorage
      return newMode;
    });
  };

  return (
    <div
      className={`min-h-screen w-full antialiased ${darkMode ? "dark" : ""}`}
    >
      <Router>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme={darkMode ? "dark" : "light"} // Optional: match dark mode
        />

        <Header darkMode={darkMode} toggleDarkMode={toggleDarkMode} />

        {/* AnimatePresence needs the correct Router context to work */}
        <AnimatePresence mode="wait" exitBeforeEnter>
          <AuthWrapper>
            <RoutesWrapper />
          </AuthWrapper>
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
      <Route path="/student" element={<StudentRegistration />} />{" "}
      {/* ................ */}
      <Route path="/bulk" element={<RegisterStudentsForm />} />
      <Route path="/login" element={<LoginForm />} />
      <Route path="/course" element={<CreateCourse />} />
      <Route path="/exam" element={<ExamCreation />} />
      <Route path="/profile" element={<UserProfile />} />
     
      <Route path="/admin_panel" element={<AdminPanel />} />
      {/* Protected Pages */}
      <Route path="/manage" element={<Manage />} />
      <Route path="/welcome" element={<Onboarding />} />
      <Route path="/quiz_demo" element={<TrialQuizDemo />} />
      <Route path="/image_upload" element={<ImageUploadQuestion />} />
      <Route path="/create_exam" element={<CreateExam />} />
      <Route path="/create_question" element={<CreateQuestionForm />} />
      <Route path="/calculator" element={<CalculatorModal />} />
      <Route path="/exam/:examId" element={<ViewExamPage />} />
      <Route path="/exam/:examId/edit" element={<EditExamPage />} />
      <Route path="/courses /:courseId" element={<ViewCoursePage />} />
      <Route path="/courses/:courseId/edit" element={<EditCoursePage />} />
      <Route path="/student/:studentId" element={<ViewStudentPage />} />
      <Route path="/student/:studentId/edit" element={<EditStudentPage />} />
      <Route path="/reports" element={<Reports />} />
    </Routes>
  ); 
}

export default App;
