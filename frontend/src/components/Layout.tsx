// App shell: header + footer + page content slot.
// Reads auth token only to switch nav items (no auth logic here).
import { type ReactNode } from "react";
import { Link, NavLink } from "react-router-dom";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const token = localStorage.getItem("token");

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-zinc-900">
      {/* Top bar */}
      <header className="fixed top-0 inset-x-0 z-50 h-20 bg-sky-600 text-white border-b border-sky-700 shadow-md">
        <div className="mx-auto max-w-7xl h-full px-4 md:px-6 flex items-center justify-between">
          <Link to="/" className="font-bold tracking-tight text-xl md:text-2xl">
            VideoBoard
          </Link>

          {/* Minimal primary nav; keeps SPA feel with NavLink active state */}
          <nav className="flex items-center gap-3 md:gap-4">
            {[
              { to: "/", label: "Home" },
              token
                ? { to: "/user/dashboard", label: "Dashboard" }
                : { to: "/sign-in", label: "Sign In" },
            ].map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  [
                    "inline-flex items-center rounded-md px-3 py-2 text-sm md:text-base transition",
                    "hover:bg-white/10 text-white/90 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60",
                    isActive ? "bg-white/15 text-white" : "",
                  ].join(" ")
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      {/* Push content below fixed header */}
      <main className="flex-1 pt-20 w-full">{children}</main>

      {/* Simple footer; no tracking or links here on purpose */}
      <footer className="bg-white border-t border-zinc-200">
        <div className="w-full px-6 py-6 text-center text-sm text-zinc-600">
          © {new Date().getFullYear()} VideoBoard
        </div>
      </footer>
    </div>
  );
}
