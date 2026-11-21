window.__ModuleLoader__.load({
  id: '@local/skills-card',
  factory(require) {
    const React = require('react')
    const h = React.createElement
    const { useEffect, useState, useCallback, useMemo, useRef } = React

    const PANEL_ID = 'skills-card'
    const STYLE_ID = 'skills-card-inline-style'

    const T = {
      ink: 'var(--dsw-alias-label-primary, currentColor)',
      ink2: 'var(--dsw-alias-label-secondary, color-mix(in srgb, currentColor 62%, transparent))',
      line1: 'var(--dsw-alias-border-l1, color-mix(in srgb, currentColor 12%, transparent))',
      line2: 'var(--dsw-alias-border-l2, color-mix(in srgb, currentColor 22%, transparent))',
      surface: 'var(--dsw-alias-bg-overlay, #ffffff)',
      layer1: 'var(--dsw-alias-bg-layer-1, color-mix(in srgb, currentColor 4%, transparent))',
      layer2: 'var(--dsw-alias-bg-layer-2, color-mix(in srgb, currentColor 8%, transparent))',
      brand: 'var(--dsw-alias-brand-primary, #4d6bfe)',
      error: 'var(--dsw-alias-state-error-primary, #e5484d)',
    }

    const CSS = `
.skc-row{transition:background .12s ease}
.skc-row:hover{background:color-mix(in srgb,currentColor 6%,transparent)}
.skc-row[data-active="1"]{background:color-mix(in srgb,currentColor 9%,transparent)}
.skc-btn{transition:background .12s ease,color .12s ease}
.skc-btn:hover{background:color-mix(in srgb,currentColor 10%,transparent)}
.skc-group.drop{background:color-mix(in srgb,var(--dsw-alias-brand-primary,#4d6bfe) 10%,transparent);
  outline:1px dashed color-mix(in srgb,var(--dsw-alias-brand-primary,#4d6bfe) 55%,transparent);outline-offset:-1px}
.skc-card{animation:skcIn .16s ease-out}
@keyframes skcIn{from{opacity:0;transform:translateY(8px) scale(.995)}to{opacity:1;transform:none}}
.skc-body::-webkit-scrollbar{width:10px;height:10px}
.skc-body::-webkit-scrollbar-thumb{background:color-mix(in srgb,currentColor 22%,transparent);border-radius:999px;border:3px solid transparent;background-clip:content-box}
`

    function useInlineStyle() {
      useEffect(() => {
        if (typeof document === 'undefined' || document.getElementById(STYLE_ID)) return
        const el = document.createElement('style')
        el.id = STYLE_ID
        el.textContent = CSS
        document.head.appendChild(el)
      }, [])
    }

    const styles = {
      wrap: { padding: '16px 18px 10px', display: 'flex', flexDirection: 'column', gap: 10, height: '100%', minHeight: 0, boxSizing: 'border-box' },
      head: { display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, flexWrap: 'wrap' },
      title: { fontSize: 15, fontWeight: 600 },
      sub: { fontSize: 12, opacity: 0.55 },
      search: {
        padding: '5px 10px', fontSize: 12, color: 'inherit', background: 'transparent',
        borderRadius: 6, width: '100%', flexShrink: 0,
        border: '1px solid ' + T.line1, outline: 'none',
      },
      newBtn: {
        display: 'inline-flex', alignItems: 'center', gap: 4, flexShrink: 0,
        padding: '4px 9px', fontSize: 11.5, lineHeight: 1.5, color: 'inherit', cursor: 'pointer',
        background: T.layer1, border: '1px solid ' + T.line1, borderRadius: 6,
      },
      createRow: { display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 },
      createInput: {
        flex: 1, padding: '5px 9px', fontSize: 12, color: 'inherit', background: 'transparent',
        borderRadius: 6, outline: 'none', border: '1px solid ' + T.line2,
      },
      notice: { fontSize: 11.5, flexShrink: 0 },
      list: { flex: 1, minHeight: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12, paddingRight: 2 },
      group: { display: 'flex', flexDirection: 'column', gap: 2, borderRadius: 8 },
      groupHead: {
        display: 'flex', alignItems: 'center', gap: 6, padding: '4px 6px', borderRadius: 6,
        cursor: 'pointer', userSelect: 'none', position: 'sticky', top: 0, zIndex: 1,
        background: 'var(--dsw-specific-sidebar-fill, transparent)',
      },
      groupName: { fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
      count: { fontSize: 10.5, opacity: 0.5, minWidth: 14 },
      ghostBtn: {
        marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: 20, height: 18, fontSize: 10.5, color: 'inherit', cursor: 'pointer',
        background: 'transparent', border: 'none', borderRadius: 4, padding: 0, opacity: 0.55,
      },
      row: {
        display: 'flex', flexDirection: 'column', gap: 1, padding: '4px 8px',
        borderRadius: 6, cursor: 'pointer', flexShrink: 0, minWidth: 0,
        border: '1px solid transparent',
      },
      rowActive: {
        border: '1px solid color-mix(in srgb, currentColor 14%, transparent)',
      },
      rowPick: {
        border: '1px solid color-mix(in srgb, var(--dsw-alias-brand-primary, #4d6bfe) 55%, transparent)',
        background: 'color-mix(in srgb, var(--dsw-alias-brand-primary, #4d6bfe) 10%, transparent)',
      },
      pickOn: {
        marginLeft: 'auto', flexShrink: 0, width: 15, height: 15, borderRadius: 999,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 9, lineHeight: 1, color: '#fff',
        background: 'var(--dsw-alias-brand-primary, #4d6bfe)',
      },
      pickOff: {
        marginLeft: 'auto', flexShrink: 0, width: 15, height: 15, borderRadius: 999,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 10, lineHeight: 1, opacity: 0.4, border: '1px dashed ' + T.line2,
      },
      hint: { fontSize: 11, opacity: 0.6, flexShrink: 0, lineHeight: 1.5 },
      rowTop: { display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 },
      name: { fontWeight: 600, fontSize: 12.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
      tag: {
        fontSize: 10, padding: '1px 6px', borderRadius: 999, opacity: 0.7,
        border: '1px solid currentColor', flexShrink: 0,
      },
      desc: { fontSize: 10.5, opacity: 0.55, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
      moveSelect: {
        marginLeft: 'auto', fontSize: 10.5, color: 'inherit', background: 'transparent', cursor: 'pointer',
        border: '1px solid ' + T.line1, borderRadius: 999, padding: '1px 4px',
        maxWidth: 96, flexShrink: 0, outline: 'none', opacity: 0.75,
      },
      empty: { fontSize: 11.5, opacity: 0.45, padding: '2px 8px 4px 24px' },
      err: { fontSize: 12, opacity: 0.8, color: T.error },

      /* ---- 浮窗卡片 ---- */
      backdrop: {
        position: 'fixed', inset: 0, zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24, background: 'rgba(0,0,0,0.34)', pointerEvents: 'auto',
      },
      card: {
        display: 'flex', flexDirection: 'column', gap: 10, minWidth: 0,
        width: 'min(880px, 92vw)', maxHeight: 'min(84vh, 820px)',
        padding: '16px 18px 14px', borderRadius: 14,
        background: T.surface, color: T.ink,
        border: '1px solid ' + T.line2,
        boxShadow: '0 24px 64px rgba(0,0,0,0.28), 0 2px 8px rgba(0,0,0,0.12)',
        animation: 'skcIn .16s ease-out',
      },
      cardHead: { display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, flexShrink: 0 },
      cardTitle: { fontSize: 15.5, fontWeight: 650, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
      closeBtn: {
        marginLeft: 'auto', width: 24, height: 24, flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 12, color: 'inherit', cursor: 'pointer', background: 'transparent',
        border: '1px solid ' + T.line1, borderRadius: 6, padding: 0,
      },
      metaRow: { display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, flexShrink: 0 },
      path: {
        fontFamily: 'ui-monospace, Consolas, monospace', fontSize: 10.5, opacity: 0.55,
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', direction: 'rtl', textAlign: 'left',
      },
      smallBtn: {
        padding: '3px 8px', fontSize: 10.5, color: 'inherit', cursor: 'pointer', flexShrink: 0,
        background: 'transparent', border: '1px solid ' + T.line1, borderRadius: 6,
      },
      descText: { fontSize: 12, opacity: 0.7, lineHeight: 1.6, flexShrink: 0 },
      tabs: { display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0, flexWrap: 'wrap' },
      tab: {
        padding: '2px 10px', fontSize: 11, color: 'inherit', cursor: 'pointer',
        background: 'transparent', border: '1px solid ' + T.line1, borderRadius: 999, opacity: 0.7,
      },
      tabOn: {
        opacity: 1, borderColor: T.brand, color: T.brand,
        background: 'color-mix(in srgb, var(--dsw-alias-brand-primary, #4d6bfe) 10%, transparent)',
      },
      body: {
        flex: 1, minHeight: 120, overflowY: 'auto', overscrollBehavior: 'contain',
        fontFamily: 'ui-monospace, Consolas, monospace', fontSize: 11.5, lineHeight: 1.62,
        whiteSpace: 'pre-wrap', wordBreak: 'break-word', margin: 0,
        background: T.layer1, border: '1px solid ' + T.line1, borderRadius: 8, padding: '10px 12px',
      },
      resources: { fontSize: 11, opacity: 0.55, flexShrink: 0 },
      cardFoot: { display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 },
      footHint: { fontSize: 10.5, opacity: 0.4 },
    }

    /* ---------------- 浮窗卡片状态（模块级，面板与 overlay 共享） ---------------- */

    let cardState = { open: false, item: null }
    const cardSubs = new Set()

    function emitCard() {
      for (const fn of Array.from(cardSubs)) {
        try { fn() } catch (e) { /* 单个订阅出错不影响其他 */ }
      }
    }

    function openCard(item) {
      cardState = { open: true, item }
      emitCard()
    }

    function closeCard() {
      if (!cardState.open) return
      cardState = { open: false, item: null }
      emitCard()
    }

    function useCardState() {
      const [state, setState] = useState(cardState)
      useEffect(() => {
        const fn = () => setState(cardState)
        cardSubs.add(fn)
        fn()
        return () => { cardSubs.delete(fn) }
      }, [])
      return state
    }

    /* ---------------- 小工具 ---------------- */

    function copiedText(text) {
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text)
          return true
        }
      } catch (e) { /* 落到下面的兜底 */ }
      try {
        const ta = document.createElement('textarea')
        ta.value = text
        ta.style.position = 'fixed'
        ta.style.opacity = '0'
        document.body.appendChild(ta)
        ta.select()
        document.execCommand('copy')
        document.body.removeChild(ta)
        return true
      } catch (e) {
        return false
      }
    }

    function byteText(n) {
      n = Number(n) || 0
      if (n < 1024) return n + ' B'
      if (n < 1024 * 1024) return (n / 1024).toFixed(1) + ' KB'
      return (n / 1024 / 1024).toFixed(1) + ' MB'
    }

    /* ---------------- 浮窗卡片 ---------------- */

    function SkillCardOverlay() {
      const state = useCardState()
      const item = state.item
      const [detail, setDetail] = useState(null)
      const [tab, setTab] = useState('body')
      const [error, setError] = useState('')
      const [copied, setCopied] = useState(false)
      const closeRef = useRef(null)

      useEffect(() => {
        if (!state.open || !item) { setDetail(null); setError(''); return }
        let alive = true
        setDetail(null)
        setError('')
        setTab('body')
        fetch('/skills/get?file=' + encodeURIComponent(item.file), { cache: 'no-store' })
          .then((r) => r.json())
          .then((d) => {
            if (!alive) return
            if (d && d.ok) { setDetail(d); if (d.body && !String(d.body).trim()) setTab('config') } else setError((d && d.message) || '读取失败')
          })
          .catch((e) => { if (alive) setError(String(e && e.message ? e.message : e)) })
        return () => { alive = false }
      }, [state.open, item && item.file])

      useEffect(() => {
        if (!state.open) return
        const onKey = (e) => {
          if (e.key === 'Escape') { e.stopPropagation(); closeCard() }
        }
        window.addEventListener('keydown', onKey, true)
        return () => window.removeEventListener('keydown', onKey, true)
      }, [state.open])

      // 打开时把焦点移到关闭按钮，键盘用户按 Esc / Tab 都顺
      useEffect(() => {
        if (state.open && closeRef.current) {
          try { closeRef.current.focus() } catch (e) { /* 忽略 */ }
        }
      }, [state.open])

      if (!state.open || !item) return null

      const d = detail || {}
      const title = d.name || item.name || item.folder
      const dir = d.dir || item.dir || ''
      const configText = d.preface ? d.preface : '(这个 skill 没有 frontmatter)'
      const bodyText = d.body != null ? d.body : (d.bodyPreview || '')
      const text = tab === 'config' ? configText : (String(bodyText).trim() ? bodyText : '(正文是空的)')

      const copy = () => {
        if (copiedText(d.file || item.file)) {
          setCopied(true)
          setTimeout(() => setCopied(false), 1200)
        }
      }

      const tabBtn = (key, label) => h('button', {
        key,
        className: 'skc-btn',
        style: tab === key ? { ...styles.tab, ...styles.tabOn } : styles.tab,
        onClick: () => setTab(key),
      }, label)

      return h('div', {
        style: styles.backdrop,
        onMouseDown: (e) => { if (e.target === e.currentTarget) closeCard() },
      },
        h('div', {
          style: styles.card,
          className: 'skc-card',
          role: 'dialog',
          'aria-modal': 'true',
          'aria-label': title,
          onMouseDown: (e) => e.stopPropagation(),
        },
          h('div', { style: styles.cardHead },
            h('span', { style: styles.cardTitle }, title),
            d.source || item.source ? h('span', { style: styles.tag }, d.source || item.source) : null,
            d.folderName || item.folderId ? h('span', { style: styles.tag }, d.folderName || '分组') : null,
            h('button', {
              ref: closeRef,
              className: 'skc-btn',
              style: styles.closeBtn,
              title: '关闭（Esc）',
              onClick: closeCard,
            }, '✕')),

          h('div', { style: styles.metaRow },
            h('code', { style: styles.path, title: dir }, dir),
            h('button', { className: 'skc-btn', style: styles.smallBtn, onClick: copy }, copied ? '已复制' : '复制路径')),

          (d.description || item.description)
            ? h('div', { style: styles.descText }, d.description || item.description)
            : null,
          d.whenToUse
            ? h('div', { style: { ...styles.descText, opacity: 0.5, fontSize: 11.5 } }, '何时使用：', d.whenToUse)
            : null,

          h('div', { style: styles.tabs },
            tabBtn('body', '正文'),
            tabBtn('config', '配置（frontmatter）'),
            h('span', { style: { marginLeft: 'auto', fontSize: 10.5, opacity: 0.45 } },
              detail
                ? `${d.lines || 0} 行 · ${byteText(d.size)}`
                : '')),

          error
            ? h('div', { style: { ...styles.body, color: T.error } }, '读取失败：', error)
            : !detail
              ? h('div', { style: { ...styles.body, opacity: 0.5 } }, '读取中…')
              : h('pre', { style: styles.body, className: 'skc-body' }, text),

          d.resources && d.resources.length
            ? h('div', { style: styles.resources }, '同目录资源：', d.resources.join('   '))
            : null,

          h('div', { style: styles.cardFoot },
            h('span', { style: styles.footHint }, 'Esc 或点击空白处关闭'),
            h('button', { className: 'skc-btn', style: { ...styles.smallBtn, marginLeft: 'auto' }, onClick: closeCard }, '关闭'))))
    }

    /* ---------------- 图标 ---------------- */

    function FolderIcon(props) {
      const size = (props && props.size) || 14
      return h('svg', {
        viewBox: '0 0 24 24', width: size, height: size, fill: 'none',
        stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round',
        'aria-hidden': true, style: { display: 'block', flexShrink: 0, opacity: (props && props.dim) ? 0.45 : 0.7 },
      },
        h('path', { d: 'M3 7.5a2 2 0 0 1 2-2h4l1.6 1.9H19a2 2 0 0 1 2 2v8.1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7.5Z' }))
    }

    function ChevronIcon(props) {
      const open = !!(props && props.open)
      return h('svg', {
        viewBox: '0 0 24 24', width: 9, height: 9, fill: 'none',
        stroke: 'currentColor', strokeWidth: 2.6, strokeLinecap: 'round', strokeLinejoin: 'round',
        'aria-hidden': true,
        style: { display: 'block', flexShrink: 0, opacity: 0.5, transform: open ? 'rotate(90deg)' : 'none', transition: 'transform .12s ease' },
      },
        h('path', { d: 'M9 5l7 7-7 7' }))
    }

    function PencilIcon() {
      return h('svg', {
        viewBox: '0 0 24 24', width: 12, height: 12, fill: 'none',
        stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round',
        'aria-hidden': true, style: { display: 'block' },
      },
        h('path', { d: 'M12 20h9' }),
        h('path', { d: 'M16.6 3.4a2 2 0 0 1 2.8 2.8L7 18.6l-3.8 1 1-3.8Z' }))
    }

    function TrashIcon() {
      return h('svg', {
        viewBox: '0 0 24 24', width: 12, height: 12, fill: 'none',
        stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round',
        'aria-hidden': true, style: { display: 'block' },
      },
        h('path', { d: 'M4 7h16' }),
        h('path', { d: 'M9 7V4.8h6V7' }),
        h('path', { d: 'M6.5 7 7.6 20h8.8L17.5 7' }))
    }

    function Icon(props) {
      const size = (props && props.size) || 20
      return h('svg', {
        viewBox: '0 0 24 24', width: size, height: size, fill: 'none',
        stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round',
        opacity: (props && props.active) ? 1 : 0.75, 'aria-hidden': true, style: { display: 'block' },
      },
        h('path', { d: 'M3 7.2a2 2 0 0 1 2-2h4.2l1.6 1.9H19a2 2 0 0 1 2 2v8.7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7.2Z' }),
        h('path', { d: 'M8.2 13.6h7.6' }))
    }

    /* ---------------- 技能面板 ---------------- */

    function SkillsPage() {
      useInlineStyle()
      const [data, setData] = useState(null)
      const [error, setError] = useState('')
      const [notice, setNotice] = useState('')
      const [q, setQ] = useState('')
      const [creating, setCreating] = useState(false)
      const [draft, setDraft] = useState('')
      const [renaming, setRenaming] = useState(null) // { id, value }
      const [delAsk, setDelAsk] = useState('')
      const [collapsed, setCollapsed] = useState({})
      const [dropTarget, setDropTarget] = useState(null)
      const [active, setActive] = useState('')
      const [busy, setBusy] = useState(false)
      // 新建文件夹时的「待放入」技能（点下面的行切换）
      const [pending, setPending] = useState([])
      const pendingSet = useMemo(() => new Set(pending), [pending])

      // 拖动到列表上下边缘时自动滚动
      const listRef = useRef(null)
      const dragYRef = useRef(null)
      const dragXRef = useRef(null)
      const rafRef = useRef(0)
      const draggingRef = useRef(false)

      const stopAutoScroll = useCallback(() => {
        draggingRef.current = false
        if (rafRef.current) {
          try { cancelAnimationFrame(rafRef.current) } catch (e) { /* 忽略 */ }
          rafRef.current = 0
        }
      }, [])

      const startAutoScroll = useCallback(() => {
        if (draggingRef.current) return
        draggingRef.current = true
        const step = () => {
          if (!draggingRef.current) return
          const el = listRef.current
          const y = dragYRef.current
          if (el && y != null) {
            const r = el.getBoundingClientRect()
            const edge = 72
            const max = 16
            let dy = 0
            if (y < r.top + edge) dy = -Math.min(max, Math.round(((r.top + edge - y) / edge) * max))
            else if (y > r.bottom - edge) dy = Math.min(max, Math.round(((y - (r.bottom - edge)) / edge) * max))
            const x = dragXRef.current
            const insideX = x == null || (x >= r.left && x <= r.right)
            if (dy && insideX) el.scrollTop += dy
          }
          rafRef.current = window.requestAnimationFrame(step)
        }
        rafRef.current = window.requestAnimationFrame(step)
      }, [])

      useEffect(() => {
        const end = () => stopAutoScroll()
        window.addEventListener('dragend', end)
        window.addEventListener('drop', end)
        window.addEventListener('mouseup', end)
        return () => {
          window.removeEventListener('dragend', end)
          window.removeEventListener('drop', end)
          window.removeEventListener('mouseup', end)
          stopAutoScroll()
        }
      }, [stopAutoScroll])

      const flash = useCallback((msg) => {
        setNotice(msg)
        window.setTimeout(() => setNotice((cur) => (cur === msg ? '' : cur)), 2400)
      }, [])

      const load = useCallback(() => {
        fetch('/skills/list', { cache: 'no-store' })
          .then((r) => r.json())
          .then((d) => {
            if (d && d.ok) { setData(d); setError('') } else setError((d && d.message) || '读取失败')
          })
          .catch((e) => setError(String(e && e.message ? e.message : e)))
      }, [])

      useEffect(() => { load() }, [load])

      // 离开这个面板时把浮窗一起收掉，免得卡片留在屏幕上
      useEffect(() => () => closeCard(), [])

      const act = useCallback((path, body) => fetch(path, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body || {}),
      }).then((r) => r.json()).then((d) => {
        if (!d || !d.ok) throw new Error((d && d.message) || '操作失败')
        return d
      }), [])

      /* ---- 文件夹操作 ---- */

      const createFolder = useCallback((event) => {
        if (event) event.preventDefault()
        const name = draft.trim()
        if (!name) return
        setBusy(true)
        const picked = pending.slice()
        act('/skills/folders/create', { name })
          .then(async (d) => {
            const id = d.folder && d.folder.id
            if (id && picked.length) {
              // 逐个放进去（顺序发送，避免后端并发读改写互相覆盖）；单个失败不挡住建文件夹
              for (const file of picked) {
                await act('/skills/assign', { file, folderId: id }).catch(() => null)
              }
            }
            setCreating(false)
            setDraft('')
            setPending([])
            setData((cur) => (cur ? { ...cur, folders: d.folders } : cur))
            setCollapsed((cur) => { const next = { ...cur }; if (id) delete next[id]; return next })
            if (picked.length) load()
            flash(id && picked.length ? `已新建「${name}」，放入 ${picked.length} 个技能` : '已新建文件夹：' + name)
          })
          .catch((e) => flash('新建失败：' + e.message))
          .then(() => setBusy(false))
      }, [draft, pending, act, flash, load])

      const renameFolder = useCallback((event) => {
        if (event) event.preventDefault()
        if (!renaming) return
        const name = renaming.value.trim()
        if (!name) return
        act('/skills/folders/rename', { id: renaming.id, name })
          .then((d) => {
            setData((cur) => (cur ? { ...cur, folders: d.folders } : cur))
            setRenaming(null)
            flash('已重命名')
          })
          .catch((e) => flash('重命名失败：' + e.message))
      }, [renaming, act, flash])

      const removeFolder = useCallback((folder) => {
        if (delAsk !== folder.id) {
          setDelAsk(folder.id)
          window.setTimeout(() => setDelAsk((cur) => (cur === folder.id ? '' : cur)), 4000)
          return
        }
        setDelAsk('')
        act('/skills/folders/delete', { id: folder.id })
          .then((d) => {
            setData((cur) => (cur ? {
              ...cur,
              folders: d.folders,
              items: cur.items.map((it) => (it.folderId === folder.id ? { ...it, folderId: '' } : it)),
            } : cur))
            flash('已删除文件夹「' + folder.name + '」，里面的技能回到未分类')
          })
          .catch((e) => flash('删除失败：' + e.message))
      }, [delAsk, act, flash])

      const assign = useCallback((file, folderId) => {
        setData((cur) => (cur
          ? { ...cur, items: cur.items.map((it) => (it.file === file ? { ...it, folderId } : it)) }
          : cur))
        act('/skills/assign', { file, folderId })
          .then((d) => {
            setData((cur) => (cur ? { ...cur, folders: d.folders || cur.folders } : cur))
            const name = (data && data.folders || []).find((f) => f.id === folderId)
            flash(folderId ? '已归到「' + (name ? name.name : '文件夹') + '」' : '已移回未分类')
          })
          .catch((e) => { flash('归类失败：' + e.message); load() })
      }, [act, data, flash, load])

      const open = useCallback((item) => {
        setActive(item.file)
        openCard(item)
      }, [])

      /* ---- 分组与过滤 ---- */

      const items = (data && data.items) || []
      const folders = useMemo(() => {
        const list = ((data && data.folders) || []).slice()
        list.sort((a, b) => (a.order || 0) - (b.order || 0))
        return list
      }, [data])

      const kw = q.trim().toLowerCase()
      const visible = kw
        ? items.filter((i) => (i.name + ' ' + i.description + ' ' + i.whenToUse + ' ' + i.folder + ' ' + i.source).toLowerCase().includes(kw))
        : items

      const groups = useMemo(() => {
        const known = new Set(folders.map((f) => f.id))
        const buckets = new Map()
        for (const f of folders) buckets.set(f.id, [])
        buckets.set('', [])
        for (const it of visible) {
          const key = it.folderId && known.has(it.folderId) ? it.folderId : ''
          if (!buckets.has(key)) buckets.set(key, [])
          buckets.get(key).push(it)
        }
        const out = folders.map((f) => ({ id: f.id, name: f.name, folder: f, items: buckets.get(f.id) || [] }))
        out.push({ id: '', name: '未分类', folder: null, items: buckets.get('') || [] })
        return kw ? out.filter((g) => g.items.length) : out
      }, [folders, visible, kw])

      if (error && !data) {
        return h('div', { style: styles.wrap },
          h('div', { style: styles.err }, '读取失败：', error),
          h('button', { className: 'skc-btn', style: styles.smallBtn, onClick: load }, '重试'))
      }
      if (!data) return h('div', { style: styles.wrap }, h('div', { style: styles.sub }, '加载中…'))

      const toggle = (id) => setCollapsed((cur) => ({ ...cur, [id]: !cur[id] }))

      const togglePending = (file) => setPending((cur) => (
        cur.includes(file) ? cur.filter((f) => f !== file) : cur.concat(file)
      ))

      const rowOf = (it) => {
        const picked = creating && pendingSet.has(it.file)
        const rowStyle = picked
          ? { ...styles.row, ...styles.rowPick }
          : (active === it.file ? { ...styles.row, ...styles.rowActive } : styles.row)
        return h('div', {
          key: it.file,
          className: 'skc-row',
          'data-active': active === it.file ? '1' : undefined,
          style: rowStyle,
          title: creating
            ? (picked ? '再点一下移出这个新文件夹' : '点一下放进这个新文件夹')
            : it.file,
          draggable: !creating,
          onDragStart: (e) => {
            try { e.dataTransfer.setData('text/plain', it.file); e.dataTransfer.effectAllowed = 'move' } catch (err) { /* 忽略 */ }
            startAutoScroll()
          },
          onDragEnd: () => stopAutoScroll(),
          onClick: () => (creating ? togglePending(it.file) : open(it)),
        },
          h('div', { style: styles.rowTop },
            h('span', { style: styles.name }, it.name),
            h('span', { style: styles.tag }, it.source),
            creating
              ? h('span', { style: picked ? styles.pickOn : styles.pickOff, 'aria-hidden': true }, picked ? '✓' : '+')
              : folders.length
                ? h('select', {
                    style: styles.moveSelect,
                    value: it.folderId || '',
                    title: '归类到文件夹',
                    onMouseDown: (e) => e.stopPropagation(),
                    onClick: (e) => e.stopPropagation(),
                    onChange: (e) => assign(it.file, e.target.value),
                  },
                    h('option', { value: '' }, '未分类'),
                    folders.map((f) => h('option', { key: f.id, value: f.id }, f.name)))
                : null),
          h('span', { style: styles.desc }, it.description || it.whenToUse || it.folder))
      }

      const groupOf = (g) => {
        const isCollapsed = !!collapsed[g.id]
        const dropKey = g.id || '__uncat'
        const drop = dropTarget === dropKey
        return h('div', {
          key: g.id || '__uncat',
          className: 'skc-group' + (drop ? ' drop' : ''),
          style: styles.group,
          onDragOver: (e) => {
            if (!folders.length) return
            e.preventDefault()
            e.dataTransfer.dropEffect = 'move'
            if (dropTarget !== dropKey) setDropTarget(dropKey)
          },
          onDragLeave: () => setDropTarget((cur) => (cur === dropKey ? null : cur)),
          onDrop: (e) => {
            e.preventDefault()
            stopAutoScroll()
            setDropTarget(null)
            let file = ''
            try { file = e.dataTransfer.getData('text/plain') } catch (err) { file = '' }
            if (file) assign(file, g.id)
          },
        },
          h('div', { style: styles.groupHead, onClick: () => toggle(g.id), title: g.folder ? '拖技能到这里归类' : '未分类' },
            h(ChevronIcon, { open: !isCollapsed }),
            h(FolderIcon, { dim: !g.folder }),
            renaming && renaming.id === g.id
              ? h('input', {
                  autoFocus: true,
                  style: { ...styles.createInput, flex: '1 1 120px', padding: '2px 6px', fontSize: 12 },
                  value: renaming.value,
                  onChange: (e) => setRenaming({ id: g.id, value: e.target.value }),
                  onClick: (e) => e.stopPropagation(),
                  onKeyDown: (e) => {
                    if (e.key === 'Enter') renameFolder(e)
                    if (e.key === 'Escape') setRenaming(null)
                  },
                  onBlur: () => setRenaming(null),
                })
              : h('span', { style: styles.groupName }, g.name),
            h('span', { style: styles.count }, String(g.items.length)),
            g.folder
              ? h('button', {
                  className: 'skc-btn', style: styles.ghostBtn, title: '重命名文件夹',
                  onClick: (e) => { e.stopPropagation(); setRenaming({ id: g.id, value: g.name }) },
                }, h(PencilIcon))
              : null,
            g.folder
              ? h('button', {
                  className: 'skc-btn',
                  style: { ...styles.ghostBtn, marginLeft: 0, opacity: delAsk === g.id ? 1 : 0.55, color: delAsk === g.id ? T.error : 'inherit', width: 'auto', padding: '0 4px' },
                  title: '删除文件夹（技能回到未分类）',
                  onClick: (e) => { e.stopPropagation(); removeFolder(g.folder) },
                }, delAsk === g.id ? '确认删除？' : h(TrashIcon))
              : null),
          isCollapsed
            ? null
            : (g.items.length
                ? g.items.map(rowOf)
                : h('div', { style: styles.empty }, g.folder ? '空的，把技能拖到这里' : '没有技能'))
        )
      }

      let listBody
      if (!groups.length) listBody = h('div', { style: styles.empty }, '没有匹配的技能')
      else listBody = groups.map(groupOf)

      return h('div', { style: styles.wrap },
        h('div', { style: styles.head },
          h('span', { style: styles.title }, '技能'),
          h('span', { style: styles.sub }, kw ? `${visible.length} / ${items.length} 个` : `${items.length} 个`),
          h('button', {
            className: 'skc-btn',
            style: creating ? { ...styles.newBtn, borderColor: T.brand, color: T.brand } : styles.newBtn,
            title: '新建一个文件夹，把技能归类',
            onClick: () => {
              setCreating((v) => !v)
              setDraft('')
              setPending([])
            },
          }, creating ? '× 取消新建' : '＋ 新建文件夹')),

        creating
          ? h('div', { style: { display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 } },
              h('form', { style: styles.createRow, onSubmit: createFolder },
                h('input', {
                  autoFocus: true,
                  style: styles.createInput,
                  placeholder: '文件夹名，回车创建',
                  value: draft,
                  onChange: (e) => setDraft(e.target.value),
                  onKeyDown: (e) => { if (e.key === 'Escape') { setCreating(false); setDraft(''); setPending([]) } },
                }),
                h('button', { type: 'submit', className: 'skc-btn', style: styles.newBtn, disabled: busy || !draft.trim() }, '创建'),
                h('button', { type: 'button', className: 'skc-btn', style: styles.newBtn, onClick: () => { setCreating(false); setDraft(''); setPending([]) } }, '取消')),
              h('div', { style: styles.hint },
                pending.length
                  ? `已选 ${pending.length} 个技能，点技能可移出`
                  : '下面的技能点一下就放进新文件夹（可多选，再点取消）'))
          : null,

        h('input', {
          style: styles.search,
          placeholder: '搜索技能名 / 描述',
          value: q,
          onChange: (e) => setQ(e.target.value),
        }),

        notice ? h('div', { style: styles.notice }, notice) : null,

        h('div', {
          style: styles.list,
          ref: listRef,
          onDragOver: (e) => { dragYRef.current = e.clientY; dragXRef.current = e.clientX },
          onDragEnter: (e) => { dragYRef.current = e.clientY; dragXRef.current = e.clientX },
        }, listBody))
    }

    return {
      inject: ['slots'],
      apply(ctx) {
        ctx.slots.inject('sidebar.panellist', () => ctx.slots.register({
          name: 'sidebar.panellist', id: PANEL_ID, order: 17, label: () => '技能',
        }, Icon))
        ctx.slots.inject('main', () => ctx.slots.register({
          name: 'main', key: PANEL_ID,
        }, SkillsPage))
        // 浮窗卡片放在整帧最上层的 overlay 槽里，不会被面板裁剪
        ctx.slots.inject('shell.overlay', () => ctx.slots.register({
          name: 'shell.overlay', id: 'skills-card-detail', order: 40,
        }, SkillCardOverlay))
      },
    }
  },
})
