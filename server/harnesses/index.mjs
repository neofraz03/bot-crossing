import claudeCode from './claude-code.mjs'
import codex from './codex.mjs'
import cursor from './cursor.mjs'
import docker from './docker.mjs'

export const HARNESSES = [claudeCode, codex, cursor, docker]

export const harnessById = (id) => HARNESSES.find((h) => h.id === id) || null

export async function detectedHarnesses() {
  const flags = await Promise.all(
    HARNESSES.map(async (h) => {
      try {
        return await h.detect()
      } catch {
        return false
      }
    })
  )
  return HARNESSES.filter((_, i) => flags[i])
}
