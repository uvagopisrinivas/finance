# Shared Utilities

## Logger (logger.js)

Production-ready logging utility that minimizes console output in production environments.

### Usage

```javascript
// Error logging (always shown)
Logger.error('Something went wrong:', error);

// Warning logging (development only)
Logger.warn('This is deprecated');

// Info logging (development only)  
Logger.info('Process completed');

// Debug logging (development only)
Logger.debug('Debug information:', data);

// Check environment
if (Logger.isProduction()) {
    // Production-specific code
}
```

### Environment Detection

The logger automatically detects production vs development based on:
- `localhost` and `127.0.0.1` are considered development
- Hostnames containing `dev` are considered development
- All other hostnames are considered production

### Benefits

- **Reduced console noise in production**: Only errors are logged
- **Full debugging in development**: All log levels are shown
- **Easy migration**: Replace `console.log` with `Logger.debug`
- **Performance**: No string concatenation in production for debug logs