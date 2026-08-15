import { json, readJson } from '../lib/http.js';
import { getSupabase } from '../lib/supabase.js';
import { generateKey } from '../lib/crypto.js';
import { TYPES, PRICE, MS, int, validPrefix } from '../lib/validate.js';

function getApiKey(request) { const h=request.headers.get('Authorization')||''; return h.startsWith('Bearer ')?h.slice(7):request.headers.get('X-API-Key')||''; }

export async function publicGenerate(request, env) {
  const apiKey=getApiKey(request); if(!apiKey)return json({error:'API key required'},401); const supabase=getSupabase(env); const {data:user,error}=await supabase.from('users').select('*').eq('api_key',apiKey).eq('status','active').eq('api_allowed',true).single(); if(error||!user)return json({error:'Invalid or inactive API key'},401);
  const b=await readJson(request); const type=b.type; const quantity=int(b.quantity,1,100,0); const maxDevices=int(b.max_devices,1,20,0); const prefix=b.prefix||user.prefix||'NHATDUYPN'; if(!TYPES.includes(type)||!quantity||!maxDevices||!validPrefix(prefix))return json({error:'Invalid parameters'},400); if(typeof b.prefix==='string'&&b.prefix!==user.prefix&&b.prefix!=='NHATDUYPN')return json({error:'Custom prefix not allowed'},400);
  const rows=Array.from({length:quantity},()=>({key:generateKey(prefix,type),duration:type,max_devices:maxDevices,expires_at:Date.now()+MS[type],created_by:user.username,creator_platform:'api',deleted:false,activated:false,device_count:0})); const cost=PRICE[type]*quantity;
  const {data,error:e}=await supabase.rpc('create_license_batch',{p_user_id:user.id,p_cost:user.unlimited?0:cost,p_keys:rows}); if(e)return json({error:e.message},e.code==='P0001'?400:500); return json({success:true,keys:data?.keys||rows.map(x=>x.key),credits_remaining:data?.credits_remaining??user.credits,unlimited:!!user.unlimited});
}

export async function verify(request, env) {
  const b=await readJson(request); const key=String(b.key||'').trim(); const hwid=typeof b.hwid==='string'?b.hwid.trim():''; if(!key)return json({error:'Key required'},400); const supabase=getSupabase(env); const {data,error}=await supabase.rpc('verify_license',{p_key:key,p_hwid:hwid||null}); if(error)return json({error:error.message},error.code==='P0001'?400:500); return json(data);
}
