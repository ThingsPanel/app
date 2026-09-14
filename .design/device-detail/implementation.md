# 设备详情与 ThingsVis 接入

本轮基于用户确认的四 Tab 方案实现；取代 design.md 中“空内容区/只读列表快照”的静态阶段边界。

## 已核对的来源

- App：`pages/devices/detail.vue`、`api/client.js`、`api/request.js`、自动化规则编辑器与告警详情页。
- 社区版：`src/views/device-details-app/index.vue`、`src/components/thingsvis/ThingsVisWidget.vue`、`src/utils/thingsvis/sdk/client.ts`、`src/utils/thingsvis/space.ts`，设备详情的 automate、give-an-alarm、message 模块。
- 后端：`internal/api/device.go`、`internal/model/devices.http.go`、`internal/dal/devices.go` 与场景联动及告警模型。
- ThingsVis：`apps/studio/src/pages/EmbedPage.tsx`、`packages/thingsvis-kernel/src/datasources/PlatformFieldAdapter.ts`。
- Docker 文档：https://thingspanel.io/zh-Hans/docs/installation/docker_installation 。标准前端端口 8080，通过 `/main/`、`/thingsvis-api/` 代理 ThingsVis；不能从后端 9999 端口猜前端地址。
- renderjs 文档：https://uniapp.dcloud.net.cn/tutorial/renderjs.html 。目标为 App-vue 和 H5；不支持将此组件直接用于小程序或 nvue。

## 页面与数据

顶部保留真实设备图片、名称、状态及元数据。列表快照仅作首屏展示，每次进入重新加载 `/api/v1/device/detail/{id}`。不持久化包含凭证的完整详情响应。

字体优先使用苹方、微软雅黑等中文无衬线字体，子组件及输入框继承。字号固定为设备名 18px、Tab/分区标题 14px、正文 12–13px、辅助文字 11px，避免桌面预览下 rpx 放大字体。Tab 常态 400、选中态 500，保留蓝色下划线；Tab 外层圆角归零。信息页保存改为分区标题右侧轻量按钮，概览直接展示图表，不显示“设备可视化”工具栏。

| Tab | 实现 |
| --- | --- |
| 概览 | 加载设备模板的 `app_chart_config`，空模板/空节点显示明确提示，不回落 PC 配置或样例数据 |
| 自动化 | `scene_automations/list` 按 `device_id` 筛选，搜索、分页、启停，复用 `pages/automation/rule` |
| 告警 | `alarm/info/history` 日期/状态筛选与详情；规则使用 `scene_automations/alarm`，不是另一个告警配置模型 |
| 信息 | 编辑经纬度和设备配置定义的扩展字段；保存时保留未出现在表单中的字段及旧版 extendedInfo 结构 |

## ThingsVis 桥接

逻辑层通过 uni.request 和 uni.connectSocket 访问平台；renderjs 只管理当前内容区 iframe、消息与高度。iframe 直接加载用户部署的 ThingsVis，不依赖社区版或企业版 App H5 页面。

1. 读取模板及四类物模型字段，替换模板 PLATFORM_FIELD 数据源的当前设备 ID。
2. 根据真实 `user/detail` 身份向 ThingsVis `/auth/sso` 换取令牌；不打印认证信息。
3. READY/tv:ready/tv:request-init 后发送 tv:init，包含 schema、platformDevices、字段、当前设备与平台 API 上下文。
4. LOADED 后推送首值、预填绑定历史，并打开遥测与在线状态 WebSocket；重连时补取首值。告警事件按已有接口定时刷新。
5. 写消息仅接受当前 iframe 的精确 origin/source，校验当前设备、数据源和物模型字段；按遥测/属性/命令路由，回传成功或失败。requestId 去重；保留模板手动控制动作。
6. 切换 Tab/离开页面关闭 WebSocket、定时器和监听，失效异步回调。等待超时、认证失败、空模板均独立显示。

Vue Proxy 不能直接 structuredClone，因此渲染层发送前转成协议 JSON；同批消息一次传给视图层，避免多条数据更新只留下最后一条。

## 地址配置

默认使用当前服务器（或已配置的 webViewBase）作为前端入口，保留协议与端口。通过“我的 → 可视化连接”（`pages/account/visualization.vue`）覆盖前端、ThingsVis 页面、ThingsVis API；覆盖按当前服务器隔离。详情概览不放连接设置，错误状态提示设置位置。普通部署无需单独暴露 ThingsVis 3000/8000 端口。

不自动将 9999 改成 8080，不沿用 localhost 开发特例，不把演示站写入用户部署配置。API 与前端分离时需显式配置正确前端地址。旧版部署缺少 ThingsVis 服务时显示错误并允许修正地址。

## 验证

- `pnpm check`：路由、资源及导入检查。
- `node scripts/test-thingsvis-address.mjs`：Docker、自定义地址、端口、IPv6、非法地址、服务器隔离。
- `node scripts/test-device-tabs.mjs`：扩展数据保留、数值/坐标、分页失败及重试、请求竞态、卸载。
- `node scripts/test-thingsvis-device-schema.mjs`：字段/schema/历史规范化，模拟认证、初始化、写回执、重复请求与跨设备拒绝。
- `node scripts/test-thingsvis-bridge.mjs`：真实 renderjs，Proxy 克隆、消息来源、READY/LOADED、高度与清理。
- HBuilderX CLI `publish web --project F:\coding\app` 与 `publish app --type appResource --project F:\coding\app`：本地构建，无上传发布。
- Chrome 本地 Web 构建只读联调：真实 PM2.5 设备的概览、自动化、告警规则和信息；不执行线上控制或保存。

## 明确限制

- 尚未完成 Android/iOS 真机验证；App 资源构建成功不等于原生网络、混合内容、iframe 触摸与滚动已验证。
- 企业版接口差异和用户独立部署需要各自联调。
- 地图服务未配置，本次支持经纬度输入，不提供地图选点。
- 现有规则新增编辑器不能预绑定 device_id，用户需在编辑器选择设备。
- 控制、启停、保存已做模拟或逻辑检查，未在演示设备执行写操作。
- 示例设备模板有折线图绑定字符串 `aqi_level`，无有效数值历史时保留空图；不修改模板、不伪造数值。
