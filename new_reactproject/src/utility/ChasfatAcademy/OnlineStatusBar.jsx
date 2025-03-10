import { useState, useEffect } from 'react';

export default function useOnlineStatus() {
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    useEffect(() => {
        // Event listener to handle online status change
        function handleOnline() {
            console.log('Online event triggered');
            setIsOnline(true);
        }

        // Event listener to handle offline status change
        function handleOffline() {
            console.log('Offline event triggered');
            setIsOnline(false);
        }

        // Add event listeners for 'online' and 'offline'
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Check the initial online status
        checkOnlineStatus().then((online) => {
            setIsOnline(online);
        });

        // Set up polling to check online status every 5 seconds
        const pollingInterval = setInterval(() => {
            checkOnlineStatus().then((online) => {
                setIsOnline(online);
            });
        }, 5000);

        // Cleanup event listeners and polling on unmount
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
            clearInterval(pollingInterval);
        };
    }, []);

    // Function to check online status by pinging a server
    async function checkOnlineStatus() {
        try {
            const response = await fetch('https://www.google.com/favicon.ico', {
                method: 'HEAD',
                mode: 'no-cors',
                cache: 'no-cache',
            });

            console.log('Online status check response:', response.ok);

            // If the request succeeds, we're online
            return true;
        } catch (error) {
            console.error('Online status check failed:', error);

            // If the request fails, we're offline
            return false;
        }
    }

    return isOnline;
}
