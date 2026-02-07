const https = require('http');
const fs = require('fs');

const req = https.get('http://localhost:3000/api/admin/sync-counts', (res) => {
    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });
    res.on('end', () => {
        fs.writeFileSync('sync_output.json', data);
        console.log('Output saved to sync_output.json');
    });
});

req.on('error', (e) => {
    console.error(`Problem with request: ${e.message}`);
});
