// Production-ready logging utility
// Only logs errors in production, full logging in development

(function() {
    'use strict';
    
    // Detect if we're in production (you can adjust this logic)
    const isProduction = window.location.hostname !== 'localhost' && 
                        window.location.hostname !== '127.0.0.1' && 
                        !window.location.hostname.includes('dev');
    
    // Create logger object
    window.Logger = {
        // Always log errors
        error: function(...args) {
            console.error(...args);
        },
        
        // Only log warnings in development
        warn: function(...args) {
            if (!isProduction) {
                console.warn(...args);
            }
        },
        
        // Only log info in development
        info: function(...args) {
            if (!isProduction) {
                console.log(...args);
            }
        },
        
        // Only log debug in development
        debug: function(...args) {
            if (!isProduction) {
                console.log('[DEBUG]', ...args);
            }
        },
        
        // Utility to check if we're in production
        isProduction: function() {
            return isProduction;
        }
    };
    
    // For backward compatibility, create a console.log wrapper
    window.safeLog = function(...args) {
        if (!isProduction) {
            console.log(...args);
        }
    };
    
})();