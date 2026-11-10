# dsh-skills-card

DeepSeek Harness 左侧边栏的「技能」面板：列出本机所有 skill（自带 / channel-qq / 用户 / profile），
点开可以查看 SKILL.md 的 frontmatter 配置和正文预览。

## 功能

- 扫描 `~/.dsh/channel-qq/skills`、`~/.dsh/skills`、`~/.dsh/plugins`、profile 与 DSH 自带的 skills 目录
- 列表显示名称、来源、描述，支持搜索
- 详情显示 YAML frontmatter（配置）与正文，附带同目录资源清单

## 安装

```bash
dsh plugin add <本目录>
```

或者用 DSH 的 `plugin_manager` 指向本目录（package.json 里已声明 `dsh.bundle.patch`）。

## 结构

```
index.js          Host：/skills/list、/skills/get
client.js         Client：sidebar 入口 + 列表/详情
cordis.patch.yml  插入 skills-card 行
locale/           中英文标题
icon.svg
```
