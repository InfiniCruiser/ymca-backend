#!/bin/bash

echo "🚀 Deploying YMCA Backend Database Fix to Heroku"
echo "=================================================="

# Check if Heroku CLI is installed
if ! command -v heroku &> /dev/null; then
    echo "❌ Heroku CLI is not installed. Please install it first:"
    echo "   https://devcenter.heroku.com/articles/heroku-cli"
    exit 1
fi

# Check if user is logged in to Heroku
if ! heroku auth:whoami &> /dev/null; then
    echo "❌ Not logged in to Heroku. Please run: heroku login"
    exit 1
fi

# Get app name from user
echo "Enter your Heroku app name (or press Enter to use 'ymca-backend'):"
read -r app_name
app_name=${app_name:-ymca-backend}

echo "📱 Using Heroku app: $app_name"

# Build the project
echo "🔨 Building project..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please fix the build errors first."
    exit 1
fi

echo "✅ Build successful!"

# Deploy to Heroku
echo "🚀 Deploying to Heroku..."
git add .
git commit -m "Fix: Add missing performance_calculations table and health check endpoint"
git push heroku main

if [ $? -ne 0 ]; then
    echo "❌ Deployment failed. Please check your git remote and try again."
    exit 1
fi

echo "✅ Deployment successful!"

# Run the database fix
echo "🔧 Running database fix script..."
heroku run "cd backend && npm run db:fix-performance" --app "$app_name"

if [ $? -ne 0 ]; then
    echo "⚠️ Database fix script failed. You may need to run it manually:"
    echo "   heroku run 'cd backend && npm run db:fix-performance' --app $app_name"
else
    echo "✅ Database fix completed!"
fi

# Verify the fix
echo "🔍 Verifying the fix..."
heroku run "cd backend && npm run db:check-schema" --app "$app_name"

echo ""
echo "🎉 Deployment and database fix completed!"
echo ""
echo "📋 Next steps:"
echo "   1. Test your frontend - the error should be resolved"
echo "   2. Check Heroku logs: heroku logs --tail --app $app_name"
echo "   3. Monitor the health endpoint: https://$app_name.herokuapp.com/health"
echo ""
echo "🔧 If you still have issues, run:"
echo "   heroku run 'cd backend && npm run db:fix-performance' --app $app_name"
