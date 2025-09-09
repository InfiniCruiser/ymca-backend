const { AppDataSource } = require('./dist/backend/src/database/data-source.js');

async function testFileUploads() {
  try {
    await AppDataSource.initialize();
    console.log('✅ Database connected');
    
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
    console.error('❌ Error testing file uploads:', error);
  } finally {
    await AppDataSource.destroy();
  }
}

testFileUploads();
