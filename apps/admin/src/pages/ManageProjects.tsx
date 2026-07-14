import { useEffect, useState } from "react";
import type { Project } from "@portfolio/types";
import { slugify } from "@portfolio/utils";
import { api } from "../lib/api";

const empty = { title: "", description: "", github_url: "", demo_url: "", thumbnail: "" };

export default function ManageProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState<number | null>(null);

  function load() {
    api.get<Project[]>("/api/v1/projects").then((res) => setProjects(res.data ?? []));
  }
  useEffect(load, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = { ...form, slug: slugify(form.title) };
    if (editId) await api.put(`/api/v1/projects/${editId}`, payload);
    else await api.post("/api/v1/projects", payload);
    setForm(empty);
    setEditId(null);
    load();
  }

  function edit(p: Project) {
    setEditId(p.id);
    setForm({
      title: p.title,
      description: p.description,
      github_url: p.github_url ?? "",
      demo_url: p.demo_url ?? "",
      thumbnail: p.thumbnail ?? "",
    });
  }

  async function remove(id: number) {
    if (!confirm("Xoá dự án này?")) return;
    await api.delete(`/api/v1/projects/${id}`);
    load();
  }

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <div>
        <h1 className="text-2xl font-bold mb-4">Quản lý dự án</h1>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            placeholder="Tiêu đề"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
            className="w-full bg-surface rounded-lg px-4 py-2"
          />
          <textarea
            placeholder="Mô tả"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            required
            className="w-full bg-surface rounded-lg px-4 py-2"
          />
          <input
            placeholder="GitHub URL"
            value={form.github_url}
            onChange={(e) => setForm({ ...form, github_url: e.target.value })}
            className="w-full bg-surface rounded-lg px-4 py-2"
          />
          <input
            placeholder="Demo URL"
            value={form.demo_url}
            onChange={(e) => setForm({ ...form, demo_url: e.target.value })}
            className="w-full bg-surface rounded-lg px-4 py-2"
          />
          <button className="bg-primary px-4 py-2 rounded-lg">
            {editId ? "Cập nhật" : "Thêm mới"}
          </button>
        </form>
      </div>
      <div>
        <h2 className="text-xl font-semibold mb-4">Danh sách</h2>
        <ul className="space-y-2">
          {projects.map((p) => (
            <li key={p.id} className="bg-surface rounded-lg p-3 flex justify-between items-center">
              <span>{p.title}</span>
              <div className="flex gap-2 text-sm">
                <button onClick={() => edit(p)} className="text-accent">Sửa</button>
                <button onClick={() => remove(p.id)} className="text-red-400">Xoá</button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
