#!/bin/bash

# Cleanup script for style consolidation
# This script removes the old LESS/CSS files after consolidation

echo "🧹 Cleaning up old styling files..."

# Backup old files before removal (optional)
if [ -f "src/styles/global.less" ]; then
    echo "📦 Backing up global.less to global.less.backup"
    cp "src/styles/global.less" "src/styles/global.less.backup"
fi

if [ -f "src/styles/global.css" ]; then
    echo "📦 Backing up global.css to global.css.backup"
    cp "src/styles/global.css" "src/styles/global.css.backup"
fi

# Remove old files
echo "🗑️  Removing old LESS and compiled CSS files..."
rm -f "src/styles/global.less"
rm -f "src/styles/global.css"

# Remove LESS from package.json if it exists
if command -v npm &> /dev/null; then
    echo "📦 Removing LESS dependency..."
    npm uninstall less
fi

echo "✅ Cleanup complete!"
echo "📄 All styles are now consolidated in src/styles/consolidated.css"
echo "🚀 You can now run 'npm run dev' to start the development server"