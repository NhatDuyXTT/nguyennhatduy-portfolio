import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import type { Project } from "@portfolio/types";
import { apiGet } from "../lib/api";

export default function ProjectDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [project, setProject] = useState<Project | null>(null);

  useEffect(() => {
    if (slug) apiGet<Project>(`/api/v1/projects/${slug}`).then(setProject);
  }, [slug]);

  if (!project) return <p className="text-gray-400">Đang tải...</p>;

  return (
    <article>
      <h1 className="text-3xl font-bold mb-4">{project.title}</h1>
      <p className="text-gray-400 mb-6">{project.description}</p>
      <div className="flex gap-4">
        {project.github_url && (
          <a href={project.github_url} target="_blank" rel="noreferrer" className="text-accent">
            GitHub
          </a>
        )}
        {project.demo_url && (
          <a href={project.demo_url} target="_blank" rel="noreferrer" className="text-accent">
            Demo
          </a>
        )}
      </div>
    </article>
  );
}
