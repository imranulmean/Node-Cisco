import snmp from 'net-snmp';

// ── Config ────────────────────────────────────────────────────────────────────
const HOST      = '192.168.11.251';
const COMMUNITY = 'A1bl786';

// ── OIDs ──────────────────────────────────────────────────────────────────────
const OID = {
  sysDescr:    '1.3.6.1.2.1.1.1.0',
  sysName:     '1.3.6.1.2.1.1.5.0',
  sysUpTime:   '1.3.6.1.2.1.1.3.0',
  sysContact:  '1.3.6.1.2.1.1.4.0',
  sysLocation: '1.3.6.1.2.1.1.6.0',
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function val(v) {
  if (v == null) return '';
  if (Buffer.isBuffer(v)) return v.toString('utf8');
  return v.toString();
}

function getMulti(oids) {
  return new Promise((resolve, reject) => {
    const session = snmp.createSession(HOST, COMMUNITY, {
      version: snmp.Version2c,
      timeout: 3000,
      retries: 1,
    });

    session.get(oids, (err, vbs) => {
      session.close();

      if (err) return reject(err);

      const result = {};
      vbs.forEach((vb, i) => {
        result[oids[i]] = snmp.isVarbindError(vb) ? null : val(vb.value);
      });

      resolve(result);
    });

    session.on('error', (err) => reject(err));
  });
}

// ── Identify device ───────────────────────────────────────────────────────────
async function identifyDevice() {
  try {
    const oids = [
      OID.sysDescr,
      OID.sysName,
      OID.sysUpTime,
      OID.sysContact,
      OID.sysLocation,
    ];

    const res = await getMulti(oids);

    const info = {
      ip: HOST,
      sysDescr: res[OID.sysDescr] || '',
      sysName: res[OID.sysName] || '',
      sysUpTime: res[OID.sysUpTime] || '',
      sysContact: res[OID.sysContact] || '',
      sysLocation: res[OID.sysLocation] || '',
      reachable: true,
      isCiscoSwitch: /cisco ios/i.test(res[OID.sysDescr] || ''),
    };

    console.log('[SNMP] Device identified:');
    console.table(info);

    return info;
  } catch (err) {
    console.error(`[SNMP ERROR] ${HOST}:`, err.message);
    return {
      ip: HOST,
      reachable: false,
      reason: err.message,
    };
  }
}

// ── Run once ──────────────────────────────────────────────────────────────────
identifyDevice();