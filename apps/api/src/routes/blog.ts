import { Hono } from "hono";
import type { BlogPost, ApiResponse } from "@portfolio/types";

type Bindings = { DB: D1Database };

export const blog = new Hono<{ Bindings: Bindings }>();

blog.get("/", async (c) => {
  const { results } = await c.env.DB.prepare(
    "SELECT id, title, slug, published_at FROM blog_posts WHERE published_at IS NOT NULL ORDER BY published_at DESC"
  ).all<Partial<BlogPost>>();
  return c.json({ success: true, data: results });
});

blog.get("/:slug", async (c) => {
  const slug = c.req.param("slug");
  const row = await c.env.DB.prepare("SELECT * FROM blog_posts WHERE slug = ?")
    .bind(slug)
    .first<BlogPost>();
  if (!row) return c.json({ success: false, error: "Not found" }, 404);
  return c.json<ApiResponse<BlogPost>>({ success: true, data: row });
});

blog.post("/", async (c) => {
  const body = await c.req.json<Omit<BlogPost, "id">>();
  const result = await c.env.DB.prepare(
    `INSERT INTO blog_posts (title, slug, content, published_at) VALUES (?, ?, ?, ?)`
  )
    .bind(body.title, body.slug, body.content, body.published_at)
    .run();
  return c.json({ success: true, data: { id: result.meta.last_row_id } });
});

blog.put("/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json<Partial<BlogPost>>();
  await c.env.DB.prepare(
    `UPDATE blog_posts SET title=?, slug=?, content=?, published_at=? WHERE id=?`
  )
    .bind(body.title, body.slug, body.content, body.published_at, id)
    .run();
  return c.json({ success: true });
});

blog.delete("/:id", async (c) => {
  const id = c.req.param("id");
  await c.env.DB.prepare("DELETE FROM blog_posts WHERE id=?").bind(id).run();
  return c.json({ success: true });
});
