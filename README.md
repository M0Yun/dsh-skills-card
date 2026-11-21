# dsh-skills-card

DeepSeek Harness 左侧边栏的「技能」面板：列出本机所有 skill（自带 / channel-qq / 用户 / profile），
可以按文件夹归类，点一下技能就用浮窗卡片看配置和正文。

## 功能

- 扫描 `~/.dsh/channel-qq/skills`、`~/.dsh/skills`、`~/.dsh/plugins`、profile 与 DSH 自带的 skills 目录
- 列表显示名称、来源、描述，支持搜索；按文件夹分组、可折叠
- 折叠状态按文件夹 id 记在浏览器 localStorage（`skills-card:collapsed`），刷新、重开页面都还是上次的样子；搜索时自动展开命中的分组
- 「＋ 新建文件夹」自己建分组：填名字的同时，点下面的技能就能直接放进这个新文件夹（可多选、再点取消，创建后一起归类）
- 整理时两种归法：行内下拉选文件夹，或把技能拖到分组标题上（拖到列表上下边缘会自动滚动，长列表也拖得到）
- 分组可重命名（✎）、删除（✕，两段式确认；里面的技能回到「未分类」）
- 点技能弹出居中浮窗卡片：标题/来源/路径、复制路径、正文与 frontmatter 两个 tab、行数与文件大小、同目录资源
- 浮窗走 `shell.overlay` 槽，盖在最上层，不会被侧栏滚动容器裁剪；Esc、点空白处、关闭按钮都能关

## 分组是怎么存的

技能本身不移动（移动会弄坏插件自带的 skill），分组是「虚拟」的：

```
~/.dsh/skills-card/groups.json
{
  "version": 1,
  "folders": [{ "id": "f_xxx", "name": "写作", "order": 0 }],
  "assign": { "C:\\...\\SKILL.md": "f_xxx" }
}
```

删掉这个文件就等于清空分组，技能仍然都在。

存储的读-改-写走一条队列（`withStore`），所以「新建文件夹时一次放进去多个技能」这种并发写入不会互相覆盖。

## 接口

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | `/skills/list` | 技能列表 + 文件夹列表（每项带 `folderId`） |
| GET | `/skills/get?file=` | 单个技能的 frontmatter、正文全文、行数、大小、资源 |
| POST | `/skills/folders/create` | `{ name }` 新建文件夹 |
| POST | `/skills/folders/rename` | `{ id, name }` 重命名 |
| POST | `/skills/folders/delete` | `{ id }` 删除（技能回未分类） |
| POST | `/skills/assign` | `{ file, folderId }` 归类，`folderId` 为空 = 未分类 |

## AI 用的工具：`skills_folders`

插件把自己注册成一个 Agent 工具，助手可以直接说「建个『写作』文件夹，把 ask-matt 和 asr-transcribe 放进去」：

| action | 参数 | 作用 |
| --- | --- | --- |
| `list` | — | 列出文件夹和各自的技能数、未分类数量 |
| `create` | `folder`, `skills?` | 建文件夹；带 `skills` 就顺手放进去 |
| `rename` | `folder`, `newName` | 改名 |
| `delete` | `folder` | 删除（里面的技能回未分类） |
| `assign` | `folder`, `skills` | 放进文件夹 |
| `unassign` | `skills` | 移回未分类 |

`skills` 可以写 skill 名、目录名或 SKILL.md 完整路径，一次给多个；名字对上多个（比如 `grill`）会报错让你用路径指定。

工具是 Host 侧注册的，改了 host 代码后需要**重启 DSH** 才会出现在工具列表里（HTTP 接口不受影响）。

## 安装

```bash
dsh plugin add <本目录>
```

或者用 DSH 的 `plugin_manager` 指向本目录（package.json 里已声明 `dsh.bundle.patch`）。

改完 `client.js` 后刷新一次页面即可生效。

## 结构

```
index.js          Host：扫描 SKILL.md、分组存储、以上接口
client.js         Client：侧栏面板（分组列表）+ shell.overlay 浮窗卡片
cordis.patch.yml  插入 skills-card 行
locale/           中英文标题
icon.svg
```
