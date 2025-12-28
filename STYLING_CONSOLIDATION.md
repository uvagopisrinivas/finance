# Styling Consolidation

## Overview

All application styles have been consolidated into a single CSS file for better maintainability and performance.

## Changes Made

### ✅ Consolidated Files
- **Before**: `src/styles/global.less` (2,210 lines) + `src/styles/global.css` (1,826 lines) + inline styles
- **After**: `src/styles/consolidated.css` (single source of truth)

### ✅ Removed Dependencies
- Removed LESS compiler dependency
- Simplified build process (no CSS compilation needed)
- Removed inline styles from HTML files

### ✅ Maintained Features
- ✅ All existing styling preserved
- ✅ Dark/light theme support
- ✅ Responsive design
- ✅ Component-based architecture
- ✅ CSS custom properties (design tokens)
- ✅ All animations and transitions
- ✅ Print styles
- ✅ Browser compatibility fixes

## File Structure

```
src/styles/
├── consolidated.css          # Single CSS file with all styles
├── global.less.backup       # Backup of original LESS file
└── global.css.backup        # Backup of compiled CSS file
```

## Build Process

### Before
```bash
npm run build:css  # Compile LESS to CSS
npm run dev        # Build CSS then start server
```

### After
```bash
npm run dev        # Start server directly (no compilation needed)
```

## Benefits

1. **Simplified Build**: No LESS compilation required
2. **Better Performance**: Single CSS file reduces HTTP requests
3. **Easier Maintenance**: One file to manage instead of multiple
4. **Faster Development**: No build step for CSS changes
5. **Reduced Dependencies**: Removed LESS compiler

## Migration Notes

- All CSS custom properties (CSS variables) are preserved
- Component-based class structure maintained
- Responsive breakpoints unchanged
- Color scheme and design tokens intact
- All utility classes available

## Verification

To verify the consolidation worked correctly:

1. Start the development server: `npm run dev`
2. Check all three calculators (SEPP, 401k, Indian)
3. Test dark/light theme toggle
4. Verify responsive design on mobile
5. Check print styles
6. Test all interactive elements

## Rollback Plan

If issues are found, you can rollback by:

1. Restore backup files:
   ```bash
   cp src/styles/global.less.backup src/styles/global.less
   cp src/styles/global.css.backup src/styles/global.css
   ```

2. Update index.html to use `global.css`

3. Reinstall LESS: `npm install --save-dev less`

4. Restore old package.json scripts

## Docker Deployment

The Docker configuration has been updated to use the consolidated CSS file. No additional changes needed for deployment.