const { Client } = require('pg');

// Database connection configuration
const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Frontend Survey Structure (25 questions) - EXACTLY matching your frontend
const frameworkData = {
  name: "Operational Performance Continuums",
  version: "1.0",
  description: "Self-reporting framework for YMCA Operational Performance Continuums covering Risk Mitigation, Governance, and Engagement."
};

const areas = [
  { name: "Child Protection", weight: 1.0, orderIndex: 1 },
  { name: "Aquatic Safety", weight: 1.0, orderIndex: 2 },
  { name: "IP/Trademark", weight: 1.0, orderIndex: 3 },
  { name: "Risk Management Framework", weight: 1.0, orderIndex: 4 },
  { name: "Strategic Planning", weight: 1.0, orderIndex: 5 },
  { name: "Board Responsibilities", weight: 1.0, orderIndex: 6 },
  { name: "Board Effectiveness", weight: 1.0, orderIndex: 7 },
  { name: "Functional Roles", weight: 1.0, orderIndex: 8 },
  { name: "Member Engagement", weight: 1.0, orderIndex: 9 },
  { name: "Staff Engagement", weight: 1.0, orderIndex: 10 },
  { name: "Volunteer Engagement", weight: 1.0, orderIndex: 11 },
  { name: "Community Engagement", weight: 1.0, orderIndex: 12 }
];

const sections = [
  { name: "Risk Mitigation", weight: 1.0, orderIndex: 1 },
  { name: "Governance", weight: 1.0, orderIndex: 2 },
  { name: "Engagement", weight: 1.0, orderIndex: 3 }
];

const questions = [
  {
    id: "RM.CP.001",
    section: "Risk Mitigation",
    area: "Child Protection",
    pathway: "Implements all components of the Child Protection Membership Qualification",
    type: "binary",
    options: ["Yes", "No"],
    required: true,
    weight: 0.5,
    orderIndex: 1
  },
  {
    id: "RM.CP.002",
    section: "Risk Mitigation",
    area: "Child Protection", 
    pathway: "Shares results of self-assessment and action plan with the Board as applicable (2 years if unaccredited, 3 years if accredited)",
    type: "binary",
    options: ["Yes", "No"],
    required: true,
    weight: 0.5,
    orderIndex: 2
  },
  {
    id: "RM.CP.003",
    section: "Risk Mitigation",
    area: "Child Protection",
    pathway: "Y has a staff member with Certified Praesidium Guardian certification",
    type: "binary",
    options: ["Yes", "No"],
    required: true,
    weight: 0.5,
    orderIndex: 3
  },
  {
    id: "RM.CP.004",
    section: "Risk Mitigation",
    area: "Child Protection",
    pathway: "Y achieves Praesidium accreditation",
    type: "binary",
    options: ["Yes", "No"],
    required: true,
    weight: 0.5,
    orderIndex: 4
  },
  {
    id: "RM.AQ.001",
    section: "Risk Mitigation",
    area: "Aquatic Safety",
    pathway: "Meets all components of the Aquatic Safety Membership Qualification",
    type: "binary",
    options: ["Yes", "No"],
    required: true,
    weight: 0.5,
    orderIndex: 5
  },
  {
    id: "RM.AQ.002",
    section: "Risk Mitigation",
    area: "Aquatic Safety",
    pathway: "Conducts a self-assessment of all aquatic facilities every two years",
    type: "binary",
    options: ["Yes", "No"],
    required: true,
    weight: 0.5,
    orderIndex: 6
  },
  {
    id: "RM.AQ.003",
    section: "Risk Mitigation",
    area: "Aquatic Safety",
    pathway: "Engages third-party experts to evaluate execution of aquatic safety practices",
    type: "binary",
    options: ["Yes", "No"],
    required: true,
    weight: 0.5,
    orderIndex: 7
  },
  {
    id: "RM.IP.001",
    section: "Risk Mitigation",
    area: "IP/Trademark",
    pathway: "Maintains compliance with Y-USA IP/trademark requirements",
    type: "binary",
    options: ["Yes", "No"],
    required: true,
    weight: 0.5,
    orderIndex: 8
  },
  {
    id: "RM.RM.001",
    section: "Risk Mitigation",
    area: "Risk Management Framework",
    pathway: "Has a comprehensive risk management program in place",
    type: "binary",
    options: ["Yes", "No"],
    required: true,
    weight: 0.5,
    orderIndex: 9
  },
  {
    id: "GOV.SP.001",
    section: "Governance",
    area: "Strategic Planning",
    pathway: "Has a current strategic plan in place",
    type: "binary",
    options: ["Yes", "No"],
    required: true,
    weight: 0.5,
    orderIndex: 10
  },
  {
    id: "GOV.SP.002",
    section: "Governance",
    area: "Strategic Planning",
    pathway: "Reviews and updates strategic plan annually",
    type: "binary",
    options: ["Yes", "No"],
    required: true,
    weight: 0.5,
    orderIndex: 11
  },
  {
    id: "GOV.BR.001",
    section: "Governance",
    area: "Board Responsibilities",
    pathway: "Has a properly structured board with defined roles",
    type: "binary",
    options: ["Yes", "No"],
    required: true,
    weight: 0.5,
    orderIndex: 12
  },
  {
    id: "GOV.BR.002",
    section: "Governance",
    area: "Board Responsibilities",
    pathway: "Conducts regular board meetings with proper documentation",
    type: "binary",
    options: ["Yes", "No"],
    required: true,
    weight: 0.5,
    orderIndex: 13
  },
  {
    id: "GOV.BE.001",
    section: "Governance",
    area: "Board Effectiveness",
    pathway: "Provides regular training and development for board members",
    type: "binary",
    options: ["Yes", "No"],
    required: true,
    weight: 0.5,
    orderIndex: 14
  },
  {
    id: "GOV.BE.002",
    section: "Governance",
    area: "Board Effectiveness",
    pathway: "Conducts regular board performance evaluations",
    type: "binary",
    options: ["Yes", "No"],
    required: true,
    weight: 0.5,
    orderIndex: 15
  },
  {
    id: "GOV.FR.001",
    section: "Governance",
    area: "Functional Roles",
    pathway: "Has a qualified CEO with clear role definition",
    type: "binary",
    options: ["Yes", "No"],
    required: true,
    weight: 0.5,
    orderIndex: 16
  },
  {
    id: "GOV.FR.002",
    section: "Governance",
    area: "Functional Roles",
    pathway: "Has clearly defined roles and responsibilities for key staff",
    type: "binary",
    options: ["Yes", "No"],
    required: true,
    weight: 0.5,
    orderIndex: 17
  },
  {
    id: "ENG.ME.001",
    section: "Engagement",
    area: "Member Engagement",
    pathway: "Offers diverse programs that engage members",
    type: "binary",
    options: ["Yes", "No"],
    required: true,
    weight: 0.5,
    orderIndex: 18
  },
  {
    id: "ENG.ME.002",
    section: "Engagement",
    area: "Member Engagement",
    pathway: "Collects and acts on member feedback",
    type: "binary",
    options: ["Yes", "No"],
    required: true,
    weight: 0.5,
    orderIndex: 19
  },
  {
    id: "ENG.SE.001",
    section: "Engagement",
    area: "Staff Engagement",
    pathway: "Provides professional development opportunities for staff",
    type: "binary",
    options: ["Yes", "No"],
    required: true,
    weight: 0.5,
    orderIndex: 20
  },
  {
    id: "ENG.SE.002",
    section: "Engagement",
    area: "Staff Engagement",
    pathway: "Has programs to recognize and reward staff",
    type: "binary",
    options: ["Yes", "No"],
    required: true,
    weight: 0.5,
    orderIndex: 21
  },
  {
    id: "ENG.VE.001",
    section: "Engagement",
    area: "Volunteer Engagement",
    pathway: "Has an active volunteer program",
    type: "binary",
    options: ["Yes", "No"],
    required: true,
    weight: 0.5,
    orderIndex: 22
  },
  {
    id: "ENG.VE.002",
    section: "Engagement",
    area: "Volunteer Engagement",
    pathway: "Provides training and support for volunteers",
    type: "binary",
    options: ["Yes", "No"],
    required: true,
    weight: 0.5,
    orderIndex: 23
  },
  {
    id: "ENG.CE.001",
    section: "Engagement",
    area: "Community Engagement",
    pathway: "Has active partnerships with community organizations",
    type: "binary",
    options: ["Yes", "No"],
    required: true,
    weight: 0.5,
    orderIndex: 24
  },
  {
    id: "ENG.CE.002",
    section: "Engagement",
    area: "Community Engagement",
    pathway: "Demonstrates positive impact on the community",
    type: "binary",
    options: ["Yes", "No"],
    required: true,
    weight: 0.5,
    orderIndex: 25
  }
];

async function completeImport() {
  try {
    // Connect to database
    await client.connect();
    console.log('✅ Connected to database');

    console.log('🚀 Starting Complete Import Process...');

    // Step 1: Import Framework
    console.log('\n📋 Step 1: Importing Framework Structure...');
    
    // Insert framework
    const frameworkResult = await client.query(
      'INSERT INTO frameworks (name, version, description, "isActive", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, NOW(), NOW()) RETURNING id',
      [frameworkData.name, frameworkData.version, frameworkData.description, true]
    );
    const frameworkId = frameworkResult.rows[0].id;
    console.log(`✅ Framework created: ${frameworkData.name} (ID: ${frameworkId})`);

    // Insert areas
    for (const area of areas) {
      const areaResult = await client.query(
        'INSERT INTO areas ("frameworkId", name, description, weight, "orderIndex", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) RETURNING id',
        [frameworkId, area.name, area.description || null, area.weight, area.orderIndex]
      );
      console.log(`✅ Area created: ${area.name} (ID: ${areaResult.rows[0].id})`);
    }

    // Insert sections
    for (const section of sections) {
      const sectionResult = await client.query(
        'INSERT INTO sections ("frameworkId", name, description, weight, "orderIndex", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) RETURNING id',
        [frameworkId, section.name, section.description || null, section.weight, section.orderIndex]
      );
      console.log(`✅ Section created: ${section.name} (ID: ${sectionResult.rows[0].id})`);
    }

    // Insert questions (25 core questions)
    for (const question of questions) {
      const questionResult = await client.query(
        'INSERT INTO questions ("sectionId", text, type, options, weight, "orderIndex", "isRequired", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW()) RETURNING id',
        [1, question.pathway, question.type, JSON.stringify(question.options), question.weight, question.orderIndex, question.required]
      );
      console.log(`✅ Question created: ${question.id} (ID: ${questionResult.rows[0].id})`);
    }

    console.log('\n🎉 Framework import complete!');
    console.log(`📝 Imported ${questions.length} questions covering core areas`);

    // Count totals
    const frameworkCount = await client.query('SELECT COUNT(*) FROM frameworks');
    const areaCount = await client.query('SELECT COUNT(*) FROM areas');
    const sectionCount = await client.query('SELECT COUNT(*) FROM sections');
    const questionCount = await client.query('SELECT COUNT(*) FROM questions');

    console.log('\n📊 Database Summary:');
    console.log(`   Frameworks: ${frameworkCount.rows[0].count}`);
    console.log(`   Areas: ${areaCount.rows[0].count}`);
    console.log(`   Sections: ${sectionCount.rows[0].count}`);
    console.log(`   Questions: ${questionCount.rows[0].count}`);

    await client.end();
    console.log('\n✅ Database connection closed');

  } catch (error) {
    console.error('❌ Import error:', error);
    process.exit(1);
  }
}

// Run the import
completeImport();
