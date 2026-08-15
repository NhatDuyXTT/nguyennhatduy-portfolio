-- Atomic operations used by the Cloudflare Worker.

create or replace function public.create_license_batch(p_user_id uuid, p_cost bigint, p_keys jsonb)
returns jsonb language plpgsql security definer set search_path=public as $$
declare u public.users%rowtype; item jsonb; inserted_count int := 0;
begin
  select * into u from public.users where id=p_user_id for update;
  if not found or u.status <> 'active' then raise exception 'User not found or inactive' using errcode='P0001'; end if;
  if p_cost < 0 then raise exception 'Invalid cost' using errcode='P0001'; end if;
  if not u.unlimited and u.unlimited_expires_at is not null and u.unlimited_expires_at <= floor(extract(epoch from clock_timestamp())*1000) then
    u.unlimited := false;
    update public.users set unlimited=false, unlimited_expires_at=null where id=u.id;
  end if;
  if p_cost > 0 and not u.unlimited and u.credits < p_cost then raise exception 'Insufficient credits' using errcode='P0001'; end if;
  for item in select * from jsonb_array_elements(p_keys) loop
    insert into public.keys(key,duration,max_devices,expires_at,created_by,creator_platform,deleted,activated,device_count)
    values(item->>'key',item->>'duration',(item->>'max_devices')::int,(item->>'expires_at')::bigint,item->>'created_by',coalesce(item->>'creator_platform','web'),false,false,0);
    inserted_count := inserted_count + 1;
  end loop;
  if p_cost > 0 and not u.unlimited then
    update public.users set credits=credits-p_cost where id=u.id;
    u.credits := u.credits-p_cost;
  end if;
  return jsonb_build_object('keys',(select coalesce(jsonb_agg(key),'[]'::jsonb) from public.keys where key in (select value->>'key' from jsonb_array_elements(p_keys))), 'credits_remaining',u.credits,'inserted',inserted_count);
end $$;

create or replace function public.adjust_credits(p_username text,p_delta bigint)
returns jsonb language plpgsql security definer set search_path=public as $$
declare c bigint;
begin
  if p_delta=0 or p_delta < 0 then raise exception 'Invalid credit delta' using errcode='P0001'; end if;
  update public.users set credits=credits+p_delta where username=p_username and role='reseller' returning credits into c;
  if c is null then raise exception 'Reseller not found' using errcode='P0001'; end if;
  return jsonb_build_object('credits',c);
end $$;

create or replace function public.reset_license_devices(p_key_id uuid)
returns void language plpgsql security definer set search_path=public as $$
begin
 delete from public.license_devices where key_id=p_key_id;
 update public.keys set hwid=null,device_count=0,activated=false,activated_at=null where id=p_key_id;
end $$;

create or replace function public.verify_license(p_key text,p_hwid text)
returns jsonb language plpgsql security definer set search_path=public as $$
declare k public.keys%rowtype; now_ms bigint:=floor(extract(epoch from clock_timestamp())*1000); device_total int:=0; known boolean:=false;
begin
 select * into k from public.keys where key=p_key and deleted=false for update;
 if not found then raise exception 'Key not found' using errcode='P0001'; end if;
 if k.expires_at < now_ms then raise exception 'Key expired' using errcode='P0001'; end if;
 if p_hwid is not null and p_hwid <> '' then
   select count(*)::int into device_total from public.license_devices where key_id=k.id;
   if k.hwid is not null and device_total=0 then
     insert into public.license_devices(key_id,hwid,first_seen_at,last_seen_at) values(k.id,k.hwid,coalesce(k.activated_at,now_ms),now_ms) on conflict do nothing;
     select count(*)::int into device_total from public.license_devices where key_id=k.id;
   end if;
   select exists(select 1 from public.license_devices where key_id=k.id and hwid=p_hwid) into known;
   if not known and device_total >= k.max_devices then raise exception 'Device limit reached' using errcode='P0001'; end if;
   if not known then
     insert into public.license_devices(key_id,hwid,first_seen_at,last_seen_at) values(k.id,p_hwid,now_ms,now_ms);
     device_total:=device_total+1;
   else
     update public.license_devices set last_seen_at=now_ms where key_id=k.id and hwid=p_hwid;
   end if;
   update public.keys set activated=true,activated_at=coalesce(activated_at,now_ms),device_count=device_total,hwid=case when device_total=1 then p_hwid else null end where id=k.id;
   k.activated:=true;k.activated_at:=coalesce(k.activated_at,now_ms);k.device_count:=device_total;
 end if;
 return jsonb_build_object('valid',true,'duration',k.duration,'expires_at',k.expires_at,'max_devices',k.max_devices,'device_count',coalesce(device_total,k.device_count,0));
end $$;

create or replace function public.compensate_keys(p_durations text[],p_days int)
returns jsonb language plpgsql security definer set search_path=public as $$
declare c int;
begin
 update public.keys set expires_at=expires_at+(p_days*86400000) where duration=any(p_durations) and deleted=false and activated=true and expires_at>floor(extract(epoch from clock_timestamp())*1000);
 get diagnostics c=row_count;
 return jsonb_build_object('count',c);
end $$;

create or replace function public.delete_reseller(p_username text)
returns void language plpgsql security definer set search_path=public as $$
begin
 delete from public.keys where created_by=p_username;
 delete from public.users where username=p_username and role='reseller';
end $$;

revoke all on function public.create_license_batch(uuid,bigint,jsonb) from public;
revoke all on function public.adjust_credits(text,bigint) from public;
revoke all on function public.reset_license_devices(uuid) from public;
revoke all on function public.verify_license(text,text) from public;
revoke all on function public.compensate_keys(text[],int) from public;
revoke all on function public.delete_reseller(text) from public;
grant execute on function public.create_license_batch(uuid,bigint,jsonb) to service_role;
grant execute on function public.adjust_credits(text,bigint) to service_role;
grant execute on function public.reset_license_devices(uuid) to service_role;
grant execute on function public.verify_license(text,text) to service_role;
grant execute on function public.compensate_keys(text[],int) to service_role;
grant execute on function public.delete_reseller(text) to service_role;
