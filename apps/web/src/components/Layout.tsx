import { Link } from "react-router-dom";
import type { ReactNode } from "react";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/projects", label: "Projects" },
  { to: "/skills", label: "Skills" },
  { to: "/blog", label: "Blog" },
  { to: "/contact", label: "Contact" },
];

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <nav className="nav-pill text-sm font-medium">
        {navLinks.map((link) => (
          <Link key={link.to} to={link.to} className="hover:text-[#5EA8FF] transition-colors">
            {link.label}
          </Link>
        ))}
      </nav>
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 pt-32 pb-10">{children}</main>
      <footer className="border-t border-surface text-center text-sm py-6 text-gray-400">
        © {new Date().getFullYear()} Nguyễn Nhật Duy
      </footer>
    </div>
  );
}
