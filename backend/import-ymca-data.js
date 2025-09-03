const fs = require('fs');
const csv = require('csv-parser');
const { Client } = require('pg');

// Database connection configuration
const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function importYMCAData() {
  try {
    // Connect to database
    await client.connect();
    console.log('✅ Connected to database');

    // Read and parse CSV file
    const results = [];
    fs.createReadStream('../../oea-self-reporting-prj/docs/Final Pilot Ys - Y Profile.csv')
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        console.log(`📊 Found ${results.length} YMCA records to import`);
        
        // Import each YMCA
        for (const ymca of results) {
          try {
            // Clean and prepare data
            const name = ymca['Association Name']?.trim();
            const address = ymca['Physical Address']?.trim();
            const city = ymca['Physical City']?.trim();
            const state = ymca['Physical State']?.trim();
            const zipCode = ymca['Physical ZIP Code']?.trim();
            const phone = ymca['Phone Number']?.trim();
            const email = ymca['Email']?.trim();
            const website = ymca['Website']?.trim();
            const latitude = parseFloat(ymca['Latitude']);
            const longitude = parseFloat(ymca['Longitude']);
            
            // Skip if no name
            if (!name) {
              console.log(`⚠️  Skipping record with no name: ${JSON.stringify(ymca)}`);
              continue;
            }

            // Insert organization
            const insertQuery = `
              INSERT INTO organizations (
                name, address, city, state, "zipCode", phone, email, website, 
                coordinates, type, "createdAt", "updatedAt"
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
              ON CONFLICT (name) DO UPDATE SET
                address = EXCLUDED.address,
                phone = EXCLUDED.phone,
                email = EXCLUDED.email,
                website = EXCLUDED.website,
                coordinates = EXCLUDED.coordinates,
                "updatedAt" = NOW()
              RETURNING id, name;
            `;

            const coordinates = (latitude && longitude) ? 
              JSON.stringify({ lat: latitude, lng: longitude }) : null;

            const values = [
              name,
              address || null,
              city || null,
              state || null,
              zipCode || null,
              phone || null,
              email || null,
              website || null,
              coordinates,
              'YMCA',
            ];

            const result = await client.query(insertQuery, values);
            console.log(`✅ Imported: ${result.rows[0].name} (ID: ${result.rows[0].id})`);

          } catch (error) {
            console.error(`❌ Error importing ${ymca['Association Name']}:`, error.message);
          }
        }

        // Count total organizations
        const countResult = await client.query('SELECT COUNT(*) FROM organizations');
        console.log(`\n🎉 Import complete! Total organizations: ${countResult.rows[0].count}`);

        await client.end();
        console.log('✅ Database connection closed');
      });

  } catch (error) {
    console.error('❌ Database connection error:', error);
    process.exit(1);
  }
}

// Run the import
importYMCAData();
