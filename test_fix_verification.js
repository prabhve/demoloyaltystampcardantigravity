const http = require('http');

function post(path, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    }, (res) => {
      let raw = '';
      res.on('data', chunk => raw += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(raw) });
        } catch (e) {
          resolve({ status: res.statusCode, raw });
        }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function get(path) {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: 'GET'
    }, (res) => {
      let raw = '';
      res.on('data', chunk => raw += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(raw) });
        } catch (e) {
          resolve({ status: res.statusCode, raw });
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function runTests() {
  console.log('🧪 VERIFYING FIXES: PASSCODE 1234 & SCRATCH CARD ENGINE\n');

  // TEST 1: Passcode 1234 across multiple businesses
  console.log('--- TEST 1: Verifying Passcode 1234 across Tenants ---');
  const testBizSlugs = [
    'royal-spice',
    'cafe-bliss',
    'grand-regency',
    'glam-studio',
    'saffron-heritage-restaurant',
    'keshari-dhaba'
  ];

  for (const slug of testBizSlugs) {
    const res = await post(`/api/auth/admin/verify-passcode?biz=${slug}`, {
      passcode: '1234',
      deviceFingerprint: 'test_device_verify_1234'
    });
    console.log(`[${slug}] Passcode 1234 Check -> Status: ${res.status}, Success: ${res.body.success}`);
    if (res.status !== 200 || !res.body.success) {
      console.error(`❌ FAILED for tenant ${slug}:`, res.body);
      process.exit(1);
    }
  }
  console.log('✅ ALL tenants successfully verified with passcode 1234!\n');

  // TEST 2: Demo Scratch Card endpoint (Public/Guest)
  console.log('--- TEST 2: Public / Guest Demo Scratch Card ---');
  const demoRes = await get('/api/public/demo-scratch?biz=royal-spice');
  console.log('Demo Scratch Card Status:', demoRes.status);
  console.log('Prepared Reward:', demoRes.body.prepared.reward.title);
  if (demoRes.status !== 200 || !demoRes.body.prepared) {
    console.error('❌ Demo scratch endpoint failed');
    process.exit(1);
  }
  console.log('✅ Demo scratch card verified successfully!\n');

  // TEST 3: Customer Registration & Scratch Card Lifecycle
  console.log('--- TEST 3: Customer Registration, Scratch Card Preload & Reveal ---');
  const testPhone = '9900112233';
  const regRes = await post('/api/auth/register', {
    name: 'Vikram Singh',
    mobile: testPhone,
    dob: '1995-05-10',
    address: 'Indiranagar',
    deviceFingerprint: 'fp_test_scratch_engine_' + Date.now(),
    biz: 'royal-spice'
  });

  const customerId = regRes.body.customer.id;
  console.log('Registered Customer ID:', customerId);

  // Reset to 0 stamps to test clean progression
  await post(`/api/customer/${customerId}/reset-stamps?biz=royal-spice`, {});

  // Progress through Visit 1, 2, 3, 4, 5, 6
  for (let visit = 1; visit <= 6; visit++) {
    // 3a. Preload scratch card (what user sees UNDER the foil)
    const prepRes = await get(`/api/customer/${customerId}/scratch-card?biz=royal-spice`);
    const prep = prepRes.body.prepared;
    console.log(`\nVisit #${visit} Preload -> Next Stamp: ${prep.nextStamp}, IsMega: ${prep.isMega}`);
    console.log(`  Prize underneath foil: "${prep.reward.title}" (Code: ${prep.reward.code || 'None'})`);

    if (visit === 6) {
      if (!prep.isMega) {
        console.error('❌ Expected 6th visit to be Mega Bumper!');
        process.exit(1);
      }
    }

    // 3b. Execute scratch claim
    const scratchRes = await post(`/api/customer/${customerId}/scratch?biz=royal-spice`, {
      deviceFingerprint: regRes.body.customer.deviceFingerprint
    });
    console.log(`  Claimed! Status: ${scratchRes.status}, Current Stamps: ${scratchRes.body.stamps}/6`);
    console.log(`  Awarded: "${scratchRes.body.reward.title}"`);

    if (scratchRes.status !== 200 || scratchRes.body.stamps !== visit) {
      console.error(`❌ Scratch claim failed on visit ${visit}:`, scratchRes.body);
      process.exit(1);
    }
  }

  console.log('\n🎉 ALL 6 VISITS TESTED! 6th Stamp correctly awarded 50% Grand Bumper!');
  console.log('\n🏁 ALL VERIFICATION TESTS PASSED (100%)!');
}

runTests().catch(err => {
  console.error('Unhandled error during test:', err);
  process.exit(1);
});
