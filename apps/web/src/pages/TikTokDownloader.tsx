import { useState } from "react";
import { motion } from "framer-motion";
import { Download, Loader2 } from "lucide-react";
import { apiPost } from "../lib/api";

interface TikTokResult {
  title: string;
  cover: string;
  play: string | null;
  images: string[];
}

async function downloadAsBlob(url: string, filename: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error("fetch failed");
  const blob = await res.blob();
  const blobUrl = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = blobUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(blobUrl);
}

export default function TikTokDownloader() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TikTokResult | null>(null);
  const [downloadingAll, setDownloadingAll] = useState(false);
  const [failedCount, setFailedCount] = useState<number | null>(null);

  async function handleDownload() {
    const trimmed = url.trim();
    if (!trimmed) return;

    setLoading(true);
    setError(null);
    setResult(null);
    setFailedCount(null);

    try {
      const res = await apiPost<TikTokResult>("/api/v1/tiktok", { url: trimmed });
      if (!res.success || !res.data) {
        setError(res.error ?? "Không lấy được dữ liệu");
      } else {
        setResult(res.data);
      }
    } catch {
      setError("Không kết nối được máy chủ. Kiểm tra API đã deploy chưa.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDownloadAllImages() {
    if (!result?.images.length) return;
    setDownloadingAll(true);
    let failed = 0;

    for (let i = 0; i < result.images.length; i++) {
      const imgUrl = result.images[i];
      if (!imgUrl) continue;
      try {
        await downloadAsBlob(imgUrl, `tiktok_image_${i + 1}.jpg`);
      } catch {
        failed++;
      }
      await new Promise((r) => setTimeout(r, 400));
    }

    setDownloadingAll(false);
    setFailedCount(failed);
  }

  return (
    <div className="max-w-2xl mx-auto py-16 space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <h1 className="gradient-text text-3xl md:text-5xl font-extrabold mb-4">
          Tải Video &amp; Ảnh TikTok
        </h1>
        <p className="text-gray-400">Dán link TikTok, tải video hoặc ảnh không logo.</p>
      </motion.div>

      <div className="glass-card">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleDownload()}
            placeholder="Dán link TikTok vào đây..."
            className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-500 focus:outline-none focus:border-[#4EA8FF]"
          />
          <button
            onClick={handleDownload}
            disabled={loading || !url.trim()}
            className="btn-gradient disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : null}
            {loading ? "Đang xử lý..." : "Tải xuống"}
          </button>
        </div>

        {error && <p className="text-red-400 text-sm mt-4 text-center">{error}</p>}
      </div>

      {result?.play && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card">
          <h3 className="font-semibold mb-4 border-l-4 border-[#4EA8FF] pl-3">Video</h3>
          <video controls className="w-full rounded-xl bg-black">
            <source src={result.play} type="video/mp4" />
          </video>
          <button
            onClick={async () => {
              setError(null);
              try {
                await downloadAsBlob(result.play!, "tiktok_video.mp4");
              } catch {
                setError("Tải video lỗi, thử mở link trực tiếp");
              }
            }}
            className="btn-gradient mt-4 inline-flex items-center gap-2"
          >
            <Download size={18} /> Tải video MP4
          </button>
        </motion.div>
      )}

      {!!result?.images.length && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card">
          <h3 className="font-semibold mb-4 border-l-4 border-[#4EA8FF] pl-3">
            Hình ảnh ({result.images.length} ảnh)
          </h3>
          <button
            onClick={handleDownloadAllImages}
            disabled={downloadingAll}
            className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/20 transition-colors font-semibold mb-4 disabled:opacity-50"
          >
            {downloadingAll ? "Đang tải..." : "Tải tất cả ảnh về máy"}
          </button>
          {failedCount !== null && (
            <p className={`text-sm mb-4 text-center ${failedCount > 0 ? "text-yellow-400" : "text-green-400"}`}>
              {failedCount > 0
                ? `Đã tải xong, ${failedCount} ảnh lỗi (trình duyệt có thể chặn tải trực tiếp — dùng nút "Xem ảnh gốc" bên dưới thay thế).`
                : "Đã tải xong tất cả ảnh!"}
            </p>
          )}
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {result.images.map((img, i) => (
              <a
                key={i}
                href={img}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl overflow-hidden aspect-square block"
              >
                <img src={img} alt={`TikTok ${i + 1}`} className="w-full h-full object-cover hover:opacity-80 transition-opacity" />
              </a>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
