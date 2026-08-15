import { Hono } from "hono";

type Bindings = { DB: D1Database };

export const profile = new Hono<{ Bindings: Bindings }>();

// Profile đơn giản, lưu dạng key-value trong D1 (bảng site_config) để chỉnh qua dashboard
profile.get("/", async (c) => {
  const { results } = await c.env.DB.prepare("SELECT key, value FROM site_config").all<{
    key: string;
    value: string;
  }>();
  const config = Object.fromEntries(results.map((r) => [r.key, r.value]));
  return c.json({ success: true, data: config });
});

profile.put("/", async (c) => {
  const body = await c.req.json<Record<string, string>>();
  const stmts = Object.entries(body).map(([key, value]) =>
    c.env.DB.prepare(
      `INSERT INTO site_config (key, value) VALUES (?, ?)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value`
    ).bind(key, value)
  );
  await c.env.DB.batch(stmts);
  return c.json({ success: true });
});
