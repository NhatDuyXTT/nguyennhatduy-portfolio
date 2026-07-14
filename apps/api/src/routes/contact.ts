import { Hono } from "hono";
import type { Message } from "@portfolio/types";

type Bindings = { DB: D1Database; TURNSTILE_SECRET: string };

export const contact = new Hono<{ Bindings: Bindings }>();

async function verifyTurnstile(token: string, secret: string, ip: string) {
  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ secret, response: token, remoteip: ip }),
  });
  const data = await res.json<{ success: boolean }>();
  return data.success;
}

contact.post("/", async (c) => {
  const body = await c.req.json<
    Omit<Message, "id" | "created_at"> & { turnstileToken: string }
  >();

  const ip = c.req.header("CF-Connecting-IP") ?? "unknown";
  const valid = await verifyTurnstile(body.turnstileToken, c.env.TURNSTILE_SECRET, ip);
  if (!valid) {
    return c.json({ success: false, error: "Xác thực Turnstile thất bại" }, 400);
  }

  if (!body.name || !body.email || !body.message) {
    return c.json({ success: false, error: "Thiếu thông tin bắt buộc" }, 400);
  }

  await c.env.DB.prepare(
    `INSERT INTO messages (name, email, subject, message, created_at) VALUES (?, ?, ?, ?, datetime('now'))`
  )
    .bind(body.name, body.email, body.subject ?? "", body.message)
    .run();

  return c.json({ success: true });
});
