import { useEffect, useState, type ChangeEvent } from "react";
import { api } from "../lib/api";

interface MediaFile {
  key: string;
  size: number;
  uploaded: string;
}

export default function ManageMedia() {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [uploading, setUploading] = useState(false);

  function load() {
    api.get<MediaFile[]>("/api/v1/media").then((res) => setFiles(res.data ?? []));
  }
  useEffect(load, []);

  async function handleUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    const API_BASE = import.meta.env.VITE_API_URL ?? "https://api.nguyennhatduy.qzz.io";
    await fetch(`${API_BASE}/api/v1/media/upload`, {
      method: "POST",
      credentials: "include",
      body: formData,
    });
    setUploading(false);
    load();
  }

  async function remove(key: string) {
    if (!confirm("Xoá file này?")) return;
    await api.delete(`/api/v1/media/${key}`);
    load();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Quản lý media</h1>
      <input type="file" onChange={handleUpload} disabled={uploading} className="mb-6" />
      <ul className="space-y-2">
        {files.map((f) => (
          <li key={f.key} className="bg-surface rounded-lg p-3 flex justify-between items-center">
            <span className="text-sm">{f.key} ({Math.round(f.size / 1024)} KB)</span>
            <button onClick={() => remove(f.key)} className="text-red-400 text-sm">Xoá</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
