import { SignJWT, jwtVerify } from 'jose';
import { getSupabase } from './supabase.js';
import { json } from './http.js';

function secret(env) {
  if (!env.JWT_SECRET || env.JWT_SECRET.length < 32) throw new Error('JWT_SECRET must be at least 32 characters');
  return new TextEncoder().encode(env.JWT_SECRET);
}

export async function generateToken(user, env, extra = {}) {
  return await new SignJWT({ id: user.id, username: user.username, role: user.role, api_allowed: !!user.api_allowed, ...extra })
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setIssuer(env.JWT_ISSUER || 'nhatduypn')
    .setAudience(env.JWT_AUDIENCE || 'nhatduypn-panel')
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret(env));
}

export async function authenticate(request, env) {
  const h = request.headers.get('Authorization') || '';
  if (!h.startsWith('Bearer ')) return { error: json({ error: 'Unauthorized - No token provided' }, 401) };
  try {
    const { payload } = await jwtVerify(h.slice(7), secret(env), {
      issuer: env.JWT_ISSUER || 'nhatduypn',
      audience: env.JWT_AUDIENCE || 'nhatduypn-panel'
    });
    const supabase = getSupabase(env);
    const { data: user, error } = await supabase.from('users')
      .select('id,username,role,status,api_allowed,unlimited,unlimited_expires_at,credits,prefix,api_key')
      .eq('id', payload.id).single();
    if (error || !user) return { error: json({ error: 'User not found' }, 401) };
    if (user.status !== 'active') return { error: json({ error: 'Account inactive' }, 403) };
    if (user.unlimited && user.unlimited_expires_at && Number(user.unlimited_expires_at) <= Date.now()) {
      await supabase.from('users').update({ unlimited: false, unlimited_expires_at: null }).eq('id', user.id);
      user.unlimited = false;
      user.unlimited_expires_at = null;
    }
    return { user };
  } catch {
    return { error: json({ error: 'Invalid or expired token' }, 401) };
  }
}

export function requireRole(user, roles) {
  return user && roles.includes(user.role);
}
