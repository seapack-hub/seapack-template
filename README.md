# Sea Pack — 企业级后台管理系统

基于 Vue 3 + TypeScript + Vite 构建的企业级后台管理模板，集成了权限管理、数据可视化、GIS 地图、金融数据监控、AI 智能助手、工作流引擎等核心功能模块。

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
- **仪表盘** — 系统概览、统计卡片
- **用户管理** — 用户分页查询、新增/编辑/删除、密码重置、角色分配、Excel 导出
- **部门管理** — 部门树形结构维护
- **角色管理** — 角色增删改查，支持 el-tree 分配菜单/按钮权限
- **菜单权限** — 树形表格维护目录/菜单/按钮节点，支持递归删除、动态表单
- **字典设置** — 字典类型与数据项管理（如交易所、分红类型等）
- **行业管理** — 行业分类 CRUD
- **行业分类** — 基金行业树形查询展示

### 股票基金
- **股票实时行情** — 大盘指数面板 + 行业树筛选 + 实时行情分页表格
- **股票池管理** — 股票池增删改查，关联行业/交易所字典
- **股票详情** — 基本信息、K 线图、分红图表、历史行情、财务数据
- **分红数据维护** — 分红记录 CRUD，对接后端 stock_dividend 表
- **股票监控池** — 可配置阈值规则的股票监控面板
- **告警历史** — 告警日志记录及筛选查询
- **基金信息** — 基金数据查询与详情
- **行业分类** — 基金行业树形结构浏览

### AI 交互
- **AI 助手侧边栏** — 全局浮动 AI 助手，支持多会话管理、Markdown 渲染、流式响应
- **技能执行** — 可配置的 AI 技能节点，支持 RAG 知识库问答
- **智能体交互** — Agent 对话
- **图片生成** — AI 图片生成
- **工作流编辑器** — 可视化工作流设计，支持 AI 技能节点嵌入

### 工作流管理
- **分类管理** — 工作流分类树形结构维护
- **工作流列表** — 分页查询、状态管理
- **工作流编辑器** — AntV X6 可视化画布，支持拖拽节点、连线、配置
- **节点配置** — 开始/结束节点、技能节点、子工作流节点、条件节点

### 博客管理
- **博客列表** — 文章分页查询、状态筛选
- **文章详情** — Markdown 渲染、评论管理
- **分类管理** — 博客分类 CRUD
- **作者管理** — 作者信息维护
- **公告管理** — 公告发布与管理
- **标签管理** — 标签 CRUD

### 二维地图
- **基础地图** — 高德底图 + 搜索定位 + 逆地理编码
- **图层类型** — 热力图层、矢量图层、切片图层
- **标注** — 地图标注绘制

### 三维 GIS
- **3D 基础** — Cesium 场景初始化
- **相机操作** — 飞行动作、移动动作
- **实体相关** — 飞机模型、扫描效果
- **粒子特效** — 雨雪效果
- **数据加载** — GeoJSON 加载、飞机航迹回放

### 数据可视化
- **智慧运营大屏** — 全屏大数据展示看板（多主题切换）
- **通用大屏模板** — Cesium 三维地球大屏模板
- **ECharts 图表** — 中国地图、迁徙图、柱状图、关系图、雷达图

### 开发工具
- **组件封装** — 电子签名、表格封装、富文本编辑器
- **图形化管理** — 流程图设计（AntV X6）
- **ECharts 图表** — 中国地图、迁徙图、柱状图、关系图、雷达图
- **开发文档** — 博客技术文章展示

### 工作台
- **个人工作台** — 快捷入口、模块导航、AI 助手集成

---

## 项目目录结构

```
seapack-template/
├── public/                       # 静态资源
├── mock/                         # Mock 数据
├── src/
│   ├── api/                      # 接口层
│   │   ├── ai/                   #   AI 接口（skill / rag / agent / image）
│   │   │   ├── skill.ts          #     技能管理 API（list / create / update / delete）
│   │   │   ├── rag.ts            #     RAG 知识库 API
│   │   │   ├── agent.ts          #     智能体 API
│   │   │   ├── image.ts          #     图片生成 API
│   │   │   └── index.ts          #     流式聊天 streamChat()
│   │   ├── workflow/             #   工作流 API（workflow / category）
│   │   ├── blogs/                #   博客 API（article / category / author / tag / notice）
│   │   ├── login/                #   登录相关
│   │   ├── file/                 #   文件上传
│   │   └── system/               #   系统管理接口（用户/部门/角色/菜单/字典/行业/股票/基金/告警等）
│   ├── assets/
│   │   └── icons/                #   SVG 图标库（90+ 自定义图标）
│   ├── components/               # 公共组件
│   │   ├── AiAssistant/          #   AI 助手侧边栏（ChatPanel / SessionList / ContextPanel）
│   │   ├── AiSkillExecutor/      #   AI 技能执行器组件
│   │   ├── baseCharts/           #   ECharts 封装
│   │   ├── baseComponents/       #   基础组件（SpTable / SpIcon / Breadcrumb…）
│   │   ├── changeLanguage/       #   语言切换
│   │   ├── loginUser/            #   用户信息下拉
│   │   ├── PageWrapper/          #   页面包装器
│   │   ├── ResizableSplit/       #   可拖拽分割面板
│   │   ├── SliderCaptcha/        #   滑块验证码
│   │   ├── WangEditor/           #   富文本编辑器
│   │   └── X6Canvas/             #   AntV X6 画布封装
│   ├── config/                   # 应用配置
│   │   ├── modules.ts            #   模块定义（MODULE_DEFS）
│   │   └── aiPositions.ts        #   AI 位置配置（6 个位置）
│   ├── constants/                # 常量定义
│   │   └── cache-key.ts          #   缓存键常量
│   ├── directives/               # 自定义指令（权限、表格阴影）
│   ├── hooks/                    # 组合式函数
│   │   ├── useAiBindings.ts      #   AI 绑定 composable
│   │   ├── useChatStream.ts      #   SSE 流式聊天
│   │   ├── useSpeechRecognition.ts # 语音输入
│   │   └── useRouteListener.ts   #   路由监听
│   ├── layout/                   # 布局组件
│   │   ├── main/                 #   主布局（左/上/左上三种模式）
│   │   ├── worldData/            #   地图 / GIS 布局（独立侧边栏）
│   │   ├── components/           #   布局子组件（侧栏、导航栏、标签页）
│   │   └── menuTab/              #   菜单导航栏
│   ├── locales/                  # 国际化（zh-CN / en / zh-TW）
│   ├── router/                   # 路由配置
│   │   ├── modules/              #   路由模块（按功能拆分）
│   │   │   ├── systemManagement.ts  # 系统管理（11 路由）
│   │   │   ├── stockFund.ts         # 股票基金（12 路由）
│   │   │   ├── aiModule.ts          # AI 交互（11 路由）
│   │   │   ├── workflow.ts          # 工作流管理（8 路由）
│   │   │   ├── blogsManagement.ts   # 博客管理（11 路由）
│   │   │   ├── devTools.ts          # 开发工具（16 路由）
│   │   │   ├── gis2d.ts             # 二维地图（8 路由）
│   │   │   ├── gis3d.ts             # 三维 GIS（12 路由）
│   │   │   └── bigData.ts           # 数据大屏（2 路由）
│   │   ├── plugins/              #   路由插件（权限、进度条）
│   │   └── index.ts              #   路由实例 + 全量加载
│   ├── store/                    # Pinia 状态管理
│   │   └── modules/
│   │       ├── user.ts           #   用户信息 + 权限菜单树
│   │       ├── permission.ts     #   路由收集 + 动态路由
│   │       ├── app.ts            #   应用状态（语言、侧栏折叠）
│   │       ├── settings.ts       #   布局设置（支持 localStorage 持久化）
│   │       ├── tags-view.ts      #   多标签页状态
│   │       ├── dictionary.ts     #   字典缓存
│   │       ├── cesium.ts         #   Cesium Viewer 实例
│   │       └── chat.ts           #   AI 对话（会话管理、消息历史）
│   ├── styles/                   # 全局样式
│   ├── utils/                    # 工具函数
│   │   ├── axios.ts              #   Axios 封装（拦截器 + token）
│   │   ├── routeUtils.ts         #   路由过滤工具
│   │   ├── echarts.ts            #   ECharts 按需导入
│   │   └── cache/                #   缓存工具（local-storage / session-storage）
│   └── views/                    # 页面视图
│       ├── systemManagement/     #   系统管理（dashboard / baseInfo / permission）
│       ├── stockFund/            #   股票基金（stockManagement / fund）
│       ├── aiModule/             #   AI 交互（aiInteraction）
│       ├── workflow/             #   工作流管理（list / editor / components / node-configs）
│       ├── blogs/                #   博客管理（article / category / author / tag / notice）
│       ├── devTools/             #   开发工具（components / graphical / echarts / blogDocument）
│       ├── gis2d/                #   二维地图（openLayers / GeoJSON）
│       ├── gis3d/                #   三维 GIS（cesium）
│       ├── bigScreen/            #   智慧运营大屏
│       ├── bigData/              #   通用大屏模板
│       ├── login/                #   登录
│       └── common/               #   公共页面（workbench 工作台、错误页）
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

## 开发规范

### 代码风格
- **自动导入**：`vue`、`vue-router`、`@vueuse/core`、`Element Plus` 已配置自动导入，无需手动 `import`
- **CSS 方案**：使用 UnoCSS 原子化类，配合 `el-card-main` 等预设样式
- **组件命名**：大驼峰（PascalCase），如 `WorkflowFormDialog.vue`

### 表格开发模式
```vue
<SpTable :columns="columns" :data="tableData">
  <template #default="{ row, prop }">
    <el-table-column :prop="prop" v-bind="columns.find(c => c.prop === prop)">
      <template #default="{ row }">
        <!-- 自定义渲染 -->
      </template>
    </el-table-column>
  </template>
</SpTable>
```

### AI 集成模式
```vue
<!-- 在页面中嵌入 AI 技能执行器 -->
<AiSkillExecutor
  :module-key="'stockFund'"
  :position="'stockAnalysis'"
  :context="{ stockCode: '000001' }"
/>
```

### 国际化
- 语言文件位于 `src/locales/lang/` 目录
- 使用 `useI18n()` composable 或 `$t('key')` 模板语法
- 支持中文简体（zh-CN）、英文（en）、中文繁体（zh-TW）

---

## 相关链接

- [Vue 3 文档](https://vuejs.org/)
- [Element Plus](https://element-plus.org/)
- [Vite](https://vitejs.dev/)
- [Pinia](https://pinia.vuejs.org/)
- [ECharts](https://echarts.apache.org/)
- [Cesium](https://cesium.com/platform/cesiumjs/)
- [OpenLayers](https://openlayers.org/)
- [AntV X6](https://x6.antv.vision/)
