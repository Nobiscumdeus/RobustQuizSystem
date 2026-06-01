import { useSelector, useDispatch } from 'react-redux'; 
import { useEffect } from 'react';
import { toggleDisplayMode } from '@/features/ChasfatAcademy/ui/displayModeSlice';


export const useTheme =() =>{
    const dispatch = useDispatch();
    const displayMode = useSelector((state)=> state.ui?.displayMode || 'light');
    const isDarkMode = displayMode === 'dark';

    //Single place that touches the React DOM 
    useEffect(() =>{
        const root = document.documentElement;

        if(isDarkMode){
            root.classList.add('dark');
        }else{
            root.classList.remove('dark');
        }
    },[isDarkMode]);

    const toggleTheme =() =>{
        dispatch(toggleDisplayMode());
    }

    return{
        displayMode,      // "light" or "dark"
        isDarkMode,       // true or false
        darkMode: isDarkMode, //Alias if needed 
        themeClass : isDarkMode ? 'dark' : 'light',
        toggleTheme

    }



}
