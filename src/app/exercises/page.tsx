import Link from 'next/link'

const exercises = [
  { title: 'Build a Personal Portfolio', topic: 'HTML & CSS', level: 'Beginner', desc: 'Create a responsive portfolio page with HTML5 semantic elements and CSS Flexbox/Grid.' },
  { title: 'Todo List App', topic: 'JavaScript', level: 'Beginner', desc: 'Build a todo list with add, delete, and mark-complete functionality using vanilla JS.' },
  { title: 'Calculator', topic: 'JavaScript', level: 'Intermediate', desc: 'Build a functional calculator with keyboard support and proper order of operations.' },
  { title: 'REST API with Express', topic: 'Node.js', level: 'Intermediate', desc: 'Create a RESTful API with CRUD endpoints, middleware, and error handling.' },
  { title: 'CLI Todo Manager', topic: 'Python', level: 'Beginner', desc: 'Build a command-line todo manager that saves tasks to a JSON file.' },
  { title: 'Database Schema Design', topic: 'SQL', level: 'Intermediate', desc: 'Design a normalized database schema for an e-commerce platform with orders, products, users.' },
  { title: 'Dockerize an App', topic: 'Docker', level: 'Intermediate', desc: 'Write a Dockerfile and docker-compose.yml for a full-stack web application.' },
  { title: 'Git Collaboration', topic: 'Git', level: 'Intermediate', desc: 'Simulate a team workflow: branches, pull requests, merge conflicts, and code review.' },
]

export default function ExercisesPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-8">
        <span className="text-4xl mb-2 block">💻</span>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">Hands-On Exercises</h1>
        <p className="text-zinc-500 mt-2">Practice what you learn with real coding exercises. Build projects from scratch.</p>
      </div>

      <div className="space-y-4">
        {exercises.map((ex, i) => (
          <div key={i} className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">{ex.title}</h3>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300">{ex.topic}</span>
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300">{ex.level}</span>
                </div>
                <p className="text-sm text-zinc-500 mt-2">{ex.desc}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
