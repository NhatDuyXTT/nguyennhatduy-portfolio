import { motion } from "framer-motion";

const skills = [
  { name: "Claude", pct: 70 },
  { name: "ChatGPT", pct: 30 },
  { name: "Gemini-Ai", pct: 50 },
  { name: "Ngok", pct: 10 },
  { name: "Deepseek", pct: 90 },
  { name: "Copilot", pct: 60 },
];

export default function Skills() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Kỹ năng</h1>
      <p className="text-gray-400 mb-8">Công nghệ tôi sử dụng thường xuyên</p>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {skills.map((s) => (
          <div key={s.name} className="glass-card !p-5">
            <h4 className="text-sm mb-2">{s.name}</h4>
            <div className="bg-white/10 rounded-md h-2 overflow-hidden">
              <motion.div
                className="h-full rounded-md bg-gradient-to-r from-[#4EA8FF] to-[#7A5CFF]"
                initial={{ width: 0 }}
                whileInView={{ width: `${s.pct}%` }}
                viewport={{ once: true }}
                transition={{ duration: 1.2 }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
