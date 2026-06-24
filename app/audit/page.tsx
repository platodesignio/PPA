import AuditForm from "@/components/AuditForm";

export const metadata = {
  title: "Audit",
};

export default function AuditPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <div className="mb-10">
        <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-accent mb-3">Audit</p>
        <h1 className="text-2xl font-light text-gray-900 tracking-tight mb-3">
          Submit Your Paper
        </h1>
        <p className="text-xs text-gray-400 leading-relaxed">
          The audit evaluates conceptual precision, originality, dialectical structure,
          AI-slop resistance, and publication risk. It does not evaluate style.
        </p>
      </div>
      <AuditForm />
    </div>
  );
}
