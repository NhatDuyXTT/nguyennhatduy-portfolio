import { Hono } from "hono";

type Bindings = { RAPIDAPI_KEY?: string };

export const tiktok = new Hono<{ Bindings: Bindings }>();

const TIKTOK_URL_RE = /^https?:\/\/(www\.|vm\.|vt\.|m\.)?tiktok\.com\/.+/i;

// Cả 2 nguồn dùng chung 1 schema đã verify (đã xác nhận qua curl thật, không đoán).
interface TikwmData {
  play?: string;
  images?: string[];
  title?: string;
  cover?: string;
}
interface TikwmResponse {
  code: number;
  msg: string;
  data?: TikwmData;
}
interface NormalizedResult {
  title: string;
  cover: string;
  play: string | null;
  images: string[];
}

function normalize(json: TikwmResponse): NormalizedResult | null {
  if (json.code !== 0 || !json.data || (!json.data.play && !json.data.images?.length)) return null;
  return {
    title: json.data.title ?? "",
    cover: json.data.cover ?? "",
    play: json.data.play ?? null,
    images: json.data.images ?? [],
  };
}

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";

// Nguồn 1: tikwm, free, không cần key, có giới hạn chung 10000 req/ngày cho mọi người dùng free.
async function fetchTikwm(url: string, signal: AbortSignal) {
  const res = await fetch(`https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`, {
    signal,
    headers: { "User-Agent": UA },
  });
  if (!res.ok) throw new Error(`tikwm HTTP ${res.status}`);
  const json = await res.json<TikwmResponse>();
  const result = normalize(json);
  if (!result) throw new Error(`tikwm: code=${json.code} msg="${json.msg}"`);
  return result;
}

// Nguồn 2 (dự phòng): RapidAPI tiktok-video-no-watermark2, quota riêng theo key của bạn.
async function fetchRapidapi(url: string, signal: AbortSignal, key: string) {
  const apiUrl = `https://tiktok-video-no-watermark2.p.rapidapi.com/?url=${encodeURIComponent(url)}&hd=1`;
  const res = await fetch(apiUrl, {
    signal,
    headers: {
      "x-rapidapi-key": key,
      "x-rapidapi-host": "tiktok-video-no-watermark2.p.rapidapi.com",
    },
  });
  if (!res.ok) throw new Error(`rapidapi HTTP ${res.status}`);
  const json = await res.json<TikwmResponse>();
  const result = normalize(json);
  if (!result) throw new Error(`rapidapi: code=${json.code} msg="${json.msg}"`);
  return result;
}

tiktok.post("/", async (c) => {
  let body: { url?: string };
  try {
    body = await c.req.json();
  } catch {
    return c.json({ success: false, error: "Body không hợp lệ" }, 400);
  }

  const url = body.url?.trim();
  if (!url || !TIKTOK_URL_RE.test(url)) {
    return c.json({ success: false, error: "Link TikTok không hợp lệ" }, 400);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);
  const errors: string[] = [];

  try {
    try {
      const result = await fetchTikwm(url, controller.signal);
      return c.json({ success: true, data: result });
    } catch (e) {
      errors.push(e instanceof Error ? e.message : "tikwm failed");
    }

    if (c.env.RAPIDAPI_KEY) {
      try {
        const result = await fetchRapidapi(url, controller.signal, c.env.RAPIDAPI_KEY);
        return c.json({ success: true, data: result });
      } catch (e) {
        errors.push(e instanceof Error ? e.message : "rapidapi failed");
      }
    }

    return c.json({ success: false, error: errors.join(" | ") }, 422);
  } catch (err) {
    const timedOut = err instanceof Error && err.name === "AbortError";
    return c.json(
      { success: false, error: timedOut ? "Quá thời gian chờ, thử lại sau" : "Lỗi máy chủ khi lấy dữ liệu" },
      timedOut ? 504 : 500
    );
  } finally {
    clearTimeout(timeout);
  }
});
