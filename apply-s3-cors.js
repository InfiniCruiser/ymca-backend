const AWS = require('aws-sdk');

// Configure AWS SDK
const s3 = new AWS.S3({
  accessKeyId: process.env.S3_ACCESS_KEY,
  secretAccessKey: process.env.S3_SECRET_KEY,
  region: process.env.S3_REGION || 'us-east-1'
});

async function applyCorsConfiguration() {
  const corsParams = {
    Bucket: 'oeabucket',
    CORSConfiguration: {
      CORSRules: [
        {
          AllowedHeaders: ['*'],
          AllowedMethods: ['GET', 'PUT', 'POST', 'DELETE', 'HEAD'],
          AllowedOrigins: [
            'http://localhost:3000',
            'http://localhost:3001',
            'https://yusa.dw.capital',
            'https://ymca-self-reporting-frontend.herokuapp.com',
            'https://ymca-frontend-only.herokuapp.com',
            'https://*.herokuapp.com'
          ],
          ExposeHeaders: ['ETag', 'x-amz-request-id'],
          MaxAgeSeconds: 3000
        }
      ]
    }
  };

  try {
    console.log('🔧 Applying CORS configuration to S3 bucket...');
    await s3.putBucketCors(corsParams).promise();
    console.log('✅ CORS configuration applied successfully!');
    
    // Verify the configuration
    const result = await s3.getBucketCors({ Bucket: 'oeabucket' }).promise();
    console.log('📋 Current CORS configuration:');
    console.log(JSON.stringify(result.CORSRules, null, 2));
    
  } catch (error) {
    console.error('❌ Failed to apply CORS configuration:', error);
    
    if (error.code === 'NoSuchBucket') {
      console.error('💡 The bucket "oeabucket" does not exist. Please check the bucket name.');
    } else if (error.code === 'AccessDenied') {
      console.error('💡 Access denied. Please check your AWS credentials and permissions.');
    }
  }
}

applyCorsConfiguration();
