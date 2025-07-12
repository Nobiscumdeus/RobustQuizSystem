import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify'

const CreateExam = () => {
  const [exam, setExam] = useState({
    title: '',
    date: '',
    password: '',
    duration: '',
    examinerId: '',
    courseId: ''
  });
  
  const handleChange = (event) => {
    setExam({ ...exam, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await axios.post('http://localhost:5000/', exam);
      toast.success('Exam created successfully');
      
    } catch (error) {
      console.error('Error creating exam:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-5 max-w-lg mx-auto bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4">Create Exam</h2>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="title">
          Exam Title
        </label>
        <input
          type="text"
          name="title"
          value={exam.title}
          onChange={handleChange}
          placeholder="Exam Title"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="date">
          Exam Date
        </label>
        <input
          type="datetime-local"
          name="date"
          value={exam.date}
          onChange={handleChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
          Exam Password
        </label>
        <input
          type="password"
          name="password"
          value={exam.password}
          onChange={handleChange}
          placeholder="Exam Password"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="duration">
          Duration (minutes)
        </label>
        <input
          type="number"
          name="duration"
          value={exam.duration}
          onChange={handleChange}
          placeholder="Duration (minutes)"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="examinerId">
          Examiner ID
        </label>
        <input
          type="text"
          name="examinerId"
          value={exam.examinerId}
          onChange={handleChange}
          placeholder="Examiner ID"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="courseId">
          Course ID
        </label>
        <input
          type="text"
          name="courseId"
          value={exam.courseId}
          onChange={handleChange}
          placeholder="Course ID"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
      </div>
      <button
        type="submit"
        className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-200"
      >
        Create Exam
      </button>
    </form>
  );
};

export default CreateExam;