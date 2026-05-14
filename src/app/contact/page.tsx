'use client'

export default function ContactPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="mb-8">
        <span className="text-4xl mb-2 block">📬</span>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">Contact Us</h1>
        <p className="text-zinc-500 mt-2">Have questions, suggestions, or feedback? We'd love to hear from you.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900">
          <span className="text-2xl">📧</span>
          <h3 className="font-semibold mt-2 text-zinc-900 dark:text-zinc-100">Email</h3>
          <p className="text-sm text-zinc-500 mt-1">hello@elearning-platform.com</p>
        </div>
        <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900">
          <span className="text-2xl">💬</span>
          <h3 className="font-semibold mt-2 text-zinc-900 dark:text-zinc-100">Live Chat</h3>
          <p className="text-sm text-zinc-500 mt-1">Available Mon-Fri, 9AM-5PM EST</p>
        </div>
        <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900">
          <span className="text-2xl">🐦</span>
          <h3 className="font-semibold mt-2 text-zinc-900 dark:text-zinc-100">Twitter / X</h3>
          <p className="text-sm text-zinc-500 mt-1">@elearningplatform</p>
        </div>
        <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900">
          <span className="text-2xl">💻</span>
          <h3 className="font-semibold mt-2 text-zinc-900 dark:text-zinc-100">GitHub</h3>
          <p className="text-sm text-zinc-500 mt-1">github.com/elearning-platform</p>
        </div>
      </div>

      <form onSubmit={(e) => e.preventDefault()} className="space-y-4 p-6 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900">
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Send us a message</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Name</label>
            <input type="text" className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Your name" />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Email</label>
            <input type="email" className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="you@example.com" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Subject</label>
          <select className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
            <option>General Inquiry</option>
            <option>Course Suggestion</option>
            <option>Bug Report</option>
            <option>Collaboration</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Message</label>
          <textarea rows={4} className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Your message..." />
        </div>
        <button type="submit" className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-medium text-sm hover:bg-indigo-700 transition-colors">Send Message</button>
      </form>
    </div>
  )
}
