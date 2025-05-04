import { motion ,useCycle} from "framer-motion";

const loaderVariants = {
   
    animationOne: {
        x: [-20, 20], // Move horizontally between -20 and 20
        y: [0, -30],  // Move vertically between 0 and -30
        transition: {
            x: {
                repeat: Infinity, // Repeat infinitely
                duration: 0.5,   // Duration of horizontal movement
                //ease: "easeInOut", // Smooth easing
            },
            y: {
                repeat: Infinity, // Repeat infinitely
                duration: 0.25,  // Duration of vertical movement
                ease: "easeOut",  // Bounce effect
            },
        },
    },
    animationTwo:{
        y:[0,-40],
        x:0,
        transition:{
            y:{
                repeat:Infinity,
                duration:0.25,
                ease:'easeOut',

            }
        }
    }
};

const Loader = () => {
    const [animation,cycleAnimation]=useCycle("animationOne","animationTwo");
    
    return (
        <>
            <motion.div
                variants={loaderVariants}
                animate={animation}
                className="loader w-4 h-4 bg-green-600 rounded-full "
            ></motion.div>
            <div onClick={()=>cycleAnimation()}>
                Cycle animation

            </div>

        </>
    );
};

export default Loader;