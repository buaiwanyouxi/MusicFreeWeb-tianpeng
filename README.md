# MusicFree Web - 插件化音乐播放器

基于 [MusicFree](https://github.com/maotoumao/MusicFree) 插件协议的 Web 端音乐播放器，自身不包含任何音源，完全依赖插件提供音乐搜索、播放、歌单等功能。

## 代码参考来源

本项目参考和借鉴了以下开源项目：

- **[MusicFree](https://github.com/maotoumao/MusicFree)** — 猫头猫开发的插件化音乐播放器（移动端），本项目借鉴了其插件协议设计和插件加载机制
- **[MusicFree Desktop](https://github.com/maotoumao/MusicFreeDesktop)** — MusicFree 桌面端实现，参考了其插件沙箱环境和模块映射方案
- **[musicfree-h5 (zyb)](https://github.com/zyb/musicfree-h5)** — 社区 Web 端实现，本项目基于其基座架构进行开发，包括插件适配器（adaptMusicFreePlugin）、代理转发机制和 UI 框架
- **[musicfree-skills](https://github.com/maotoumao/musicfree-skills)** — 官方插件开发 AI 技能集，提供了插件协议文档和开发方法论参考

## 技术栈

- **前端框架**: React 18 + TypeScript
- **构建工具**: Vite 6
- **样式**: Tailwind CSS
- **部署**: Netlify（含 Serverless Functions 代理）

## 核心特性

- 插件化架构，所有音源通过插件提供
- 兼容 MusicFree 移动端插件协议（自动适配）
- 支持搜索、播放、歌单管理、歌词显示
- 订阅源机制，一键加载插件列表
- 响应式设计，支持桌面和移动端
- Netlify Serverless Functions 处理跨域代理

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

## 插件开发

插件需符合 MusicFree 插件协议，支持以下方法：

- `search(query, page, type)` — 搜索
- `getMediaSource(track, quality)` — 获取播放地址
- `getLyric(track)` — 获取歌词
- `getMusicSheetInfo(sheet, page)` — 获取歌单详情
- 更多方法参见 [官方插件协议文档](https://musicfree.catcat.work/plugin/introduction.html)

## 许可

本项目遵循 AGPL-3.0 协议，仅供个人学习使用，不得用于商业运营。
