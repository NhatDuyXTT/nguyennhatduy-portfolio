import { Routes, Route, Link } from "react-router-dom";
import ManageProjects from "./pages/ManageProjects";
import ManageBlog from "./pages/ManageBlog";
import ManageMedia from "./pages/ManageMedia";
import Settings from "./pages/Settings";

// Không có trang /login: Cloudflare Access chặn toàn bộ domain admin.nguyennhatduy.qzz.io
// ở edge, chỉ email được whitelist trong Access Policy mới vào được app này.

export default function App() {
  return (
    <div className="min-h-screen flex">
      <aside className="w-56 bg-surface p-4 space-y-2">
        <h1 className="font-semibold mb-4">Admin</h1>
        <Link to="/" className="block hover:text-accent">Dự án</Link>
        <Link to="/blog" className="block hover:text-accent">Blog</Link>
        <Link to="/media" className="block hover:text-accent">Media</Link>
        <Link to="/settings" className="block hover:text-accent">Cấu hình</Link>
      </aside>
      <main className="flex-1 p-6">
        <Routes>
          <Route path="/" element={<ManageProjects />} />
          <Route path="/blog" element={<ManageBlog />} />
          <Route path="/media" element={<ManageMedia />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>
    </div>
  );
}
