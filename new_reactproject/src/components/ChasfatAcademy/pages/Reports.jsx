import {useState, useEffect} from 'react';
import Spinner from '../utility/Spinner';
import { saveAs } from 'file-saver';
import { useNavigate, Link } from 'react-router-dom';
import { useCurrentUser } from '@/hooks/useAuth'; // ADD THIS
import { useTheme } from '@/hooks/useTheme';
import { useGenerateReportMutation, useGetReportDataQuery } from '@api/reportsApi'; // ADD THIS - You'll need to create this API

const Reports = () => {
    const { darkMode } = useTheme()
    const [reportType, setReportType] = useState("exams");
    const [dateRange, setDateRange] = useState("last-month");
    const [format, setFormat] = useState("pdf");
  const [searchQuery, setSearchQuery] = useState('');
    const [error, setError] = useState(null);
    
    // Use hooks instead of direct API calls
    const { isAuthenticated, isLoading: authLoading } = useCurrentUser(); // ADD THIS
    const navigate = useNavigate();

    // RTK Query hooks
    const { 
        data: reportData, 
        isLoading: isPreviewLoading, 
        error: previewError,
        refetch: refetchReportData 
    } = useGetReportDataQuery(
        { type: reportType, range: dateRange },
        { skip: !isAuthenticated } // Only fetch when authenticated
    );

    const [generateReportMutation, { isLoading: isGenerating }] = useGenerateReportMutation();

    // Authentication check - UPDATED
    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            navigate("/login", {
                state: { from: "/reports", message: "Please login to access reports" },
                replace: true,
            });
        }
    }, [authLoading, isAuthenticated, navigate]);

    const generateReport = async () => {
        try {
            setError(null);
            
            // Use RTK Query mutation
            const result = await generateReportMutation({
                type: reportType,
                range: dateRange,
                format: format
            }).unwrap();

            // Handle the blob response
            const blob = new Blob([result], { 
                type: format === 'pdf' ? 'application/pdf' : 
                       format === 'excel' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' : 
                       'text/csv'
            });
            
            const extension = format === "excel" ? "xlsx" : format;
            const filename = `report-${reportType}-${new Date().toISOString().split('T')[0]}.${extension}`;
            
            saveAs(blob, filename);
        } catch (err) {
            console.error("Failed to generate report:", err);
            setError(err.data?.message || "Failed to generate report");
        }
    };

    const handlePreview = () => {
        refetchReportData();
    };

    // Update error from preview
    useEffect(() => {
        if (previewError) {
            setError(previewError.data?.message || 'Failed to fetch report data');
        } else {
            setError(null);
        }
    }, [previewError]);

    // Combined loading state
  //  const isLoading = authLoading || isPreviewLoading || isGenerating;

    // Authentication check render
    if (!authLoading && !isAuthenticated) {
        return null; // Will redirect in useEffect
    }

    return (
        <div className={`min-h-screen p-6 ${darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-800"}`}>
            <div className={`max-w-6xl mx-auto ${darkMode ? "bg-gray-800" : "bg-white"} rounded-lg shadow-md p-6`}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-extrabold tracking-tight">{reportType === 'exams' ? 'EXAMS REPORT' : 'REPORTS'}</h1>
                  <p className={`${darkMode ? "text-gray-300" : "text-gray-500"} mt-1`}>Generate, preview, and export institutional reports.</p>
                </div>
                <div className="text-sm text-gray-600">Generated on: {new Date().toLocaleDateString()}</div>
              </div>

              <div className="flex items-center gap-3 mb-4">
                <input
                  type="search"
                  placeholder={`Search ${reportType}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`flex-1 px-3 py-2 border rounded-md ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
                <button onClick={() => { setSearchQuery(''); refetchReportData(); }} className="px-3 py-2 rounded-md border">Clear</button>
              </div>
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
                        disabled={isPreviewLoading || !isAuthenticated}
                        className={`px-6 py-3 rounded-lg font-medium ${darkMode ? "bg-blue-600 hover:bg-blue-700" : "bg-blue-500 hover:bg-blue-600"} text-white transition disabled:opacity-50`}
                    >
                        {isPreviewLoading ? <Spinner size="small" /> : "Preview Data"}
                    </button>
                    <button
                        onClick={generateReport}
                        disabled={isGenerating || !isAuthenticated}
                        className={`px-6 py-3 rounded-lg font-medium ${darkMode ? "bg-green-600 hover:bg-green-700" : "bg-green-500 hover:bg-green-600"} text-white transition disabled:opacity-50`}
                    >
                        {isGenerating ? <Spinner size="small" /> : "Generate Report"}
                    </button>
                    <Link
                        to="/admin_panel"
                        className={`px-6 py-3 rounded-lg font-medium text-center ${darkMode ? "bg-red-600 hover:bg-red-700" : "bg-red-500 hover:bg-red-600"} text-white transition`}
                    >
                        Back
                    </Link>
                </div>

                {/* Data Preview (card layout for exams) */}
                {reportData && (
                  <div className="mt-6">
                    <h2 className="text-xl font-semibold mb-4">Data Preview</h2>

                    {/* normalize possible report payload shapes */}
                    {(() => {
                      const exams = Array.isArray(reportData)
                        ? reportData
                        : Array.isArray(reportData.exams)
                        ? reportData.exams
                        : Array.isArray(reportData.data?.exams)
                        ? reportData.data.exams
                        : Array.isArray(reportData.items)
                        ? reportData.items
                        : [];

                      if (reportType === 'exams') {
                        const filtered = exams.filter((ex) => {
                          if (!searchQuery) return true;
                          const q = searchQuery.toLowerCase();
                          const titleText = (ex.title || ex.name || '') + '';
                          const courseText = typeof ex.course === 'string' ? ex.course : (ex.course?.title || ex.course?.name || '');
                          const descText = (ex.description || '') + '';
                          return (
                            titleText.toLowerCase().includes(q) ||
                            courseText.toLowerCase().includes(q) ||
                            descText.toLowerCase().includes(q)
                          );
                        });

                        if (filtered.length === 0) {
                          return <div className="text-sm text-gray-500">No exams found for the selected criteria.</div>;
                        }

                        const formatDate = (d) => {
                          try {
                            return new Date(d).toLocaleDateString();
                          } catch (e) {
                            return d;
                          }
                        };

                        return (
                          <div className="grid gap-4">
                            {filtered.map((ex, idx) => (
                              <div key={ex.id || idx} className={`bg-white rounded-lg shadow p-4 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                                <div className="flex items-start justify-between">
                                  <h3 className="text-lg font-semibold">{ex.title || ex.name}</h3>
                                  <div className="text-sm text-gray-500">{formatDate(ex.date || ex.examDate)}</div>
                                </div>
                                                <p className="mt-2 text-gray-700">{typeof ex.course === 'string' ? ex.course : (ex.course?.title || ex.courseName || ex.course?.name || '')}</p>
                                <div className="mt-3 flex items-center gap-4 text-sm text-gray-600">
                                  <span className="flex items-center gap-2">⏱ {ex.duration ?? ex.time ?? '—'} mins</span>
                                  <span className="text-gray-400">|</span>
                                  <span className="text-gray-600">Students: {ex.studentCount ?? ex.participants ?? '—'}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        );
                      }

                      // fallback: show JSON for other report types
                      return (
                        <div className={`overflow-x-auto rounded-lg ${darkMode ? "bg-gray-700" : "bg-white"} shadow`}>
                          <pre className={`p-4 text-sm ${darkMode ? "text-gray-300" : "text-gray-800"} overflow-auto max-h-96`}>
                            {JSON.stringify(reportData, null, 2)}
                          </pre>
                        </div>
                      );
                    })()}
                  </div>
                )}
            </div>
        </div>
    );
}

export default Reports;

