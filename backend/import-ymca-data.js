const { Client } = require('pg');

// Database connection configuration
const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// YMCA data directly in the script
const ymcaData = [
  {
    name: "Putnam County Family YMCA",
    address: "235 Raider Drive",
    city: "Cookeville",
    state: "Tennessee",
    zipCode: "38501",
    phone: "931-528-1133",
    email: "info@pcfymca.org",
    website: "http://www.pcfymca.org",
    latitude: 36.16,
    longitude: -85.4799
  },
  {
    name: "Dickson County Family YMCA",
    address: "225 Henlsee Drive",
    city: "Dickson",
    state: "Tennessee",
    zipCode: "37055",
    phone: "615-326-7070",
    email: "paul@dcfy.org",
    website: "https://www.dicksoncountyfamilyymca.org/",
    latitude: 36.0785,
    longitude: -87.3748
  },
  {
    name: "YMCA of Greater Birmingham",
    address: "2401 20th Place South",
    city: "Birmingham",
    state: "Alabama",
    zipCode: "35223",
    phone: "205-801-9622",
    email: "corporate@ymcabham.org",
    website: "https://www.ymcabham.org/",
    latitude: 33.5177,
    longitude: -86.8055
  },
  {
    name: "Enterprise YMCA",
    address: "904 E Lee St",
    city: "Enterprise",
    state: "Alabama",
    zipCode: "36331",
    phone: "334-347-4513",
    email: "enymca@centurylink.net",
    website: "https://www.enymca.org/",
    latitude: 31.4121,
    longitude: -85.8664
  },
  {
    name: "YMCA of Metropolitan Huntsville AL",
    address: "130 Park Square Lane",
    city: "Madison",
    state: "Alabama",
    zipCode: "35758",
    phone: "256-428-9622",
    email: "jerry.courtney@ymcahuntsville.org",
    website: "https://www.ymcahuntsville.org/",
    latitude: 34.7323,
    longitude: -86.5864
  }
];

async function importYMCAData() {
  try {
    // Connect to database
    await client.connect();
    console.log('✅ Connected to database');

    console.log(`📊 Found ${ymcaData.length} YMCA records to import`);
    
    // Import each YMCA
    for (const ymca of ymcaData) {
      try {
        // Insert organization
        const insertQuery = `
          INSERT INTO organizations (
            name, address, city, state, "zipCode", phone, email, website, 
            coordinates, type, "createdAt", "updatedAt"
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
          ON CONFLICT (name) DO UPDATE SET
            address = EXCLUDED.address,
            city = EXCLUDED.city,
            state = EXCLUDED.state,
            "zipCode" = EXCLUDED."zipCode",
            phone = EXCLUDED.phone,
            email = EXCLUDED.email,
            website = EXCLUDED.website,
            coordinates = EXCLUDED.coordinates,
            "updatedAt" = NOW()
          RETURNING id, name;
        `;

        const coordinates = (ymca.latitude && ymca.longitude) ? 
          JSON.stringify({ lat: ymca.latitude, lng: ymca.longitude }) : null;

        const values = [
          ymca.name,
          ymca.address || null,
          ymca.city || null,
          ymca.state || null,
          ymca.zipCode || null,
          ymca.phone || null,
          ymca.email || null,
          ymca.website || null,
          coordinates,
          'YMCA',
        ];

        const result = await client.query(insertQuery, values);
        console.log(`✅ Imported: ${result.rows[0].name} (ID: ${result.rows[0].id})`);

      } catch (error) {
        console.error(`❌ Error importing ${ymca.name}:`, error.message);
      }
    }

    // Count total organizations
    const countResult = await client.query('SELECT COUNT(*) FROM organizations');
    console.log(`\n🎉 Import complete! Total organizations: ${countResult.rows[0].count}`);

    await client.end();
    console.log('✅ Database connection closed');

  } catch (error) {
    console.error('❌ Database connection error:', error);
    process.exit(1);
  }
}

// Run the import
importYMCAData();
