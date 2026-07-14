import { motion } from "framer-motion";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.7 },
};

export default function About() {
  return (
    <div className="space-y-8">
      <motion.h1 {...fadeUp} className="text-3xl font-bold mb-6">
        Giới thiệu
      </motion.h1>
      <div className="grid md:grid-cols-2 gap-6">
        <motion.div {...fadeUp} className="glass-card">
          <p className="text-gray-300">
            Tôi là một sinh viên mới tốt nghiệp.
          </p>
          <p className="text-gray-300 mt-4">
            Tôi chẳng thích gì cả.
          </p>
        </motion.div>
        <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.15 }} className="glass-card">
          <h2 className="text-xl font-semibold mb-4">Thông tin nhanh</h2>
          <p className="text-gray-300"><strong>Vai trò:</strong> .../ ...</p>
          <p className="text-gray-300 mt-2"><strong>Công nghệ chính:</strong> ChatGPT, Claude, Gemini-Ai, Ngok, Deepseek</p>
          <p className="text-gray-300 mt-2"><strong>Đang làm:</strong> Làm tào lao& Chẳng có nào ra hồn.</p>
          <p className="text-gray-300 mt-2"><strong>Vị trí:</strong> Việt Nam</p>
        </motion.div>
      </div>
    </div>
  );
}
