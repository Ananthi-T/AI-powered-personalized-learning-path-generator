import jwt from 'jsonwebtoken';

const SECRET = 'dev-pathwise-secret';
const USER_ID = '04107700-d8f4-40ef-bcb2-dd2bab7a2ed4'; // Ananthi T

const token = jwt.sign({ sub: USER_ID }, SECRET, { expiresIn: '1h' });
const COOKIE = `pathwise_session=${token}`;

async function test() {
  console.log('Testing GET /api/ai/career-snapshot...');
  try {
      const res = await fetch('http://localhost:3000/api/ai/career-snapshot', {
        headers: {
            'Cookie': COOKIE
        }
      });
      console.log('GET Status:', res.status);
      if (res.status === 200) {
          const data = await res.json();
          console.log('Snapshot found:', data.snapshot ? 'Yes' : 'No');
          console.log('Data:', JSON.stringify(data.snapshot, null, 2));
      } else if (res.status === 404) {
          console.log('Snapshot not found (404) - Expected if new');
      } else {
          console.log('GET Error:', await res.text());
      }

      if (res.status === 404) {
          console.log('Testing POST /api/ai/career-snapshot...');
          const postRes = await fetch('http://localhost:3000/api/ai/career-snapshot', {
              method: 'POST',
              headers: {
                  'Cookie': COOKIE
              }
          });
          console.log('POST Status:', postRes.status);
          const postData = await postRes.json();
          console.log('POST Response:', JSON.stringify(postData, null, 2));
      }
  } catch (e) {
      console.error('Error:', e);
  }
}

test();
