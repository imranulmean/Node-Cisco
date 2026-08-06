// generateLicense.js
// ⚠️ RUN THIS ONLY ON YOUR OWN MACHINE. NEVER SHIP THIS FILE TO A CLIENT.
// This is the only file that ever touches private.pem.

import jwt from 'jsonwebtoken';
import fs from 'fs';
import moment from 'moment';

const PRIVATE_KEY = fs.readFileSync('./private.pem', 'utf8');

/**
 * Generates a signed license file for a client.
 * @param {string} companyName   - e.g. "ABC Bank Ltd"
 * @param {number} validForDays  - e.g. 30 for a monthly license
 * @param {number} maxRouters    - e.g. 500
 * @param {string[]} features    - e.g. ["monitoring", "config-push", "reports", "mrtg"]
 */
function generateLicense(companyName, validForDays, maxRouters, features) {
    const issuedAt = new Date();
    const expiresAt = moment().add(validForDays, 'days').toDate();

    const payload = {
        company: companyName,
        maxRouters,
        features,
        issuedAt,
        expiresAt
    };

    // signed with YOUR private key — nobody can forge this without it
    const token = jwt.sign(payload, PRIVATE_KEY, { algorithm: 'RS256' });

    if (!fs.existsSync('./licenses')) fs.mkdirSync('./licenses');

    const safeName = companyName.replace(/\s+/g, '_');
    const filePath = `./licenses/${safeName}-license.key`;
    fs.writeFileSync(filePath, token);

    console.log(`✅ License generated: ${filePath}`);
    console.log(`   Company:  ${companyName}`);
    console.log(`   Expires:  ${moment(expiresAt).format('MMMM Do YYYY, h:mm a')}`);
    console.log(`   Routers:  ${maxRouters}`);
    console.log(`   Features: ${features.join(', ')}`);
}

// ===== EDIT THESE VALUES FOR EACH CLIENT, THEN RUN: node generateLicense.js =====
generateLicense(
    'ABC Bank Ltd',           // company name
    30,                       // valid for 30 days (monthly renewal)
    500,                      // max routers allowed
    ['monitoring', 'config-push', 'reports', 'mrtg', 'mail']  // licensed features
);