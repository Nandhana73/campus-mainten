import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const http = require('http');

const data = JSON.stringify({
  estimatedAmount: 10000
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/complaint/69abb096eb9d1b466693c38f',
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, res => {
  console.log(`statusCode: ${res.statusCode}`);
  
  res.on('data', d => {
    process.stdout.write(d);
  });
});

req.on('error', error => {
  console.error(error);
});

req.write(data);
req.end();

