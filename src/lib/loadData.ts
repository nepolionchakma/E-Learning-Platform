import { promises as fs } from 'fs'
import path from 'path'

export async function loadTopicData(slug: string) {
  const filePath = path.join(process.cwd(), 'src', 'data', `${slug}.json`)
  const content = await fs.readFile(filePath, 'utf-8')
  return JSON.parse(content)
}
