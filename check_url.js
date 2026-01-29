const http = require('http');

const urls = [
  'http://100.77.18.82:8000/admin/users',
  'http://100.77.18.82:8000/api/admin/users',
  'http://100.77.18.82:8000/auth/admin/users'
];

urls.forEach(url => {
  const req = http.request(url, { method: 'HEAD' }, (res) => {
    console.log(`${url} => ${res.statusCode}`);
  });
  req.on('error', (e) => {
    console.log(`${url} => Error: ${e.message}`);
  });
  req.end();
});
