import Link from 'next/link'

const bootcamps = [
  {
    title: 'Web Development Fundamentals',
    icon: '🌐',
    duration: '4 weeks',
    topics: ['HTML', 'CSS', 'JavaScript'],
    desc: 'Start from zero. Build your first websites with HTML5, style them with modern CSS, and add interactivity with JavaScript.',
    level: 'Beginner'
  },
  {
    title: 'Frontend Developer',
    icon: '⚛️',
    duration: '6 weeks',
    topics: ['JavaScript', 'TypeScript', 'React'],
    desc: 'Master modern frontend development. Learn TypeScript, React hooks, state management, and build single-page applications.',
    level: 'Intermediate'
  },
  {
    title: 'Backend Developer',
    icon: '🖥️',
    duration: '6 weeks',
    topics: ['Node.js', 'Python', 'SQL', 'Docker'],
    desc: 'Build server-side applications. REST APIs, databases, authentication, and containerization with Docker.',
    level: 'Intermediate'
  },
  {
    title: 'Full Stack Developer',
    icon: '🚀',
    duration: '12 weeks',
    topics: ['React', 'Node.js', 'SQL', 'Docker', 'Git', 'DevOps'],
    desc: 'Complete full-stack training. Frontend, backend, databases, containers, CI/CD, and deployment.',
    level: 'Intermediate'
  },
]

export default function BootcampPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-8">
        <span className="text-4xl mb-2 block">🎓</span>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">Learning Bootcamps</h1>
        <p className="text-zinc-500 mt-2">Structured learning paths designed to take you from beginner to job-ready.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {bootcamps.map((b, i) => (
          <div key={i} className="p-6 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:shadow-lg transition-shadow">
            <span className="text-3xl">{b.icon}</span>
            <h3 className="text-lg font-bold mt-3 text-zinc-900 dark:text-zinc-100">{b.title}</h3>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300">{b.level}</span>
              <span className="text-xs text-zinc-500">{b.duration}</span>
            </div>
            <p className="text-sm text-zinc-500 mt-3">{b.desc}</p>
            <div className="flex flex-wrap gap-2 mt-4">
              {b.topics.map((t) => (
                <span key={t} className="text-xs px-2 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">{t}</span>
              ))}
            </div>
            <button className="mt-4 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline">Enroll Now &rarr;</button>
          </div>
        ))}
      </div>
    </div>
  )
}
