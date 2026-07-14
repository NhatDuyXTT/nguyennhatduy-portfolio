import { motion } from "framer-motion";
import About from "./About";
import Skills from "./Skills";
import Contact from "./Contact";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.7 },
};

const stats = [
  { label: "Projects", value: "20+" },
  { label: "Languages", value: "8" },
  { label: "Lines", value: "100K+" },
  { label: "Online", value: "24/7" },
];

export default function Home() {
  return (
    <div className="space-y-28">
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center py-10 flex flex-col items-center"
      >
        <div className="avatar-ring">
          <img src="https://avatars.githubusercontent.com/u/9919?v=4" alt="Nguyễn Nhật Duy" className="w-full h-full rounded-full object-cover" />
        </div>
        <h1 className="gradient-text text-4xl md:text-6xl font-extrabold mt-8 mb-4">Nguyễn Nhật Duy</h1>
        <p className="text-gray-400 text-lg max-w-xl mx-auto mb-8">
          Software Engineer • Cloud • Open Source • Networking • Minecraft
        </p>
      </motion.section>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {stats.map((s) => (
          <div key={s.label} className="glass-card text-center">
            <h2 className="text-4xl font-bold text-[#4EA8FF] mb-2">{s.value}</h2>
            <p className="text-gray-400 text-sm">{s.label}</p>
          </div>
        ))}
      </div>

      <motion.div {...fadeUp}><About /></motion.div>
      <motion.div {...fadeUp}><Skills /></motion.div>
      <motion.div {...fadeUp}><Contact /></motion.div>
    </div>
  );
}
