import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { DIALECTIC_SYSTEM_PROMPT, buildDialecticUserPrompt } from "@/lib/dialectic-prompt";
import { DialecticAuditResultSchema } from "@/lib/schemas";

export const runtime = "nodejs";

const MODEL = "gpt-4o";
const MAX_TOKENS = 4000;

function extractJson(text: string): string {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenced) return fenced[1].trim();
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start !== -1 && end > start) return text.slice(start, end + 1);
  return text.trim();
}

export async function POST(req: NextRequest) {
  // 1. Parse request body
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { proposition } = body as { proposition?: string };
  if (!proposition || typeof proposition !== "string" || proposition.trim().length === 0) {
    return NextResponse.json({ error: "命題が入力されていません。" }, { status: 422 });
  }

  // 2. API key check
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY が設定されていません。.env.local を確認してください。" },
      { status: 503 },
    );
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
        { role: "system", content: DIALECTIC_SYSTEM_PROMPT },
        { role: "user", content: buildDialecticUserPrompt(proposition.trim()) },
      ],
    });
    raw = response.choices[0]?.message?.content ?? "";
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: `LLM API呼び出しに失敗しました: ${msg}` },
      { status: 502 },
    );
  }

  // 4. Parse JSON
  let parsed: unknown;
  try {
    parsed = JSON.parse(extractJson(raw));
  } catch {
    return NextResponse.json(
      { error: "モデルから有効なJSONが返されませんでした。再試行してください。" },
      { status: 500 },
    );
  }

  // 5. Validate with Zod (fills defaults for missing optional arrays)
  const validated = DialecticAuditResultSchema.safeParse(parsed);
  if (!validated.success) {
    return NextResponse.json(
      { error: "モデルの出力が期待されたスキーマと一致しませんでした。再試行してください。" },
      { status: 500 },
    );
  }

  return NextResponse.json({ result: validated.data });
}
