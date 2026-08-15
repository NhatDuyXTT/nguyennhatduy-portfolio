import { json, readJson } from '../lib/http.js';
import { getSupabase } from '../lib/supabase.js';
import { authenticate, requireRole } from '../lib/auth.js';
import { generateKey } from '../lib/crypto.js';
import { TYPES, PRICE, MS, int } from '../lib/validate.js';

async function auth(request, env) { const a = await authenticate(request, env); return a; }

export async function listKeys(request, env) {
  const a = await auth(request, env); if (a.error) return a.error;
  const url = new URL(request.url); const filter = url.searchParams.get('filter'); const showDeleted = url.searchParams.get('show_deleted') === 'true';
  const supabase = getSupabase(env);
  let q = supabase.from('keys').select('*').order('created_at', {ascending:false}).eq('deleted', showDeleted);
  if (a.user.role === 'reseller') q = q.eq('created_by', a.user.username);
  if (filter?.startsWith('reseller:') && a.user.role === 'admin') q = q.eq('created_by', filter.slice(9));
  const { data, error } = await q;
  if (error) return json({ error: error.message }, 500);
  return json(data || []);
}

export async function generateKeys(request, env) {
  const a = await auth(request, env); if (a.error) return a.error;
  if (!requireRole(a.user, ['admin','reseller'])) return json({ error: 'Reseller access required' }, 403);
  const body = await readJson(request); const type = body.type; const quantity = int(body.quantity, 1, 100, 0); const maxDevices = int(body.max_devices, 1, 20, 0);
  if (!TYPES.includes(type) || !quantity || !maxDevices) return json({ error: 'Invalid type, quantity, or max_devices' }, 400);
  const prefix = a.user.prefix || 'NHATDUYPN'; const expiresAt = Date.now() + MS[type];
  const rows = Array.from({length: quantity}, () => ({ key: generateKey(prefix, type), duration:type, max_devices:maxDevices, expires_at:expiresAt, created_by:a.user.username, creator_platform: String(body.platform || 'web').slice(0,20), deleted:false, activated:false, device_count:0 }));
  const cost = PRICE[type] * quantity;
  const supabase = getSupabase(env);
  const { data, error } = await supabase.rpc('create_license_batch', { p_user_id: a.user.id, p_cost: a.user.role === 'reseller' && !a.user.unlimited ? cost : 0, p_keys: rows });
  if (error) return json({ error: error.message }, error.code === 'P0001' ? 400 : 500);
  return json({ success:true, keys: data?.keys || rows.map(x=>x.key), credits_remaining: data?.credits_remaining ?? a.user.credits, unlimited: !!a.user.unlimited });
}

export async function updateKey(request, env) {
  const a=await auth(request,env); if(a.error)return a.error; const b=await readJson(request); const key=String(b.key||''); const days=int(b.days,1,3650,0); if(!key||!days)return json({error:'Invalid key or days'},400);
  const supabase=getSupabase(env); const {data:k,error}=await supabase.from('keys').select('id,created_by,expires_at,deleted').eq('key',key).single(); if(error||!k)return json({error:'Key not found'},404); if(a.user.role==='reseller'&&k.created_by!==a.user.username)return json({error:'Not your key'},403); if(k.deleted)return json({error:'Key is deleted'},400);
  const {error:e}=await supabase.from('keys').update({expires_at:Number(k.expires_at)+days*86400000}).eq('id',k.id); if(e)return json({error:'Update failed'},500); return json({success:true,new_expiry:Number(k.expires_at)+days*86400000});
}

export async function resetKey(request, env) {
  const a=await auth(request,env); if(a.error)return a.error; const b=await readJson(request); const key=String(b.key||''); if(!key)return json({error:'Key required'},400); const supabase=getSupabase(env); const {data:k,error}=await supabase.from('keys').select('id,created_by,deleted').eq('key',key).single(); if(error||!k)return json({error:'Key not found'},404); if(k.deleted)return json({error:'Key is deleted'},400); if(a.user.role==='reseller'&&k.created_by!==a.user.username)return json({error:'Not your key'},403); const {error:e}=await supabase.rpc('reset_license_devices',{p_key_id:k.id}); if(e)return json({error:e.message},500); return json({success:true});
}

export async function deleteKey(request, env) {
  const a=await auth(request,env); if(a.error)return a.error; const b=await readJson(request); const key=String(b.key||''); if(!key)return json({error:'Key required'},400); const supabase=getSupabase(env); const {data:k,error}=await supabase.from('keys').select('id,created_by').eq('key',key).single(); if(error||!k)return json({error:'Key not found'},404); if(a.user.role==='reseller'&&k.created_by!==a.user.username)return json({error:'Not your key'},403); const {error:e}=await supabase.from('keys').update({deleted:true}).eq('id',k.id); if(e)return json({error:'Delete failed'},500); return json({success:true});
}

export async function restoreKey(request, env) {
  const a=await auth(request,env); if(a.error)return a.error; if(!requireRole(a.user,['admin']))return json({error:'Admin access required'},403); const b=await readJson(request); const key=String(b.key||''); if(!key)return json({error:'Key required'},400); const supabase=getSupabase(env); const {error}=await supabase.from('keys').update({deleted:false}).eq('key',key); if(error)return json({error:'Restore failed'},500); return json({success:true});
}

export async function cleanExpired(request, env) {
  const a=await auth(request,env); if(a.error)return a.error; if(!requireRole(a.user,['admin']))return json({error:'Admin access required'},403); const supabase=getSupabase(env); const {data,error}=await supabase.from('keys').update({deleted:true}).lt('expires_at',Date.now()).eq('deleted',false).select('id'); if(error)return json({error:error.message},500); return json({success:true,deleted:data?.length||0});
}

export async function compensate(request, env) {
  const a=await auth(request,env); if(a.error)return a.error; if(!requireRole(a.user,['admin']))return json({error:'Admin access required'},403); const b=await readJson(request); const durations=b.durations; const days=int(b.days,1,3650,0); if(!Array.isArray(durations)||!durations.length||!days||durations.some(x=>!TYPES.includes(x)))return json({error:'Invalid durations or days'},400); const supabase=getSupabase(env); const {data,error}=await supabase.rpc('compensate_keys',{p_durations:durations,p_days:days}); if(error)return json({error:error.message},500); return json({success:true,count:data?.count||0,days,durations});
}
