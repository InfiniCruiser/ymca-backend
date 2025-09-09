// Set environment variables for testing
process.env.DB_HOST = 'localhost';
process.env.DB_PORT = '5432';
process.env.DB_USERNAME = 'postgres';
process.env.DB_PASSWORD = 'password';
process.env.DB_DATABASE = 'ymca_portal';

process.env.S3_ENDPOINT = 'http://localhost:9000';
process.env.S3_ACCESS_KEY = 'minioadmin';
process.env.S3_SECRET_KEY = 'minioadmin';
process.env.S3_BUCKET = 'ymca-evidence';
process.env.S3_REGION = 'us-east-1';
process.env.S3_FORCE_PATH_STYLE = 'true';

process.env.MAX_FILE_SIZE = '10485760';
process.env.ALLOWED_FILE_TYPES = 'application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/jpeg,image/png,image/gif';

const { AppDataSource } = require('./dist/backend/src/database/data-source.js');

async function testFileUploads() {
  try {
    console.log('🔗 Connecting to database...');
    console.log('DB_HOST:', process.env.DB_HOST);
    console.log('DB_PORT:', process.env.DB_PORT);
    console.log('DB_USERNAME:', process.env.DB_USERNAME);
    console.log('DB_DATABASE:', process.env.DB_DATABASE);
    
    await AppDataSource.initialize();
    console.log('✅ Database connected successfully');
    
    // Test if FileUpload entity is properly registered
    const fileUploadRepository = AppDataSource.getRepository('FileUpload');
    console.log('✅ FileUpload repository created');
    
    // Test basic query
    const count = await fileUploadRepository.count();
    console.log(`✅ FileUpload table accessible, count: ${count}`);
    
    // Test if we can create a test record
    const testUpload = fileUploadRepository.create({
      organizationId: '00000000-0000-0000-0000-000000000001',
      userId: '00000000-0000-0000-0000-000000000001',
      periodId: '2024-Q1',
      categoryId: 'test-category',
      uploadType: 'main',
      uploadId: '00000000-0000-0000-0000-000000000001',
      files: [
        {
          originalName: 'test.pdf',
          s3Key: 'test/test.pdf',
          size: 1024,
          type: 'application/pdf',
          uploadedAt: new Date().toISOString(),
        }
      ],
      status: 'completed',
      uploadedAt: new Date(),
    });
    
    const savedUpload = await fileUploadRepository.save(testUpload);
    console.log(`✅ Test file upload created with ID: ${savedUpload.id}`);
    
    // Clean up test record
    await fileUploadRepository.remove(savedUpload);
    console.log('✅ Test file upload cleaned up');
    
    console.log('🎉 File uploads system is working correctly!');
    
  } catch (error) {
    console.error('❌ Error testing file uploads:', error.message);
    console.error('Full error:', error);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('🔌 Database connection closed');
    }
  }
}

testFileUploads();
