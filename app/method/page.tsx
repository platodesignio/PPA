import Link from "next/link";

export const metadata = {
  title: "Method — Proper Paper Audit",
};

const PILLARS = [
  {
    number: "01",
    title: "Concept Audit",
    body: `Concept Audit examines whether the central concepts are defined, bounded, and used properly rather than functioning as vague metaphors or total explanations. A concept that can mean anything means nothing. The audit asks: can you state what the concept excludes? Can you say what would count as evidence against the claim? If the answer is no, the concept is functioning as a metaphor, not an analytical instrument.`,
  },
  {
    number: "02",
    title: "Originality Audit",
    body: `Originality Audit distinguishes genuine conceptual contribution from pseudo-originality produced by new terminology without methodological force. The invention of a term is not a contribution. The contribution is in what the term makes possible: new distinctions, new questions, new operations on evidence. The audit asks whether the paper's originality is terminological or methodological.`,
  },
  {
    number: "03",
    title: "Dialectical Structure Audit",
    body: `Dialectical Structure Audit examines whether the paper moves from problem, contradiction, mediation, and reconstruction toward a generative theoretical form. A paper that merely presents positions has not done philosophical work. The audit examines whether the paper earns its conclusions through dialectical movement — not through assertion, not through citation, but through the logic of the argument itself.`,
  },
  {
    number: "04",
    title: "AI-Slop Risk Audit",
    body: `AI-Slop Risk Audit detects fluent but empty writing, abstract-word inflation, undefined neologisms, and arguments that sound intelligent without producing conceptual necessity. The signature of AI-slop is not grammatical error but argumentative vagueness: prose that flows without generating thought. The audit asks whether each paragraph produces a conceptual outcome — a distinction, a constraint, a question — or merely performs intellectual activity.`,
  },
  {
    number: "05",
    title: "Publication Risk Audit",
    body: `Publication Risk Audit evaluates whether the paper can survive public reason, academic scrutiny, misreading, controversy, and platform-specific interpretation. Publication is not only a matter of quality but of exposure. The audit evaluates whether the paper's claims are bounded against essentialism, whether the theory can survive being applied incorrectly, and whether the argument can be understood by a hostile reader without collapsing into something the author did not intend.`,
  },
  {
    number: "06",
    title: "Freedom-Generation Audit",
    body: `Freedom-Generation Audit asks whether the paper opens possibilities for thought, responsibility, re-entry, and difference-preservation, or whether it closes them through classification, management, and scorification. Critical theory itself can become a management apparatus. A paper that claims to audit freedom must itself be audited for whether its audit grammar generates or constrains the freedom of those it addresses.`,
  },
];

const PRINCIPLES = [
  "Score is not judgment. It is an entry point for revision.",
  "Originality is not the density of neologisms but the force of new distinctions.",
  "The value of a paper lies not in its fluency but in the usability of its concepts.",
  "A paper that can explain everything explains nothing.",
  "Critical theory must audit itself for the risk of becoming a management apparatus.",
  "Public risk is not a property of the audience. It is a property of the argument's vulnerability to misreading.",
];

export default function MethodPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <div className="mb-12">
        <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-accent mb-3">Method</p>
        <h1 className="text-2xl font-light text-gray-900 tracking-tight mb-4">
          The Audit Method
        </h1>
        <p className="text-xs text-gray-500 leading-relaxed max-w-xl">
          Proper Paper Audit does not evaluate style, grammar, or citation count.
          It evaluates whether the paper generates thought — whether its concepts are
          usable, its structure is dialectical, and its claims can survive use and public reason.
        </p>
      </div>

      {/* Five Pillars */}
      <div className="space-y-10 mb-16">
        {PILLARS.map(({ number, title, body }) => (
          <div key={number} className="flex gap-6 pb-10 border-b border-gray-100 last:border-0">
            <span className="text-[10px] font-bold text-gray-200 mt-1 shrink-0 w-6">{number}</span>
            <div>
              <h2 className="text-sm font-semibold text-gray-800 mb-3">{title}</h2>
              <p className="text-xs text-gray-500 leading-relaxed">{body}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Constitutional Principles */}
      <div className="border-t border-gray-100 pt-10">
        <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-300 mb-6">
          Constitutional Principles
        </p>
        <div className="space-y-3">
          {PRINCIPLES.map((p, i) => (
            <div key={i} className="flex gap-4 text-xs text-gray-500 leading-relaxed">
              <span className="text-gray-200 shrink-0">—</span>
              <span className="italic">{p}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Method family note */}
      <div className="mt-12 border border-gray-100 bg-gray-50 px-6 py-5">
        <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-300 mb-3">
          From the FEDS Method Family
        </p>
        <p className="text-xs text-gray-400 leading-relaxed max-w-xl">
          Proper Paper Audit applies audit philosophy to papers, concepts, and research manuscripts.
          It does not score authors. It audits texts, concepts, risks, and revision conditions.
          It belongs to the same method family as FEDS Studio, which audits systems, institutions,
          policies, and technologies — but the two instruments address different objects and
          produce different reports.
        </p>
        <p className="text-[10px] text-gray-300 mt-3 italic">
          Same audit philosophy family. Separate products. Separate targets. Separate reports.
        </p>
      </div>

      {/* CTA */}
      <div className="mt-10 pt-8 border-t border-gray-100 flex items-center gap-4">
        <Link
          href="/audit"
          className="px-6 py-2.5 bg-accent text-white text-xs tracking-[0.1em] uppercase hover:bg-indigo-700 transition-colors"
        >
          Start Audit
        </Link>
        <p className="text-xs text-gray-300 italic">
          Audit before publication.
        </p>
      </div>
    </div>
  );
}
