import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { BlogPost } from "@portfolio/types";
import { apiGet } from "../lib/api";
import { formatDate } from "@portfolio/utils";

export default function Blog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    apiGet<BlogPost[]>("/api/v1/blog").then((data) => setPosts(data ?? []));
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Blog</h1>
      <div className="space-y-4">
        {posts.map((post) => (
          <Link key={post.id} to={`/blog/${post.slug}`} className="block">
            <h2 className="text-xl font-semibold hover:text-accent">{post.title}</h2>
            {post.published_at && (
              <p className="text-gray-500 text-sm">{formatDate(post.published_at)}</p>
            )}
          </Link>
        ))}
        {posts.length === 0 && <p className="text-gray-500">Chưa có bài viết nào.</p>}
      </div>
    </div>
  );
}
