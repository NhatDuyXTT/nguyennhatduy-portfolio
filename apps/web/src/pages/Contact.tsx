import { useState, type FormEvent } from "react";
import { apiPost } from "../lib/api";

export default function Contact() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    const form = new FormData(e.currentTarget);
    const res = await apiPost("/api/v1/contact", {
      name: form.get("name"),
      email: form.get("email"),
      subject: form.get("subject"),
      message: form.get("message"),
      turnstileToken: form.get("cf-turnstile-response"),
    });
    setStatus(res.success ? "sent" : "error");
  }

  return (
    <div className="text-center">
      <h1 className="text-2xl font-bold mb-1">Liên hệ</h1>
      <p className="text-gray-400 mb-8">Có dự án hoặc ý tưởng? Hãy nhắn cho tôi</p>
      <form onSubmit={handleSubmit} className="glass-card max-w-md mx-auto text-left space-y-4">
        <input name="name" placeholder="Tên" required className="w-full bg-white/5 rounded-lg px-4 py-2" />
        <input name="email" type="email" placeholder="Email" required className="w-full bg-white/5 rounded-lg px-4 py-2" />
        <input name="subject" placeholder="Chủ đề" className="w-full bg-white/5 rounded-lg px-4 py-2" />
        <textarea name="message" placeholder="Nội dung" required rows={4} className="w-full bg-white/5 rounded-lg px-4 py-2" />
        <div className="cf-turnstile" data-sitekey={import.meta.env.VITE_TURNSTILE_SITE_KEY} />
        <button type="submit" disabled={status === "sending"} className="btn-gradient w-full disabled:opacity-50">
          {status === "sending" ? "Đang gửi..." : "Gửi"}
        </button>
        {status === "sent" && <p className="text-green-400 text-sm">Đã gửi thành công!</p>}
        {status === "error" && <p className="text-red-400 text-sm">Có lỗi xảy ra, thử lại sau.</p>}
      </form>
    </div>
  );
}
