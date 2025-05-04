// src/utils/auth.js
export const logout = (isExpired = false) => {
    // Clear all authentication data
    localStorage.removeItem('token');  // Changed from 'token' to 'accessToken'
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    
    // Clear cookies more aggressively
    document.cookie.split(';').forEach(cookie => {
        const [name] = cookie.trim().split('=');
        document.cookie = `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
    });
    
    // Force reload if session expired
    if (isExpired) {
        window.location.href = `/login?session_expired=true&from=${encodeURIComponent(window.location.pathname)}`;
        return; // Stop further execution
    }
    
    // For normal logouts, notify the app
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new Event('logout'));
};

export const isAuthenticated = () => {
    const token = localStorage.getItem('token');
    if (!token) return false;
    
    // Verify token hasn't expired (optional)
    try {
        const { exp } = JSON.parse(atob(token.split('.')[1]));
        return exp * 1000 > Date.now();
    } catch {
        return false;
    }
};