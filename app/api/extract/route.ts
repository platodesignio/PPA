import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const MIN_CHARS = 500;
const SUPPORTED = ["txt", "md", "docx", "pdf"] as const;
type SupportedExt = (typeof SUPPORTED)[number];

export interface ExtractionResult {
  fileName: string;
  fileType: string;
  fileSize: number;
  extractedCharacters: number;
  textPreview: string;
  extractedText: string;
  warning?: string;
}

function isSupportedExt(ext: string): ext is SupportedExt {
  return (SUPPORTED as readonly string[]).includes(ext);
}

async function extractText(buffer: Buffer, ext: SupportedExt): Promise<string> {
  switch (ext) {
    case "txt":
    case "md":
      return buffer.toString("utf-8");

    case "docx": {
      const mammoth = await import("mammoth");
      const result = await mammoth.extractRawText({ buffer });
      return result.value;
    }

    case "pdf": {
      const pdfParse = (await import("pdf-parse")).default;
      const result = await pdfParse(buffer);
      return result.text;
    }
  }
}

export async function POST(req: NextRequest) {
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json(
      { error: "Could not parse form data. Ensure Content-Type is multipart/form-data." },
      { status: 400 },
    );
  }

  const file = formData.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "No file provided in field 'file'." }, { status: 400 });
  }

  const fileName = file.name;
  const fileSize = file.size;
  const ext = fileName.split(".").pop()?.toLowerCase() ?? "";

  if (!isSupportedExt(ext)) {
    return NextResponse.json(
      {
        error: `Unsupported file type: .${ext}. Supported types: ${SUPPORTED.join(", ")}.`,
      },
      { status: 415 },
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  let rawText = "";

  try {
    rawText = await extractText(buffer, ext);
  } catch (err) {
    console.error("[extract] Extraction failed:", err);
    return NextResponse.json(
      {
        error:
          "Text extraction failed. The file may be corrupted, encrypted, or scanned (image-only PDF). Try pasting the text directly.",
      },
      { status: 422 },
    );
  }

  // Normalise whitespace
  const extractedText = rawText
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  const extractedCharacters = extractedText.length;
  const textPreview = extractedText.slice(0, 500);

  let warning: string | undefined;
  if (extractedCharacters < MIN_CHARS) {
    warning = `Extracted text is very short (${extractedCharacters} characters). The audit accuracy will be limited. Consider pasting the full text in the Paste Draft tab.`;
  }

  const payload: ExtractionResult = {
    fileName,
    fileType: ext.toUpperCase(),
    fileSize,
    extractedCharacters,
    textPreview,
    extractedText,
    warning,
  };

  return NextResponse.json(payload);
}
