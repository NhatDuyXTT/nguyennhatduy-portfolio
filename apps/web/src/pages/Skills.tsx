const skills = [
  "TypeScript", "React", "Node.js", "Python", "Kotlin",
  "Cloudflare Workers", "Docker", "Android", "Tailwind CSS",
];

export default function Skills() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Kỹ năng</h1>
      <div className="flex flex-wrap gap-3">
        {skills.map((s) => (
          <span key={s} className="glass-card !p-0 px-4 py-2 rounded-full text-sm">
            {s}
          </span>
        ))}
      </div>
    </div>
  );
}
