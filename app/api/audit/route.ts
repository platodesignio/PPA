import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { SYSTEM_PROMPT, buildUserPrompt } from "@/lib/auditPrompt";
import { runMockAudit } from "@/lib/audit";
import { AuditInputSchema, AuditResultSchema } from "@/lib/schemas";
import type { AuditResult } from "@/lib/types";

export const runtime = "nodejs";

const MODEL = "gpt-4o";
const MAX_TOKENS = 3000;

function extractJson(text: string): string {
  // Strip markdown code fences
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenced) return fenced[1].trim();
  // Find outermost { ... } block
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start !== -1 && end > start) return text.slice(start, end + 1);
  return text.trim();
}

function mockFallback(
  input: Parameters<typeof runMockAudit>[0],
  warnings: string[],
): NextResponse {
  const mock = runMockAudit(input);
  const result: AuditResult = { ...mock, auditSource: "mock", warnings };
  return NextResponse.json({ result, source: "mock" });
}

export async function POST(req: NextRequest) {
  // 1. Parse and validate request body
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = AuditInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid audit input", issues: parsed.error.issues },
      { status: 422 },
    );
  }
  const input = parsed.data;

  // 2. No API key → mock
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return mockFallback(input, ["OPENAI_API_KEY not set — using mock audit."]);
  }

  // 3. Call OpenAI
  let raw = "";
  try {
    const client = new OpenAI({ apiKey });
    const response = await client.chat.completions.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      temperature: 0.3,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: buildUserPrompt(input) },
      ],
    });
    raw = response.choices[0]?.message?.content ?? "";
  } catch (err) {
    console.error("[audit] OpenAI call failed:", err);
    return mockFallback(input, ["OpenAI API call failed — using mock audit."]);
  }

  // 4. Parse JSON (handles fenced blocks and stray text)
  let parsed2: unknown;
  try {
    parsed2 = JSON.parse(extractJson(raw));
  } catch {
    console.error("[audit] JSON parse failed. Raw (first 400):", raw.slice(0, 400));
    return mockFallback(input, ["Model returned unparseable JSON — using mock audit."]);
  }

  // 5. Validate result shape with zod
  const validated = AuditResultSchema.safeParse(parsed2);
  if (!validated.success) {
    console.error("[audit] Result shape invalid:", validated.error.issues);
    return mockFallback(input, ["Model JSON failed schema validation — using mock audit."]);
  }

  const result: AuditResult = {
    ...validated.data,
    totalScore: Math.max(0, Math.min(100, Math.round(validated.data.totalScore))),
    createdAt: new Date().toISOString(),
    auditSource: "real",
  };

  return NextResponse.json({ result, source: "openai" });
}
