// licenseCheck.js
// This file gets compiled INTO the client's binary via pkg.
// It only ever sees the PUBLIC key, so it can verify a license but never create one.

import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import moment from 'moment';

// ⚠️ paste your real public.pem content here before compiling — this is safe to ship,
// it can only VERIFY signatures, never CREATE them.
const PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAh17ZfI5NroPKksdzYxGz
uDsueA6DFcf3frPch0N77yi9GXc4UHY74SxrSd1fOFqAspeUvfoFEGfaUAB0qIRZ
VgxC1hcwTcg9VjRhMpawy32kf28qbpYQSzPnbA69uh/eJDeRCOs9prHZttHaJeir
VtT7ebLmJxiq9NrjKTZgMkA7FBwhYvufep7PUhI6X6nffdNA9R0vJIrunM0EuQET
/8AwSImAe6UYaRJZX/Dg5KZituJ+MbV7atHyNtNrQJ/U2BGGCmBu06QW4BB8jK8N
UugkyXwf+eXldag29vWvT0ntX4Njk6K4o2SGyA3VihBlOuE0+6sPosoKn+4x14Ng
jwIDAQAB
-----END PUBLIC KEY-----`;

const LICENSE_FILE_PATH = path.join(process.cwd(), 'license.key');

let cachedLicense = null;
let cachedAt = null;

/**
 * Validates the license.key file sitting next to the binary.
 * Returns { valid: true, company, maxRouters, features, expiresAt }
 * or { valid: false, reason: "..." }
 */
export function checkLicense() {
    try {
        if (!fs.existsSync(LICENSE_FILE_PATH)) {
            return { valid: false, reason: 'license.key file not found. Contact your provider.' };
        }

        const licenseToken = fs.readFileSync(LICENSE_FILE_PATH, 'utf8').trim();

        const decoded = jwt.verify(licenseToken, PUBLIC_KEY, { algorithms: ['RS256'] });

        if (moment().isAfter(moment(decoded.expiresAt))) {
            return {
                valid: false,
                reason: `License expired on ${moment(decoded.expiresAt).format('MMMM Do YYYY')}. Please renew your subscription.`
            };
        }

        cachedLicense = decoded;
        cachedAt = new Date();

        return {
            valid: true,
            company: decoded.company,
            maxRouters: decoded.maxRouters,
            features: decoded.features,
            expiresAt: decoded.expiresAt,
            daysRemaining: moment(decoded.expiresAt).diff(moment(), 'days')
        };

    } catch (err) {
        // covers: invalid signature (tampered/forged), malformed token, etc.
        return { valid: false, reason: 'License file is invalid or corrupted. Contact your provider.' };
    }
}

/**
 * Call this before any licensed feature/route runs.
 * Throws if invalid — calling code should catch and respond with 403.
 */
export function requireValidLicense() {
    const result = checkLicense();
    if (!result.valid) {
        throw new Error(result.reason);
    }
    return result;
}

/**
 * Check if a specific feature is included in this license.
 */
export function hasFeature(featureName) {
    const result = checkLicense();
    if (!result.valid) return false;
    return result.features.includes(featureName);
}

/**
 * Check router count against the licensed max.
 */
export function isWithinRouterLimit(currentRouterCount) {
    const result = checkLicense();
    if (!result.valid) return false;
    return currentRouterCount <= result.maxRouters;
}

export function getCachedLicense() {
    return cachedLicense;
}