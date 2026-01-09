import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";

// Redux imports - at top level to provide store to all components
import { Provider } from 'react-redux';
//import { store } from './store';
import store from "./store";

// Shared components (appear on multiple pages)
import Header from "./components/ChasfatAcademy/shared/Header";

// ================= PUBLIC ROUTES (No authentication required) =================
// These are accessible to everyone, even logged out users
import Home from "./components/ChasfatAcademy/Home";                     // Landing page
import AboutPage from "./components/ChasfatAcademy/shared/About";       // About us page
import Contact from "./components/ChasfatAcademy/shared/Contact";       // Contact page
import Onboarding from "./components/ChasfatAcademy/pages/Onboarding";  // Welcome/walkthrough
import RegistrationForm from "./components/ChasfatAcademy/pages/auth/RegistrationForm"; // Public registration
import LoginForm from "./components/ChasfatAcademy/pages/auth/LoginForm";              // Login page
import TrialQuizDemo from "./components/ChasfatAcademy/pages/TrialQuizDemoEnhanced";   // Demo for unauthenticated

// ================= STUDENT/AUTHENTICATED USER ROUTES =================
// Require authentication but not necessarily admin role
import Manage from "./components/ChasfatAcademy/pages/Manage";                    // Management interface
import StudentRegistration from "./components/ChasfatAcademy/pages/StudentRegistration"; // Student signup
import UserProfile from "./components/ChasfatAcademy/pages/UserProfile";          // User profile
import StudentExamLogin from "./components/ChasfatAcademy/pages/StudentExamLogin"; // Exam entry point
import PersonalizedExamInterface from "./components/ChasfatAcademy/pages/PersonalizedExamInterface"; // Exam taking
//import DynamicExamInterface from "./components/ChasfatAcademy/pages/PersonalExamInterface"; // Alternative exam UI
import CalculatorModal from "./components/ChasfatAcademy/utility/CalculatorModal"; // Tool for exams

// ================= ADMIN ROUTES =================
// Should be protected with admin role checks
import ExamCreation from "./components/ChasfatAcademy/pages/admin/exams/ExamCreation";         // Create exams
import RegisterStudentsForm from "./components/ChasfatAcademy/pages/admin/registration/RegisterStudentsForm"; // Bulk registration
import CreateCourse from "./components/ChasfatAcademy/pages/admin/courses/CreateCourse";       // Course creation
import CreateQuestionForm from "./components/ChasfatAcademy/pages/admin/questions/CreateQuestionForm"; // Question bank
import AdminPanel from "./components/ChasfatAcademy/pages/AdminPanel";                         // Admin dashboard
import ImageUploadQuestion from "./components/ChasfatAcademy/pages/ImageUploadQuestion";       // Upload images for questions

// ================= CRUD OPERATION ROUTES =================
// View/Edit pages for admin management
import ViewExamPage from "./components/ChasfatAcademy/pages/admin/exams/ViewExamPage";
import EditExamPage from "./components/ChasfatAcademy/pages/admin/exams/EditExamPage";
import ViewCoursePage from "./components/ChasfatAcademy/pages/admin/courses/ViewCoursePage";
import EditCoursePage from "./components/ChasfatAcademy/pages/admin/courses/EditCoursePage";
import ViewStudentPage from "./components/ChasfatAcademy/pages/admin/students/ViewStudentPage";
import EditStudentPage from "./components/ChasfatAcademy/pages/admin/students/EditStudentPage";
import Reports from "./components/ChasfatAcademy/pages/Reports";  // Analytics & reporting

// ================= UTILITY & WRAPPER COMPONENTS =================
import { AnimatePresence } from "framer-motion";  // Page transition animations
//import { useState, useEffect } from "react";
import AuthWrapper from "./components/ChasfatAcademy/pages/AuthWrapper";  // Authentication guard
import { ToastContainer } from "react-toastify";  // Notification system

//============================= LEGAL Components ===============================
import PrivacyPolicy from "@components/ChasfatAcademy/pages/legal/PrivacyPolicy";
import TermsOfService from "@components/ChasfatAcademy/pages/legal/TermsofService";
import AcceptableUsePolicy from "@components/ChasfatAcademy/pages/legal/AcceptableUsePolicy";
import CookiePolicy from "@components/ChasfatAcademy/pages/legal/CookiePolicy";
import StudentResultsDashboard from "@components/ChasfatAcademy/pages/StudentResultDashboard";

function App() {

  
  return (
    // 1. PROVIDER: Redux store must wrap entire app for state management
    <Provider store={store}>
      {/* 2. LAYOUT WRAPPER: Global styling and dark mode class */}
      <div className={`min-h-screen w-full antialiased`}>
        {/* 3. ROUTER: Routing context for navigation - inside Provider to access Redux */}
        <Router>
          {/* 4. NOTIFICATIONS: Toast container positioned above all content */}
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
            //theme={darkMode ? "dark" : "light"}  // Sync with app theme
            theme='colored'
          />

          {/* 5. PERSISTENT HEADER: Appears on all pages with dark mode toggle
            <Header darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
 */}
        <Header />
          {/* 6. PAGE TRANSITIONS + AUTH WRAPPER: Animations with auth protection */}
          <AnimatePresence mode="wait" exitBeforeEnter>
            <AuthWrapper>
              {/* 7. ROUTES: Actual page content that changes based on URL */}
              <RoutesWrapper />
            </AuthWrapper>
          </AnimatePresence>
        </Router>
      </div>
    </Provider>
  );
}

function RoutesWrapper() {
  const location = useLocation();

  return (
    // Key={location.key} forces re-render on navigation for proper animations
    <Routes location={location} key={location.key}>
      {/* ============ PUBLIC ROUTES (No auth required) ============ */}
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/register" element={<RegistrationForm />} />
      <Route path="/login" element={<LoginForm />} />
      <Route path="/welcome" element={<Onboarding />} />
      <Route path="/quiz_demo" element={<TrialQuizDemo />} />
      
      {/* ============ STUDENT/AUTHENTICATED USER ROUTES ============ */}
      {/* NOTE: These should be protected by AuthWrapper */}
      <Route path="/student" element={<StudentRegistration />} />  {/* Student registration portal */}
      <Route path="/profile" element={<UserProfile />} />           {/* User profile management */}
      <Route path="/student_exam_login" element={<StudentExamLogin />} />     {/* Exam access point */}
      <Route path="/personalized_exam_interface" element={<PersonalizedExamInterface />} />
       <Route path="/student_results" element={<StudentResultsDashboard />} />
        {/* Primary exam interface */}
      
      {/* <Route path="/dynamic_exam_interface" element={<DynamicExamInterface />} />    */}        {/* Alternative exam UI */}
      <Route path="/student/exam/:examId" element={<PersonalizedExamInterface />} />         {/* Direct exam access */}
      <Route path="/calculator" element={<CalculatorModal />} />    {/* Exam calculator tool */}
      
      {/* ============ ADMIN ROUTES ============ */}
      {/* NOTE: These need additional admin role protection */}
      <Route path="/admin_panel" element={<AdminPanel />} />        {/* Admin dashboard */}
      <Route path="/manage" element={<Manage />} />                  {/* General management */}
      <Route path="/bulk" element={<RegisterStudentsForm />} />     {/* Bulk student registration */}
      <Route path="/course" element={<CreateCourse />} />           {/* Create new course */}
      <Route path="/exam" element={<ExamCreation />} />             {/* Create new exam */}
      <Route path="/create_question" element={<CreateQuestionForm />} />  {/* Add questions */}
      <Route path="/image_upload" element={<ImageUploadQuestion />} />    {/* Upload question images */}
      <Route path="/reports" element={<Reports />} />               {/* Analytics reports */}
      
      {/* ============ CRUD OPERATION ROUTES ============ */}
      {/* These follow RESTful patterns for admin resource management */}
      <Route path="/exam/:examId" element={<ViewExamPage />} />            {/* View exam details */}
      <Route path="/exam/:examId/edit" element={<EditExamPage />} />       {/* Edit existing exam */}
      <Route path="/courses/:courseId" element={<ViewCoursePage />} />     {/* View course details */}
      <Route path="/courses/:courseId/edit" element={<EditCoursePage />} /> {/* Edit existing course */}
      <Route path="/student/:studentId" element={<ViewStudentPage />} />   {/* View student details */}
      <Route path="/student/:studentId/edit" element={<EditStudentPage />} /> {/* Edit student info */}
   
   
      {/* ============================= LEGAL COMPONENT ROUTES =================== */}
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
       <Route path="/terms" element={<TermsOfService />} />
        <Route path="/acceptable-use" element={<AcceptableUsePolicy />} />
         <Route path="/cookie-policy" element={<CookiePolicy />} />
    </Routes>
  ); 
}

export default App;