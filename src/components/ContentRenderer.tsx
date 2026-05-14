'use client'

import Accordion from './Accordion'
import CopyButton from './CopyButton'
import site from '@/data/site.json'

interface CommandRow {
  name: string
  rows?: string[][]
  type?: string
  code?: string
}

interface Stage {
  title: string
  commands: CommandRow[]
}

interface SectionItem {
  label?: string
  code?: string
}

interface Section {
  title: string
  type: string
  items: SectionItem[]
}

interface TopicData {
  title: string
  icon: string
  description: string
  stages?: Stage[]
  sections?: Section[]
}

export default function ContentRenderer({ data, topic }: { data: TopicData; topic?: string }) {
  if (data.stages) return renderStages(data.stages, topic || '')
  if (data.sections) return renderSections(data.sections)
  return null
}

function renderStages(stages: Stage[], topicSlug: string) {
  return (
    <div className="space-y-3">
      {stages.map((stage, si) => (
        <Accordion key={si} title={stage.title} topicSlug={topicSlug} stageIndex={si} defaultOpen={si === 0}>
          <div className="space-y-5">
            {stage.commands.map((cmd, ci) => (
              <div key={ci}>
                <h4 className="font-semibold text-sm text-zinc-800 dark:text-zinc-200 mb-2 flex items-center gap-2">
                  <span className="w-1 h-4 bg-orange-500 rounded-full inline-block" />
                  {cmd.name}
                </h4>
                {cmd.type === 'codeblock' ? (
                  <div className="relative group">
                    <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                      <CopyButton text={cmd.code || ''} />
                    </div>
                    <pre className="text-sm bg-zinc-900 text-zinc-100 p-4 rounded-lg overflow-x-auto border border-zinc-700">{cmd.code}</pre>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-700">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="bg-zinc-100 dark:bg-zinc-800">
                          <th className="p-3 text-left font-semibold text-zinc-700 dark:text-zinc-300 border-b border-zinc-200 dark:border-zinc-700">Command</th>
                          <th className="p-3 text-left font-semibold text-zinc-700 dark:text-zinc-300 border-b border-zinc-200 dark:border-zinc-700">Scenario</th>
                          <th className="p-3 text-left font-semibold text-zinc-700 dark:text-zinc-300 border-b border-zinc-200 dark:border-zinc-700">Explanation</th>
                          <th className="p-3 w-16 border-b border-zinc-200 dark:border-zinc-700" />
                        </tr>
                      </thead>
                      <tbody className="text-zinc-600 dark:text-zinc-300">
                        {cmd.rows?.map((row, ri) => (
                          <tr key={ri} className="border-b border-zinc-100 dark:border-zinc-800 last:border-0 hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                            <td className="p-3 font-mono text-xs text-zinc-800 dark:text-zinc-200">
                              <code>{row[0]}</code>
                            </td>
                            <td className="p-3 text-xs">{row[1]}</td>
                            <td className="p-3 text-xs text-zinc-500">{row[2]}</td>
                            <td className="p-2">
                              <CopyButton text={row[0]} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Accordion>
      ))}
      <ResourcesSection />
    </div>
  )
}

function renderSections(sections: Section[]) {
  return (
    <div className="space-y-6">
      {sections.map((section, si) => (
        <div key={si} className="rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden">
          <div className="px-5 py-3 bg-zinc-50 dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700">
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">{section.title}</h3>
          </div>
          <div className="px-5 py-4 bg-white dark:bg-zinc-900 space-y-4">
            {section.items.map((item, ii) => (
              <div key={ii}>
                {item.label && (
                  <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5 uppercase tracking-wide">
                    {item.label}
                  </p>
                )}
                {item.code && (
                  <div className="relative group">
                    <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                      <CopyButton text={item.code} />
                    </div>
                    <pre className="text-sm bg-zinc-900 text-zinc-100 p-4 rounded-lg overflow-x-auto border border-zinc-700 leading-relaxed">{item.code}</pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
      <ResourcesSection />
    </div>
  )
}

function ResourcesSection() {
  const r = site.resources
  return (
    <div className="rounded-xl border border-orange-200 dark:border-orange-800 p-5 bg-orange-50 dark:bg-zinc-800">
      <h3 className="font-bold text-orange-600 dark:text-orange-400 mb-3">{r.heading}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-zinc-600 dark:text-zinc-300">
        {r.items.map((item, i) => (
          <div key={i}>
            <p className="font-medium mb-1">{item.title}</p>
            {item.type === 'ordered' ? (
              <ol className="space-y-1 list-decimal list-inside">
                {item.entries.map((e, j) => <li key={j}>{e}</li>)}
              </ol>
            ) : (
              <ul className="space-y-1 list-disc list-inside">
                {item.entries.map((e, j) => <li key={j}>{e}</li>)}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
