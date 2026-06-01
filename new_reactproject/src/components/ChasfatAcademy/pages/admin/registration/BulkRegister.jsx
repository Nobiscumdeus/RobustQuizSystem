import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthCheck } from "@hooks/useAuth";
import { useBulkRegisterStudents } from "@hooks/useStudent";

const BulkRegister = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useAuthCheck();
  
  // Use our custom hooks
  const { 
    bulkRegister, 
    isLoading: uploadLoading, 
    error: uploadError 
  } = useBulkRegisterStudents();
  
  const [file, setFile] = useState(null);
  const [localError, setLocalError] = useState(null);
  const [success, setSuccess] = useState(null);

  const isLoading = authLoading || uploadLoading;

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setLocalError(null);
    setSuccess(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);
    setSuccess(null);
    
    if (!file) {
      setLocalError("Please select a file.");
      return;
    }

    // Check if the file is CSV or Excel
    const fileExtension = file.name.split(".").pop().toLowerCase();
    const allowedExtensions = ["csv", "xlsx", "xls"];
    
    if (!allowedExtensions.includes(fileExtension)) {
      setLocalError("Invalid file format. Please upload a CSV or Excel file.");
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setLocalError("File size too large. Maximum size is 5MB.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", file);

      const result = await bulkRegister(formData);
      
      if (result.success) {
        setSuccess(result.data?.message || "Bulk registration successful!");
        setFile(null);
        // Clear file input
        e.target.reset();
      } else {
        setLocalError(result.error);
      }
    } catch (error) {
      setLocalError("An unexpected error occurred.");
    }
  };

  // Show loading state during auth check
  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div 
          className="animate-spin rounded-full h-12 w-12 border-b-2"
          style={{ borderColor: 'rgb(var(--color-primary))' }}
        ></div>
        <span className="ml-3" style={{ color: 'rgb(var(--color-text-secondary))' }}>
          Checking authentication...
        </span>
      </div>
    );
  }

  // If not authenticated, the hook will handle redirection
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div 
      className="max-w-md mx-auto p-6 rounded-lg shadow-lg"
      style={{
        backgroundColor: 'rgb(var(--color-surface-elevated))',
        color: 'rgb(var(--color-text-primary))'
      }}
    >
      <h2 
        className="text-2xl font-bold mb-6 text-center"
        style={{ color: 'rgb(var(--color-text-primary))' }}
      >
        Bulk Student Registration
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* File Upload */}
        <div>
          <label 
            className="block text-sm font-medium mb-2"
            style={{ color: 'rgb(var(--color-text-primary))' }}
          >
            Upload Student File<span style={{ color: 'rgb(var(--color-error))' }}>*</span>
          </label>
          <input
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileChange}
            className="w-full p-3 rounded-md border-2 border-dashed transition-colors"
            style={{
              backgroundColor: 'rgb(var(--color-background))',
              borderColor: file 
                ? 'rgb(var(--color-primary))' 
                : 'rgb(var(--color-border))',
              color: 'rgb(var(--color-text-primary))'
            }}
            disabled={isLoading}
          />
          <p 
            className="text-xs mt-2"
            style={{ color: 'rgb(var(--color-text-secondary))' }}
          >
            Accepted formats: CSV, XLSX, XLS (Max 5MB)
          </p>
        </div>

        {/* File Preview */}
        {file && (
          <div 
            className="p-4 rounded-md"
            style={{
              backgroundColor: 'rgb(var(--color-background))',
              border: '1px solid rgb(var(--color-border))'
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium" style={{ color: 'rgb(var(--color-text-primary))' }}>
                  {file.name}
                </p>
                <p className="text-sm" style={{ color: 'rgb(var(--color-text-secondary))' }}>
                  {(file.size / 1024 / 1024).toFixed(2)} MB • {file.type || 'Unknown type'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setFile(null);
                  setLocalError(null);
                }}
                className="text-sm"
                style={{ color: 'rgb(var(--color-error))' }}
                disabled={isLoading}
              >
                Remove
              </button>
            </div>
          </div>
        )}

        {/* Template Download */}
        <div 
          className="p-4 rounded-md"
          style={{
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            border: '1px solid rgba(59, 130, 246, 0.2)'
          }}
        >
          <h3 
            className="font-medium mb-2"
            style={{ color: 'rgb(var(--color-primary))' }}
          >
            File Format Requirements
          </h3>
          <ul 
            className="text-sm space-y-1 list-disc pl-5"
            style={{ color: 'rgb(var(--color-text-secondary))' }}
          >
            <li>File must have headers: firstName, lastName, matricNo, email, department, level</li>
            <li>Email is optional but recommended</li>
            <li>Phone number can be included as an optional column</li>
            <li>All students will be registered as active by default</li>
          </ul>
          <button
            type="button"
            onClick={() => {
              // Create and download a sample CSV template
              const headers = ['firstName', 'lastName', 'matricNo', 'email', 'phone', 'department', 'level'];
              const sampleData = [
                ['John', 'Doe', 'MAT001', 'john.doe@example.com', '08012345678', 'Computer Science', '100'],
                ['Jane', 'Smith', 'MAT002', 'jane.smith@example.com', '08087654321', 'Mathematics', '200']
              ];
              
              let csvContent = headers.join(',') + '\n';
              sampleData.forEach(row => {
                csvContent += row.join(',') + '\n';
              });
              
              const blob = new Blob([csvContent], { type: 'text/csv' });
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'student_template.csv';
              a.click();
              window.URL.revokeObjectURL(url);
            }}
            className="mt-2 text-sm"
            style={{ color: 'rgb(var(--color-primary))' }}
          >
            Download CSV Template
          </button>
        </div>

        {/* Error Messages */}
        {localError && (
          <div 
            className="p-3 rounded-md"
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              color: 'rgb(var(--color-error))'
            }}
          >
            {localError}
          </div>
        )}

        {uploadError && (
          <div 
            className="p-3 rounded-md"
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              color: 'rgb(var(--color-error))'
            }}
          >
            {uploadError}
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div 
            className="p-3 rounded-md"
            style={{
              backgroundColor: 'rgba(52, 211, 153, 0.1)',
              color: 'rgb(var(--color-success))'
            }}
          >
            {success}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full py-3 rounded-md font-medium transition-colors disabled:opacity-50"
          style={{
            backgroundColor: file && !isLoading 
              ? 'rgb(var(--color-primary))' 
              : 'rgb(var(--color-border))',
            color: file && !isLoading ? 'white' : 'rgb(var(--color-text-secondary))'
          }}
          disabled={!file || isLoading}
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg 
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24"
              >
                <circle 
                  className="opacity-25" 
                  cx="12" 
                  cy="12" 
                  r="10" 
                  stroke="currentColor" 
                  strokeWidth="4"
                ></circle>
                <path 
                  className="opacity-75" 
                  fill="currentColor" 
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Uploading...
            </span>
          ) : 'Upload Students'}
        </button>
      </form>

      {/* Back Button */}
      <div className="mt-6 text-center">
        <button
          onClick={() => navigate('/admin_panel')}
          className="text-sm"
          style={{ color: 'rgb(var(--color-primary))' }}
        >
          ← Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default BulkRegister;
