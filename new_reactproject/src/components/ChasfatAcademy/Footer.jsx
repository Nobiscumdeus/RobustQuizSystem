import { useSelector } from 'react-redux';

function Footer() {
  const darkMode = useSelector((state) => state.darkMode.darkMode); // Access the dark mode state
  return (
   
   
      <footer className={`${darkMode ? 'bg-gray-800 text-gray-200 shadow py-4 bg-gray-100' : 'bg-white text-gray-600 shadow py-4'} `}>
        <div className="container mx-auto px-4 text-center">
          <p className="">© {new Date().getFullYear()} Chasfat Academy. All rights reserved.</p>
          <ul className="flex justify-center space-x-4 mt-2">
            <li><a href="#privacy" className="hover:text-blue-500">Privacy Policy</a></li>
            <li><a href="#terms" className="hover:text-blue-500">Terms of Service</a></li>
          </ul>
        </div>
      </footer>
      

  )
}

export default Footer
