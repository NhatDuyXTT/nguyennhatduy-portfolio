import type { Context, Next } from "hono";

/**
 * Xác thực request từ Cloudflare Access.
 * Khi bật CF Access trước Worker route (/api/v1/admin/*), CF sẽ tự chèn
 * header "Cf-Access-Jwt-Assertion" sau khi user đăng nhập qua Access policy.
 * Middleware này chỉ cần kiểm tra header tồn tại — việc verify JWT
 * đã được Cloudflare Access thực hiện ở edge trước khi request tới Worker.
 * KHÔNG cần tự viết logic OAuth/JWT signing.
 */
export async function requireCloudflareAccess(c: Context, next: Next) {
  const jwt = c.req.header("Cf-Access-Jwt-Assertion");
  if (!jwt) {
    return c.json({ success: false, error: "Unauthorized" }, 401);
  }
  // Optional: decode payload để lấy email người đăng nhập (không cần verify chữ ký,
  // vì Access đã verify trước khi request đến được đây)
  const email = c.req.header("Cf-Access-Authenticated-User-Email");
  c.set("userEmail", email ?? "unknown");
  await next();
}
