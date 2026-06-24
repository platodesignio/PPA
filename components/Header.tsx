'use client'
import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";

const NAV = [
  { href: "/audit", label: "Audit" },
  { href: "/method", label: "Method" },
];

export default function Header() {
  const path = usePathname();
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100">
      <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-xs font-bold tracking-[0.25em] uppercase text-accent">PPA</span>
        </Link>
        <nav className="flex items-center gap-6">
          {NAV.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={clsx(
                "text-xs tracking-wide transition-colors",
                path === href ? "text-gray-900 font-medium" : "text-gray-400 hover:text-gray-700"
              )}
            >
              {label}
            </Link>
          ))}
          <Link
            href="/audit"
            className="text-xs px-3 py-1.5 bg-accent text-white tracking-wide hover:bg-indigo-700 transition-colors"
          >
            Start Audit
          </Link>
        </nav>
      </div>
    </header>
  );
}
