import { Hono } from "hono";

type Bindings = { MEDIA: R2Bucket };

export const media = new Hono<{ Bindings: Bindings }>();

media.get("/", async (c) => {
  const list = await c.env.MEDIA.list();
  const files = list.objects.map((o) => ({
    key: o.key,
    size: o.size,
    uploaded: o.uploaded,
  }));
  return c.json({ success: true, data: files });
});

media.post("/upload", async (c) => {
  const formData = await c.req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return c.json({ success: false, error: "Thiếu file" }, 400);

  const key = `${Date.now()}-${file.name}`;
  await c.env.MEDIA.put(key, await file.arrayBuffer(), {
    httpMetadata: { contentType: file.type },
  });
  return c.json({ success: true, data: { key } });
});

media.delete("/:key", async (c) => {
  await c.env.MEDIA.delete(c.req.param("key"));
  return c.json({ success: true });
});
