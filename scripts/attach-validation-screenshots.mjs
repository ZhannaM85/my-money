#!/usr/bin/env node
/**
 * Comment validation screenshots onto a GitHub issue (#118).
 * Images must already be on main under docs/validation-proof/ (PNGs in git).
 *
 * Usage:
 *   node scripts/attach-validation-screenshots.mjs <issue> <relative-dir-under-docs/validation-proof>
 *
 * Example:
 *   node scripts/attach-validation-screenshots.mjs 108 108
 *   node scripts/attach-validation-screenshots.mjs 111 dashboard
 */
import { spawnSync } from 'node:child_process'
import { readdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const issue = process.argv[2]
const folder = process.argv[3]
if (!issue || !/^\d+$/.test(issue) || !folder) {
  console.error(
    'Usage: node scripts/attach-validation-screenshots.mjs <issue> <proof-folder>',
  )
  process.exit(1)
}

const dir = join('docs', 'validation-proof', folder)
if (!existsSync(dir)) {
  console.error(`Missing ${dir}`)
  process.exit(1)
}

const pngs = readdirSync(dir).filter((name) => name.endsWith('.png'))
if (pngs.length === 0) {
  console.error(`No PNGs in ${dir}`)
  process.exit(1)
}

const repo = spawnSync(
  'gh',
  ['repo', 'view', '--json', 'nameWithOwner', '-q', '.nameWithOwner'],
  { encoding: 'utf8' },
)
const nameWithOwner = (repo.stdout || '').trim()
if (repo.status !== 0 || !nameWithOwner) {
  console.error(repo.stderr || 'Could not resolve repo')
  process.exit(repo.status ?? 1)
}

const branch = spawnSync('git', ['branch', '--show-current'], {
  encoding: 'utf8',
})
const ref = (branch.stdout || 'main').trim() || 'main'

const lines = [
  `## Validation screenshots`,
  ``,
  `Proof attached before on-device check (#118).`,
  ``,
]
for (const name of pngs) {
  const raw = `https://raw.githubusercontent.com/${nameWithOwner}/${ref}/docs/validation-proof/${folder}/${name}`
  lines.push(`### ${name}`)
  lines.push(``)
  lines.push(`![${name}](${raw})`)
  lines.push(``)
}

const body = lines.join('\n')
const comment = spawnSync('gh', ['issue', 'comment', issue, '--body', body], {
  encoding: 'utf8',
})
if (comment.status !== 0) {
  console.error(comment.stderr || comment.stdout)
  process.exit(comment.status ?? 1)
}
console.log(comment.stdout.trim())
console.log(`Attached ${pngs.length} screenshot(s) to #${issue}`)
