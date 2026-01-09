function ExamHeader() {
  return (
    <div className="bg-surface border-b border-border shadow-md p-4 mb-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Student Details */}
        <div className="space-y-3">
          <h2 className="font-bold text-text-primary flex items-center">
            <span className="mr-2">👨‍🎓</span> Student Details
          </h2>
          <div className="space-y-2">
            <p className="text-text-primary">
              <span className="font-medium">Name:</span> John Doe
            </p>
            <p className="text-text-primary">
              <span className="font-medium">Matric No:</span> 2023/0001
            </p>
            <p className="text-text-primary">
              <span className="font-medium">Department:</span> Anatomy
            </p>
          </div>
        </div>

        {/* Exam Details */}
        <div className="space-y-3">
          <h2 className="font-bold text-text-primary flex items-center">
            <span className="mr-2">📝</span> Exam Details
          </h2>
          <div className="space-y-2">
            <p className="text-text-primary">
              <span className="font-medium">Course:</span> Introduction to Anatomy
            </p>
            <p className="text-text-primary">
              <span className="font-medium">Duration:</span> 30 minutes
            </p>
            <p className="text-text-primary">
              <span className="font-medium">Total Questions:</span> 10
            </p>
          </div>
        </div>

        {/* Timer */}
        <div className="flex justify-end items-start">
          <div className="bg-primary/10 border border-primary/20 p-4 rounded-xl min-w-[140px]">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary mb-1">25:00</div>
              <p className="text-sm text-primary/80">Time Remaining</p>
            </div>
            <div className="mt-2 text-xs text-text-secondary text-center">
              Auto-submits when timer ends
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="max-w-7xl mx-auto mt-4">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm text-text-secondary">Progress</span>
          <span className="text-sm font-medium text-text-primary">25%</span>
        </div>
        <div className="w-full bg-background rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: '25%' }}
          ></div>
        </div>
      </div>
    </div>
  );
}

export default ExamHeader;

/*
function ExamHeader() {
  return (
    <div className="bg-white shawod-md p-4 mb-6">
      <div className="max-w-7xl mx-auto grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <h2 className="font-bold text-gray-700"> Student Details</h2>
          <p className="text-sm"> Name: John Doe </p>
          <p className="text-sm">Matric No: 2023/0001</p>
          <p className="text-sm">Department: Anatomy</p>
        </div>

        <div className="space-y-2">
          <h2 className="font-bold text-gray-700">Exam Details</h2>
          <p className="text-sm">Course: Introduction to Anatomy</p>
          <p className="text-sm">Duration: 30 minutes</p>
          <p className="text-sm">Total Questions: 10(static)</p>
        </div>

        <div className="flex justify-end items-start">
          <div className="bg-blue-100 p-3 rounded-lg">
            <span className="text-xl font-bold text-blue-800">25:00</span>
            <p className="text-sm text-blue-600">Time Remaining</p>
          </div>
        </div>


      </div>
    </div>
  );
}

export default ExamHeader;
*/
