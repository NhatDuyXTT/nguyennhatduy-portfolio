export const TYPES = ['1d', '3d', '7d', '15d', '30d'];
export const PRICE = { '1d': 5, '3d': 10, '7d': 20, '15d': 25, '30d': 30 };
export const MS = { '1d': 86400000, '3d': 259200000, '7d': 604800000, '15d': 1296000000, '30d': 2592000000 };

export function int(v, min, max, fallback) {
  const n = Number.parseInt(v, 10);
  if (!Number.isFinite(n) || n < min || n > max) return fallback;
  return n;
}

export function validKeyType(type) { return TYPES.includes(type); }
export function validUsername(name) { return typeof name === 'string' && /^[A-Za-z0-9_]{2,32}$/.test(name); }
export function validPrefix(prefix) { return prefix == null || /^[A-Za-z0-9]{2,15}$/.test(prefix); }
