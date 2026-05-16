import topics from "@/data/topics.json"
import bashData from "@/data/bash.json"
import cplusplusData from "@/data/cplusplus.json"
import cssData from "@/data/css.json"
import databaseData from "@/data/database.json"
import devopsData from "@/data/devops.json"
import dockerData from "@/data/docker.json"
import gitData from "@/data/git.json"
import htmlData from "@/data/html.json"
import javaData from "@/data/java.json"
import javascriptData from "@/data/javascript.json"
import linuxData from "@/data/linux.json"
import machineLearningData from "@/data/machine-learning.json"
import networkingData from "@/data/networking.json"
import nodejsData from "@/data/nodejs.json"
import pythonData from "@/data/python.json"
import reactData from "@/data/react.json"
import reactNativeData from "@/data/react-native.json"
import sqlData from "@/data/sql.json"
import typescriptData from "@/data/typescript.json"

export interface SearchEntry {
  topicSlug: string
  topicTitle: string
  topicIcon: string
  sectionTitle: string
  itemLabel: string
}

const topicDataMap: Record<string, any> = {
  bash: bashData, cplusplus: cplusplusData, css: cssData,
  database: databaseData, devops: devopsData, docker: dockerData,
  git: gitData, html: htmlData, java: javaData,
  javascript: javascriptData, linux: linuxData,
  "machine-learning": machineLearningData, networking: networkingData,
  nodejs: nodejsData, python: pythonData, react: reactData,
  "react-native": reactNativeData, sql: sqlData,
  typescript: typescriptData,
}

function extractEntries(slug: string): SearchEntry[] {
  const data = topicDataMap[slug]
  if (!data) return []
  const topic = topics.find((t) => t.slug === slug)
  const topicTitle = data.title || topic?.title || slug
  const topicIcon = data.icon || topic?.icon || ""

  const entries: SearchEntry[] = []

  if (data.sections) {
    for (const section of data.sections) {
      if (section.items) {
        for (const item of section.items) {
          entries.push({
            topicSlug: slug,
            topicTitle,
            topicIcon,
            sectionTitle: section.title,
            itemLabel: item.label,
          })
        }
      }
    }
  }

  if (data.stages) {
    for (const stage of data.stages) {
      if (stage.commands) {
        for (const cmd of stage.commands) {
          if (cmd.name) {
            entries.push({
              topicSlug: slug,
              topicTitle,
              topicIcon,
              sectionTitle: stage.title,
              itemLabel: cmd.name,
            })
          }
          if (cmd.rows) {
            for (const row of cmd.rows) {
              if (typeof row[0] === "string") {
                entries.push({
                  topicSlug: slug,
                  topicTitle,
                  topicIcon,
                  sectionTitle: stage.title,
                  itemLabel: row[0],
                })
              }
            }
          }
        }
      }
    }
  }

  return entries
}

let index: SearchEntry[] | null = null

export function getSearchIndex(): SearchEntry[] {
  if (index) return index
  index = []
  const seen = new Set<string>()
  for (const slug of Object.keys(topicDataMap)) {
    for (const entry of extractEntries(slug)) {
      const key = `${entry.topicSlug}|${entry.sectionTitle}|${entry.itemLabel}`
      if (!seen.has(key)) {
        seen.add(key)
        index.push(entry)
      }
    }
  }
  return index
}

export function search(query: string): SearchEntry[] {
  const q = query.toLowerCase().trim()
  if (!q) return []
  const all = getSearchIndex()
  return all.filter(
    (e) =>
      e.itemLabel.toLowerCase().includes(q) ||
      e.sectionTitle.toLowerCase().includes(q) ||
      e.topicTitle.toLowerCase().includes(q),
  )
}
