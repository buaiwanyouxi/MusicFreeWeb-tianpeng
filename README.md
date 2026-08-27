# MusicFree Web - 插件化音乐播放器

本项目基于社区基座 [zyb/musicfree-h5](https://github.com/zyb/musicfree-h5) 改造的 Web/PWA 插件化音乐播放器，自身不包含任何音源，完全依赖符合 MusicFree 插件协议的插件提供搜索、播放、歌单、歌词能力。

## 代码参考来源

本项目参考和借鉴了以下开源项目：

- **[MusicFree](https://github.com/maotoumao/MusicFree)** — 猫头猫开发的插件化音乐播放器（移动端），本项目借鉴了其插件协议设计和插件加载机制
- **[MusicFree Desktop](https://github.com/maotoumao/MusicFreeDesktop)** — MusicFree 桌面端实现，参考了其插件沙箱环境和模块映射方案
- **[musicfree-h5 (zyb)](https://github.com/zyb/musicfree-h5)** — 社区 Web 端基座，适配器/代理/UI 均基于其改造
- **[musicfree-skills](https://github.com/maotoumao/musicfree-skills)** — 官方插件开发 AI 技能集，提供了插件协议文档和开发方法论参考

## 技术栈

- **前端框架**: React 18 + TypeScript
- **构建工具**: Vite 5.4
- **样式**: Tailwind CSS
- **部署**: Netlify（含 Serverless Functions 代理），或自托管（`node server.js` / Docker）

## 核心特性

- 插件化架构，所有音源通过插件提供
- 兼容 MusicFree 移动端插件协议（自动适配）
- 支持搜索、播放、歌单管理、歌词显示
- 订阅源机制，一键加载插件列表
- 响应式设计，支持桌面和移动端
- Netlify Serverless Functions 处理跨域代理
- PWA 离线支持（IndexedDB 全曲缓存 + Service Worker）
- 插件沙箱（执行期 localStorage 隔离 + 越权请求审计）

## 本地开发

```bash
npm install
npm run dev
```

访问 http://localhost:3000

## 构建

```bash
npm run build
```

## 部署

项目已内置 Netlify 配置，推送到 Git 仓库后可直接连接 Netlify 自动部署。

代理功能由 `netlify/functions/proxy.js` 提供，支持 Gitee、GitHub、jsDelivr 等源站。

也可自托管：`node server.js`（已具备全部代理能力），或 Docker 部署（规划中）。

## 插件订阅源

支持两种导入格式：

1. **Feed JSON**：`{ desc, plugins: [{ name, platform, version, url }] }` — 批量加载多个插件
2. **单个 .js 直链**：直接粘贴插件脚本 URL，自动识别为单插件订阅

侧边栏下拉可切换活跃插件，`/api/proxy` 统一转发跨域请求。

## 插件开发

插件需符合 MusicFree 插件协议，支持以下方法：

- `search(query, page, type)` — 搜索
- `getMediaSource(track, quality)` — 获取播放地址
- `getLyric(track)` — 获取歌词
- `getMusicSheetInfo(sheet, page)` — 获取歌单详情
- 更多方法参见 [官方插件协议文档](https://musicfree.catcat.work/plugin/introduction.html)

## 开发路线图

| 阶段 | 内容 | 状态 |
|---|---|---|
| **P0** 协议正确性 | 歌词链、时长透传、单音质、沙箱隔离、代理白名单 | ✅ M1 完成 (2026-08-27) |
| **P1** 体验与可维护性 | 分页贯通、代理合一、流式代理、测试 CI、拆单体、自托管部署 | 进行中 |
| **P2** 功能对齐 | 本地音乐、迷你播放条、备份恢复、多音源编排、跨插件歌词 | 规划中 |

详见 [docs/07-项目分析与优化计划.md](docs/07-项目分析与优化计划.md)

## 许可

本项目遵循 AGPL-3.0 协议，仅供个人学习使用，不得用于商业运营。
