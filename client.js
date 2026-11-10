window.__ModuleLoader__.load({
  id: '@local/skills-card',
  factory(require) {
    const React = require('react')
    const h = React.createElement
    const { useEffect, useState, useCallback } = React

    const PANEL_ID = 'skills-card'

    const styles = {
      wrap: { padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: 10, height: '100%', overflowY: 'auto', minHeight: 0 },
      head: { display: 'flex', alignItems: 'baseline', gap: 10, flexShrink: 0 },
      sub: { fontSize: 12, opacity: 0.55 },
      search: {
        padding: '5px 10px', fontSize: 12, color: 'inherit', background: 'transparent',
        borderRadius: 6, flex: '0 0 260px',
        border: '1px solid color-mix(in srgb, currentColor 20%, transparent)',
      },
      list: { display: 'flex', flexDirection: 'column', gap: 2 },
      row: {
        display: 'flex', alignItems: 'baseline', gap: 8, padding: '6px 8px',
        borderRadius: 6, cursor: 'pointer', flexShrink: 0,
        border: '1px solid transparent',
      },
      rowActive: {
        background: 'color-mix(in srgb, currentColor 7%, transparent)',
        border: '1px solid color-mix(in srgb, currentColor 14%, transparent)',
      },
      name: { fontWeight: 600, fontSize: 12.5 },
      tag: {
        fontSize: 10, padding: '1px 6px', borderRadius: 999, opacity: 0.7,
        border: '1px solid currentColor',
      },
      desc: { fontSize: 11, opacity: 0.6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
      detail: {
        display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8,
        borderTop: '1px solid color-mix(in srgb, currentColor 10%, transparent)', paddingTop: 10,
      },
      label: { fontSize: 11, opacity: 0.55 },
      code: {
        fontFamily: 'ui-monospace, Consolas, monospace', fontSize: 11.5, lineHeight: 1.55,
        whiteSpace: 'pre-wrap', wordBreak: 'break-word',
        background: 'color-mix(in srgb, currentColor 5%, transparent)',
        border: '1px solid color-mix(in srgb, currentColor 10%, transparent)',
        borderRadius: 6, padding: '8px 10px', maxHeight: 320, overflowY: 'auto',
      },
      err: { fontSize: 12, opacity: 0.7 },
    }

    function Icon(props) {
      const size = (props && props.size) || 20
      return h('svg', { viewBox: '0 0 24 24', width: size, height: size, fill: 'none',
                        stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round',
                        opacity: (props && props.active) ? 1 : 0.75, 'aria-hidden': true, style: { display: 'block' } },
        h('rect', { x: 3, y: 4, width: 18, height: 16, rx: 2 }),
        h('path', { d: 'M7 8h6M7 12h10M7 16h8' }))
    }

    function SkillsPage() {
      const [data, setData] = useState(null)
      const [error, setError] = useState('')
      const [q, setQ] = useState('')
      const [sel, setSel] = useState(null)
      const [detail, setDetail] = useState(null)
      const [tab, setTab] = useState('config')

      const load = useCallback(() => {
        fetch('/skills/list', { cache: 'no-store' })
          .then((r) => r.json())
          .then((d) => { if (d && d.ok) setData(d); else setError((d && d.message) || '读取失败') })
          .catch((e) => setError(String(e)))
      }, [])

      useEffect(() => { load() }, [load])

      useEffect(() => {
        if (!sel) { setDetail(null); return }
        fetch(`/skills/get?file=${encodeURIComponent(sel.file)}`, { cache: 'no-store' })
          .then((r) => r.json())
          .then((d) => { if (d && d.ok) setDetail(d); else setError((d && d.message) || '读取失败') })
          .catch((e) => setError(String(e)))
      }, [sel])

      if (error) return h('div', { style: styles.wrap }, h('div', { style: styles.err }, '读取失败：', error))
      if (!data) return h('div', { style: styles.wrap }, h('div', { style: styles.err }, '加载中…'))

      const items = data.items || []
      const kw = q.trim().toLowerCase()
      const hit = kw
        ? items.filter((i) => (i.name + ' ' + i.description + ' ' + i.whenToUse).toLowerCase().includes(kw))
        : items

      const rows = hit.map((it) => h('div', {
        key: it.file,
        style: sel && sel.file === it.file ? { ...styles.row, ...styles.rowActive } : styles.row,
        onClick: () => setSel(it),
      },
        h('span', { style: styles.name }, it.name),
        h('span', { style: styles.tag }, it.source),
        h('span', { style: { ...styles.desc, flex: 1 } }, it.description || it.folder)))

      return h('div', { style: styles.wrap },
        h('div', { style: styles.head },
          h('span', { style: { fontSize: 15, fontWeight: 600 } }, '技能'),
          h('span', { style: styles.sub }, `${items.length} 个`),
          h('input', {
            style: { ...styles.search, marginLeft: 'auto' },
            placeholder: '搜索技能名 / 描述',
            value: q,
            onChange: (e) => setQ(e.target.value),
          })),
        h('div', { style: styles.list }, rows.length ? rows : h('div', { style: styles.err }, '没有匹配的技能')),
        detail ? h('div', { style: styles.detail },
          h('div', { style: { display: 'flex', alignItems: 'baseline', gap: 8 } },
            h('span', { style: { fontSize: 13, fontWeight: 600 } }, detail.name),
            h('span', { style: styles.tag }, detail.source),
            h('span', { style: { ...styles.sub, fontSize: 11 } }, detail.dir)),
          detail.description ? h('div', { style: { ...styles.desc, whiteSpace: 'normal' } }, detail.description) : null,
          h('div', { style: { display: 'flex', gap: 6 } },
            ['config', 'body'].map((k) => h('button', {
              key: k,
              style: {
                ...styles.tag, cursor: 'pointer', background: tab === k ? 'color-mix(in srgb, currentColor 12%, transparent)' : 'transparent',
                padding: '2px 10px', fontSize: 11,
              },
              onClick: () => setTab(k),
            }, k === 'config' ? '配置（frontmatter）' : '正文预览'))),
          h('pre', { style: styles.code },
            tab === 'config' ? (detail.preface || '(无 frontmatter)') : (detail.bodyPreview || '')),
          detail.resources && detail.resources.length
            ? h('div', { style: styles.label }, '同目录资源：', detail.resources.join('  '))
            : null
        ) : h('div', { style: styles.err }, '点上面任意一行查看配置'))
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
      },
    }
  },
})
