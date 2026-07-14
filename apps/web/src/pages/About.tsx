export default function About() {
  return (
    <div className="prose prose-invert max-w-none">
      <h1 className="text-3xl font-bold mb-6">Về tôi</h1>
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Tiểu sử</h2>
        <p className="text-gray-400">Nội dung tiểu sử...</p>
      </section>
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Kinh nghiệm</h2>
        <p className="text-gray-400">Nội dung kinh nghiệm...</p>
      </section>
      <section>
        <h2 className="text-xl font-semibold mb-2">Mục tiêu</h2>
        <p className="text-gray-400">Nội dung mục tiêu...</p>
      </section>
    </div>
  );
}
