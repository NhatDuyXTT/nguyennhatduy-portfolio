import { Hono } from "hono";
import type { Project, ApiResponse } from "@portfolio/types";

type Bindings = { DB: D1Database };

export const projects = new Hono<{ Bindings: Bindings }>();

// GET /api/v1/projects
projects.get("/", async (c) => {
  const { results } = await c.env.DB.prepare(
    "SELECT * FROM projects ORDER BY created_at DESC"
  ).all<Project>();
  return c.json<ApiResponse<Project[]>>({ success: true, data: results });
});

// GET /api/v1/projects/:slug
projects.get("/:slug", async (c) => {
  const slug = c.req.param("slug");
  const row = await c.env.DB.prepare("SELECT * FROM projects WHERE slug = ?")
    .bind(slug)
    .first<Project>();
  if (!row) {
    return c.json<ApiResponse<null>>({ success: false, error: "Not found" }, 404);
  }
  return c.json<ApiResponse<Project>>({ success: true, data: row });
});

// POST /api/v1/projects (admin only - bảo vệ bởi Cloudflare Access ở index.ts)
projects.post("/", async (c) => {
  const body = await c.req.json<Omit<Project, "id" | "created_at">>();
  const result = await c.env.DB.prepare(
    `INSERT INTO projects (title, slug, description, thumbnail, github_url, demo_url, created_at)
     VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`
  )
    .bind(body.title, body.slug, body.description, body.thumbnail, body.github_url, body.demo_url)
    .run();
  return c.json<ApiResponse<{ id: number }>>({
    success: true,
    data: { id: result.meta.last_row_id as number },
  });
});

// PUT /api/v1/projects/:id (admin only)
projects.put("/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json<Partial<Project>>();
  await c.env.DB.prepare(
    `UPDATE projects SET title=?, slug=?, description=?, thumbnail=?, github_url=?, demo_url=? WHERE id=?`
  )
    .bind(body.title, body.slug, body.description, body.thumbnail, body.github_url, body.demo_url, id)
    .run();
  return c.json<ApiResponse<null>>({ success: true });
});

// DELETE /api/v1/projects/:id (admin only)
projects.delete("/:id", async (c) => {
  const id = c.req.param("id");
  await c.env.DB.prepare("DELETE FROM projects WHERE id=?").bind(id).run();
  return c.json<ApiResponse<null>>({ success: true });
});
