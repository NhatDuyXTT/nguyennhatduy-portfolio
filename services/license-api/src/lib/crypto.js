import bcrypt from 'bcryptjs';

const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';

function randomString(length) {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  let out = '';
  for (const b of bytes) out += chars[b % chars.length];
  return out;
}

export function generateKey(prefix = 'NHATDUYPN', duration = '1d') {
  const map = { '1d': '1D', '3d': '3D', '7d': '7D', '15d': '15D', '30d': '30D' };
  const stamp = Date.now().toString(36).slice(-7).toUpperCase();
  return `${prefix}${map[duration] || '1D'}${stamp}${randomString(12)}`;
}

export function generateApiKey() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return 'nhatduypn_' + [...bytes].map(x => x.toString(16).padStart(2, '0')).join('');
}

export function generateRandomPassword(length = 12) {
  return randomString(length);
}

export function hashPassword(password) {
  return bcrypt.hashSync(password, 12);
}

export function comparePassword(password, hash) {
  return bcrypt.compareSync(password, hash);
}
