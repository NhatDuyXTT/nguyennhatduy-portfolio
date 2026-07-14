import { useEffect, useState } from "react";
import { api } from "../lib/api";

export default function Settings() {
  const [config, setConfig] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.get<Record<string, string>>("/api/v1/profile").then((res) => setConfig(res.data ?? {}));
  }, []);

  async function save() {
    await api.put("/api/v1/profile", config);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const fields = ["site_title", "site_description", "contact_email", "github_url", "linkedin_url"];

  return (
    <div className="max-w-md">
      <h1 className="text-2xl font-bold mb-4">Cấu hình website</h1>
      <div className="space-y-3">
        {fields.map((key) => (
          <div key={key}>
            <label className="text-sm text-gray-400 block mb-1">{key}</label>
            <input
              value={config[key] ?? ""}
              onChange={(e) => setConfig({ ...config, [key]: e.target.value })}
              className="w-full bg-surface rounded-lg px-4 py-2"
            />
          </div>
        ))}
        <button onClick={save} className="bg-primary px-4 py-2 rounded-lg">
          Lưu
        </button>
        {saved && <span className="text-green-400 ml-3">Đã lưu!</span>}
      </div>
    </div>
  );
}
