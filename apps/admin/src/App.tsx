import { Routes, Route, Link } from "react-router-dom";
import LicensePanel from "./pages/LicensePanel";

// Cloudflare Access không được sử dụng. Trang license panel tự xử lý đăng nhập qua License API.

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
