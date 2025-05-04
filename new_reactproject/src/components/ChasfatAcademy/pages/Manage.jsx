import { Link ,useNavigate} from "react-router-dom";
import { useSelector } from "react-redux";
import Footer from "../shared/Footer";
import PropTypes from 'prop-types';
import ScrollDownIcon from "../utility/ScrollDownIcon";
import ReactJoyride from 'react-joyride';

import useTourStore from "../../../zustand/store"

const Manage = () => {
  const { isTourRunning, startTour ,stopTour} = useTourStore(); // Get state and actions from Zustand
  const navigate =useNavigate();
  // Define the steps for the onboarding tour
  const steps = [
    {
      target: '.start-button',
      content: 'Click here to start the quiz!',
    },
    {
      target: '.profile',
      content: 'Here is the link to your profile!',
    },
    {
      target: '.quiz-demo',
      content: 'Take a quiz demo from here.',
    },
    {
      target: '.course',
      content: 'Click here to create a course!',
    },
    {
      target: '.exam',
      content: 'Click here to create exams!',
    },
    {
      target: '.bulk',
      content: 'Click here to create bulk questions!',
    },
    {
      target: '.create-question',
      content: 'Click here to create questions!',
    },
    {
      target: '.modal',
      content: 'Go to the Admin Panel to complete the tour.',
      locale: { next: 'Go to Admin Panel' }, // Customize the button text
    },

  ];

  const darkMode = useSelector((state) => state.darkMode.darkMode); // Access the dark mode state

   // Callback function for React Joyride
   const handleJoyrideCallback = (data) => {
    if (data.action === 'next' && data.index === steps.length - 1) {
      // Last step: Navigate to the AdminPanel page
      navigate('/admin_panel');
      stopTour(); // Stop the tour after navigation
    }
  };


  return (
    <>
      <div
        className={`${
          darkMode ? "bg-gray-700 text-gray-100 " : "bg-gray-100 text-gray-800 "
        } min-h-screen p-8`}
      >
        <header
          className={`flex justify-center items-center ${
            darkMode ? "bg-gray-600 text-gray-100 " : "bg-white "
          } shadow-md p-4 rounded-lg mb-8`}
        >
          <h1
            className={`text-3xl font-bold ${
              darkMode ? " text-gray-100 " : "text-blue-600 "
            }`}
          >
            Management
          </h1>
        </header>

        <section className="flex flex-row items-center justify-center mb-6">
          <button className="start-button" onClick={startTour}>
            Take Tour
          </button>
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card
            link="/profile"
            title="Your Profile"
            description="See all your data in a single point."
            className="profile"
          />
          <Card
            link="/quiz_demo"
            title="Take a quick Quiz"
            description="Try a quiz interface..."
            className="quiz-demo"
          />
          <Card
            link="/course"
            title="Create a Course"
            description="Create and manage courses."
            className="course"
          />
          <Card
            link="/exam"
            title="Create an Exam"
            description="Set up examination here."
            className="exam"
          />
          <Card
            link="/bulk"
            title="Register Students"
            description="Enroll students with their matric numbers."
            className="bulk"
          />
          <Card
            link="/create_question"
            title="Set Examination Questions"
            description="Set questions for upcoming examinations."
            className="create-question"
          />

<Card
            link="/admin_panel"
            title="Admin Panel"
            description="Go to the admin panel."
            className="admin-panel-link"
          />


        </section>

        {/* Render React Joyride */}
        <ReactJoyride
          steps={steps}
          run={isTourRunning} // Use the tour state from Zustand
          continuous={true}
          scrollToFirstStep={true}
          showProgress={true}
          showSkipButton={true}
          callback={handleJoyrideCallback} // Add the callback function
          locale={{
            back: 'Back',
            close: 'Close',
            last: 'End Tour',
            next: 'Next',
            skip: 'Skip',
          }}
        />
      </div>
      <ScrollDownIcon />
      <Footer />
    </>
  );
};

const Card = ({ link, title, description, className }) => {
  const darkMode = useSelector((state) => state.darkMode.darkMode); // Access the dark mode state
  return (
    <Link
      to={link}
      className={`${
        darkMode ? "bg-gray-800 text-gray-100 " : "bg-gray-100 text-gray-800 "
      } ${className} rounded-lg shadow-lg p-6 transition-transform transform hover:scale-105`}
    >
      <h3 className="text-xl font-semibold">{title}</h3>
      <p className="mt-2">{description}</p>
    </Link>
  );
};

// PropTypes validation
Card.propTypes = {
  link: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  className: PropTypes.string,
};

export default Manage;