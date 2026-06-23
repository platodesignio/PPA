'use client'
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { clsx } from "clsx";
import { runAudit } from "@/lib/audit";
import { saveAuditInput, saveAuditResult } from "@/lib/storage";
import type { AuditInput, TargetMedium, Tone, RiskTolerance, AuditDepth } from "@/lib/types";
import type { ExtractionResult } from "@/app/api/extract/route";

type TabMode = "upload" | "paste" | "section";

const TABS: { id: TabMode; label: string }[] = [
  { id: "upload", label: "Upload Paper" },
  { id: "paste", label: "Paste Draft" },
  { id: "section", label: "Section Audit" },
];

const TARGET_MEDIUMS: TargetMedium[] = [
  "Zenodo", "Journal", "Research Essay", "Personal Website",
  "X / Social Post", "Book Chapter", "Private Draft",
];
const TONES: Tone[] = ["Academic", "Public", "Sharp", "Experimental"];
const RISKS: RiskTolerance[] = ["Low", "Medium", "High"];
const DEPTHS: AuditDepth[] = ["Quick Audit", "Full Audit", "Deep Theory Audit"];

// ── Small field components ─────────────────────────────────────────────────
function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-xs text-gray-500 mb-1.5 tracking-wide">
      {children}{required && <span className="text-accent ml-0.5">*</span>}
    </label>
  );
}

function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={clsx(
        "w-full border border-gray-200 px-3 py-2 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:border-accent transition-colors",
        className
      )}
    />
  );
}

function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={clsx(
        "w-full border border-gray-200 px-3 py-2 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:border-accent transition-colors resize-none",
        className
      )}
    />
  );
}

function Select<T extends string>({
  value, onChange, options,
}: { value: T; onChange: (v: T) => void; options: T[] }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as T)}
      className="w-full border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-accent transition-colors bg-white"
    >
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

// ── Extraction preview ─────────────────────────────────────────────────────
function ExtractionPreview({ extraction }: { extraction: ExtractionResult }) {
  const [expanded, setExpanded] = useState(false);
  const text = extraction.extractedText;
  const preview = text.slice(0, 400);

  return (
    <div className="border border-gray-100 bg-gray-50">
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-[10px] font-bold tracking-wider text-gray-400 shrink-0">
            {extraction.fileType}
          </span>
          <span className="text-xs text-gray-600 truncate">{extraction.fileName}</span>
          <span className="text-[10px] text-gray-300 shrink-0 tabular-nums">
            {(extraction.fileSize / 1024).toFixed(1)} KB
          </span>
        </div>
        <span className="text-[10px] text-gray-400 shrink-0 tabular-nums">
          {extraction.extractedCharacters.toLocaleString()} chars
        </span>
      </div>
      {extraction.warning && (
        <div className="px-4 py-2 border-b border-amber-100 bg-amber-50 text-xs text-amber-700">
          {extraction.warning}
        </div>
      )}
      <div className="px-4 py-3">
        <p className="text-[10px] text-gray-300 uppercase tracking-widest mb-2">Extracted preview</p>
        <p className="text-xs text-gray-500 leading-relaxed font-mono whitespace-pre-wrap break-words">
          {expanded ? text.slice(0, 2000) : preview}
          {!expanded && text.length > 400 && "…"}
        </p>
        {text.length > 400 && (
          <button
            type="button"
            onClick={() => setExpanded(e => !e)}
            className="mt-2 text-[10px] text-accent hover:underline"
          >
            {expanded ? "Collapse" : "Show more"}
          </button>
        )}
      </div>
    </div>
  );
}

// ── Main form ──────────────────────────────────────────────────────────────
type LoadingPhase = "extracting" | "auditing" | null;

export default function AuditForm() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [tab, setTab] = useState<TabMode>("paste");
  const [loadingPhase, setLoadingPhase] = useState<LoadingPhase>(null);
  const [error, setError] = useState<string | null>(null);

  // shared
  const [title, setTitle] = useState("");
  // paste
  const [abstract, setAbstract] = useState("");
  const [outline, setOutline] = useState("");
  const [mainText, setMainText] = useState("");
  // section
  const [sectionTitle, setSectionTitle] = useState("");
  const [sectionText, setSectionText] = useState("");
  const [prevSummary, setPrevSummary] = useState("");
  const [nextAim, setNextAim] = useState("");
  // upload
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [extraction, setExtraction] = useState<ExtractionResult | null>(null);
  const [extractionError, setExtractionError] = useState<string | null>(null);

  // settings
  const [targetMedium, setTargetMedium] = useState<TargetMedium>("Zenodo");
  const [tone, setTone] = useState<Tone>("Academic");
  const [riskTolerance, setRiskTolerance] = useState<RiskTolerance>("Medium");
  const [auditDepth, setAuditDepth] = useState<AuditDepth>("Full Audit");

  const isLoading = loadingPhase !== null;

  // Validate: precise per-mode content checks
  function validate(): string | null {
    if (!title.trim()) return "Paper title is required.";
    if (tab === "paste") {
      if (!abstract.trim() && !outline.trim() && !mainText.trim())
        return "Paste at least one of: abstract, outline, or main text.";
    }
    if (tab === "section") {
      if (!sectionText.trim()) return "Section text is required.";
    }
    if (tab === "upload") {
      if (!selectedFile) return "Please select a file to upload.";
      if (!extraction) return "Wait for file extraction to complete before submitting.";
      if (!extraction.extractedText.trim())
        return "No text could be extracted from the file. Try pasting the text in the Paste Draft tab.";
    }
    return null;
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setSelectedFile(f);
    setExtraction(null);
    setExtractionError(null);
    setError(null);

    // Extract immediately on file select
    setLoadingPhase("extracting");
    try {
      const fd = new FormData();
      fd.append("file", f);
      const res = await fetch("/api/extract", { method: "POST", body: fd });
      if (!res.ok) {
        const err = await res.json() as { error?: string };
        throw new Error(err.error ?? `Extraction failed (${res.status})`);
      }
      const data = await res.json() as ExtractionResult;
      setExtraction(data);
    } catch (err) {
      setExtractionError(err instanceof Error ? err.message : "Extraction failed.");
    } finally {
      setLoadingPhase(null);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const validationError = validate();
    if (validationError) { setError(validationError); return; }

    const input: AuditInput = {
      mode: tab,
      title: title.trim(),
      abstract: abstract.trim() || undefined,
      outline: outline.trim() || undefined,
      mainText: (tab === "upload" ? extraction?.extractedText : mainText.trim()) || undefined,
      sectionTitle: sectionTitle.trim() || undefined,
      sectionText: sectionText.trim() || undefined,
      previousSectionSummary: prevSummary.trim() || undefined,
      nextSectionAim: nextAim.trim() || undefined,
      fileName: selectedFile?.name,
      targetMedium,
      tone,
      riskTolerance,
      auditDepth,
    };

    setLoadingPhase("auditing");
    try {
      const result = await runAudit(input);
      saveAuditInput(input);
      saveAuditResult(result);
      router.push("/result");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Audit failed. Please try again.");
      setLoadingPhase(null);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => { setTab(id); setError(null); }}
            className={clsx(
              "px-4 py-2.5 text-xs tracking-wide transition-colors border-b-2 -mb-px",
              tab === id
                ? "border-accent text-accent font-medium"
                : "border-transparent text-gray-400 hover:text-gray-600"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Tab: Upload */}
      {tab === "upload" && (
        <div className="space-y-4">
          <div
            className={clsx(
              "border-2 border-dashed p-8 text-center cursor-pointer transition-colors",
              selectedFile ? "border-accent/30 bg-accent/5" : "border-gray-200 hover:border-gray-300"
            )}
            onClick={() => fileInputRef.current?.click()}
          >
            <p className="text-xs text-gray-400 mb-3">PDF · DOCX · TXT · MD</p>
            <span className="inline-block px-4 py-2 border border-gray-300 text-xs text-gray-600 hover:border-accent hover:text-accent transition-colors">
              {selectedFile ? "Change File" : "Choose File"}
            </span>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.txt,.md"
              className="hidden"
              onChange={handleFileChange}
            />
            {selectedFile && !extraction && loadingPhase !== "extracting" && (
              <p className="mt-3 text-xs text-gray-500">{selectedFile.name}</p>
            )}
          </div>

          {loadingPhase === "extracting" && (
            <div className="flex items-center gap-2 text-xs text-gray-400 py-2">
              <span className="inline-block w-3 h-3 border border-accent border-t-transparent rounded-full animate-spin" />
              Extracting text…
            </div>
          )}
          {extractionError && (
            <p className="text-xs text-red-500 bg-red-50 border border-red-100 px-3 py-2">
              {extractionError}. Try pasting the text in the Paste Draft tab.
            </p>
          )}
          {extraction && <ExtractionPreview extraction={extraction} />}

          <div>
            <Label required>Paper Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter paper title" />
          </div>
        </div>
      )}

      {/* Tab: Paste Draft */}
      {tab === "paste" && (
        <div className="space-y-4">
          <div>
            <Label required>Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Paper title" />
          </div>
          <div>
            <Label>Abstract</Label>
            <Textarea value={abstract} onChange={(e) => setAbstract(e.target.value)} rows={4} placeholder="Paste abstract…" />
          </div>
          <div>
            <Label>Outline</Label>
            <Textarea value={outline} onChange={(e) => setOutline(e.target.value)} rows={4} placeholder="Section structure…" />
          </div>
          <div>
            <Label>Main Text</Label>
            <Textarea value={mainText} onChange={(e) => setMainText(e.target.value)} rows={10} placeholder="Paste main body text…" />
          </div>
        </div>
      )}

      {/* Tab: Section Audit */}
      {tab === "section" && (
        <div className="space-y-4">
          <div>
            <Label required>Paper Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Overall paper title" />
          </div>
          <div>
            <Label>Section Title</Label>
            <Input value={sectionTitle} onChange={(e) => setSectionTitle(e.target.value)} placeholder="This section's title" />
          </div>
          <div>
            <Label required>Section Text</Label>
            <Textarea value={sectionText} onChange={(e) => setSectionText(e.target.value)} rows={10} placeholder="Paste the section text…" />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label>Previous Section Summary</Label>
              <Textarea value={prevSummary} onChange={(e) => setPrevSummary(e.target.value)} rows={3} placeholder="Brief summary of what came before…" />
            </div>
            <div>
              <Label>Next Section Aim</Label>
              <Textarea value={nextAim} onChange={(e) => setNextAim(e.target.value)} rows={3} placeholder="What the next section intends to do…" />
            </div>
          </div>
        </div>
      )}

      {/* Audit Settings */}
      <div className="pt-6 border-t border-gray-100">
        <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-300 mb-5">Audit Settings</p>
        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <Label>Target Medium</Label>
            <Select value={targetMedium} onChange={setTargetMedium} options={TARGET_MEDIUMS} />
          </div>
          <div>
            <Label>Tone</Label>
            <Select value={tone} onChange={setTone} options={TONES} />
          </div>
          <div>
            <Label>Risk Tolerance</Label>
            <Select value={riskTolerance} onChange={setRiskTolerance} options={RISKS} />
          </div>
          <div>
            <Label>Audit Depth</Label>
            <Select value={auditDepth} onChange={setAuditDepth} options={DEPTHS} />
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="border border-red-100 bg-red-50 px-4 py-3 text-xs text-red-600">
          {error}
        </div>
      )}

      {/* Submit */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 bg-accent text-white text-xs tracking-[0.15em] uppercase hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
        >
          {loadingPhase === "auditing" ? (
            <>
              <span className="inline-block w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
              Running Audit…
            </>
          ) : (
            "Run Proper Paper Audit"
          )}
        </button>
        {loadingPhase === "auditing" && (
          <p className="text-center text-xs text-gray-300 mt-3 italic">
            Performing conceptual analysis. This may take 15–30 seconds.
          </p>
        )}
      </div>
    </form>
  );
}
