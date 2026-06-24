'use client'
import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { clsx } from "clsx";
import { runAudit } from "@/lib/audit";
import { saveAuditInput, saveAuditResult } from "@/lib/storage";
import type { AuditInput, TargetMedium, Tone, RiskTolerance, AuditDepth } from "@/lib/types";
import type { ExtractionResult } from "@/app/api/extract/route";

type TabMode = "upload" | "paste" | "section";

const TABS: { id: TabMode; label: string }[] = [
  { id: "upload", label: "Upload Paper" },
  { id: "paste",  label: "Paste Draft"  },
  { id: "section",label: "Section Audit"},
];

const TARGET_MEDIUMS: TargetMedium[] = [
  "Research Essay", "Journal", "Zenodo", "Book Chapter",
  "Personal Website", "X / Social Post", "Private Draft",
];
const TONES: Tone[]             = ["Academic", "Public", "Sharp", "Experimental"];
const RISKS: RiskTolerance[]    = ["Low", "Medium", "High"];
const DEPTHS: AuditDepth[]      = ["Quick Audit", "Full Audit", "Deep Theory Audit"];

const FILE_SIZE_LIMIT = 10 * 1024 * 1024; // 10 MB
const MAX_CHARS = 20_000;

const SETTING_HELP: Record<string, string> = {
  targetMedium: "Adjusts what the audit prioritises — journal submissions require literature contact; social posts flag decontextualisation risk.",
  tone:         "Academic = rigorous. Public = accessible. Sharp = direct diagnosis language. Experimental = tolerates methodological risk.",
  riskTolerance:"Low = conservative framing in revisions. High = accepts bolder claims with acknowledged exposure.",
  auditDepth:   "Quick = top 1-2 issues. Full = all categories. Deep Theory = maximum rigour, ontological and dialectical analysis.",
};

const AUDIT_STEPS = [
  "Parsing conceptual structure…",
  "Evaluating originality and dialectical arc…",
  "Assessing publication risk…",
  "Generating report dossier…",
];

const DRAFT_KEY = "ppa_form_draft";

// ── Field components ──────────────────────────────────────────────────────────

function Label({ htmlFor, children, required }: { htmlFor: string; children: React.ReactNode; required?: boolean }) {
  return (
    <label htmlFor={htmlFor} className="block text-xs text-gray-500 mb-1.5 tracking-wide cursor-pointer">
      {children}{required && <span className="text-accent ml-0.5" aria-hidden="true">*</span>}
    </label>
  );
}

function FieldHint({ text }: { text: string }) {
  return <p className="text-[10px] text-gray-300 mt-1 leading-relaxed italic">{text}</p>;
}

function CharCount({ current, max }: { current: number; max: number }) {
  const pct = current / max;
  const color = pct > 0.95 ? "text-red-400" : pct > 0.8 ? "text-amber-400" : "text-gray-300";
  const words = Math.round(current / 5);
  return (
    <p className={clsx("text-[10px] tabular-nums mt-1 text-right", color)}>
      {current.toLocaleString()} / {max.toLocaleString()} chars · ~{words.toLocaleString()} words
    </p>
  );
}

function Input({ id, className, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { id: string }) {
  return (
    <input
      id={id}
      {...props}
      className={clsx(
        "w-full border border-gray-200 px-3 py-2.5 text-sm text-gray-800 placeholder-gray-300",
        "focus:outline-none focus:border-accent transition-colors min-h-[44px]",
        className,
      )}
    />
  );
}

function Textarea({ id, className, showCount, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { id: string; showCount?: boolean }) {
  const value = typeof props.value === "string" ? props.value : "";
  return (
    <div>
      <textarea
        id={id}
        {...props}
        maxLength={MAX_CHARS}
        className={clsx(
          "w-full border border-gray-200 px-3 py-2.5 text-sm text-gray-800 placeholder-gray-300",
          "focus:outline-none focus:border-accent transition-colors resize-none",
          className,
        )}
      />
      {showCount && <CharCount current={value.length} max={MAX_CHARS} />}
    </div>
  );
}

function Select<T extends string>({
  id, value, onChange, options, "aria-describedby": ariaDescribedby,
}: { id: string; value: T; onChange: (v: T) => void; options: T[]; "aria-describedby"?: string }) {
  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value as T)}
      aria-describedby={ariaDescribedby}
      className="w-full border border-gray-200 px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-accent transition-colors bg-white min-h-[44px]"
    >
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

// ── Extraction preview ────────────────────────────────────────────────────────

function ExtractionPreview({ extraction }: { extraction: ExtractionResult }) {
  const [expanded, setExpanded] = useState(false);
  const text = extraction.extractedText;
  return (
    <div className="border border-gray-100 bg-gray-50" role="region" aria-label="Extracted text preview">
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-[10px] font-bold tracking-wider text-gray-400 shrink-0">{extraction.fileType}</span>
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
        <div className="px-4 py-2 border-b border-amber-100 bg-amber-50 text-xs text-amber-700" role="alert">
          {extraction.warning}
        </div>
      )}
      <div className="px-4 py-3">
        <p className="text-[10px] text-gray-300 uppercase tracking-widest mb-2">Extracted preview</p>
        <p className="text-xs text-gray-500 leading-relaxed font-mono whitespace-pre-wrap break-words">
          {expanded ? text.slice(0, 2000) : text.slice(0, 400)}
          {!expanded && text.length > 400 && "…"}
        </p>
        {text.length > 400 && (
          <button
            type="button"
            onClick={() => setExpanded(e => !e)}
            className="mt-2 text-[10px] text-accent hover:underline min-h-[44px] px-1"
            aria-expanded={expanded}
          >
            {expanded ? "Collapse" : "Show more"}
          </button>
        )}
      </div>
    </div>
  );
}

// ── Loading overlay ───────────────────────────────────────────────────────────

function AuditingOverlay({ onCancel }: { onCancel: () => void }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const intervals = AUDIT_STEPS.map((_, i) =>
      setTimeout(() => setStep(i), i * 7000),
    );
    return () => intervals.forEach(clearTimeout);
  }, []);

  return (
    <div className="border border-gray-100 bg-gray-50 px-6 py-8 text-center" role="status" aria-live="polite">
      <div className="flex items-center justify-center gap-2 mb-4">
        <span className="inline-block w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" aria-hidden="true" />
        <p className="text-xs text-gray-600 font-medium">{AUDIT_STEPS[step]}</p>
      </div>

      <div className="flex items-center gap-1 justify-center mb-5">
        {AUDIT_STEPS.map((_, i) => (
          <div
            key={i}
            className={clsx(
              "h-0.5 w-8 transition-all duration-700",
              i <= step ? "bg-accent" : "bg-gray-200",
            )}
          />
        ))}
      </div>

      <p className="text-[10px] text-gray-300 italic mb-5">
        Performing conceptual analysis. This may take 15–30 seconds.
      </p>

      <button
        type="button"
        onClick={onCancel}
        className="text-[10px] text-gray-400 border border-gray-200 px-4 py-2 hover:border-gray-400 hover:text-gray-600 transition-colors min-h-[44px]"
      >
        Cancel
      </button>
    </div>
  );
}

// ── Main form ─────────────────────────────────────────────────────────────────

type LoadingPhase = "extracting" | "auditing" | null;

const DRAFT_DEFAULTS = {
  title: "", abstract: "", outline: "", mainText: "",
  sectionTitle: "", sectionText: "", prevSummary: "", nextAim: "",
  targetMedium: "Research Essay" as TargetMedium,
  tone: "Academic" as Tone,
  riskTolerance: "Medium" as RiskTolerance,
  auditDepth: "Full Audit" as AuditDepth,
};

export default function AuditForm() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);
  const cancelRef = useRef<AbortController | null>(null);

  const [tab, setTab]               = useState<TabMode>("paste");
  const [loadingPhase, setLoadingPhase] = useState<LoadingPhase>(null);
  const [error, setError]           = useState<string | null>(null);

  const [title, setTitle]           = useState(DRAFT_DEFAULTS.title);
  const [abstract, setAbstract]     = useState(DRAFT_DEFAULTS.abstract);
  const [outline, setOutline]       = useState(DRAFT_DEFAULTS.outline);
  const [mainText, setMainText]     = useState(DRAFT_DEFAULTS.mainText);
  const [sectionTitle, setSectionTitle] = useState(DRAFT_DEFAULTS.sectionTitle);
  const [sectionText, setSectionText]   = useState(DRAFT_DEFAULTS.sectionText);
  const [prevSummary, setPrevSummary]   = useState(DRAFT_DEFAULTS.prevSummary);
  const [nextAim, setNextAim]           = useState(DRAFT_DEFAULTS.nextAim);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [extraction, setExtraction]     = useState<ExtractionResult | null>(null);
  const [extractionError, setExtractionError] = useState<string | null>(null);

  const [targetMedium, setTargetMedium] = useState<TargetMedium>(DRAFT_DEFAULTS.targetMedium);
  const [tone, setTone]                 = useState<Tone>(DRAFT_DEFAULTS.tone);
  const [riskTolerance, setRiskTolerance] = useState<RiskTolerance>(DRAFT_DEFAULTS.riskTolerance);
  const [auditDepth, setAuditDepth]     = useState<AuditDepth>(DRAFT_DEFAULTS.auditDepth);

  // ── Restore draft from localStorage ────────────────────────────────────────
  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (!saved) return;
      const d = JSON.parse(saved);
      if (d.title)         setTitle(d.title);
      if (d.abstract)      setAbstract(d.abstract);
      if (d.outline)       setOutline(d.outline);
      if (d.mainText)      setMainText(d.mainText);
      if (d.sectionTitle)  setSectionTitle(d.sectionTitle);
      if (d.sectionText)   setSectionText(d.sectionText);
      if (d.prevSummary)   setPrevSummary(d.prevSummary);
      if (d.nextAim)       setNextAim(d.nextAim);
      if (d.targetMedium)  setTargetMedium(d.targetMedium);
      if (d.tone)          setTone(d.tone);
      if (d.riskTolerance) setRiskTolerance(d.riskTolerance);
      if (d.auditDepth)    setAuditDepth(d.auditDepth);
      if (d.tab)           setTab(d.tab);
    } catch { /* ignore */ }
  }, []);

  // ── Autosave draft ──────────────────────────────────────────────────────────
  const saveDraft = useCallback(() => {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({
        tab, title, abstract, outline, mainText,
        sectionTitle, sectionText, prevSummary, nextAim,
        targetMedium, tone, riskTolerance, auditDepth,
      }));
    } catch { /* ignore */ }
  }, [tab, title, abstract, outline, mainText, sectionTitle, sectionText,
      prevSummary, nextAim, targetMedium, tone, riskTolerance, auditDepth]);

  useEffect(() => {
    const t = setTimeout(saveDraft, 800);
    return () => clearTimeout(t);
  }, [saveDraft]);

  const isLoading = loadingPhase !== null;

  function showError(msg: string) {
    setError(msg);
    setTimeout(() => errorRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 50);
  }

  function validate(): string | null {
    if (!title.trim()) return "Paper title is required.";
    if (tab === "paste" && !abstract.trim() && !outline.trim() && !mainText.trim())
      return "Paste at least one of: abstract, outline, or main text.";
    if (tab === "section" && !sectionText.trim())
      return "Section text is required.";
    if (tab === "upload") {
      if (!selectedFile)                         return "Please select a file to upload.";
      if (!extraction)                           return "Wait for file extraction to complete.";
      if (!extraction.extractedText.trim())      return "No text extracted. Try pasting the text instead.";
    }
    return null;
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;

    if (f.size > FILE_SIZE_LIMIT) {
      showError(`File is too large (${(f.size / 1024 / 1024).toFixed(1)} MB). Maximum is 10 MB.`);
      e.target.value = "";
      return;
    }

    setSelectedFile(f);
    setExtraction(null);
    setExtractionError(null);
    setError(null);
    setLoadingPhase("extracting");

    try {
      const fd = new FormData();
      fd.append("file", f);
      const res = await fetch("/api/extract", { method: "POST", body: fd });
      if (!res.ok) {
        const err = await res.json() as { error?: string };
        throw new Error(err.error ?? `Extraction failed (${res.status})`);
      }
      setExtraction(await res.json() as ExtractionResult);
    } catch (err) {
      setExtractionError(err instanceof Error ? err.message : "Extraction failed.");
    } finally {
      setLoadingPhase(null);
    }
  }

  function handleCancel() {
    cancelRef.current?.abort();
    setLoadingPhase(null);
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const validationError = validate();
    if (validationError) { showError(validationError); return; }

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
      targetMedium, tone, riskTolerance, auditDepth,
    };

    cancelRef.current = new AbortController();
    setLoadingPhase("auditing");

    try {
      const result = await runAudit(input);
      saveAuditInput(input);
      saveAuditResult(result);
      localStorage.removeItem(DRAFT_KEY);
      router.push("/result");
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      showError(err instanceof Error ? err.message : "Audit failed. Please try again.");
      setLoadingPhase(null);
    }
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <form onSubmit={handleSubmit} className="space-y-8" noValidate>

      {/* Error — top of form */}
      {error && (
        <div
          ref={errorRef}
          role="alert"
          className="border border-red-100 bg-red-50 px-4 py-3 text-xs text-red-600"
        >
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-gray-200" role="tablist">
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            onClick={() => { setTab(id); setError(null); }}
            className={clsx(
              "px-4 py-3 text-xs tracking-wide transition-colors border-b-2 -mb-px min-h-[44px]",
              tab === id
                ? "border-accent text-accent font-medium"
                : "border-transparent text-gray-400 hover:text-gray-600",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Tab: Upload */}
      {tab === "upload" && (
        <div className="space-y-4" role="tabpanel">
          {/* Title first */}
          <div>
            <Label htmlFor="upload-title" required>Paper Title</Label>
            <Input
              id="upload-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter paper title"
              aria-required="true"
            />
          </div>

          {/* File drop zone */}
          <div
            className={clsx(
              "border-2 border-dashed p-8 text-center cursor-pointer transition-colors",
              selectedFile ? "border-accent/30 bg-accent/5" : "border-gray-200 hover:border-gray-300",
            )}
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
            tabIndex={0}
            role="button"
            aria-label="Click to select a file (PDF, DOCX, TXT, or MD, max 10 MB)"
          >
            <p className="text-xs text-gray-400 mb-1">PDF · DOCX · TXT · MD</p>
            <p className="text-[10px] text-gray-300 mb-3">Maximum 10 MB</p>
            <span className="inline-block px-4 py-2 border border-gray-300 text-xs text-gray-600 hover:border-accent hover:text-accent transition-colors">
              {selectedFile ? "Change File" : "Choose File"}
            </span>
            <input
              ref={fileInputRef}
              id="file-upload"
              type="file"
              accept=".pdf,.docx,.txt,.md"
              className="hidden"
              aria-label="Upload paper file"
              onChange={handleFileChange}
            />
            {selectedFile && !extraction && loadingPhase !== "extracting" && (
              <p className="mt-3 text-xs text-gray-500">{selectedFile.name}</p>
            )}
          </div>

          {loadingPhase === "extracting" && (
            <div className="flex items-center gap-2 text-xs text-gray-400 py-2" role="status">
              <span className="inline-block w-3 h-3 border border-accent border-t-transparent rounded-full animate-spin" aria-hidden="true" />
              Extracting text…
            </div>
          )}
          {extractionError && (
            <p className="text-xs text-red-500 bg-red-50 border border-red-100 px-3 py-2" role="alert">
              {extractionError} — Try pasting the text in the Paste Draft tab.
            </p>
          )}
          {extraction && <ExtractionPreview extraction={extraction} />}
        </div>
      )}

      {/* Tab: Paste Draft */}
      {tab === "paste" && (
        <div className="space-y-4" role="tabpanel">
          <div>
            <Label htmlFor="paste-title" required>Title</Label>
            <Input id="paste-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Paper title" aria-required="true" />
          </div>
          <div>
            <Label htmlFor="paste-abstract">Abstract</Label>
            <Textarea id="paste-abstract" value={abstract} onChange={(e) => setAbstract(e.target.value)} rows={4} placeholder="Paste abstract…" showCount />
          </div>
          <div>
            <Label htmlFor="paste-outline">Outline</Label>
            <Textarea id="paste-outline" value={outline} onChange={(e) => setOutline(e.target.value)} rows={4} placeholder="Section structure…" showCount />
          </div>
          <div>
            <Label htmlFor="paste-main">Main Text</Label>
            <Textarea id="paste-main" value={mainText} onChange={(e) => setMainText(e.target.value)} rows={12} placeholder="Paste main body text…" showCount />
          </div>
        </div>
      )}

      {/* Tab: Section Audit */}
      {tab === "section" && (
        <div className="space-y-4" role="tabpanel">
          <div className="border border-gray-100 bg-gray-50 px-4 py-3 mb-2">
            <p className="text-[10px] text-gray-400 leading-relaxed">
              Section Audit evaluates a single section in the context of what came before and what comes next.
              Use this when you want focused conceptual diagnosis on a specific argument or theoretical move.
            </p>
          </div>
          <div>
            <Label htmlFor="sec-paper-title" required>Paper Title</Label>
            <Input id="sec-paper-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Overall paper title" aria-required="true" />
          </div>
          <div>
            <Label htmlFor="sec-title">Section Title</Label>
            <Input id="sec-title" value={sectionTitle} onChange={(e) => setSectionTitle(e.target.value)} placeholder="This section's title" />
          </div>
          <div>
            <Label htmlFor="sec-text" required>Section Text</Label>
            <Textarea id="sec-text" value={sectionText} onChange={(e) => setSectionText(e.target.value)} rows={10} placeholder="Paste the section text…" showCount aria-required="true" />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="sec-prev">Previous Section Summary</Label>
              <Textarea id="sec-prev" value={prevSummary} onChange={(e) => setPrevSummary(e.target.value)} rows={4} placeholder="Brief summary of what came before…" />
            </div>
            <div>
              <Label htmlFor="sec-next">Next Section Aim</Label>
              <Textarea id="sec-next" value={nextAim} onChange={(e) => setNextAim(e.target.value)} rows={4} placeholder="What the next section intends to do…" />
            </div>
          </div>
        </div>
      )}

      {/* Audit Settings */}
      <div className="pt-6 border-t border-gray-100">
        <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400 mb-5">Audit Settings</p>
        <div className="grid sm:grid-cols-2 gap-5">

          <div>
            <Label htmlFor="setting-medium">Target Medium</Label>
            <Select id="setting-medium" value={targetMedium} onChange={setTargetMedium} options={TARGET_MEDIUMS} aria-describedby="hint-medium" />
            <FieldHint text={SETTING_HELP.targetMedium} />
          </div>

          <div>
            <Label htmlFor="setting-tone">Tone</Label>
            <Select id="setting-tone" value={tone} onChange={setTone} options={TONES} aria-describedby="hint-tone" />
            <FieldHint text={SETTING_HELP.tone} />
          </div>

          <div>
            <Label htmlFor="setting-risk">Risk Tolerance</Label>
            <Select id="setting-risk" value={riskTolerance} onChange={setRiskTolerance} options={RISKS} aria-describedby="hint-risk" />
            <FieldHint text={SETTING_HELP.riskTolerance} />
          </div>

          <div>
            <Label htmlFor="setting-depth">Audit Depth</Label>
            <Select id="setting-depth" value={auditDepth} onChange={setAuditDepth} options={DEPTHS} aria-describedby="hint-depth" />
            <FieldHint text={SETTING_HELP.auditDepth} />
          </div>

        </div>
      </div>

      {/* Loading overlay or Submit */}
      {loadingPhase === "auditing" ? (
        <AuditingOverlay onCancel={handleCancel} />
      ) : (
        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-accent text-white text-xs tracking-[0.15em] uppercase hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 min-h-[44px]"
            aria-busy={isLoading}
          >
            {loadingPhase === "extracting" ? (
              <>
                <span className="inline-block w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" aria-hidden="true" />
                Extracting file…
              </>
            ) : (
              "Run Proper Paper Audit"
            )}
          </button>
          <p className="text-[10px] text-gray-200 text-center mt-2 italic">
            Draft is saved automatically.
          </p>
        </div>
      )}

    </form>
  );
}
