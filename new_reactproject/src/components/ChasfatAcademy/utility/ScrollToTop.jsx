import { useEffect } from "react";
import { useLocation} from "react-router-dom"

const ScrollToTop =() =>{
    const { pathname, hash} = useLocation()

    useEffect(()=>{
        window.scrollTo(0,0);
    },[pathname])

    useEffect(()=>{
        if(hash){
            setTimeout(()=>{
                const element = document.getElementById(hash.replace('#',''))
                if(element){
                    const offset = 80
                    const elementPosition = element.ofsetTop - offset;
                    window.scrollTo({
                        top:elementPosition,
                        behavior:'smooth'
                    })
                }
                if (!element) {
  console.warn(`Element with id "${hash.replace('#', '')}" not found`);
  // Optionally scroll to top as fallback
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
            },100)
        }
    },[hash])

    return null;
}

export default ScrollToTop