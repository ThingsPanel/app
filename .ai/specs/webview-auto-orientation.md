# WebView 页面自动横竖屏技术规格书

## 目标
- App 的 WebView 页面随设备方向在横屏和竖屏之间自动切换，其他页面不强制横屏。

## 影响范围
| 文件 | 原因 |
|---|---|
| `manifest.json` | 声明原生 App 支持竖屏及两个横屏方向。 |
| `pages.json` | 仅为 `pages/webViewPage/webViewPage` 配置自动旋转。 |

## 实施步骤
1. 在 `app-plus` 中增加完整的 `screenOrientation` 支持列表。
2. 在 WebView 页面的 style 中增加 `pageOrientation: "auto"`。
3. 不改 WebView URL、导航标题和页面内容布局。

## 验证方式
- 解析 `manifest.json` 与 `pages.json`，确认配置存在且 JSON 结构有效。
- 检查 diff 仅包含目标配置和项目上下文文件。

## 回滚方案
- 删除新增的 `screenOrientation` 与 `pageOrientation` 配置。

## 目标编辑文件清单
- `manifest.json`
- `pages.json`
