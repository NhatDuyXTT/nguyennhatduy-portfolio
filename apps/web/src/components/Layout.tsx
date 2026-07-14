import type { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 pt-16 pb-10">{children}</main>
      <footer className="border-t border-surface text-center text-sm py-6 text-gray-400">
        © {new Date().getFullYear()} Nguyễn Nhật Duy
      </footer>
    </div>
  );
}
