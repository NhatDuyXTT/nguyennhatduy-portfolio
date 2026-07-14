# nguyennhatduy.qzz.io

Portfolio cá nhân — React + Vite + Cloudflare (Workers, D1, R2, Pages).
**Toàn bộ setup và deploy chạy qua GitHub Actions — không cần cài wrangler trên máy/điện thoại.**

## Chuẩn bị (chỉ 1 lần)

### 1. Tạo Cloudflare API Token
Dashboard → My Profile → API Tokens → Create Token → template "Edit Cloudflare Workers"
(cần thêm quyền Account.Cloudflare Pages:Edit và Account.Access: Apps and Policies:Edit nếu dùng workflow 5)

### 2. Thêm Secrets vào GitHub repo
Repo → Settings → Secrets and variables → Actions → tab Secrets:
- CLOUDFLARE_API_TOKEN — token bước 1
- CLOUDFLARE_ACCOUNT_ID — Account ID (Dashboard trang chủ)
- TURNSTILE_SECRET — Secret Key từ Turnstile
- ADMIN_EMAIL — email dùng đăng nhập trang admin

### 3. Thêm Variables vào GitHub repo
Cùng chỗ trên, tab Variables:
- VITE_API_URL — https://portfolio-api.<account>.workers.dev (lấy sau khi chạy workflow 4)
- VITE_TURNSTILE_SITE_KEY — Site Key từ Turnstile

## Chạy setup — vào tab Actions, chạy lần lượt theo số thứ tự

1. `1. Setup Infrastructure (D1 + R2)` — tạo D1 database, R2 bucket, 2 Pages project, tự ghi database_id vào wrangler.toml và commit lại
2. `2. Run Database Migration` — tạo bảng trong D1
3. `3. Set Worker Secret (Turnstile)` — đẩy TURNSTILE_SECRET vào Worker
4. `4. Deploy` — build & deploy web/admin/api. Sau khi chạy xong, lấy URL Worker ở log job deploy-api, cập nhật vào Variable VITE_API_URL, rồi chạy lại workflow này 1 lần nữa để web build đúng URL API
5. `5. Setup Domains and Access` — gán domain nguyennhatduy.qzz.io / admin.nguyennhatduy.qzz.io và tạo Cloudflare Access chỉ cho phép ADMIN_EMAIL vào trang admin

(Yêu cầu: domain qzz.io đã được thêm làm zone trong tài khoản Cloudflare trước đó.)

## Từ lần sau

Chỉ cần git push lên main (kể cả sửa trực tiếp trên GitHub web) → workflow "4. Deploy" tự chạy lại, không cần làm gì thêm.

## Cấu trúc

- apps/web — trang public
- apps/admin — dashboard quản trị (bảo vệ bằng Cloudflare Access, không có code login)
- apps/api — Hono API trên Cloudflare Workers (D1 + R2)
- packages/* — types, utils, tailwind preset dùng chung
- .github/workflows/0-manual-wrangler.yml — chạy tay bất kỳ lệnh wrangler nào khi cần (input command)
