import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { Project } from "@portfolio/types";
import { apiGet } from "../lib/api";

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet<Project[]>("/api/v1/projects").then((data) => {
      setProjects(data ?? []);
      setLoading(false);
    });
  }, []);

  if (loading) return <p className="text-gray-400">Đang tải dự án...</p>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dự án</h1>
      <div className="grid md:grid-cols-2 gap-6">
        {projects.map((p) => (
          <Link
            key={p.id}
            to={`/projects/${p.slug}`}
            className="block glass-card"
          >
            <h2 className="text-xl font-semibold mb-2">{p.title}</h2>
            <p className="text-gray-400 text-sm">{p.description}</p>
          </Link>
        ))}
        {projects.length === 0 && (
          <p className="text-gray-500 col-span-2">Chưa có dự án nào.</p>
        )}
      </div>
    </div>
  );
}
