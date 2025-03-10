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
