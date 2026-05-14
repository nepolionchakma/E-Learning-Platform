import Link from 'next/link'
import topics from '@/data/topics.json'

const quizzes = [
  { topic: 'HTML', icon: '🌐', questions: 20, slug: 'html' },
  { topic: 'CSS', icon: '🎨', questions: 20, slug: 'css' },
  { topic: 'JavaScript', icon: '🟨', questions: 25, slug: 'javascript' },
  { topic: 'Python', icon: '🐍', questions: 20, slug: 'python' },
  { topic: 'Git', icon: '🔀', questions: 15, slug: 'git' },
  { topic: 'SQL', icon: '📊', questions: 20, slug: 'sql' },
]

export default function QuizzesPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-8">
        <span className="text-4xl mb-2 block">🧠</span>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">Knowledge Quizzes</h1>
        <p className="text-zinc-500 mt-2">Test your knowledge across all topics. Each quiz has multiple-choice questions.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {quizzes.map((q) => (
          <Link key={q.slug} href={`/${q.slug}`}
            className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:shadow-lg transition-shadow"
          >
            <span className="text-2xl">{q.icon}</span>
            <h3 className="font-semibold mt-2 text-zinc-900 dark:text-zinc-100">{q.topic} Quiz</h3>
            <p className="text-sm text-zinc-500">{q.questions} questions</p>
            <span className="inline-block mt-3 text-sm font-medium text-indigo-600 dark:text-indigo-400">Start Quiz &rarr;</span>
          </Link>
        ))}
      </div>

      <div className="mt-12 p-6 rounded-xl bg-indigo-50 dark:bg-zinc-800 border border-indigo-100 dark:border-zinc-700">
        <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-2">Coming Soon</h2>
        <p className="text-sm text-zinc-500">More quizzes for TypeScript, React, Docker, Java, C++, and DevOps are being prepared. Check back soon!</p>
      </div>
    </div>
  )
}
