// 技能卡片：扫描本地所有 SKILL.md，供左侧「技能」面板浏览、分组与配置预览
import { readFile, readdir, writeFile, mkdir } from 'node:fs/promises'
import { join, dirname, basename } from 'node:path'
import { homedir } from 'node:os'

export const name = 'skills-card'
export const inject = ['webServer']

const HOME = homedir()
const MAX_DEPTH = 6

// 虚拟分组（不动磁盘上的 skill，只在自己的存储里记归属）
const STORE_DIR = join(HOME, '.dsh', 'skills-card')
const STORE_FILE = join(STORE_DIR, 'groups.json')
const MAX_FOLDER_NAME = 40

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
    body,
    bodyPreview: body.split(/\r?\n/).slice(0, 120).join('\n'),
    bodyLength: body.length,
    hasScripts: false,
  }
}

/* ---------------- 分组存储 ---------------- */

function emptyStore() {
  return { version: 1, folders: [], assign: {} }
}

function normalizeStore(input) {
  const out = emptyStore()
  const folders = Array.isArray(input && input.folders) ? input.folders : []
  const seen = new Set()
  folders.forEach((f, i) => {
    if (!f || typeof f.id !== 'string' || seen.has(f.id)) return
    seen.add(f.id)
    out.folders.push({
      id: f.id,
      name: String(f.name || '未命名').slice(0, MAX_FOLDER_NAME),
      order: Number.isFinite(f.order) ? f.order : i,
    })
  })
  out.folders.sort((a, b) => a.order - b.order)
  const assign = input && typeof input.assign === 'object' && input.assign ? input.assign : {}
  for (const [file, folderId] of Object.entries(assign)) {
    if (typeof folderId === 'string' && seen.has(folderId)) out.assign[file] = folderId
  }
  return out
}

async function readStore() {
  try {
    return normalizeStore(JSON.parse(await readFile(STORE_FILE, 'utf8')))
  } catch {
    return emptyStore()
  }
}

async function writeStore(store) {
  await mkdir(STORE_DIR, { recursive: true })
  await writeFile(STORE_FILE, JSON.stringify(store, null, 2), 'utf8')
}

// 读-改-写要排队，否则并发（比如新建时一次性分配多个技能）会互相覆盖丢数据
let storeQueue = Promise.resolve()

function withStore(mutate) {
  const run = storeQueue.then(async () => {
    const store = await readStore()
    const result = await mutate(store)
    await writeStore(store)
    return result
  })
  storeQueue = run.then(() => undefined, () => undefined)
  return run
}

function newFolderId() {
  return 'f_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
}

class HttpError extends Error {
  constructor(status, message) {
    super(message)
    this.status = status
  }
}

function cleanName(value) {
  const name = String(value == null ? '' : value).replace(/\s+/g, ' ').trim().slice(0, MAX_FOLDER_NAME)
  if (!name) throw new HttpError(400, '文件夹名不能为空')
  return name
}

/* ---------------- 扫描 ---------------- */

async function scan() {
  const store = await readStore()
  const found = []
  for (const r of roots()) {
    const out = []
    await walk(r.path, 0, out)
    for (const f of out) found.push({ file: f, source: r.source })
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
      item.folderId = store.assign[file] || ''
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
  return { items, folders: store.folders }
}

/* ---------------- HTTP 小工具 ---------------- */

function sendJson(res, code, data) {
  const body = JSON.stringify(data)
  res.writeHead(code, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' })
  res.end(body)
}

function readJsonBody(req, limit = 128 * 1024) {
  return new Promise((resolve, reject) => {
    let size = 0
    const chunks = []
    req.on('data', (c) => {
      size += c.length
      if (size > limit) {
        reject(new HttpError(413, '请求体过大'))
        req.destroy()
        return
      }
      chunks.push(c)
    })
    req.on('end', () => {
      if (!chunks.length) return resolve({})
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')))
      } catch {
        reject(new HttpError(400, '请求体不是合法 JSON'))
      }
    })
    req.on('error', reject)
  })
}

function fail(res, e) {
  const status = e instanceof HttpError ? e.status : 500
  sendJson(res, status, { ok: false, message: e && e.message ? e.message : String(e) })
}

/* ---------------- 给 AI 用的工具：直接建文件夹 / 放技能 ---------------- */

// 把「技能名 / 目录名 / SKILL.md 路径」解析成技能条目
async function resolveSkillKeys(keys) {
  const { items } = await scan()
  const hits = []
  const missing = []
  for (const raw of keys) {
    const key = String(raw || '').trim()
    if (!key) continue
    const lower = key.toLowerCase()
    let hit = items.find((i) => i.file === key || i.dir === key)
    if (!hit) {
      const exact = items.filter((i) => i.name.toLowerCase() === lower || i.folder.toLowerCase() === lower)
      if (exact.length > 1) throw new HttpError(409, `「${key}」对上了多个技能：${exact.map((i) => i.folder).join(' / ')}，请用路径指定`)
      hit = exact[0]
    }
    if (!hit) {
      const partial = items.filter((i) => i.name.toLowerCase().includes(lower) || i.folder.toLowerCase().includes(lower))
      if (partial.length === 1) hit = partial[0]
      else if (partial.length > 1) throw new HttpError(409, `「${key}」匹配到多个技能：${partial.slice(0, 6).map((i) => i.folder).join(' / ')}`)
    }
    if (!hit) { missing.push(key); continue }
    if (!hits.some((h) => h.file === hit.file)) hits.push(hit)
  }
  return { hits, missing }
}

// 当前各文件夹 + 各自有几个技能
async function folderSummaries() {
  const { items, folders } = await scan()
  return folders.map((f) => ({ id: f.id, name: f.name, count: items.filter((i) => i.folderId === f.id).length }))
}

function findFolder(store, key) {
  const k = String(key || '').trim()
  return store.folders.find((f) => f.id === k) || store.folders.find((f) => f.name === k)
}

function skillsLine(list) {
  return list.length ? `：${list.map((i) => i.name).join('、')}` : ''
}

async function runFolderTool(args) {
  const action = String(args.action || 'list').toLowerCase()
  const folderArg = String(args.folder || '').trim()
  const newName = String(args.newName || '').trim()
  const skillArgs = Array.isArray(args.skills) ? args.skills.map((s) => String(s)) : (args.skills ? [String(args.skills)] : [])

  if (action === 'list') {
    const folders = await folderSummaries()
    const store = await readStore()
    const { items } = await scan()
    return {
      ok: true,
      action,
      message: folders.length ? `现在有 ${folders.length} 个文件夹，未分类 ${items.filter((i) => !i.folderId).length} 个技能` : '还没有文件夹',
      folders,
      unassigned: items.filter((i) => !i.folderId).length,
      store: STORE_FILE,
      foldersRaw: store.folders,
    }
  }

  if (action === 'create') {
    const name = cleanName(folderArg)
    const { hits, missing } = await resolveSkillKeys(skillArgs)
    const folder = await withStore((store) => {
      if (store.folders.some((f) => f.name === name)) throw new HttpError(409, `已经有叫「${name}」的文件夹`)
      const folder = { id: newFolderId(), name, order: store.folders.length }
      store.folders.push(folder)
      for (const it of hits) store.assign[it.file] = folder.id
      return folder
    })
    return {
      ok: true,
      action,
      message: `建好文件夹「${name}」${hits.length ? `，放进 ${hits.length} 个技能` + skillsLine(hits) : ''}${missing.length ? `；没找到：${missing.join('、')}` : ''}`,
      folder: { id: folder.id, name: folder.name, skills: hits.map((i) => i.name) },
      folders: await folderSummaries(),
      missing,
    }
  }

  if (action === 'rename') {
    const name = cleanName(newName || folderArg)
    const old = await withStore((store) => {
      const hit = findFolder(store, folderArg)
      if (!hit) throw new HttpError(404, `没有叫「${folderArg}」的文件夹`)
      if (store.folders.some((f) => f.id !== hit.id && f.name === name)) throw new HttpError(409, `已经有叫「${name}」的文件夹`)
      const before = hit.name
      hit.name = name
      return { id: hit.id, name: before }
    })
    return { ok: true, action, message: `「${old.name}」改名成「${name}」`, folders: await folderSummaries() }
  }

  if (action === 'delete') {
    const removed = await withStore((store) => {
      const hit = findFolder(store, folderArg)
      if (!hit) throw new HttpError(404, `没有叫「${folderArg}」的文件夹`)
      store.folders = store.folders.filter((f) => f.id !== hit.id)
      for (const [file, id] of Object.entries(store.assign)) {
        if (id === hit.id) delete store.assign[file]
      }
      store.folders.forEach((f, i) => { f.order = i })
      return hit
    })
    return { ok: true, action, message: `删掉文件夹「${removed.name}」，里面的技能回到未分类`, folders: await folderSummaries() }
  }

  if (action === 'assign' || action === 'unassign') {
    if (!skillArgs.length) throw new HttpError(400, '要给 skills 至少一个技能')
    const { hits, missing } = await resolveSkillKeys(skillArgs)
    if (!hits.length) throw new HttpError(404, `没找到技能：${missing.join('、') || skillArgs.join('、')}`)

    if (action === 'unassign') {
      const store0 = await readStore()
      const wasIn = hits.map((it) => {
        const id = store0.assign[it.file]
        const f = store0.folders.find((x) => x.id === id)
        return { skill: it.name, folder: f ? f.name : '未分类' }
      })
      await withStore((store) => {
        for (const it of hits) delete store.assign[it.file]
      })
      return { ok: true, action, message: `移回未分类${skillsLine(hits)}`, moved: wasIn, folders: await folderSummaries(), missing }
    }

    const folder = await withStore((store) => {
      const hit = findFolder(store, folderArg)
      if (!hit) throw new HttpError(404, `没有叫「${folderArg}」的文件夹，先用 create 建一个`)
      for (const it of hits) store.assign[it.file] = hit.id
      return hit
    })
    return {
      ok: true,
      action,
      message: `放进「${folder.name}」${skillsLine(hits)}${missing.length ? `；没找到：${missing.join('、')}` : ''}`,
      folder: { id: folder.id, name: folder.name, skills: hits.map((i) => i.name) },
      folders: await folderSummaries(),
      missing,
    }
  }

  throw new HttpError(400, `不认识的 action：${action}`)
}

const FOLDER_TOOL = {
  name: 'skills_folders',
  description: '管理「技能」面板里的文件夹（只是面板里的分组索引，不移动磁盘上的 skill 文件）：list 看现状；create 建文件夹（可顺手把技能放进去）；rename 改名；delete 删除（里面的技能回未分类）；assign 把技能放进某个文件夹；unassign 移回未分类。技能可以用 skill 名、目录名或 SKILL.md 完整路径指定，一次可给多个。',
  parameters: {
    type: 'object',
    additionalProperties: false,
    properties: {
      action: {
        type: 'string',
        enum: ['list', 'create', 'rename', 'delete', 'assign', 'unassign'],
        description: 'list 列出文件夹；create 新建；rename 改名；delete 删除；assign 放进文件夹；unassign 移回未分类。',
      },
      folder: { type: 'string', description: '文件夹名或 id。create 时是要建的名字；rename/delete/assign 时指定目标文件夹。' },
      newName: { type: 'string', description: 'rename 时的新名字。' },
      skills: { type: 'array', items: { type: 'string' }, description: '要放进（或移出）的技能：skill 名 / 目录名 / SKILL.md 路径，可多个。' },
    },
    required: ['action'],
  },
  output: {
    schema: { type: 'object' },
    render(args, value) {
      const v = value || {}
      const lines = [String(v.message || '完成')]
      if (Array.isArray(v.folders) && v.folders.length) {
        lines.push('当前文件夹：')
        for (const f of v.folders) lines.push(`- ${f.name}（${f.count}）`)
      }
      if (Array.isArray(v.missing) && v.missing.length) lines.push('没找到：' + v.missing.join('、'))
      return [{ type: 'text', text: lines.join('\n') }]
    },
  },
  async execute(args) {
    return runFolderTool(args || {})
  },
}

/* ---------------- 插件 ---------------- */

export function apply(ctx, config) {
  ctx.effect(() => ctx.webServer.register({
    kind: 'exact',
    path: '/skills/list',
    handler: async (req, res) => {
      try {
        const { items, folders } = await scan()
        sendJson(res, 200, { ok: true, items, folders, roots: roots().map((r) => r.path) })
      } catch (e) {
        fail(res, e)
      }
    },
  }))

  ctx.effect(() => ctx.webServer.register({
    kind: 'exact',
    path: '/skills/get',
    handler: async (req, res) => {
      try {
        const url = new URL(req.url || '/', 'http://localhost')
        const file = url.searchParams.get('file') || ''
        const { items, folders } = await scan()
        const hit = items.find((i) => i.file === file)
        if (!hit) throw new HttpError(404, '未找到该技能')
        const raw = await readFile(hit.file, 'utf8')
        const folder = folders.find((f) => f.id === hit.folderId)
        sendJson(res, 200, {
          ok: true,
          ...hit,
          folderName: folder ? folder.name : '',
          lines: raw.split(/\r?\n/).length,
          size: Buffer.byteLength(raw, 'utf8'),
          raw,
        })
      } catch (e) {
        fail(res, e)
      }
    },
  }))

  // 新建文件夹
  ctx.effect(() => ctx.webServer.register({
    kind: 'exact',
    path: '/skills/folders/create',
    handler: async (req, res) => {
      try {
        const body = await readJsonBody(req)
        const name = cleanName(body.name)
        const { folder, folders } = await withStore((store) => {
          if (store.folders.some((f) => f.name === name)) throw new HttpError(409, '已存在同名文件夹')
          const folder = { id: newFolderId(), name, order: store.folders.length }
          store.folders.push(folder)
          return { folder, folders: store.folders }
        })
        sendJson(res, 200, { ok: true, folder, folders })
      } catch (e) {
        fail(res, e)
      }
    },
  }))

  // 重命名文件夹
  ctx.effect(() => ctx.webServer.register({
    kind: 'exact',
    path: '/skills/folders/rename',
    handler: async (req, res) => {
      try {
        const body = await readJsonBody(req)
        const id = String(body.id || '')
        const name = cleanName(body.name)
        const { folders } = await withStore((store) => {
          const hit = store.folders.find((f) => f.id === id)
          if (!hit) throw new HttpError(404, '未找到该文件夹')
          if (store.folders.some((f) => f.id !== id && f.name === name)) throw new HttpError(409, '已存在同名文件夹')
          hit.name = name
          return { folders: store.folders }
        })
        sendJson(res, 200, { ok: true, folders })
      } catch (e) {
        fail(res, e)
      }
    },
  }))

  // 删除文件夹（里面的技能回到未分类）
  ctx.effect(() => ctx.webServer.register({
    kind: 'exact',
    path: '/skills/folders/delete',
    handler: async (req, res) => {
      try {
        const body = await readJsonBody(req)
        const id = String(body.id || '')
        const { folders } = await withStore((store) => {
          const before = store.folders.length
          store.folders = store.folders.filter((f) => f.id !== id)
          if (store.folders.length === before) throw new HttpError(404, '未找到该文件夹')
          for (const [file, folderId] of Object.entries(store.assign)) {
            if (folderId === id) delete store.assign[file]
          }
          store.folders.forEach((f, i) => { f.order = i })
          return { folders: store.folders }
        })
        sendJson(res, 200, { ok: true, folders })
      } catch (e) {
        fail(res, e)
      }
    },
  }))

  // 把技能归到某个文件夹（folderId 为空 = 移回未分类）
  ctx.effect(() => ctx.webServer.register({
    kind: 'exact',
    path: '/skills/assign',
    handler: async (req, res) => {
      try {
        const body = await readJsonBody(req)
        const file = String(body.file || '')
        const folderId = String(body.folderId || '')
        if (!file) throw new HttpError(400, '缺少技能文件路径')
        const { folders } = await withStore((store) => {
          if (folderId && !store.folders.some((f) => f.id === folderId)) throw new HttpError(404, '未找到该文件夹')
          if (folderId) store.assign[file] = folderId
          else delete store.assign[file]
          return { folders: store.folders }
        })
        sendJson(res, 200, { ok: true, folders, folderId })
      } catch (e) {
        fail(res, e)
      }
    },
  }))

  // 注册成 AI 工具：让助手直接「建文件夹 → 把技能放进去」
  try {
    const tools = ctx.get('tools')
    if (tools && typeof tools.register === 'function') {
      ctx.effect(() => tools.register(FOLDER_TOOL))
    }
  } catch {
    /* 没有 tools 服务就只保留 HTTP 接口 */
  }
}
