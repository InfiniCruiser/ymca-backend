const fs = require('fs');
const csv = require('csv-parser');

console.log('Testing CSV parsing...');

const results = [];
fs.createReadStream('../docs/Final Pilot Ys - Y Profile.csv')
  .pipe(csv())
  .on('data', (row) => {
    if (results.length < 3) {
      const values = Object.values(row);
      console.log(`\nRow ${results.length + 1}:`);
      console.log('Association Number:', values[0]);
      console.log('Association Name:', values[1]);
      console.log('Charter Date (index 16):', values[16]);
      console.log('Association Branch Count (index 17):', values[17]);
      console.log('All values:', values);
    }
    results.push(row);
  })
  .on('end', () => {
    console.log(`\nTotal rows: ${results.length}`);
  });
