import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

const DEFAULT_BASE_URL = "https://ai.xyrusrouter.my.id/v1";

const ALLOWED_MODELS = new Set([
  "xyrz/gpt-5.6-luna",
  "xyrz/gpt-5.6-sol",
  "xyrz/gpt-5.6-terra",
  "xyrz/gpt-5.5",
  "xyrz/gpt-5.5-review",
  "xyrz/minimax-m2.1",
  "xyrz/minimax-m3",
  "xyrz/glm-5.1",
  "xyrz/glm-5.3",
  "xyrz/glm-5.3-flash",
  "xyrz/kimi-k2.7-code",
  "xyrz/kimi-k3",
  "xyrz/deepseek-v4-flash",
  "xyrz/deepseek-v4-pro",
  "xyrz/deepsek-4.1-flash",
  "xyrz/claude-fable-5",
  "xyrz/claude-fable5.1",
  "xyrz/claude-opus-4.7",
  "xyrz/claude-opus-5",
  "xyrz/claude-opus-5.5",
  "xyrz/gpt-6-astra",
  "xyrz/gpt-6-luna",
  "xyrz/qwen3.7-max",
  "xyrz/qwen3.7-plus",
  "xyrz/qwen3.8-max-preview",
  "xyrz/gemini-4-argon",
  "xyrz/muse-spark-1.3"
]);

const MAX_MESSAGES = 40;
const MAX_MESSAGE_LENGTH = 24000;
const MAX_TOTAL_LENGTH = 80000;

export async function POST(request) {
  const apiKey = process.env.XYRUS_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "API key belum dikonfigurasi. Tambahkan XYRUS_API_KEY di Vercel."
      },
      { status: 500 }
    );
  }

  let payload;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Format request tidak valid." },
      { status: 400 }
    );
  }

  const model = payload?.model;

  if (
    typeof model !== "string" ||
    !ALLOWED_MODELS.has(model)
  ) {
    return NextResponse.json(
      { error: "Model tidak tersedia dalam daftar ZEROX AI." },
      { status: 400 }
    );
  }

  if (
    !Array.isArray(payload?.messages) ||
    payload.messages.length < 1 ||
    payload.messages.length > MAX_MESSAGES
  ) {
    return NextResponse.json(
      { error: "Jumlah pesan tidak valid." },
      { status: 400 }
    );
  }

  let totalLength = 0;

  const messages = [];

  for (const message of payload.messages) {
    const role = message?.role;
    const content = message?.content;

    if (
      !["system", "user", "assistant"].includes(role) ||
      typeof content !== "string"
    ) {
      return NextResponse.json(
        { error: "Format pesan tidak valid." },
        { status: 400 }
      );
    }

    if (content.length > MAX_MESSAGE_LENGTH) {
      return NextResponse.json(
        { error: "Satu pesan terlalu panjang." },
        { status: 413 }
      );
    }

    totalLength += content.length;

    if (totalLength > MAX_TOTAL_LENGTH) {
      return NextResponse.json(
        { error: "Total konteks terlalu panjang." },
        { status: 413 }
      );
    }

    if (content.trim()) {
      messages.push({ role, content });
    }
  }

  if (!messages.length) {
    return NextResponse.json(
      { error: "Pesan kosong." },
      { status: 400 }
    );
  }

  const baseUrl = (
    process.env.XYRUS_BASE_URL || DEFAULT_BASE_URL
  ).replace(/\/+$/, "");

  let upstream;

  try {
    upstream = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages,
        stream: true
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(55000)
    });
  } catch {
    return NextResponse.json(
      {
        error:
          "Gateway tidak dapat dihubungi. Periksa koneksi atau coba lagi nanti."
      },
      { status: 502 }
    );
  }

  if (!upstream.ok) {
    let detail = "";

    try {
      const data = await upstream.json();
      detail =
        data?.error?.message ||
        data?.message ||
        "";
    } catch {}

    if (upstream.status === 401 || upstream.status === 403) {
      return NextResponse.json(
        { error: "API key ditolak oleh gateway. Periksa key Xyrus lo." },
        { status: 502 }
      );
    }

    if (upstream.status === 429) {
      return NextResponse.json(
        {
          error:
            "Gateway sedang membatasi request atau kuota sedang penuh."
        },
        { status: 429 }
      );
    }

    return NextResponse.json(
      {
        error:
          `Gateway gagal (${upstream.status}). ` +
          (detail || "Coba model lain.")
      },
      { status: 502 }
    );
  }

  if (!upstream.body) {
    return NextResponse.json(
      { error: "Gateway tidak mengirim respons." },
      { status: 502 }
    );
  }

  return new Response(upstream.body, {
    status: 200,
    headers: {
      "Content-Type":
        upstream.headers.get("content-type") ||
        "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no"
    }
  });
}
