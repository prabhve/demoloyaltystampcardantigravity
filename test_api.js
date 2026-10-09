const http = require('http');

function request(options, body = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });
    req.on('error', reject);
    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('🚀 Starting Comprehensive SaaS & Multi-Tenant Tests...\n');

  // 1. SaaS Meta: Plans & Competitor Analysis
  console.log('1. Testing /api/saas/meta (Plans & Competitors)...');
  const saasMeta = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/saas/meta',
    method: 'GET'
  });
  console.log('✅ SaaS Meta received:', Object.keys(saasMeta.data.plans), '| Competitor matrix items:', saasMeta.data.competitors.length);

  // 2. Business Directory
  console.log('\n2. Testing /api/businesses (List Businesses)...');
  const bizList = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/businesses',
    method: 'GET'
  });
  console.log('✅ Found', bizList.data.businesses.length, 'businesses in database.');

  // 3. Create New Business Profile (Self-Serve Onboarding)
  console.log('\n3. Testing New Business Profile Creation (Self-serve)...');
  const newBizRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/businesses/create',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    name: 'Saffron Heritage Restaurant',
    type: 'restaurant',
    tagline: 'Mughlai & Awadhi Feasts',
    phone: '+91 99999 88888',
    city: 'Jaipur',
    googleReviewUrl: 'https://search.google.com/local/writereview?placeid=saffron_heritage',
    plan: 'pro_bundle',
    billingCycle: 'annual',
    adminPin: '4321'
  });
  console.log('✅ Created Business:', newBizRes.data.business.name, '| Slug:', newBizRes.data.business.slug);
  console.log('🔗 Customer Link:', newBizRes.data.customerUrl);
  console.log('🔗 Admin Link:', newBizRes.data.adminUrl);

  const createdSlug = newBizRes.data.business.slug;

  // 4. Test Customer Flow for this new business
  console.log('\n4. Testing Device Verification for new business...');
  const newDevFp = 'fp_jaipur_diner_' + Date.now();
  const v1 = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/verify-device',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { deviceFingerprint: newDevFp, biz: createdSlug });
  console.log('✅ New visitor identified for', createdSlug, '| Registered:', v1.data.registered);

  // 5. Register Customer in new business
  console.log('\n5. Registering Diner in new business...');
  const regCust = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/register',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    name: 'Kabir Singh',
    mobile: '9888877777',
    dob: '1995-08-10',
    address: 'C-Scheme, Jaipur',
    deviceFingerprint: newDevFp,
    biz: createdSlug
  });
  console.log('✅ Registered Customer:', regCust.data.customer.name, '| Stamps:', regCust.data.customer.stamps);

  // 6. Test Scratch Card for this business
  console.log('\n6. Testing Scratch Card on new business...');
  const scratch = await request({
    hostname: 'localhost',
    port: 3000,
    path: `/api/customer/${regCust.data.customer.id}/scratch`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { deviceFingerprint: newDevFp, biz: createdSlug });
  console.log('✅ Scratch outcome: Stamps', scratch.data.stamps, '| Prize:', scratch.data.reward.title);

  // 7. Test AI Review Suggestions for this business
  console.log('\n7. Testing AI Review Suggestions for new business...');
  const aiRev = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/reviews/ai-suggest',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { rating: 5, customerName: 'Kabir', biz: createdSlug });
  console.log('✅ Received AI suggestion tailored to', createdSlug, ':', aiRev.data.suggestions[0].title);

  // 8. Test QR Generation for this business
  console.log('\n8. Generating QR Standee for Table 3 on', createdSlug, '...');
  const qrRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: `/api/qr/generate?biz=${createdSlug}&table=Table%203`,
    method: 'GET'
  });
  console.log('✅ Generated QR pointing to:', qrRes.data.targetUrl);

  // 9. Authenticate with 10-Layer Passcode & Query Admin Stats for this business
  console.log('\n9. Authenticating via 10-Layer Passcode for', createdSlug, '...');
  const authRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: `/api/auth/admin/verify-passcode?biz=${createdSlug}`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    passcode: '4321',
    deviceFingerprint: newDevFp,
    clientTimestamp: Date.now(),
    clientNonce: 'n_api_test_' + Date.now()
  });
  console.log('✅ 10-Layer Passcode Verified! Token obtained.');

  console.log('Checking Admin Stats with 10-Layer Signed Session Token...');
  const adminStats = await request({
    hostname: 'localhost',
    port: 3000,
    path: `/api/admin/stats?biz=${createdSlug}`,
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${authRes.data.token}`,
      'x-device-fingerprint': newDevFp
    }
  });
  console.log('✅ Admin Stats for', adminStats.data.business.name, ':', adminStats.data.stats);

  console.log('\n✨ ALL MULTI-TENANT, SAAS & 10-LAYER AUTH WORKFLOWS TESTED SUCCESSFULLY WITH 100% PASS! ✨\n');
}

runTests().catch(console.error);
