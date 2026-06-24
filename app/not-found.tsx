import Link from "next/link";

export default function NotFound() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-24 text-center">
      <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-gray-200 mb-6">404</p>
      <h1 className="text-2xl font-light text-gray-900 tracking-tight mb-4">
        Page not found.
      </h1>
      <p className="text-xs text-gray-400 leading-relaxed mb-10 max-w-sm mx-auto">
        The audit file you are looking for does not exist or has been removed.
        Audit results are stored in your browser only and are not retained between sessions.
      </p>
      <div className="flex items-center justify-center gap-4">
        <Link
          href="/audit"
          className="px-6 py-2.5 bg-accent text-white text-xs tracking-[0.1em] uppercase hover:bg-indigo-700 transition-colors"
        >
          New Audit
        </Link>
        <Link
          href="/"
          className="px-6 py-2.5 border border-gray-200 text-gray-500 text-xs tracking-[0.1em] uppercase hover:border-gray-400 transition-colors"
        >
          Home
        </Link>
      </div>
    </div>
  );
}
