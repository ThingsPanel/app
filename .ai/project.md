---
status: draft
last-verified: 2026-07-14
---
# ThingsPanel App

## 项目定位
ThingsPanel 的 UniApp 移动端外壳，负责原生页面、底部导航以及 WebView 嵌入页面。

## 技术约束
- 技术栈：UniApp、Vue 2、App Plus。
- `manifest.json` 管理原生 App 打包能力，`pages.json` 管理页面级窗口行为。
- 默认语言：规格书、回滚方案、变更日志、审查结论和新增注释使用中文。

## 关键路径
| 模块 | 路径 | 职责 |
|---|---|---|
| App 打包配置 | `manifest.json` | App Plus 模块、权限和屏幕方向能力 |
| 页面配置 | `pages.json` | 页面路由及页面级窗口样式 |
| WebView 页面 | `pages/webViewPage/webViewPage.vue` | 承载设备详情和可视化看板等 Web 页面 |

## 当前状态
- 已完成：WebView 通用承载页面；WebView 页面跟随设备横竖屏旋转。
- 进行中：无。

## 架构决策
| 日期 | 决策 | 原因 |
|---|---|---|
| 2026-07-14 | 屏幕方向能力由 App 打包配置声明，WebView 页面单独启用自动旋转 | 内嵌网页不能越过原生外壳改变屏幕方向，同时避免普通页面被强制横屏 |

## 变更日志
| 日期 | 变更 | 验证 |
|---|---|---|
| 2026-07-14 | App Plus 声明支持四个屏幕方向，WebView 页面单独启用自动旋转 | UTF-8 解析 `manifest.json`、`pages.json` 成功；`git diff --check` 通过 |
