import { useState, useEffect, useCallback, useRef } from "react";
/*
import {
  LineChart,
  BarChart,
  PieChart,
  Line,
  Bar,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
 */
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import axios from "axios";

import Spinner from "../utility/Spinner";
import { isAuthenticated } from "../utility/auth";


import ExaminerExams from "./admin/exams/ExaminerExams";
import ExaminerCourses from "./admin/courses/ExaminerCourses";
import ExaminerStudents from "./admin/students/ExaminerStudents";

function AdminPanel() {
  const darkMode = useSelector((state) => state.darkMode?.darkMode) || false;
  const [activeTab, setActiveTab] = useState("overview");
  const [timeframe, setTimeframe] = useState("week");
  const [isLoading, setIsLoading] = useState(true);
  const [examData, setExamData] = useState({});
  // const [selectedExam, setSelectedExam] = useState(null);
  console.log(examData);

  const [filterStatus, setFilterStatus] = useState("all");
  // Fetch stats when component mounts
  const [stats, setStats] = useState({
    totalExams: 0,
    totalStudents: 0,
    totalCourses: 0,
    ongoingExams: 0,
    completedExams: 0,
  });

  //const [userData, setUserData] = useState(null);

  const [userData, setUserData] = useState({ students: [] });
  console.log(userData)
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  //Search Query
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const token = localStorage.getItem("token");
  const debounceRef = useRef();

  //Authentication check
  const navigate = useNavigate();
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/login", {
        state: { from: "/admin_panel" },
        replace: true,
      });
    }
  }, [navigate]);

  // Add event listener for auth changes
  useEffect(() => {
    const handleAuthChange = () => {
      if (!isAuthenticated()) {
        navigate("/login", { replace: true });
      }
    };

    window.addEventListener("authChange", handleAuthChange);
    return () => window.removeEventListener("authChange", handleAuthChange);
  }, [navigate]);

  //Perform search

  const performSearch = useCallback(
    async (query) => {
      try {
        if (!query || typeof query !== "string" || query.trim().length < 2) {
          setSearchResults({ exams: [], students: [], courses: [] });
          return;
        }

        setIsSearching(true);

        const response = await axios.get(
          `http://localhost:5000/api/search?query=${encodeURIComponent(query)}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        // Validate API response structure
        const responseData = response.data || {};
        setIsSearching(true);
        // Check if the response has our expected structure
        if (responseData.success && responseData.data) {
          setSearchResults({
            exams: Array.isArray(responseData.data.exams)
              ? responseData.data.exams
              : [],
            students: Array.isArray(responseData.data.students)
              ? responseData.data.students
              : [],
            courses: Array.isArray(responseData.data.courses)
              ? responseData.data.courses
              : [],
          });
        } else {
          // Fallback for unexpected response structure
          console.warn("Unexpected API response structure:", responseData);

          setSearchResults({ exams: [], students: [], courses: [] });
        }
      } catch (error) {
        console.error("Search failed: ", error.response?.data || error.message);
        setSearchResults({ exams: [], students: [], courses: [] });
      } finally {
        setIsSearching(false);
      }
    },
    [token]
  );

  useEffect(() => {
    // Validate input
    const query = typeof searchQuery === "string" ? searchQuery.trim() : "";

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (query.length >= 2) {
      // Changed from > 2 to >= 2 to match backend validation
      debounceRef.current = setTimeout(() => {
        performSearch(query);
      }, 500);
    } else {
      setSearchResults({ exams: [], students: [], courses: [] });
    }

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [searchQuery, performSearch]);

  const handleInputChange = (e) => {
    const value = e.target?.value || "";
    setSearchQuery(value);
  };

  // Fetch user profile on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("token"); // Get token from local storage

      try {
        const response = await axios.get("http://localhost:5000/profile", {
          headers: {
            Authorization: `Bearer ${token}`, // Send token in headers
          },
        });
        setUserData(response.data); // Store fetched data in state
        setLoading(false);
        console.log(loading);
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError("Failed to fetch user data");
        console.error(error);
        setLoading(false);
      }
    };

    fetchUserData();
  }, [error, loading]);


  //........................................... Get dashboard data .......................
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await axios.get("/api/dashboard-data", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setExamData({
          ...response.data,
          // Add any additional transformations if needed
        });
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to fetch data", error);
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, [token]);

  //Stats API fetch
  useEffect(() => {
    const fetchStats = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        console.error("No token found");
        // Redirect to login if needed
        // navigate('/login');
        return;
      }

      try {
        const response = await axios.get("http://localhost:5000/api/stats", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.data) {
          // setStats(response.data);
          setStats({
            totalExams: response.data.statsData.totalExams ?? 0,
            totalStudents: response.data.statsData.totalStudents ?? 0,
            totalCourses: response.data.statsData.totalCourses ?? 0,
            ongoingExams: response.data.statsData.ongoingExams ?? 0,
            completedExams: response.data.statsData.completedExams ?? 0,
          });
        }
      } catch (error) {
        console.error("Error details:", {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
        });

        if (error.response?.status === 401) {
          // Token expired - clear and redirect
          localStorage.removeItem("token");
          // navigate('/login');
        }
      }
    };

    fetchStats();
  }, []);

 

  

  const highlightMatch = (text, query) => {
    if (!query || !text || typeof text !== "string") return text;

    // Escape special regex characters to prevent errors
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    try {
      const regex = new RegExp(`(${escapedQuery})`, "gi");
      return text.split(regex).map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <span key={i} className="bg-yellow-200 text-black px-0.5 rounded">
            {part}
          </span>
        ) : (
          part
        )
      );
    } catch (error) {
      console.error("Highlighting error:", error);
      return text; // Fallback to plain text if regex fails
    }
  };

  return (
    <div
      className={`min-h-screen ${
        darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-800"
      }`}
    >
      {/* Header */}
      <header
        className={`${
          darkMode ? "bg-gray-800" : "bg-white"
        } shadow-md p-4 flex justify-between items-center`}
      >
        <div className="flex items-center">
          <h1
            className={`text-xl font-bold ${
              darkMode ? "text-white" : "text-blue-600"
            }`}
          >
            Exam System Admin Dashboard
          </h1>
        </div>

        <div className="relative w-full max-w-xl mx-auto">
          {/* Search Input */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search exams, students..."
              value={searchQuery}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 rounded-xl border ${
                darkMode
                  ? "bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
                  : "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500"
              } shadow-sm focus:outline-none focus:ring-2 pr-12 transition-all duration-200`}
            />

            {/* Search Controls */}
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
              {searchQuery && !isSearching && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSearchResults(null);
                  }}
                  className={`p-1 rounded-full ${
                    darkMode
                      ? "text-gray-400 hover:text-gray-500 hover:bg-gray-700"
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                  } transition-colors duration-200`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              )}
              <div
                className={`w-5 h-5 flex items-center justify-center ${
                  isSearching
                    ? "text-blue-500"
                    : darkMode
                    ? "text-gray-400"
                    : "text-gray-500"
                }`}
              >
                {isSearching ? (
                  <Spinner size="small" />
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
            </div>
          </div>

          {/* Search Results Dropdown */}
          {searchQuery && (
            <div
              className={`absolute z-30 mt-2 w-full rounded-xl shadow-lg overflow-hidden ${
                darkMode
                  ? "bg-gray-900 border border-gray-700"
                  : "bg-white border border-gray-200"
              } transition-all duration-200 origin-top`}
              style={{
                boxShadow:
                  "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
              }}
            >
              {/* Loading State */}
              {isSearching && (
                <div
                  className={`p-4 flex items-center justify-center ${
                    darkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  <Spinner size="small" className="mr-2" />
                  <span>Searching...</span>
                </div>
              )}

              {/* Results */}
              {!isSearching && (
                <div
                  className="divide-y"
                  style={{
                    divideColor: darkMode
                      ? "rgba(55, 65, 81, 1)"
                      : "rgba(229, 231, 235, 1)",
                  }}
                >
                  {/* Exams Section */}
                  {searchResults?.exams?.length > 0 && (
                    <div>
                      <div
                        className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider ${
                          darkMode
                            ? "text-gray-400 bg-gray-900"
                            : "text-gray-500 bg-gray-50"
                        }`}
                      >
                        Exams
                      </div>
                      {searchResults.exams.map((exam) => (
                        <Link
                          to={`/exam/${exam.id}`}
                          key={`exam-${exam.id}`}
                          className={`block px-4 py-3 transition-colors ${
                            darkMode
                              ? "hover:bg-gray-700 text-gray-200"
                              : "hover:bg-gray-50 text-gray-800"
                          }`}
                        >
                          <div className="font-medium">
                            {/*{exam.title} */}
                            {highlightMatch(exam.title, searchQuery)}
                          </div>
                          <div
                            className={`text-sm mt-1 ${
                              darkMode ? "text-gray-400" : "text-gray-500"
                            }`}
                          >
                            {/*{exam.course} */}
                            {highlightMatch(exam.course, searchQuery)}
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* Students Section */}
                  {searchResults?.students?.length > 0 && (
                    <div>
                      <div
                        className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider ${
                          darkMode
                            ? "text-gray-400 bg-gray-900"
                            : "text-gray-500 bg-gray-50"
                        }`}
                      >
                        Students
                      </div>
                      {searchResults.students.map((student) => (
                        <Link
                          to={`/student/${student.id}`}
                          key={`student-${student.id}`}
                          className={`block px-4 py-3 transition-colors ${
                            darkMode
                              ? "hover:bg-gray-700 text-gray-200"
                              : "hover:bg-gray-50 text-gray-800"
                          }`}
                        >
                          <div className="font-medium">
                            {/* {student.firstName} {student.lastName} */}
                            {highlightMatch(
                              student.firstName,
                              searchQuery
                            )}{" "}
                            {highlightMatch(student.lastName, searchQuery)}
                          </div>
                          <div
                            className={`text-sm mt-1 ${
                              darkMode ? "text-gray-400" : "text-gray-500"
                            }`}
                          >
                            {/*   {student.matricNo} */}

                            {highlightMatch(student.matricNo, searchQuery)}
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* Courses Section */}
                  {searchResults?.courses?.length > 0 && (
                    <div>
                      <div
                        className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider ${
                          darkMode
                            ? "text-gray-400 bg-gray-900"
                            : "text-gray-500 bg-gray-50"
                        }`}
                      >
                        Courses
                      </div>
                      {searchResults.courses.map((course) => (
                        <Link
                          to={`/course/${course.id}`}
                          key={`course-${course.id}`}
                          className={`block px-4 py-3 transition-colors ${
                            darkMode
                              ? "hover:bg-gray-700 text-gray-200"
                              : "hover:bg-gray-50 text-gray-800"
                          }`}
                        >
                          <div className="font-medium">
                            {/* {course.title} */}
                            {highlightMatch(course.title, searchQuery)}
                          </div>
                          <div
                            className={`text-sm mt-1 ${
                              darkMode ? "text-gray-400" : "text-gray-500"
                            }`}
                          >
                            {/*   {course.code}*/}
                            {highlightMatch(course.title, searchQuery)}
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* Empty State */}
                  {searchResults &&
                    !searchResults.exams?.length &&
                    !searchResults.students?.length &&
                    !searchResults.courses?.length && (
                      <div
                        className={`p-4 text-center ${
                          darkMode ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        No results found for &quot; {searchQuery} &quot;
                      </div>
                    )}
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto py-6 px-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-xl">Loading dashboard data...</p>
          </div>
        ) : (
          <>
            {/* Overall Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
              <StatCard
                title="Total Exams"
                // value={stats.totalExams }
                value={stats.totalExams || "..."}
                icon="📝"
                darkMode={darkMode}
              />

              <StatCard
                title="Active Exams"
                value={stats.ongoingExams}
                icon="🔄"
                darkMode={darkMode}
                highlight={true}
              />
              <StatCard
                title="Total Students"
                value={stats.totalStudents}
                icon="👨‍🎓"
                darkMode={darkMode}
              />
              <StatCard
                title="Total Courses"
                value={stats.totalCourses}
                icon="📚"
                darkMode={darkMode}
              />
{/*}
              <StatCard
                title="Completion Rate"
                value={`${overallStats.completionRate}% `}
                icon="✅"
                darkMode={darkMode}
              />
              <StatCard
                title="Average Score"
                value={`${overallStats.averageScore}%`}
                icon="📊"
                darkMode={darkMode}
              />

              */}


            </div>

            {/* Tabs */}
            <div
              className={`flex border-b flex-wrap ${
                darkMode ? "border-gray-700" : "border-gray-200"
              } mb-6`}
            >
              <button
                onClick={() => setActiveTab("overview")}
                className={`px-4 py-2 font-medium ${
                  activeTab === "overview"
                    ? darkMode
                      ? "border-b-2 border-blue-500 text-gray-700"
                      : "border-b-2 border-blue-600 text-blue-600"
                    : darkMode
                    ? "text-gray-400"
                    : "text-gray-600"
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab("exams")}
                className={`px-4 py-2 font-medium ${
                  activeTab === "exams"
                    ? darkMode
                      ? "border-b-2 border-blue-500 text-blue-500"
                      : "border-b-2 border-blue-600 text-blue-600"
                    : darkMode
                    ? "text-gray-700"
                    : "text-gray-600"
                }`}
              >
                Exams
              </button>
              <button
                onClick={() => setActiveTab("students")}
                className={`px-4 py-2 font-medium ${
                  activeTab === "students"
                    ? darkMode
                      ? "border-b-2 border-blue-500 text-blue-500"
                      : "border-b-2 border-blue-600 text-blue-600"
                    : darkMode
                    ? "text-gray-700"
                    : "text-gray-600"
                }`}
              >
                Students
              </button>
              <button
                onClick={() => setActiveTab("courses")}
                className={`px-4 py-2 font-medium ${
                  activeTab === "courses"
                    ? darkMode
                      ? "border-b-2 border-blue-500 text-blue-500"
                      : "border-b-2 border-blue-600 text-blue-600"
                    : darkMode
                    ? "text-gray-700"
                    : "text-gray-600"
                }`}
              >
                Courses
              </button>
              <button
                onClick={() => setActiveTab("analytics")}
                className={`px-4 py-2 font-medium ${
                  activeTab === "analytics"
                    ? darkMode
                      ? "border-b-2 border-blue-500 text-blue-500"
                      : "border-b-2 border-blue-600 text-blue-600"
                    : darkMode
                    ? "text-gray-700"
                    : "text-gray-600"
                }`}
              >
                Analytics
              </button>
              <button
                onClick={() => setActiveTab("settings")}
                className={`px-4 py-2 font-medium ${
                  activeTab === "settings"
                    ? darkMode
                      ? "border-b-2 border-blue-500 text-blue-500"
                      : "border-b-2 border-blue-600 text-blue-600"
                    : darkMode
                    ? "text-gray-700"
                    : "text-gray-600"
                }`}
              >
                Settings
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                {/* Quick Actions */}
                <div className={`grid grid-cols-1 md:grid-cols-4 gap-4 mb-6`}>
                  <ActionCard
                    title="Exam Demo"
                    description="Check out examination demo"
                    icon="✏️"
                    link="/quiz_demo"
                    darkMode={darkMode}
                  />
                  <ActionCard
                    title="Create New Exam"
                    description="Set up a new examination"
                    icon="✍️"
                    link="/exam"
                    darkMode={darkMode}
                  />
                  <ActionCard
                    title="Create New Course"
                    description="Set up a new course "
                    icon="📝"
                    link="/course"
                    darkMode={darkMode}
                  />
                  <ActionCard
                    title="Add Question Bank"
                    description="Manage your question database"
                    icon="❓"
                    link="/create_question"
                    darkMode={darkMode}
                  />
                  <ActionCard
                    title="Student Registration"
                    description="Register new students for their examination "
                    icon="✍️"
                    link="/bulk"
                    darkMode={darkMode}
                  />
                  <ActionCard
                    title="Manage Proctoring"
                    description="Configure exam monitoring"
                    icon="👁️"
                    link="/proctoring"
                    darkMode={darkMode}
                  />
                  <ActionCard
                    title="Generate Reports"
                    description="Create detailed exam reports"
                    icon="📊"
                    link="/reports"
                    darkMode={darkMode}
                  />
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6"></div>

                {/* Quick Stats Charts */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6"></div>
              </div>
            )}

            {activeTab === "exams" && (
             
             <div className="space-y-6">
                {/* Exam Controls */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-4">
                  <div className="flex items-center space-x-2 mb-2 md:mb-0">
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className={`px-4 py-2 rounded-lg ${
                        darkMode ? "bg-gray-700 text-white" : "bg-gray-100"
                      } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    >
                      <option value="all">All Statuses</option>
                      <option value="scheduled">Scheduled</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                  <Link
                    to="/exam"
                    className={`px-4 py-2 rounded-lg ${
                      darkMode
                        ? "bg-blue-600 hover:bg-blue-700"
                        : "bg-blue-500 hover:bg-blue-600"
                    } text-white transition`}
                  >
                    Create New Exam
                  </Link>
                </div>

                {/* Exam Table */}

                <ExaminerExams />
              </div>
            )}

            {activeTab === "students" && (


              


              <ExaminerStudents />


            )}

            {activeTab === "courses" && (
             <ExaminerCourses />
            )}

            {activeTab === "analytics" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Analytics Dashboard</h2>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setTimeframe("week")}
                      className={`px-3 py-1 rounded-md ${
                        timeframe === "week"
                          ? darkMode
                            ? "bg-blue-600"
                            : "bg-blue-500 text-white"
                          : darkMode
                          ? "bg-gray-700"
                          : "bg-gray-200"
                      }`}
                    >
                      Week
                    </button>
                    <button
                      onClick={() => setTimeframe("month")}
                      className={`px-3 py-1 rounded-md ${
                        timeframe === "month"
                          ? darkMode
                            ? "bg-blue-600"
                            : "bg-blue-500 text-white"
                          : darkMode
                          ? "bg-gray-700"
                          : "bg-gray-200"
                      }`}
                    >
                      Month
                    </button>
                    <button
                      onClick={() => setTimeframe("year")}
                      className={`px-3 py-1 rounded-md ${
                        timeframe === "year"
                          ? darkMode
                            ? "bg-blue-600"
                            : "bg-blue-500 text-white"
                          : darkMode
                          ? "bg-gray-700"
                          : "bg-gray-200"
                      }`}
                    >
                      Year
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Exam Trends */}
                  <div
                    className={`${
                      darkMode ? "bg-gray-800" : "bg-white"
                    } rounded-lg shadow-md p-4`}
                  >
                    <h3 className="text-lg font-semibold mb-2">
                      Exam Performance Trends
                    </h3>
                    <div className="h-64">
                      {/* Chart placeholder */}
                      <div className="w-full h-full flex items-center justify-center">
                        <p>Performance trend chart would render here</p>
                      </div>
                    </div>
                  </div>

                  {/* Participation Rate */}
                  <div
                    className={`${
                      darkMode ? "bg-gray-800" : "bg-white"
                    } rounded-lg shadow-md p-4`}
                  >
                    <h3 className="text-lg font-semibold mb-2">
                      Participation Rate
                    </h3>
                    <div className="h-64">
                      {/* Chart placeholder */}
                      <div className="w-full h-full flex items-center justify-center">
                        <p>Participation rate chart would render here</p>
                      </div>
                    </div>
                  </div>

                  {/* Score Distribution */}
                  <div
                    className={`${
                      darkMode ? "bg-gray-800" : "bg-white"
                    } rounded-lg shadow-md p-4`}
                  >
                    <h3 className="text-lg font-semibold mb-2">
                      Score Distribution
                    </h3>
                    <div className="h-64">
                      {/* Chart placeholder */}
                      <div className="w-full h-full flex items-center justify-center">
                        <p>Score distribution chart would render here</p>
                      </div>
                    </div>
                  </div>

                  {/* Device Usage */}
                  <div
                    className={`${
                      darkMode ? "bg-gray-800" : "bg-white"
                    } rounded-lg shadow-md p-4`}
                  >
                    <h3 className="text-lg font-semibold mb-2">Device Usage</h3>
                    <div className="h-64">
                      {/* Chart placeholder */}
                      <div className="w-full h-full flex items-center justify-center">
                        <p>Device usage chart would render here</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "settings" && (
              <div
                className={`${
                  darkMode ? "bg-gray-800" : "bg-white"
                } rounded-lg shadow-md p-4`}
              >
                <h2 className="text-xl font-semibold mb-6">System Settings</h2>

                <div className="space-y-6">
                  {/* General Settings */}
                  <div>
                    <h3 className="text-lg font-medium mb-4">
                      General Settings
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          System Name
                        </label>
                        <input
                          type="text"
                          defaultValue="Exam System"
                          className={`w-full px-4 py-2 rounded-lg ${
                            darkMode ? "bg-gray-700 text-white" : "bg-gray-100"
                          } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Institution Name
                        </label>
                        <input
                          type="text"
                          defaultValue="Sample University"
                          className={`w-full px-4 py-2 rounded-lg ${
                            darkMode ? "bg-gray-700 text-white" : "bg-gray-100"
                          } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Admin Email
                        </label>
                        <input
                          type="email"
                          defaultValue="admin@example.com"
                          className={`w-full px-4 py-2 rounded-lg ${
                            darkMode ? "bg-gray-700 text-white" : "bg-gray-100"
                          } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Time Zone
                        </label>
                        <select
                          className={`w-full px-4 py-2 rounded-lg ${
                            darkMode ? "bg-gray-700 text-white" : "bg-gray-100"
                          } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        >
                          <option>UTC (Coordinated Universal Time)</option>
                          <option>EST (Eastern Standard Time)</option>
                          <option>CST (Central Standard Time)</option>
                          <option>PST (Pacific Standard Time)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Exam Settings */}
                  <div>
                    <h3 className="text-lg font-medium mb-4">Exam Settings</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Default Exam Duration (minutes)
                        </label>
                        <input
                          type="number"
                          defaultValue="60"
                          className={`w-full px-4 py-2 rounded-lg ${
                            darkMode ? "bg-gray-700 text-white" : "bg-gray-100"
                          } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Default Points Per Question
                        </label>
                        <input
                          type="number"
                          defaultValue="1"
                          className={`w-full px-4 py-2 rounded-lg ${
                            darkMode ? "bg-gray-700 text-white" : "bg-gray-100"
                          } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            defaultChecked
                            className="h-4 w-4 rounded focus:ring-blue-500"
                          />
                          <span className="ml-2">
                            Enable Proctoring by Default
                          </span>
                        </label>
                      </div>
                      <div className="col-span-2">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            defaultChecked
                            className="h-4 w-4 rounded focus:ring-blue-500"
                          />
                          <span className="ml-2">Randomize Question Order</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Security Settings */}
                  <div>
                    <h3 className="text-lg font-medium mb-4">
                      Security Settings
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            defaultChecked
                            className="h-4 w-4 rounded focus:ring-blue-500"
                          />
                          <span className="ml-2">
                            Require Two-Factor Authentication for Admin Users
                          </span>
                        </label>
                      </div>
                      <div className="col-span-2">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            defaultChecked
                            className="h-4 w-4 rounded focus:ring-blue-500"
                          />
                          <span className="ml-2">Log All Admin Actions</span>
                        </label>
                      </div>
                      <div className="col-span-2">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            defaultChecked
                            className="h-4 w-4 rounded focus:ring-blue-500"
                          />
                          <span className="ml-2">Enable IP Restrictions</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2 pt-4">
                    <button
                      className={`px-4 py-2 rounded-lg ${
                        darkMode
                          ? "bg-gray-700 hover:bg-gray-600"
                          : "bg-gray-200 hover:bg-gray-300"
                      } transition`}
                    >
                      Cancel
                    </button>
                    <button
                      className={`px-4 py-2 rounded-lg ${
                        darkMode
                          ? "bg-blue-600 hover:bg-blue-700"
                          : "bg-blue-500 hover:bg-blue-600"
                      } text-white transition`}
                    >
                      Save Settings
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

// Component for stats cards on the dashboard
const StatCard = ({ title, value, icon, darkMode, highlight }) => {
  return (
    <div
      className={`p-4 rounded-lg shadow-md ${
        highlight
          ? darkMode
            ? "bg-blue-900"
            : "bg-blue-50 border border-blue-200"
          : darkMode
          ? "bg-gray-800"
          : "bg-white"
      }`}
    >
      <div className="flex items-center">
        <div
          className={`flex-shrink-0 h-12 w-12 rounded-full flex items-center justify-center ${
            darkMode ? "bg-gray-700" : "bg-gray-100"
          }`}
        >
          <span className="text-xl">{icon}</span>
        </div>
        <div className="ml-4">
          <h3
            className={`text-sm font-medium ${
              darkMode ? "text-gray-300" : "text-gray-500"
            }`}
          >
            {title}
          </h3>
          <p className="text-2xl font-semibold">{value}</p>
        </div>
      </div>
    </div>
  );
};

// Component for action cards on the dashboard
const ActionCard = ({ title, description, icon, link, darkMode }) => {
  return (
    <Link
      to={link}
      className={`flex items-center p-4 rounded-lg shadow-md transition hover:shadow-lg ${
        darkMode ? "bg-gray-800 hover:bg-gray-700" : "bg-white hover:bg-gray-50"
      }`}
    >
      <div
        className={`flex-shrink-0 h-12 w-12 rounded-full flex items-center justify-center ${
          darkMode ? "bg-gray-700" : "bg-gray-100"
        }`}
      >
        <span className="text-xl">{icon}</span>
      </div>
      <div className="ml-4">
        <h3 className="font-medium">{title}</h3>
        <p
          className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}
        >
          {description}
        </p>
      </div>
    </Link>
  );
};

StatCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  icon: PropTypes.string.isRequired,
  darkMode: PropTypes.bool,
  highlight: PropTypes.bool,
};

ActionCard.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  icon: PropTypes.string.isRequired,
  link: PropTypes.string.isRequired,
  darkMode: PropTypes.bool,
};

export default AdminPanel;
