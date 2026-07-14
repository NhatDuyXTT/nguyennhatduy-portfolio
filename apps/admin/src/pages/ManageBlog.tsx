import { useEffect, useState } from "react";
import type { BlogPost } from "@portfolio/types";
import { slugify } from "@portfolio/utils";
import { api } from "../lib/api";

const empty = { title: "", content: "", published: false };

export default function ManageBlog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState<number | null>(null);

  function load() {
    api.get<BlogPost[]>("/api/v1/blog").then((res) => setPosts(res.data ?? []));
  }
  useEffect(load, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      title: form.title,
      slug: slugify(form.title),
      content: form.content,
      published_at: form.published ? new Date().toISOString() : null,
    };
    if (editId) await api.put(`/api/v1/blog/${editId}`, payload);
    else await api.post("/api/v1/blog", payload);
    setForm(empty);
    setEditId(null);
    load();
  }

  async function remove(id: number) {
    if (!confirm("Xoá bài viết này?")) return;
    await api.delete(`/api/v1/blog/${id}`);
    load();
  }

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <div>
        <h1 className="text-2xl font-bold mb-4">Quản lý blog</h1>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            placeholder="Tiêu đề"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
            className="w-full bg-surface rounded-lg px-4 py-2"
          />
          <textarea
            placeholder="Nội dung (HTML/Markdown)"
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            required
            rows={8}
            className="w-full bg-surface rounded-lg px-4 py-2"
          />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.published}
              onChange={(e) => setForm({ ...form, published: e.target.checked })}
            />
            Xuất bản ngay
          </label>
          <button className="bg-primary px-4 py-2 rounded-lg">
            {editId ? "Cập nhật" : "Thêm mới"}
          </button>
        </form>
      </div>
      <div>
        <h2 className="text-xl font-semibold mb-4">Danh sách</h2>
        <ul className="space-y-2">
          {posts.map((p) => (
            <li key={p.id} className="bg-surface rounded-lg p-3 flex justify-between items-center">
              <span>{p.title}</span>
              <button onClick={() => remove(p.id)} className="text-red-400 text-sm">Xoá</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
