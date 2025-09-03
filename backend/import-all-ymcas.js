const { Client } = require('pg');

// Database connection configuration
const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Sample YMCAs (first 5 as example)
const ymcaData = [
  {
    name: "Putnam County Family YMCA",
    address: "235 Raider Drive",
    city: "Cookeville",
    state: "Tennessee",
    zipcode: "38501",
    phone: "931-528-1133",
    email: "info@pcfymca.org",
    website: "http://www.pcfymca.org",
    latitude: 36.16,
    longitude: -85.4799
  },
  {
    name: "YMCA of Greater Birmingham",
    address: "2400 7th Avenue South",
    city: "Birmingham",
    state: "Alabama",
    zipcode: "35233",
    phone: "205-322-9622",
    email: "info@ymcabham.org",
    website: "https://www.ymcabham.org",
    latitude: 33.5207,
    longitude: -86.8025
  },
  {
    name: "YMCA of Central Alabama",
    address: "400 20th Street North",
    city: "Birmingham",
    state: "Alabama",
    zipcode: "35203",
    phone: "205-322-9622",
    email: "info@ymcacentralalabama.org",
    website: "https://www.ymcacentralalabama.org",
    latitude: 33.5207,
    longitude: -86.8025
  },
  {
    name: "YMCA of Greater Montgomery",
    address: "880 S Lawrence Street",
    city: "Montgomery",
    state: "Alabama",
    zipcode: "36104",
    phone: "334-241-9622",
    email: "info@ymcamontgomery.org",
    website: "https://www.ymcamontgomery.org",
    latitude: 32.3792,
    longitude: -86.3077
  },
  {
    name: "YMCA of Mobile",
    address: "401 Dauphin Street",
    city: "Mobile",
    state: "Alabama",
    zipcode: "36602",
    phone: "251-473-9622",
    email: "info@ymcamobile.org",
    website: "https://www.ymcamobile.org",
    latitude: 30.6954,
    longitude: -88.0399
  }
];

async function importAllYMCAs() {
  try {
    await client.connect();
    console.log('✅ Connected to database');
    console.log('🚀 Starting YMCA Import Process...');
    console.log(`📊 Found ${ymcaData.length} YMCA records to import`);

    for (const ymca of ymcaData) {
      try {
        const insertQuery = `
          INSERT INTO organizations (
            name, address, city, state, zipcode, phone, email, website,
            coordinates, type, "createdAt", "updatedAt"
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
          RETURNING id, name;
        `;
        
        const coordinates = (ymca.latitude && ymca.longitude) ?
          JSON.stringify({ lat: ymca.latitude, lng: ymca.longitude }) : null;
        
        const values = [
          ymca.name, ymca.address || null, ymca.city || null, ymca.state || null,
          ymca.zipcode || null, ymca.phone || null, ymca.email || null,
          ymca.website || null, coordinates, 'YMCA'
        ];
        
        const result = await client.query(insertQuery, values);
        console.log(`✅ Imported: ${result.rows[0].name} (ID: ${result.rows[0].id})`);
      } catch (error) {
        console.error(`❌ Error importing ${ymca.name}:`, error.message);
      }
    }

    const countResult = await client.query('SELECT COUNT(*) FROM organizations');
    console.log(`\n🎉 Import complete! Total organizations: ${countResult.rows[0].count}`);

    await client.end();
    console.log('✅ Database connection closed');

  } catch (error) {
    console.error('❌ Database connection error:', error);
    process.exit(1);
  }
}

importAllYMCAs();
