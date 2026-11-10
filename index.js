// 技能卡片：扫描本地所有 SKILL.md，供左侧「技能」面板浏览与配置预览
import { readFile, readdir, stat } from 'node:fs/promises'
import { join, dirname, basename } from 'node:path'
import { homedir } from 'node:os'

export const name = 'skills-card'
export const inject = ['webServer']

const HOME = homedir()
const MAX_DEPTH = 6

function roots() {
  const list = [
    { path: join(HOME, '.dsh', 'channel-qq', 'skills'), source: 'channel-qq' },
    { path: join(HOME, '.dsh', 'skills'), source: 'user' },
    { path: join(HOME, '.dsh', 'plugins'), source: 'plugins' },
  ]
  const prof = process.env.DSH_PROFILE_DIR
  if (prof) list.push({ path: join(prof, 'node_modules'), source: 'profile' })
  const res = process.resourcesPath
  if (res) list.push({ path: join(res, 'app.asar', 'dsh', 'node_modules'), source: 'builtin' })
  return list
}

async function walk(dir, depth, out) {
  if (depth > MAX_DEPTH) return
  let entries
  try {
    entries = await readdir(dir, { withFileTypes: true })
  } catch {
    return
  }
  for (const e of entries) {
    const p = join(dir, e.name)
    if (e.isDirectory()) {
      if (e.name === 'node_modules' && depth > 0) continue
      await walk(p, depth + 1, out)
    } else if (e.isFile() && e.name === 'SKILL.md') {
      out.push(p)
    }
  }
}

function field(fm, key) {
  const m = fm.match(new RegExp('^' + key + ':\\s*(.+)$', 'm'))
  return m ? m[1].trim() : ''
}

function parse(file, raw) {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/)
  const fm = m ? m[1] : ''
  const body = m ? m[2] : raw
  const dir = dirname(file)
  return {
    file,
    dir,
    id: dir,
    folder: basename(dir),
    name: field(fm, 'name') || basename(dir),
    description: field(fm, 'description'),
    whenToUse: field(fm, 'whenToUse'),
    preface: fm,
    bodyPreview: body.split(/\r?\n/).slice(0, 400).join('\n'),
    bodyLength: body.length,
    hasScripts: false,
  }
}

async function scan() {
  const found = []
  for (const r of roots()) {
    const out = []
    await walk(r.path, 0, out)
    for (const f of out) {
      found.push({ file: f, source: r.source })
    }
  }
  const seen = new Set()
  const items = []
  for (const { file, source } of found) {
    if (seen.has(file)) continue
    seen.add(file)
    try {
      const raw = await readFile(file, 'utf8')
      const item = parse(file, raw)
      item.source = source
      try {
        const files = await readdir(item.dir)
        item.hasScripts = files.some((n) => n === 'scripts' || n === 'templates' || n === 'references')
        item.resources = files.filter((n) => n !== 'SKILL.md')
      } catch {
        item.resources = []
      }
      items.push(item)
    } catch {
      /* 读不了就跳过 */
    }
  }
  items.sort((a, b) => a.name.localeCompare(b.name, 'zh'))
  return items
}

function sendJson(res, code, data) {
  const body = JSON.stringify(data)
  res.writeHead(code, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' })
  res.end(body)
}

export function apply(ctx, config) {
  ctx.effect(() => ctx.webServer.register({
    kind: 'exact',
    path: '/skills/list',
    handler: async (req, res) => {
      try {
        const items = await scan()
        sendJson(res, 200, { ok: true, items, roots: roots().map((r) => r.path) })
      } catch (e) {
        sendJson(res, 500, { ok: false, message: String(e) })
      }
    },
  }))

  ctx.effect(() => ctx.webServer.register({
    kind: 'exact',
    path: '/skills/get',
    handler: async (req, res) => {
      const url = new URL(req.url || '/', 'http://localhost')
      const file = url.searchParams.get('file') || ''
      const items = await scan()
      const hit = items.find((i) => i.file === file)
      if (!hit) {
        sendJson(res, 404, { ok: false, message: '未找到该技能' })
        return
      }
      try {
        const raw = await readFile(hit.file, 'utf8')
        sendJson(res, 200, { ok: true, ...hit, raw })
      } catch (e) {
        sendJson(res, 500, { ok: false, message: String(e) })
      }
    },
  }))
}
