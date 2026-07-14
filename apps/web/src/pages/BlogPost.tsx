import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import type { BlogPost } from "@portfolio/types";
import { apiGet } from "../lib/api";

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);

  useEffect(() => {
    if (slug) apiGet<BlogPost>(`/api/v1/blog/${slug}`).then(setPost);
  }, [slug]);

  if (!post) return <p className="text-gray-400">Đang tải...</p>;

  return (
    <article className="prose prose-invert max-w-none">
      <h1 className="text-3xl font-bold mb-6">{post.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: post.content }} />
    </article>
  );
}
