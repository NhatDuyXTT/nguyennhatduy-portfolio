import type { ReactNode } from "react";
import { Link } from "react-router-dom";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 pt-16 pb-10">{children}</main>
      <footer className="border-t border-surface text-center text-sm py-6 text-gray-400 space-x-4">
        <span>© {new Date().getFullYear()} Nguyễn Nhật Duy</span>
        <Link to="/tools/tiktok-downloader" className="hover:text-[#4EA8FF]">
          TikTok Downloader
        </Link>
      </footer>
    </div>
  );
}
