import Link from 'next/link'

interface TopicCardProps {
  title: string
  description: string
  gradientClass: string
  href: string
  icon: string
}

export default function TopicCard({ title, description, gradientClass, href, icon }: TopicCardProps) {
  return (
    <Link href={href} className="block">
      <div className={`card-hover rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 h-full`}>
        <div className={`w-12 h-12 rounded-xl ${gradientClass} flex items-center justify-center text-2xl mb-4`}>
          {icon}
        </div>
        <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-2">{title}</h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">{description}</p>
      </div>
    </Link>
  )
}
