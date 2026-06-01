import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStudentForEdit, useUpdateStudent } from '@hooks/useStudent';

const EditStudentPage = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();
  
  // Use our custom hooks
  const { 
    student: fetchedStudent, 
    isLoading: studentLoading, 
    error: fetchError,
    refetch: refetchStudent 
  } = useStudentForEdit(studentId);
  
  const { 
    updateStudent, 
    isLoading: updateLoading 
  } = useUpdateStudent();
  
  const [student, setStudent] = useState({
    firstName: '',
    lastName: '',
    matricNo: '',
    email: '',
    phone: '',
    department: '',
    level: '',
    isActive: true
  });
  
  const [error, setError] = useState(null);
  const [formChanged, setFormChanged] = useState(false);

  const isLoading = studentLoading || updateLoading;

  // Initialize form with fetched data
  useEffect(() => {
    if (fetchedStudent) {
      setStudent({
        firstName: fetchedStudent.firstName || '',
        lastName: fetchedStudent.lastName || '',
        matricNo: fetchedStudent.matricNo || '',
        email: fetchedStudent.email || '',
        phone: fetchedStudent.phone || '',
        department: fetchedStudent.department || '',
        level: fetchedStudent.level || '',
        isActive: fetchedStudent.isActive !== false
      });
    }
  }, [fetchedStudent]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormChanged(true);
    setStudent(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    if (!formChanged) {
      setError('No changes detected.');
      return;
    }
    
    try {
      // Prepare payload
      const payload = {
        firstName: student.firstName,
        lastName: student.lastName,
        matricNo: student.matricNo,
        email: student.email || null,
        phone: student.phone || null,
        department: student.department || null,
        level: student.level || null,
        isActive: student.isActive
      };
  
      const result = await updateStudent({ studentId, ...payload });
      
      if (result.success) {
        setFormChanged(false);
        refetchStudent(); // Refresh student data
        navigate(`/student/${studentId}`);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to update student');
    }
  };

  // Handle unsaved changes warning
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (formChanged) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [formChanged]);

  const handleCancel = () => {
    if (formChanged && !window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
      return;
    }
    navigate(`/student/${studentId}`);
  };

  // Loading state
  if (studentLoading && !fetchedStudent) {
    return (
      <div className="flex justify-center items-center h-64">
        <div 
          className="animate-spin rounded-full h-12 w-12 border-b-2"
          style={{ borderColor: 'rgb(var(--color-primary))' }}
        ></div>
        <span className="ml-3" style={{ color: 'rgb(var(--color-text-secondary))' }}>
          Loading student data...
        </span>
      </div>
    );
  }

  // Error state
  if (fetchError && !fetchedStudent) {
    return (
      <div className="p-4 text-center">
        <div 
          className="mb-4 p-4 rounded-lg"
          style={{
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            color: 'rgb(var(--color-error))'
          }}
        >
          {fetchError}
        </div>
        <button
          onClick={() => navigate('/admin_panel')}
          className="px-4 py-2 rounded"
          style={{
            backgroundColor: 'rgb(var(--color-surface-elevated))',
            color: 'rgb(var(--color-text-primary))'
          }}
        >
          Back to Students
        </button>
      </div>
    );
  }

  // No student found
  if (!fetchedStudent) {
    return (
      <div className="p-4 text-center">
        <p style={{ color: 'rgb(var(--color-text-primary))' }} className="mb-4">Student not found</p>
        <button
          onClick={() => navigate('/admin_panel')}
          className="px-4 py-2 rounded"
          style={{
            backgroundColor: 'rgb(var(--color-surface-elevated))',
            color: 'rgb(var(--color-text-primary))'
          }}
        >
          Back to Students
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 
          className="text-2xl font-bold"
          style={{ color: 'rgb(var(--color-text-primary))' }}
        >
          Edit Student
        </h1>
        {formChanged && (
          <span 
            className="text-sm px-3 py-1 rounded"
            style={{
              backgroundColor: 'rgba(245, 158, 11, 0.1)',
              color: 'rgb(var(--color-warning))'
            }}
          >
            You have unsaved changes
          </span>
        )}
      </div>
      
      {/* Error Display */}
      {error && (
        <div 
          className="mb-4 p-4 rounded-lg"
          style={{
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            color: 'rgb(var(--color-error))',
            border: '1px solid rgba(239, 68, 68, 0.2)'
          }}
        >
          {error}
        </div>
      )}
      
      {/* Form */}
      <form 
        onSubmit={handleSubmit} 
        className="rounded-lg p-6"
        style={{
          backgroundColor: 'rgb(var(--color-surface-elevated))',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* First Name */}
          <div className="form-group">
            <label 
              className="block text-sm font-medium mb-1"
              style={{ color: 'rgb(var(--color-text-primary))' }}
            >
              First Name<span style={{ color: 'rgb(var(--color-error))' }}>*</span>
            </label>
            <input
              type="text"
              name="firstName"
              value={student.firstName}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-md"
              style={{
                backgroundColor: 'rgb(var(--color-background))',
                border: '1px solid rgb(var(--color-border))',
                color: 'rgb(var(--color-text-primary))'
              }}
              required
            />
          </div>
          
          {/* Last Name */}
          <div className="form-group">
            <label 
              className="block text-sm font-medium mb-1"
              style={{ color: 'rgb(var(--color-text-primary))' }}
            >
              Last Name<span style={{ color: 'rgb(var(--color-error))' }}>*</span>
            </label>
            <input
              type="text"
              name="lastName"
              value={student.lastName}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-md"
              style={{
                backgroundColor: 'rgb(var(--color-background))',
                border: '1px solid rgb(var(--color-border))',
                color: 'rgb(var(--color-text-primary))'
              }}
              required
            />
          </div>
          
          {/* Matric Number */}
          <div className="form-group">
            <label 
              className="block text-sm font-medium mb-1"
              style={{ color: 'rgb(var(--color-text-primary))' }}
            >
              Matric Number<span style={{ color: 'rgb(var(--color-error))' }}>*</span>
            </label>
            <input
              type="text"
              name="matricNo"
              value={student.matricNo}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-md"
              style={{
                backgroundColor: 'rgb(var(--color-background))',
                border: '1px solid rgb(var(--color-border))',
                color: 'rgb(var(--color-text-primary))'
              }}
              required
            />
          </div>
          
          {/* Email */}
          <div className="form-group">
            <label 
              className="block text-sm font-medium mb-1"
              style={{ color: 'rgb(var(--color-text-primary))' }}
            >
              Email
            </label>
            <input
              type="email"
              name="email"
              value={student.email}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-md"
              style={{
                backgroundColor: 'rgb(var(--color-background))',
                border: '1px solid rgb(var(--color-border))',
                color: 'rgb(var(--color-text-primary))'
              }}
            />
          </div>
          
          {/* Phone */}
          <div className="form-group">
            <label 
              className="block text-sm font-medium mb-1"
              style={{ color: 'rgb(var(--color-text-primary))' }}
            >
              Phone
            </label>
            <input
              type="text"
              name="phone"
              value={student.phone}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-md"
              style={{
                backgroundColor: 'rgb(var(--color-background))',
                border: '1px solid rgb(var(--color-border))',
                color: 'rgb(var(--color-text-primary))'
              }}
            />
          </div>
          
          {/* Department */}
          <div className="form-group">
            <label 
              className="block text-sm font-medium mb-1"
              style={{ color: 'rgb(var(--color-text-primary))' }}
            >
              Department
            </label>
            <input
              type="text"
              name="department"
              value={student.department}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-md"
              style={{
                backgroundColor: 'rgb(var(--color-background))',
                border: '1px solid rgb(var(--color-border))',
                color: 'rgb(var(--color-text-primary))'
              }}
            />
          </div>
          
          {/* Level */}
          <div className="form-group">
            <label 
              className="block text-sm font-medium mb-1"
              style={{ color: 'rgb(var(--color-text-primary))' }}
            >
              Level
            </label>
            <input
              type="text"
              name="level"
              value={student.level}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-md"
              style={{
                backgroundColor: 'rgb(var(--color-background))',
                border: '1px solid rgb(var(--color-border))',
                color: 'rgb(var(--color-text-primary))'
              }}
            />
          </div>
          
          {/* Active Status */}
          <div className="form-group flex items-center">
            <input
              type="checkbox"
              name="isActive"
              checked={student.isActive}
              onChange={handleChange}
              className="h-5 w-5 rounded"
              style={{
                color: 'rgb(var(--color-primary))',
                borderColor: 'rgb(var(--color-border))',
                backgroundColor: 'rgb(var(--color-background))'
              }}
            />
            <label 
              className="ml-2 block text-sm font-medium"
              style={{ color: 'rgb(var(--color-text-primary))' }}
            >
              Active Student
            </label>
          </div>
        </div>
        
        {/* Form Actions */}
        <div className="flex justify-end space-x-4 pt-4 border-t" style={{ borderColor: 'rgb(var(--color-border))' }}>
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 rounded-md text-sm font-medium"
            style={{
              backgroundColor: 'rgb(var(--color-surface-elevated))',
              border: '1px solid rgb(var(--color-border))',
              color: 'rgb(var(--color-text-primary))'
            }}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 rounded-md shadow-sm text-sm font-medium"
            style={{
              backgroundColor: isLoading || !formChanged
                ? 'rgb(var(--color-border))'
                : 'rgb(var(--color-primary))',
              color: isLoading || !formChanged
                ? 'rgb(var(--color-text-secondary))'
                : 'white',
              opacity: isLoading || !formChanged ? 0.7 : 1
            }}
            disabled={isLoading || !formChanged}
          >
            {isLoading ? (
              <span className="flex items-center">
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
                Saving...
              </span>
            ) : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditStudentPage;

