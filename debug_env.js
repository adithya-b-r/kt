const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env.local');

try {
    const fileContent = fs.readFileSync(envPath, 'utf8');
    const lines = fileContent.split('\n');
    let clientId = '';

    lines.forEach(line => {
        if (line.trim().startsWith('GOOGLE_CLIENT_ID=')) {
            clientId = line.split('=')[1] || '';
        }
    });

    console.log('--- DEBUG INFO ---');
    if (clientId) {
        // Remove simple carriage returns if present
        clientId = clientId.replace('\r', '');

        console.log('Raw value found in file (first 5 chars):', clientId.substring(0, 5));
        console.log('Total Length:', clientId.length);
        console.log('Contains double quotes:', clientId.includes('"'));
        console.log('Contains single quotes:', clientId.includes("'"));
        console.log('Contains leading space:', clientId.startsWith(' '));
        console.log('Contains trailing space:', clientId.endsWith(' '));
        console.log('Ends with .com:', clientId.trim().endsWith('.com') || clientId.trim().endsWith('.com"'));

        if (clientId.includes('"')) {
            console.log('WARNING: VALUE HAS QUOTES. PLEASE REMOVE THEM.');
        }
        if (clientId.trim().length !== clientId.length) {
            console.log('WARNING: VALUE HAS EXTRA SPACES. PLEASE REMOVE THEM.');
        }
    } else {
        console.log('GOOGLE_CLIENT_ID not found in .env.local');
    }
    console.log('--- END DEBUG ---');

} catch (err) {
    console.error('Error reading .env.local:', err.message);
}
