#!/bin/bash

echo "🚀 Starting YMCA Association Data Import Process..."

# Navigate to backend directory
cd "$(dirname "$0")/.."

# Install dependencies if needed
echo "📦 Installing dependencies..."
npm install

# Run the migration to add YMCA fields
echo "🔄 Running database migration..."
npm run migration:run

# Build the project
echo "🔨 Building the project..."
npm run build

# Create a temporary script to run the import
echo "📥 Creating import script..."
cat > temp-import.js << 'EOF'
const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('./dist/backend/src/app.module.js');
const { YMCAImportService } = require('./dist/backend/src/organizations/services/ymca-import.service.js');

async function importData() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const importService = app.get(YMCAImportService);
  
  try {
    console.log('🌱 Starting YMCA data import...');
    const result = await importService.importYMCAData();
    console.log('✅ Import completed successfully!');
    console.log(`📊 Results: ${result.imported} imported, ${result.updated} updated, ${result.errors} errors`);
  } catch (error) {
    console.error('❌ Import failed:', error.message);
    process.exit(1);
  } finally {
    await app.close();
  }
}

importData();
EOF

# Run the import
echo "📥 Importing YMCA association data..."
node temp-import.js

# Clean up
rm temp-import.js

echo "✅ YMCA Association Data Import Process Completed!"
