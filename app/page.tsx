import Link from "next/link";

const AUDIT_CATEGORIES = [
  {
    number: "01",
    title: "Concept Audit",
    desc: "Are the central concepts defined, bounded, and operationally used — or do they function as vague metaphors?",
  },
  {
    number: "02",
    title: "Originality Audit",
    desc: "Does the paper produce a genuine conceptual contribution, or pseudo-originality through new terminology without methodological force?",
  },
  {
    number: "03",
    title: "Dialectical Structure Audit",
    desc: "Does the paper move from problem through contradiction toward generative theoretical form — or does it merely present positions?",
  },
  {
    number: "04",
    title: "AI-Slop Risk Audit",
    desc: "Does the writing generate conceptual necessity, or fluent emptiness? Undefined neologisms, abstract-word inflation, arguments that sound intelligent without producing thought.",
  },
  {
    number: "05",
    title: "Publication Risk Audit",
    desc: "Can the paper survive public reason, academic scrutiny, misreading, and platform-specific interpretation?",
  },
  {
    number: "06",
    title: "Freedom-Generation Audit",
    desc: "Does the paper open possibilities for thought, responsibility, and difference — or does it close them through classification and scorification?",
  },
];

const INPUT_MODES = [
  { label: "Upload Paper", desc: "PDF, DOCX, TXT, or Markdown" },
  { label: "Paste Draft", desc: "Title, abstract, outline, main text" },
  { label: "Section Audit", desc: "Audit a single section in context" },
];

const EXAMPLE_SCORES = [
  { label: "Conceptual Precision", value: 71, color: "#3730a3" },
  { label: "Originality", value: 84, color: "#3730a3" },
  { label: "AI-Slop Resistance", value: 89, color: "#22c55e" },
  { label: "Metaphysical Inflation Risk", value: 38, color: "#eab308", risk: true },
  { label: "Publication Readiness", value: 67, color: "#3730a3" },
];

export default function HomePage() {
  return (
    <div className="max-w-4xl mx-auto px-6">

      {/* Hero */}
      <section className="pt-20 pb-16 border-b border-gray-100">
        <div className="max-w-2xl">
          <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-accent mb-6">
            Proper Paper Audit
          </p>
          <h1 className="text-3xl sm:text-4xl font-light text-gray-900 leading-tight tracking-tight mb-6">
            Does your paper generate thought,<br />
            <span className="text-gray-400">or only arrange language?</span>
          </h1>
          <p className="text-sm text-gray-500 leading-relaxed mb-2 max-w-xl">
            A conceptual audit engine for originality, conceptual precision, dialectical structure,
            AI-slop resistance, public risk, and publication readiness.
          </p>
          <p className="text-xs text-gray-300 mb-6">
            Not a writing assistant. A conceptual audit engine.
          </p>
          <p className="text-xs text-gray-400 mb-10 border-l border-gray-100 pl-4">
            Open a paper audit file or begin a new conceptual audit.
          </p>
          <div className="flex items-center gap-4">
            <Link
              href="/audit"
              className="inline-block px-6 py-2.5 bg-accent text-white text-xs tracking-[0.1em] uppercase hover:bg-indigo-700 transition-colors"
            >
              Start Audit
            </Link>
            <Link
              href="/method"
              className="inline-block px-6 py-2.5 border border-gray-200 text-gray-500 text-xs tracking-[0.1em] uppercase hover:border-gray-400 hover:text-gray-700 transition-colors"
            >
              View Method
            </Link>
          </div>
        </div>
      </section>

      {/* Methodological Axioms */}
      <section className="py-10 border-b border-gray-100">
        <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-gray-200 mb-5">Methodological Axioms</p>
        <div className="space-y-2">
          {[
            "No authors are scored.",
            "Score is not judgment.",
            "Originality is not terminology density.",
            "A concept that can mean anything means nothing.",
          ].map((axiom) => (
            <div key={axiom} className="flex gap-3 text-xs text-gray-400 leading-relaxed">
              <span className="text-gray-200 shrink-0">—</span>
              <span className="italic">{axiom}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Input Modes */}
      <section className="py-14 border-b border-gray-100">
        <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-gray-300 mb-8">Three Input Modes</p>
        <div className="grid sm:grid-cols-3 gap-px bg-gray-100">
          {INPUT_MODES.map(({ label, desc }) => (
            <div key={label} className="bg-white p-6">
              <p className="text-xs font-semibold text-gray-800 mb-2">{label}</p>
              <p className="text-xs text-gray-400 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Audit Categories */}
      <section className="py-14 border-b border-gray-100">
        <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-gray-300 mb-8">Audit Categories</p>
        <div className="grid sm:grid-cols-2 gap-8">
          {AUDIT_CATEGORIES.map(({ number, title, desc }) => (
            <div key={number} className="flex gap-4">
              <span className="text-[10px] font-bold text-gray-200 mt-0.5 shrink-0">{number}</span>
              <div>
                <p className="text-xs font-semibold text-gray-800 mb-1.5">{title}</p>
                <p className="text-xs text-gray-400 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Example Report Preview */}
      <section className="py-14 border-b border-gray-100">
        <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-gray-300 mb-8">Example Report Preview</p>
        <div className="border border-gray-100 p-6 sm:p-8">
          {/* Total */}
          <div className="flex items-baseline justify-between mb-6 pb-6 border-b border-gray-100">
            <div>
              <p className="text-[10px] tracking-[0.2em] uppercase text-gray-300 mb-1">Total Audit Score</p>
              <p className="text-4xl font-extralight text-gray-900 tabular-nums">84</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-medium text-accent mb-1">Publishable with conceptual tightening</p>
              <p className="text-xs text-gray-400 italic max-w-xs">
                High conceptual energy. Insufficient operational discipline.
              </p>
            </div>
          </div>
          {/* Scores */}
          <div className="space-y-3">
            {EXAMPLE_SCORES.map(({ label, value, color, risk }) => (
              <div key={label}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-500">{label}</span>
                  <span className="text-xs font-bold tabular-nums" style={{ color }}>
                    {value}
                  </span>
                </div>
                <div className="h-0.5 bg-gray-100 rounded-full">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${value}%`, backgroundColor: color }}
                  />
                </div>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-gray-300 text-center mt-6 italic">
            Score is not judgment. It is an entry point for revision.
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 text-center">
        <p className="text-sm text-gray-400 leading-relaxed max-w-lg mx-auto mb-8">
          A paper is not ready when it sounds intelligent.<br />
          It is ready when its concepts can survive use, critique, and public reason.
        </p>
        <Link
          href="/audit"
          className="inline-block px-8 py-3 bg-accent text-white text-xs tracking-[0.15em] uppercase hover:bg-indigo-700 transition-colors"
        >
          Audit before publication
        </Link>
      </section>

    </div>
  );
}
