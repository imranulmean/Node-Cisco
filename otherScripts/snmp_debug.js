import snmp from 'net-snmp';

// ── Config ────────────────────────────────────────────────────────────────────
const HOST          = '192.168.166.1';
const COMMUNITY     = 'A1bl786';
const POLL_INTERVAL = 60 * 1000;

// ── OIDs ──────────────────────────────────────────────────────────────────────
const OID = {
  sysName:      '1.3.6.1.2.1.1.5.0',
  ifDescr:      '1.3.6.1.2.1.2.2.1.2',
  ifAlias:      '1.3.6.1.2.1.31.1.1.1.18',
  ifOperStatus: '1.3.6.1.2.1.2.2.1.8',
  ifSpeed:      '1.3.6.1.2.1.2.2.1.5',

  // ✅ 64-bit counters
  ifHCInOctets:  '1.3.6.1.2.1.31.1.1.1.6',
  ifHCOutOctets: '1.3.6.1.2.1.31.1.1.1.10',
};

// ── State ─────────────────────────────────────────────────────────────────────
let sysName = HOST;
const _state = {};
let staticLoaded = false;
let isPolling = false;

// ── SNMP Session ──────────────────────────────────────────────────────────────
const session = snmp.createSession(HOST, COMMUNITY, {
  version: snmp.Version2c,
  timeout: 8000,
  retries: 1,
});

// ── Helpers ───────────────────────────────────────────────────────────────────

// ✅ Correct Counter64 → BigInt conversion
function toBigInt(v) {
  if (v == null) return 0n;

  if (Buffer.isBuffer(v)) {
    return BigInt('0x' + v.toString('hex'));
  }

  if (typeof v === 'number') {
    return BigInt(v);
  }

  try {
    return BigInt(v.toString());
  } catch {
    return 0n;
  }
}

function val(v) {
  if (v == null) return '';
  if (Buffer.isBuffer(v)) return v.toString('utf8');
  return v.toString();
}

function get(oid) {
  return new Promise((resolve) => {
    session.get([oid], (err, vbs) => {
      if (err || !vbs[0] || snmp.isVarbindError(vbs[0])) return resolve(null);
      resolve(val(vbs[0].value));
    });
  });
}

// ✅ Smaller bulk + safer walk
function walk(oid) {
  return new Promise((resolve) => {
    const out = {};

    session.walk(
      oid,
      10, // 🔥 reduced bulk (fix timeout)
      (vbs) => {
        for (const vb of vbs) {
          if (!snmp.isVarbindError(vb)) {
            out[vb.oid] = vb.value;
          }
        }
      },
      (err) => {
        if (err) {
          console.error(`[SNMP] Walk error ${oid}: ${err.message}`);
        }
        resolve(out);
      }
    );
  });
}

// ── Load static data (only once) ──────────────────────────────────────────────
async function loadStaticData() {
  console.log('[SNMP] Loading interface data...');

  const descrMap = await walk(OID.ifDescr);
  const speedMap = await walk(OID.ifSpeed);
  const aliasMap= await walk(OID.ifAlias);

  const indexes = Object.keys(descrMap)
    .map(oid => oid.replace(`${OID.ifDescr}.`, ''))
    .filter(idx => /^\d+$/.test(idx));

  for (const idx of indexes) {
    _state[idx] = {
      descr: val(descrMap[`${OID.ifDescr}.${idx}`]),
      alias: val(aliasMap[`${OID.ifAlias}.${idx}`]),
      speed: Number(val(speedMap[`${OID.ifSpeed}.${idx}`]) || 0),
      prevIn: 0n,
      prevOut: 0n,
      prevTime: 0,
      status: 2,
    };
  }

  staticLoaded = true;
  console.log(`[SNMP] Found ${indexes.length} interfaces\n`);
}

// ── Poll ──────────────────────────────────────────────────────────────────────
async function poll() {
  if (isPolling) {
    console.log('[SNMP] Skipping poll (still running)');
    return;
  }

  isPolling = true;

  console.log(`\n[SNMP] Polling ${HOST}...`);

  try {
    if (!staticLoaded) {
      await loadStaticData();
    }

    sysName = (await get(OID.sysName)) ?? HOST;

    // ✅ sequential (no overload)
    const statusMap = await walk(OID.ifOperStatus);
    const inMap     = await walk(OID.ifHCInOctets);
    const outMap    = await walk(OID.ifHCOutOctets);

    const now = Date.now();
    const table = [];

    for (const idx in _state) {
      const s = _state[idx];

      const status = Number(val(statusMap[`${OID.ifOperStatus}.${idx}`]) || 2);
      const inOct  = toBigInt(inMap[`${OID.ifHCInOctets}.${idx}`]);
      const outOct = toBigInt(outMap[`${OID.ifHCOutOctets}.${idx}`]);

      // baseline
      if (s.prevTime === 0) {
        s.prevIn = inOct;
        s.prevOut = outOct;
        s.prevTime = now;
        continue;
      }

      const dt = (now - s.prevTime) / 1000;

      const inBps  = dt > 0 ? Number((inOct - s.prevIn) * 8n) / dt : 0;
      const outBps = dt > 0 ? Number((outOct - s.prevOut) * 8n) / dt : 0;

      const util = s.speed > 0
        ? Math.min(100, (Math.max(inBps, outBps) / s.speed) * 100)
        : 0;

      // update state
      s.prevIn = inOct;
      s.prevOut = outOct;
      s.prevTime = now;
      s.status = status;

      // pretty log
      console.log(
        `[${idx}] ${s.descr.padEnd(25)} | ` +
        `IN: ${Math.round(inBps / 1000).toString().padStart(6)} Kbps | ` +
        `OUT: ${Math.round(outBps / 1000).toString().padStart(6)} Kbps | ` +
        `UTIL: ${util.toFixed(2)}%`
      );

      table.push({
        idx,
        name: s.descr,
        alias:s.alias || 'no description',
        status: status === 1 ? 'UP' : 'DOWN',
        inKbps: Math.round(inBps / 1000),
        outKbps: Math.round(outBps / 1000),
        util: util.toFixed(2) + '%',
      });
    }

    console.log('\n📊 Interface Summary');
    console.table(table);

  } catch (err) {
    console.error('[SNMP ERROR]', err.message);
  } finally {
    isPolling = false;
  }
}

// ── Start ─────────────────────────────────────────────────────────────────────
function start() {
  console.log('[SNMP] Starting monitor...');
  poll();
  setInterval(poll, POLL_INTERVAL);
}

start();