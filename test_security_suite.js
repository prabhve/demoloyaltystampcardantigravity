const http = require('http');

function request(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          resolve({ status: res.statusCode, headers: res.headers, body: json });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, body });
        }
      });
    });
    req.on('error', reject);
    if (data) {
      req.write(typeof data === 'string' ? data : JSON.stringify(data));
    }
    req.end();
  });
}

async function runTests() {
  console.log('========================================================');
  console.log('🔒 10-LAYER PASSCODE SECURITY ARCHITECTURE VERIFICATION');
  console.log('========================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(title, condition, detail = '') {
    if (condition) {
      console.log(`✅ [PASS] ${title} ${detail ? `(${detail})` : ''}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${title} ${detail ? `(${detail})` : ''}`);
      failed++;
    }
  }

  const BASE_HOST = 'localhost';
  const BASE_PORT = 3000;
  const DEVICE_A = 'fp_hardware_device_alpha_9988';
  const DEVICE_B = 'fp_hardware_device_beta_1122';

  // ----------------------------------------------------
  // TEST 1: Unauthenticated Block
  // ----------------------------------------------------
  console.log('--- TEST 1: Default Protection on Admin Endpoints ---');
  const unauthRes = await request({
    hostname: BASE_HOST,
    port: BASE_PORT,
    path: '/api/admin/stats?biz=royal-spice',
    method: 'GET'
  });
  assert('Unauthenticated access to /api/admin/stats blocked with 401', unauthRes.status === 401);
  assert('Error mentions 10-Layer Security Shield', unauthRes.body.error && unauthRes.body.error.includes('10-Layer Security Shield'));

  // ----------------------------------------------------
  // TEST 2: Layer 8 Replay Attack Defense & Timestamp Skew
  // ----------------------------------------------------
  console.log('\n--- TEST 2: Layer 8 Replay Attack & Timestamp Skew ---');
  const staleTimestamp = Date.now() - 120000; // 2 minutes ago (beyond 60s window)
  const replayRes = await request({
    hostname: BASE_HOST,
    port: BASE_PORT,
    path: '/api/auth/admin/verify-passcode?biz=royal-spice',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    passcode: '1234',
    deviceFingerprint: DEVICE_A,
    clientTimestamp: staleTimestamp,
    clientNonce: 'nonce_expired_1'
  });
  assert('Stale timestamp blocked with 400', replayRes.status === 400);
  assert('Replay defense detected clock skew / expired signature', replayRes.body.error && replayRes.body.error.includes('Replay'));

  // Duplicate Nonce Test
  const validTimestamp = Date.now();
  const duplicateNonce = 'nonce_unique_test_' + Date.now();
  await request({
    hostname: BASE_HOST,
    port: BASE_PORT,
    path: '/api/auth/admin/verify-passcode?biz=royal-spice',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    passcode: '1234',
    deviceFingerprint: DEVICE_A,
    clientTimestamp: validTimestamp,
    clientNonce: duplicateNonce
  });

  const dupRes = await request({
    hostname: BASE_HOST,
    port: BASE_PORT,
    path: '/api/auth/admin/verify-passcode?biz=royal-spice',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    passcode: '1234',
    deviceFingerprint: DEVICE_A,
    clientTimestamp: validTimestamp,
    clientNonce: duplicateNonce
  });
  assert('Duplicate client nonce blocked with 400 (Replay Attack blocked)', dupRes.status === 400 && dupRes.body.error && dupRes.body.error.includes('Nonce already utilized'));

  // ----------------------------------------------------
  // TEST 3: Layer 1, 2, 6 - Valid Passcode Verification & Auto-Upgrade to PBKDF2
  // ----------------------------------------------------
  console.log('\n--- TEST 3: Layer 1 & 2 PBKDF2 Constant-Time Passcode Check & Token Issuance ---');
  const validLoginRes = await request({
    hostname: BASE_HOST,
    port: BASE_PORT,
    path: '/api/auth/admin/verify-passcode?biz=royal-spice',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    passcode: '1234',
    deviceFingerprint: DEVICE_A,
    clientTimestamp: Date.now(),
    clientNonce: 'nonce_valid_' + Math.random() + '_' + Date.now()
  });

  assert('Valid passcode verified with 200 OK', validLoginRes.status === 200);
  assert('HMAC Signed Ephemeral Token received', !!validLoginRes.body.token);
  assert('Protocol indicates 10-Layer Security Shield Active', validLoginRes.body.securitySummary && validLoginRes.body.securitySummary.protocol.includes('10-Layer'));

  let authToken = validLoginRes.body.token;

  // ----------------------------------------------------
  // TEST 4: Authorized Data Access
  // ----------------------------------------------------
  console.log('\n--- TEST 4: Authorized Data Access ---');
  const authAccessRes = await request({
    hostname: BASE_HOST,
    port: BASE_PORT,
    path: '/api/admin/stats?biz=royal-spice',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'x-device-fingerprint': DEVICE_A
    }
  });
  assert('Authenticated request to /api/admin/stats succeeds with 200', authAccessRes.status === 200);
  assert('Business stats retrieved for Royal Spice', authAccessRes.body.business && authAccessRes.body.business.slug === 'royal-spice');

  // ----------------------------------------------------
  // TEST 5: Layer 9 Strict Multi-Tenant RBAC Boundary Enforcer
  // ----------------------------------------------------
  console.log('\n--- TEST 5: Layer 9 Strict Multi-Tenant RBAC Boundary ---');
  const crossTenantRes = await request({
    hostname: BASE_HOST,
    port: BASE_PORT,
    path: '/api/admin/stats?biz=cafe-bliss', // Royal Spice token used against Cafe Bliss!
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'x-device-fingerprint': DEVICE_A
    }
  });
  assert('Cross-tenant data access strictly blocked with 403 Forbidden', crossTenantRes.status === 403);
  assert('Tenant boundary violation logged and communicated', crossTenantRes.body.error && crossTenantRes.body.error.includes('strictly bounded'));

  // ----------------------------------------------------
  // TEST 6: Layer 10 Immutable Security Audit Trail
  // ----------------------------------------------------
  console.log('\n--- TEST 6: Layer 10 Immutable Security Audit Trail ---');
  const auditRes = await request({
    hostname: BASE_HOST,
    port: BASE_PORT,
    path: '/api/auth/admin/audit-logs?biz=royal-spice',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'x-device-fingerprint': DEVICE_A
    }
  });
  assert('Audit trail retrieved successfully with 200 OK', auditRes.status === 200);
  assert('Audit log contains entries', Array.isArray(auditRes.body.logs) && auditRes.body.logs.length > 0);

  const eventTypes = (auditRes.body.logs || []).map(l => l.eventType || l.event);
  assert('Audit log contains LOGIN_SUCCESS event', eventTypes.includes('LOGIN_SUCCESS'));
  assert('Audit log captured TENANT_BOUNDARY_VIOLATION event', eventTypes.includes('TENANT_BOUNDARY_VIOLATION'));

  // ----------------------------------------------------
  // TEST 7: Layer 4 Hardware & Device Fingerprint Binding
  // ----------------------------------------------------
  console.log('\n--- TEST 7: Layer 4 Hardware Device Fingerprint Binding ---');
  const hijackedRes = await request({
    hostname: BASE_HOST,
    port: BASE_PORT,
    path: '/api/admin/stats?biz=royal-spice',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'x-device-fingerprint': DEVICE_B // Stolen token on different device!
    }
  });
  assert('Token used on untrusted/unbound hardware device is rejected (401)', hijackedRes.status === 401);
  assert('Error specifies hardware device mismatch', hijackedRes.body.error && hijackedRes.body.error.includes('Hardware device mismatch'));

  // ----------------------------------------------------
  // TEST 8: Layer 3 Adaptive Rate Limiting & Brute Force Lockout
  // ----------------------------------------------------
  console.log('\n--- TEST 8: Layer 3 Adaptive Rate Limiter & Brute-Force Lockout ---');
  const TEST_IP_TENANT = 'glam-studio';
  // Attempt 5 consecutive wrong passcodes on another tenant
  let lastAttemptRes = null;
  for (let i = 1; i <= 5; i++) {
    lastAttemptRes = await request({
      hostname: BASE_HOST,
      port: BASE_PORT,
      path: `/api/auth/admin/verify-passcode?biz=${TEST_IP_TENANT}`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      passcode: '9999_wrong_' + i,
      deviceFingerprint: 'fp_attacker_test_' + i,
      clientTimestamp: Date.now(),
      clientNonce: 'nonce_bf_' + Math.random() + '_' + i
    });
  }

  // 6th attempt should trigger 429 Brute-force Lockout
  const lockedRes = await request({
    hostname: BASE_HOST,
    port: BASE_PORT,
    path: `/api/auth/admin/verify-passcode?biz=${TEST_IP_TENANT}`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    passcode: '1234', // even correct passcode is now locked out!
    deviceFingerprint: 'fp_attacker_test_6',
    clientTimestamp: Date.now(),
    clientNonce: 'nonce_bf_lockout_' + Math.random()
  });

  assert('5 failed attempts triggers 429 Security Lockout', lockedRes.status === 429);
  assert('Lockout message specifies temporary hold', lockedRes.body.error && lockedRes.body.error.includes('locked'));

  console.log('\n========================================================');
  console.log(`RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('========================================================');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests().catch(err => {
  console.error('Fatal error during test run:', err);
  process.exit(1);
});
