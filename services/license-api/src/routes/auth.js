import { json, readJson } from '../lib/http.js';
import { getSupabase } from '../lib/supabase.js';
import { comparePassword } from '../lib/crypto.js';
import { authenticate, generateToken, requireRole } from '../lib/auth.js';

export async function login(request, env) {
  const body = await readJson(request);
  const username = String(body.username || '').trim();
  const password = String(body.password || '');
  if (!username || !password) return json({ error: 'Username and password required' }, 400);
  const supabase = getSupabase(env);
  const { data: user, error } = await supabase.from('users').select('*').eq('username', username).eq('status', 'active').single();
  if (error || !user || !comparePassword(password, user.password)) return json({ error: 'Invalid credentials' }, 401);
  return json({ success: true, token: await generateToken(user, env), role: user.role, username: user.username });
}

export async function me(request, env) {
  const a = await authenticate(request, env); if (a.error) return a.error;
  const u = a.user;
  return json({ id: u.id, username: u.username, role: u.role, credits: u.credits, unlimited: !!u.unlimited,
    unlimited_expires_at: u.unlimited_expires_at, api_allowed: !!u.api_allowed, api_key: u.api_key, prefix: u.prefix, status: u.status });
}

export async function setupTelegram(request, env) {
  const a = await authenticate(request, env); if (a.error) return a.error;
  if (!requireRole(a.user, ['admin'])) return json({ error: 'Admin access required' }, 403);
  if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_WEBHOOK_URL) return json({ error: 'Telegram config missing' }, 400);
  const r = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/setWebhook`, { method: 'POST', headers: {'content-type':'application/json'}, body: JSON.stringify({url: env.TELEGRAM_WEBHOOK_URL}) });
  const d = await r.json();
  return json({ ok: d.ok, description: d.description });
}
