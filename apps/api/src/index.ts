import { Hono } from "hono";
import { cors } from "hono/cors";
import { projects } from "./routes/projects";
import { blog } from "./routes/blog";
import { profile } from "./routes/profile";
import { contact } from "./routes/contact";
import { media } from "./routes/media";
import { requireCloudflareAccess } from "./middleware/access";

type Bindings = { DB: D1Database; MEDIA: R2Bucket; TURNSTILE_SECRET: string };

const app = new Hono<{ Bindings: Bindings }>();

app.use(
  "*",
  cors({
    origin: ["https://nguyennhatduy.qzz.io"],
    allowMethods: ["GET", "POST", "PUT", "DELETE"],
  })
);

// Bảo vệ mọi request ghi dữ liệu (POST/PUT/DELETE) bằng Cloudflare Access.
// Access policy được cấu hình trên Cloudflare Dashboard cho path /api/v1/*
// với method != GET, hoặc tách riêng path /api/v1/admin/* nếu muốn rõ ràng hơn.
app.use("/api/v1/*", async (c, next) => {
  const isPublicWrite = c.req.path.startsWith("/api/v1/contact");
  const isMutation = ["POST", "PUT", "DELETE"].includes(c.req.method);
  if (isMutation && !isPublicWrite) {
    return requireCloudflareAccess(c, next);
  }
  await next();
});

app.route("/api/v1/projects", projects);
app.route("/api/v1/blog", blog);
app.route("/api/v1/profile", profile);
app.route("/api/v1/contact", contact); // contact luôn public, không qua Access

app.use("/api/v1/media/*", requireCloudflareAccess);
app.route("/api/v1/media", media);

app.get("/api/v1/health", (c) => c.json({ success: true, status: "ok" }));

export default app;
