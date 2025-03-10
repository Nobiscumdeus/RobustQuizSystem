import { motion, useAnimation } from "framer-motion";
import { FaArrowDown } from "react-icons/fa";
import { useState, useEffect } from "react";

const ScrollDownIcon = () => {
  const [isVisible, setIsVisible] = useState(true); // State to control visibility
  const controls = useAnimation(); // Animation controls for the tooltip

  const handleScrollDown = () => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: "smooth",
    });
  };

  // Hide icon on scroll down, show on scroll up
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setIsVisible(false); // Hide icon when scrolled down
      } else {
        setIsVisible(true); // Show icon when scrolled up
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Tooltip animation on hover
  const handleHoverStart = () => {
    controls.start({ opacity: 1, y: 0 });
  };

  const handleHoverEnd = () => {
    controls.start({ opacity: 0, y: 10 });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }} // Fade in/out based on visibility
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.1 }} // Scale up on hover
      whileTap={{ scale: 0.9 }} // Scale down on tap
      onClick={handleScrollDown}
      onHoverStart={handleHoverStart}
      onHoverEnd={handleHoverEnd}
      style={{
        position: "fixed",
        bottom: "20px",
        right: "20px",
        cursor: "pointer",
        zIndex: 1000,
      }}
    >
      {/* Arrow Icon */}
      <div className="rounded-full shadow-md border-radius:50 bg-black-400 p-2">
      <FaArrowDown size={32} color="#3B82F6" />

      </div>
      

      {/* Tooltip */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={controls}
        transition={{ duration: 0.2 }}
        style={{
          position: "absolute",
          bottom: "40px",
          right: "0",
          backgroundColor: "#3B82F6",
          color: "white",
          padding: "4px 8px",
          borderRadius: "4px",
          fontSize: "12px",
          whiteSpace: "nowrap",
        }}
      >
        Scroll Down
      </motion.div>
    </motion.div>
  );
};

export default ScrollDownIcon;