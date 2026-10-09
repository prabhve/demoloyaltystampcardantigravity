const fs = require('fs');
const path = require('path');
const security = require('./security.js');

const dbPath = path.join(__dirname, 'db', 'data.json');
const raw = fs.readFileSync(dbPath, 'utf8');
const data = JSON.parse(raw);

const { hash, salt } = security.hashPasscode('1234');

data.businesses.forEach(b => {
  b.adminPin = '1234';
  b.passcodeHash = hash;
  b.passcodeSalt = salt;
  console.log(`Updated ${b.slug} (${b.name}) -> passcode: 1234`);
});

fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
console.log('ALL businesses in database successfully set to passcode 1234!');
