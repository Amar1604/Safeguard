// Configuration loader for environment variables
// This file loads Firebase config from environment variables or falls back to defaults

function loadFirebaseConfig() {
    const savedConfig = localStorage.getItem('safeguard_firebase_config');
    if (savedConfig) {
        try {
            return JSON.parse(savedConfig);
        } catch (e) {
            console.error('Error parsing saved Firebase config, resetting:', e);
            localStorage.removeItem('safeguard_firebase_config');
        }
    }
    
    const config = {
        apiKey: window.ENV?.FIREBASE_API_KEY || "AIzaSyChVq9DHstMA9EXoNyDhZQb_qjRpHaMQIA",
        authDomain: window.ENV?.FIREBASE_AUTH_DOMAIN || "women-safety-tracker-2da51.firebaseapp.com",
        databaseURL: window.ENV?.FIREBASE_DATABASE_URL || "https://women-safety-tracker-2da51-default-rtdb.firebaseio.com",
        projectId: window.ENV?.FIREBASE_PROJECT_ID || "women-safety-tracker-2da51",
        storageBucket: window.ENV?.FIREBASE_STORAGE_BUCKET || "women-safety-tracker-2da51.firebasestorage.app",
        messagingSenderId: window.ENV?.FIREBASE_MESSAGING_SENDER_ID || "413352353793",
        appId: window.ENV?.FIREBASE_APP_ID || "1:413352353793:web:1f2ee4284957e13c922000"
    };
    
    return config;
}