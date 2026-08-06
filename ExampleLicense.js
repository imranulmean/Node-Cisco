// === ADD THIS NEAR THE TOP OF index_socket.js, after your existing imports ===

import { checkLicense, requireValidLicense, hasFeature } from './licenseCheck.js';

// --- LICENSE CHECK ON STARTUP ---
// If this fails, the server refuses to even start.
const licenseStatus = checkLicense();

if (!licenseStatus.valid) {
    console.log('=====================================');
    console.log('❌ LICENSE ERROR');
    console.log(licenseStatus.reason);
    console.log('=====================================');
    process.exit(1); // hard stop — no server, no monitoring, nothing runs
}

console.log('=====================================');
console.log(`✅ Licensed to: ${licenseStatus.company}`);
console.log(`   Expires in: ${licenseStatus.daysRemaining} days`);
console.log(`   Max routers: ${licenseStatus.maxRouters}`);
console.log('=====================================');

// warn proactively when renewal is approaching
if (licenseStatus.daysRemaining <= 7) {
    console.log(`⚠️  WARNING: License expires in ${licenseStatus.daysRemaining} day(s). Please renew.`);
}

// --- PERIODIC RE-CHECK WHILE RUNNING ---
// Catches the case where license.key gets deleted/corrupted/replaced with an
// expired one while the server is already running.
setInterval(() => {
    const check = checkLicense();
    if (!check.valid) {
        console.log(`❌ ${check.reason} — shutting down monitoring.`);
        process.exit(1);
    }
}, 60 * 60 * 1000); // re-check every hour


// === EXAMPLE: gate a specific route behind a feature flag ===
// Use this pattern on routes tied to specific licensed features.

app.post('/sendMail', authMiddleware, (req, res, next) => {
    if (!hasFeature('mail')) {
        return res.status(403).json({
            success: false,
            message: 'Mail feature is not included in your current license.'
        });
    }
    next();
}, sendMail);


// === EXAMPLE: gate router count against license limit ===
// Put this inside your addRouter controller, or check it here before allowing
// a new router to be added.

app.post('/addRouter', authMiddleware, (req, res, next) => {
    const currentCount = routers.length;
    const license = checkLicense();

    if (currentCount >= license.maxRouters) {
        return res.status(403).json({
            success: false,
            message: `Router limit reached (${license.maxRouters} max on your current plan). Upgrade your license to add more.`
        });
    }
    next();
}, addRouter);


// === EXAMPLE: expose license status to the frontend so you can show a banner ===

app.get('/licenseStatus', (req, res) => {
    const status = checkLicense();
    res.json({
        valid: status.valid,
        company: status.company,
        daysRemaining: status.daysRemaining,
        expiresAt: status.expiresAt,
        reason: status.reason
    });
});