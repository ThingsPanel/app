# ThingsPanel App 架构说明

本项目是基于 Vue 3 与 uni-app 的 IoT 移动端应用。业务页面、跨页面业务能力和通用组件分层存放，避免以历史页面名组织代码。

## 目录职责

- `api/`：请求客户端与按业务域拆分的接口模块。
- `components/`：不依赖具体业务页面的通用组件。
- `features/`：跨页面复用的业务组件和业务样式。
- `pages/`：uni-app 注册页面；目录使用复数业务名，入口页使用 `index.vue`，创建、编辑、详情分别使用 `create.vue`、`edit.vue`、`detail.vue` 或 `editor.vue`。
- `services/`：WebSocket 等有生命周期的应用服务。
- `store/`：Vuex 状态及模块。
- `styles/`：全局样式、动画和设计变量。
- `utils/`：无业务状态的工具函数。

## 主要页面域

- `pages/devices/`：设备列表、添加和本地设备详情。
- `pages/alarms/`：告警列表与告警详情。
- `pages/alarm-rules/`：告警规则创建与编辑。
- `pages/automation/`：自动化列表、场景和场景联动编辑。
- `pages/dashboard/`：IoT 仪表盘入口。
- `pages/account/`：账户首页与资料展示编辑。
- `pages/web-view/`：承载看板等仍需服务端页面的通用跨端内容；设备详情由 `pages/devices/detail.vue` 原生实现。

## 命名约定

- 文件和目录统一使用 kebab-case；Vue 组件在脚本中使用 PascalCase。
- 页面路径必须在 `pages.json` 注册，跳转不得引用历史文件名。
- 翻译命名空间使用业务语义，例如 `pages.devices`、`pages.alarms`、`pages.sceneEditor`。
- 静态资源使用可读业务名，不使用拼音缩写、序号或旧产品名称。

修改页面、路由或资源后运行 `pnpm check`；发布前再执行 HBuilderX 的 H5 构建。
