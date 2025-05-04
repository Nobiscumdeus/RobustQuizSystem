import {useState,useEffect} from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import Spinner from '../utility/Spinner';
import {saveAs} from 'file-saver'
import { useNavigate } from 'react-router-dom';
import { isAuthenticated } from '../utility/auth';
import { Link } from 'react-router-dom';

const Reports=()=>{
    const darkMode = useSelector((state) => state.darkMode.darkMode); //
    const [isLoading, setIsLoading] = useState(false);
    const [reportType, setReportType] = useState("exams");
    const [dateRange, setDateRange] = useState("last-month");
    const [format, setFormat] = useState("pdf");
    const [reportData, setReportData] = useState(null);
    const [error, setError] = useState(null);
    const token = localStorage.getItem("token");
    const navigate = useNavigate();

     // Authentication check
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/login", {
        state: { from: "/reports" },
        replace: true,
      });
    }
  }, [navigate]);


  const fetchReportData = async () => {
    try {
      setIsLoading(true);
      setError(null);
  
      const response = await axios.get(
        `http://localhost:5000/reports/data?type=${reportType}&range=${dateRange}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setReportData(response.data);
  
    } catch (err) {
      console.error("Failed to fetch report data: ", err);
      setError(err.response?.data?.message || 'Failed to fetch report data');
    } finally {
      setIsLoading(false); // This was incorrectly set to true
    }
  }
  const generateReport = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await axios.get(
        `http://localhost:5000/reports/generate?type=${reportType}&range=${dateRange}&format=${format}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob",
        }
      );

      // Determine file extension based on format
      const extension = format === "excel" ? "xlsx" : format;
      const filename = `report-${reportType}-${new Date().toISOString().split('T')[0]}.${extension}`;

      // Save the file
      saveAs(new Blob([response.data]), filename);
    } catch (err) {
      console.error("Failed to generate report:", err);
      setError(err.response?.data?.message || "Failed to generate report");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreview = () => {
    fetchReportData();
  };

  return(
    <div className={`min-h-screen p-6 ${darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-800"}`}>
    <div className={`max-w-6xl mx-auto ${darkMode ? "bg-gray-800" : "bg-white"} rounded-lg shadow-md p-6`}>
      <h1 className="text-2xl font-bold mb-6">Report Generator</h1>
      
      {error && (
        <div className={`mb-4 p-4 rounded-md ${darkMode ? "bg-red-900 text-red-200" : "bg-red-100 text-red-800"}`}>
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Report Type Selection */}
        <div>
          <label className={`block mb-2 font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
            Report Type
          </label>
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className={`w-full p-3 rounded-lg border ${darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"}`}
          >
            <option value="exams">Exams</option>
            <option value="students">Students</option>
            <option value="courses">Courses</option>
            <option value="results">Exam Results</option>
            <option value="attendance">Exam Attendance</option>
            <option value="all">Comprehensive Report</option>
          </select>
        </div>

        {/* Date Range Selection */}
        <div>
          <label className={`block mb-2 font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
            Date Range
          </label>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className={`w-full p-3 rounded-lg border ${darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"}`}
          >
            <option value="last-week">Last Week</option>
            <option value="last-month">Last Month</option>
            <option value="last-quarter">Last Quarter</option>
            <option value="last-year">Last Year</option>
            <option value="custom">Custom Range</option>
            <option value="all">All Time</option>
          </select>
        </div>

        {/* Format Selection */}
        <div>
          <label className={`block mb-2 font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
            Export Format
          </label>
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value)}
            className={`w-full p-3 rounded-lg border ${darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"}`}
          >
            <option value="pdf">PDF</option>
            <option value="csv">CSV</option>
            <option value="excel">Excel</option>
          </select>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4 mb-8">
        <button
          onClick={handlePreview}
          disabled={isLoading}
          className={`px-6 py-3 rounded-lg font-medium ${darkMode ? "bg-blue-600 hover:bg-blue-700" : "bg-blue-500 hover:bg-blue-600"} text-white transition disabled:opacity-50`}
        >
          {isLoading ? <Spinner size="small" /> : "Preview Data"}
        </button>
        <button
          onClick={generateReport}
          disabled={isLoading}
          className={`px-6 py-3 rounded-lg font-medium ${darkMode ? "bg-green-600 hover:bg-green-700" : "bg-green-500 hover:bg-green-600"} text-white transition disabled:opacity-50`}
        >
          {isLoading ? <Spinner size="small" /> : "Generate Report"}
        </button>
        <button   className={`px-3 py-0  rounded-lg font-medium text-center ${
            darkMode 
              ? "bg-red-600 hover:bg-red-700" 
              : "bg-red-500 hover:bg-red-600"
          } text-white transition disabled:opacity-50`}>
        <Link
        to="/admin_panel"
      
          
        >
            Back
        </Link>

        </button>
       
      </div>

      {/* Data Preview */}
      {reportData && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-4">Data Preview</h2>
          <div className={`overflow-x-auto rounded-lg ${darkMode ? "bg-gray-700" : "bg-white"} shadow`}>
            <pre className={`p-4 text-sm ${darkMode ? "text-gray-300" : "text-gray-800"} overflow-auto max-h-96`}>
              {JSON.stringify(reportData, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  </div>
  )

    



}

export default Reports;
