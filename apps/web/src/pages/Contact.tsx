import { useState, type FormEvent } from "react";
import { apiPost } from "../lib/api";

export default function Contact() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    const form = new FormData(e.currentTarget);
    const turnstileToken = form.get("cf-turnstile-response") as string;

    const res = await apiPost("/api/v1/contact", {
      name: form.get("name"),
      email: form.get("email"),
      subject: form.get("subject"),
      message: form.get("message"),
      turnstileToken,
    });

    setStatus(res.success ? "sent" : "error");
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Liên hệ</h1>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <input name="name" placeholder="Tên" required className="w-full bg-surface rounded-lg px-4 py-2" />
        <input name="email" type="email" placeholder="Email" required className="w-full bg-surface rounded-lg px-4 py-2" />
        <input name="subject" placeholder="Chủ đề" className="w-full bg-surface rounded-lg px-4 py-2" />
        <textarea name="message" placeholder="Nội dung" required rows={5} className="w-full bg-surface rounded-lg px-4 py-2" />
        {/* Cloudflare Turnstile widget - script load trong index.html hoặc component riêng */}
        <div className="cf-turnstile" data-sitekey={import.meta.env.VITE_TURNSTILE_SITE_KEY} />
        <button
          type="submit"
          disabled={status === "sending"}
          className="bg-primary hover:bg-primary/90 px-6 py-2 rounded-lg font-medium disabled:opacity-50"
        >
          {status === "sending" ? "Đang gửi..." : "Gửi"}
        </button>
        {status === "sent" && <p className="text-green-400">Đã gửi thành công!</p>}
        {status === "error" && <p className="text-red-400">Có lỗi xảy ra, thử lại sau.</p>}
      </form>
    </div>
  );
}
