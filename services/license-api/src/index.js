import { json, withCors } from './lib/http.js';
import * as Auth from './routes/auth.js';
import * as Keys from './routes/keys.js';
import * as Public from './routes/public.js';
import * as Resellers from './routes/resellers.js';

const routes = new Map([
 ['POST /api/login', Auth.login], ['GET /api/me', Auth.me], ['POST /api/admin/setup-telegram-webhook', Auth.setupTelegram],
 ['GET /api/keys', Keys.listKeys], ['POST /api/keys/generate', Keys.generateKeys], ['POST /api/keys/update', Keys.updateKey], ['POST /api/keys/reset', Keys.resetKey], ['POST /api/keys/delete', Keys.deleteKey], ['POST /api/keys/restore', Keys.restoreKey], ['POST /api/keys/clean-expired', Keys.cleanExpired], ['POST /api/keys/compensate', Keys.compensate],
 ['POST /api/public/generate', Public.publicGenerate], ['POST /api/public/verify', Public.verify],
 ['GET /api/resellers', Resellers.listResellers], ['POST /api/reseller/create', Resellers.createReseller], ['POST /api/reseller/topup', Resellers.topup], ['POST /api/reseller/upgrade', Resellers.upgrade], ['POST /api/reseller/downgrade', Resellers.downgrade], ['POST /api/reseller/toggle-api', Resellers.toggleApi], ['POST /api/reseller/toggle', Resellers.toggleStatus], ['POST /api/reseller/login-as', Resellers.loginAs], ['POST /api/reseller/delete', Resellers.deleteReseller], ['POST /api/reseller/prefix', Resellers.setPrefix], ['POST /api/reseller/regen-api-key', Resellers.regenApiKey]
]);

export default {
 async fetch(request, env) {
   const cors = withCors(new Response(null), request, env);
   if (request.method === 'OPTIONS') return cors;
   const url = new URL(request.url);
   // When deployed behind the admin hostname, Cloudflare routes requests
   // under /license-api/* to this Worker. Strip the prefix so the original
   // /api/* routes remain unchanged.
   const pathname = url.pathname.startsWith('/license-api')
     ? (url.pathname.slice('/license-api'.length) || '/')
     : url.pathname;
   if (request.method === 'GET' && pathname === '/health') return withCors(json({ok:true,service:'nhatduypn-api',timestamp:Date.now()}),request,env);
   const handler = routes.get(`${request.method} ${pathname}`);
   if (!handler) return withCors(json({error:'Not found'},404),request,env);
   try { return withCors(await handler(request,env),request,env); }
   catch (e) { console.error(e); return withCors(json({error:'Internal server error'},500),request,env); }
 }
};
