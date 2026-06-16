# Sea Pack — 企业级后台管理系统

基于 Vue 3 + TypeScript + Vite 构建的企业级后台管理模板，集成了权限管理、数据可视化、GIS 地图、金融数据监控等核心功能模块。

---

## 技术栈

| 类别 | 技术 |
|---|---|
| **核心框架** | Vue 3.5 + TypeScript + Vite 5 |
| **UI 组件库** | Element Plus 2.6 |
| **状态管理** | Pinia 2 + pinia-plugin-persistedstate |
| **路由** | Vue Router 4 |
| **HTTP 请求** | Axios（请求/响应拦截器封装） |
| **CSS 方案** | UnoCSS（原子化）+ SCSS |
| **图表** | ECharts 5 + ECharts-GL |
| **地图引擎** | Cesium（3D 地球）+ OpenLayers（2D 地图） |
| **流程图** | AntV X6 |
| **富文本** | WangEditor 5 |
| **代码编辑器** | CodeMirror 6 |
| **国际化** | vue-i18n（中/英/繁） |
| **3D 渲染** | Three.js |
| **代码规范** | ESLint + Prettier |

---

## 功能模块

### 系统管理
- **用户管理** — 用户分页查询、新增/编辑/删除、密码重置、角色分配、Excel 导出
- **部门管理** — 部门树形结构维护
- **角色管理** — 角色增删改查，支持 el-tree 分配菜单/按钮权限
- **菜单权限** — 树形表格维护目录/菜单/按钮节点，支持递归删除、动态表单
- **字典设置** — 字典类型与数据项管理（如交易所、分红类型等）
- **行业管理** — 行业分类树形结构维护

### 股息监控（金融模块）
- **股票实时行情** — 大盘指数面板 + 行业树筛选 + 实时行情分页表格
- **股票池管理** — 股票池增删改查，关联行业/交易所字典
- **股票详情** — 基本信息、K 线图、分红图表、历史行情、财务数据
- **分红数据维护** — 分红记录 CRUD，对接后端 stock_dividend 表
- **股票监控池** — 可配置阈值规则的股票监控面板
- **告警历史** — 告警日志记录及筛选查询

### GIS 地图
- **OpenLayers** — 底图切换、矢量/热力/瓦片图层、标注绘制
- **Cesium 3D** — 相机飞行、粒子特效（雨雪）、实体模型、GeoJSON 加载、航迹回放

### 数据可视化
- **大屏看板** — 全屏大数据展示模板
- **ECharts 图表** — 中国地图、迁徙图、柱状图、关系图、雷达图

### 其他
- **博客系统** — 文章分类、作者信息、公告展示
- **流程编辑器** — 基于 AntV X6 的流程图设计
- **AI 交互** — RAG 知识库问答 + Agent 对话
- **富文本编辑** — WangEditor 集成
- **代码预览** — CodeMirror 代码高亮展示
- **滑块验证** — 登录滑块/滑动拼图验证码

---

## 项目目录结构

```
seapack-template/
├── public/                       # 静态资源（3D模型、GeoJSON、图片）
├── mock/                         # Mock 数据
├── src/
│   ├── api/                      # 接口层
│   │   ├── login/                #   登录
│   │   ├── file/                 #   文件上传
│   │   ├── ai/                   #   AI 相关接口
│   │   ├── system/               #   系统管理接口
│   │   │   ├── baseInfo/         #     基础信息（用户/部门/字典/行业）
│   │   │   ├── permission/       #     权限管理（角色/菜单/认证）
│   │   │   ├── stock/            #     股票股息相关
│   │   │   ├── fund/             #     基金
│   │   │   └── alertLog.ts       #     告警日志
│   │   └── types/                #   通用类型定义
│   ├── assets/                   # 静态资源（SVG图标、图片、JSON）
│   ├── components/               # 公共组件
│   │   ├── baseCharts/           #   图表封装
│   │   ├── baseComponents/       #   基础组件库
│   │   │   ├── SpTable/          #     表格组件（插槽式扩展）
│   │   │   ├── Pagination/       #     分页组件
│   │   │   ├── SpIcon/           #     图标
│   │   │   └── ……
│   │   ├── PageHeader/           #   页面头部
│   │   └── WangEditor/           #   富文本编辑器
│   ├── config/                   # 应用配置
│   ├── constants/                # 常量/枚举
│   ├── directives/               # 自定义指令
│   ├── hooks/                    # 组合式函数
│   ├── layout/                   # 布局组件
│   │   ├── main/                 #   主布局（左/上/左上三种模式）
│   │   ├── sideBar/              #   侧边栏
│   │   ├── navigationBar/        #   顶部导航
│   │   ├── tagsView/             #   多标签页
│   │   └── settings/             #   右侧设置面板
│   ├── locales/                  # 国际化（zh-CN / en / zh-TW）
│   ├── router/                   # 路由配置
│   │   └── modules/              #   路由模块
│   │       ├── systemManagement.ts  # 系统管理路由
│   │       ├── mapWorld.ts          # GIS 地图路由
│   │       └── bigData.ts           # 大数据屏路由
│   ├── store/                    # Pinia 状态管理
│   │   └── modules/
│   │       ├── user.ts           #   用户信息
│   │       ├── permission.ts     #   路由权限
│   │       ├── app.ts            #   应用状态（语言、侧栏）
│   │       ├── settings.ts       #   布局设置
│   │       ├── tags-view.ts      #   多标签页状态
│   │       ├── dictionary.ts     #   字典缓存
│   │       └── chat.ts           #   AI 对话
│   ├── styles/                   # 全局样式
│   ├── utils/                    # 工具函数
│   │   ├── axios.ts              #   Axios 封装（拦截器）
│   │   ├── cache/                #   缓存工具（cookie / localStorage）
│   │   └── validate.ts           #   校验工具
│   └── views/                    # 页面视图
│       ├── systemManagement/     #   系统管理页面
│       ├── worldData/            #   GIS 地图页面
│       ├── bigData/              #   大数据屏页面
│       ├── blogs/                #   博客页面
│       ├── login/                #   登录页面
│       ├── common/               #   公共页面（工作台、错误页）
│       └── funGame/              #   趣味游戏
├── .env / .env.development       # 环境变量
├── vite.config.ts                # Vite 构建配置
├── uno.config.ts                 # UnoCSS 配置
├── tsconfig.json                 # TypeScript 配置
└── eslint.config.js              # ESLint 配置
```

---

## 快速开始

### 环境要求

- Node.js >= 18
- pnpm >= 8（推荐）

### 安装依赖

```bash
pnpm install
```

### 启动开发服务

```bash
pnpm dev
```

开发服务器默认运行在 `http://localhost:4444`，接口代理转发至 `http://localhost:8090`。

### 代码检查

```bash
pnpm lint
```

### 构建生产包

```bash
pnpm build
```

构建产物输出至 `dist/` 目录。

### 预览构建结果

```bash
pnpm preview
```

---

## 环境变量

| 变量 | 说明 | 默认值 |
|---|---|---|
| `VITE_APP_TITLE` | 应用标题 | Sea Pack |
| `VITE_PUBLIC_PATH` | 部署路径 | `/` |
| `VITE_APP_API_URL` | 后端接口地址 | `http://localhost:8090` |
| `VITE_BASE_API` | Mock 接口前缀 | 空 |

---

## 相关链接

- [Vue 3 文档](https://vuejs.org/)
- [Element Plus](https://element-plus.org/)
- [Vite](https://vitejs.dev/)
- [Pinia](https://pinia.vuejs.org/)
- [ECharts](https://echarts.apache.org/)
- [Cesium](https://cesium.com/platform/cesiumjs/)
- [OpenLayers](https://openlayers.org/)
