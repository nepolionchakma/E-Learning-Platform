import TopicCard from "@/components/TopicCard";
import topics from "@/data/topics.json";
import site from "@/data/site.json";
import SearchBar from "@/components/SearchBar";

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-8">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-4">
          <span className="gradient-text">{site.hero.title}</span>
        </h1>
        <p className="max-w-2xl mx-auto text-lg text-zinc-500 dark:text-zinc-400 mb-8">
          {site.hero.subtitle}
        </p>
        <div className="max-w-xl mx-auto">
          <SearchBar />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {topics.map((topic) => (
          <TopicCard
            key={topic.slug}
            title={topic.title}
            description={topic.description}
            gradientClass={topic.gradientClass}
            href={`/${topic.slug}`}
            icon={topic.icon}
          />
        ))}
      </div>

      <div className="mt-20 text-center">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">{site.features.heading}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {site.features.items.map((item, i) => (
            <div key={i} className="p-6">
              <div className="text-3xl mb-3">{item.icon}</div>
              <h3 className="font-semibold mb-2">{item.title}</h3>
              <p className="text-sm text-zinc-500">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
