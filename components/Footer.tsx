import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-gray-100 py-8 mt-16">
      <div className="max-w-4xl mx-auto px-6 space-y-5">

        {/* Constitutional constraints */}
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold tracking-[0.15em] uppercase text-accent mb-1.5">Proper Paper Audit</p>
            <p className="text-xs text-gray-400 italic mb-1">Score is not judgment. It is an entry point for revision.</p>
            <p className="text-xs text-gray-300">No authors are scored. Proper Paper Audit audits texts, concepts, risks, and revision conditions — never the worth of the writer.</p>
          </div>
          <div className="text-xs text-gray-300 text-right space-y-1 shrink-0">
            <p>Not a writing assistant.</p>
            <p>A conceptual audit engine.</p>
          </div>
        </div>

        {/* Links + method family */}
        <div className="border-t border-gray-50 pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="text-[10px] text-gray-300 hover:text-gray-500 transition-colors">
              Privacy Policy
            </Link>
            <span className="text-gray-100 text-[10px]">·</span>
            <Link href="/terms" className="text-[10px] text-gray-300 hover:text-gray-500 transition-colors">
              Terms of Use
            </Link>
            <span className="text-gray-100 text-[10px]">·</span>
            <Link href="/method" className="text-[10px] text-gray-300 hover:text-gray-500 transition-colors">
              Method
            </Link>
          </div>
          <p className="text-[10px] text-gray-200 italic shrink-0">
            Part of an independent audit philosophy tool family. FEDS Method Family.
          </p>
        </div>

      </div>
    </footer>
  );
}
