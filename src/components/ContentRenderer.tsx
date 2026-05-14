interface CommandRow {
  name: string
  rows: string[][]
  type?: string
  code?: string
}

interface Stage {
  title: string
  commands: CommandRow[]
}

interface TopicData {
  title: string
  icon: string
  description: string
  stages?: Stage[]
  sections?: {
    title: string
    type: string
    items: { label?: string; code?: string }[]
  }[]
}

export default function ContentRenderer({ data }: { data: TopicData }) {
  if (data.stages) {
    return renderStages(data.stages)
  }
  if (data.sections) {
    return renderSections(data.sections)
  }
  return null
}

function renderStages(stages: Stage[]) {
  return (
    <div className="space-y-12">
      {stages.map((stage, si) => (
        <section key={si} className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 bg-white dark:bg-zinc-900">
          <h2 className="text-2xl font-bold text-orange-500 mb-1">{stage.title}</h2>
          <div className="space-y-6 mt-4">
            {stage.commands.map((cmd, ci) => (
              <div key={ci}>
                <h3 className="font-bold text-lg mb-2">{cmd.name}</h3>
                {cmd.type === 'codeblock' ? (
                  <pre className="text-sm bg-zinc-900 text-zinc-100 p-4 rounded-lg overflow-x-auto">{cmd.code}</pre>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="bg-zinc-100 dark:bg-zinc-800">
                          <th className="p-2 text-left">Example</th>
                          <th className="p-2 text-left">Scenario</th>
                          <th className="p-2 text-left">Explanation</th>
                        </tr>
                      </thead>
                      <tbody className="text-zinc-600 dark:text-zinc-300">
                        {cmd.rows.map((row, ri) => (
                          <tr key={ri} className="border-b border-zinc-100 dark:border-zinc-800">
                            <td className="p-2"><code className="text-xs bg-zinc-100 dark:bg-zinc-800 px-1 rounded">{row[0]}</code></td>
                            <td className="p-2">{row[1]}</td>
                            <td className="p-2">{row[2]}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      ))}
      <ResourcesSection />
    </div>
  )
}

function renderSections(sections: { title: string; type: string; items: { label?: string; code?: string }[] }[]) {
  return (
    <div className="space-y-8">
      {sections.map((section, si) => (
        <section key={si} className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 bg-white dark:bg-zinc-900">
          <h2 className="text-xl font-bold mb-4">{section.title}</h2>
          <div className="space-y-4">
            {section.items.map((item, ii) => (
              <div key={ii} className="p-4 bg-zinc-50 dark:bg-zinc-800 rounded-xl">
                {item.label && <p className="text-sm font-medium text-zinc-500 mb-2">{item.label}</p>}
                {item.code && <pre className="text-sm bg-zinc-900 text-zinc-100 p-4 rounded-lg overflow-x-auto">{item.code}</pre>}
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}

function ResourcesSection() {
  return (
    <section className="rounded-2xl border border-orange-200 dark:border-orange-800 p-6 bg-orange-50 dark:bg-zinc-800">
      <h2 className="text-xl font-bold text-orange-600 dark:text-orange-400 mb-4">Resources & Tips</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-bold mb-2">Free Learning Resources</h3>
          <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-300">
            <li>explainshell.com &ndash; paste any command to learn it</li>
            <li>tldr.sh &ndash; simplified man pages</li>
            <li>OverTheWire Bandit &ndash; game-like CLI challenges</li>
            <li>learnshell.org &ndash; interactive shell scripting</li>
            <li>linuxcommand.org &ndash; tutorials for all levels</li>
          </ul>
        </div>
        <div>
          <h3 className="font-bold mb-2">Study Plan</h3>
          <ol className="space-y-2 text-sm text-zinc-600 dark:text-zinc-300 list-decimal list-inside">
            <li>Install Ubuntu in VirtualBox (sandbox, break things)</li>
            <li>15 min daily: practice 3-4 commands</li>
            <li>Master basics first: 1 week per stage</li>
            <li>Always use <code className="text-xs">man</code> and <code className="text-xs">--help</code></li>
            <li>Build projects: backup script, log analyzer, deploy script</li>
          </ol>
        </div>
      </div>
    </section>
  )
}
