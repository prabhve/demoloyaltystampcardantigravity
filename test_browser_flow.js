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

function getAuth(path, token, fp) {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'x-device-fingerprint': fp
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
    req.end();
  });
}

async function test() {
  const fp = 'fp_browser_test_' + Date.now();
  console.log('Testing verify-passcode for keshari-dhaba with passcode: 1234...');
  
  const verifyRes = await post('/api/auth/admin/verify-passcode?biz=keshari-dhaba', {
    passcode: '1234',
    deviceFingerprint: fp,
    clientTimestamp: Date.now(),
    clientNonce: 'nonce_' + Date.now()
  });

  console.log('Verify Status:', verifyRes.status);
  console.log('Verify Body:', verifyRes.body);

  if (!verifyRes.body.token) {
    console.error('FAILED to get token!');
    return;
  }

  console.log('\nTesting /api/admin/stats with received token...');
  const statsRes = await getAuth('/api/admin/stats?biz=keshari-dhaba', verifyRes.body.token, fp);
  console.log('Stats Status:', statsRes.status);
  console.log('Stats Success:', statsRes.body.success);
}

test();
