import { Routes, Route, Link } from "react-router-dom";
import LicensePanel from "./pages/LicensePanel";

// Không có trang /login: Cloudflare Access chặn toàn bộ domain admin.nguyennhatduy.qzz.io
// ở edge, chỉ email được whitelist trong Access Policy mới vào được app này.

export default function App() {
  return (
    <div className="min-h-screen flex">
      <aside className="w-56 bg-surface p-4 space-y-2">
        <h1 className="font-semibold mb-4">Admin</h1>
        <Link to="/license" className="block hover:text-accent">License / Key</Link>
      </aside>
      <main className="flex-1 p-6">
        <Routes>
          <Route path="/" element={<LicensePanel />} />
          <Route path="/license" element={<LicensePanel />} />
        </Routes>
      </main>
    </div>
  );
}
