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
            Tôi là một lập trình viên độc lập, làm việc chủ yếu một mình trên nhiều dự án khác nhau —
            từ ứng dụng Android, dashboard quản lý server tự host, đến các script tự động hóa bằng Python.
          </p>
          <p className="text-gray-300 mt-4">
            Tôi thích xây dựng công cụ thực tế giải quyết vấn đề cụ thể, và luôn tìm cách tối ưu quy
            trình làm việc — từ CI/CD trên GitHub Actions đến build trực tiếp trên thiết bị Android.
          </p>
        </motion.div>
        <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.15 }} className="glass-card">
          <h2 className="text-xl font-semibold mb-4">Thông tin nhanh</h2>
          <p className="text-gray-300"><strong>Vai trò:</strong> Lập trình viên Full-stack / Mobile</p>
          <p className="text-gray-300 mt-2"><strong>Công nghệ chính:</strong> Kotlin, Node.js, Python, React</p>
          <p className="text-gray-300 mt-2"><strong>Đang làm:</strong> Ứng dụng Android & dashboard tự host</p>
          <p className="text-gray-300 mt-2"><strong>Vị trí:</strong> Việt Nam</p>
        </motion.div>
      </div>
    </div>
  );
}
