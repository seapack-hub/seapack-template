# Sea Pack

> 记录工作中的技术实践，同时为自己打造一个投资分析工具。

这个项目的初衷是把日常工作中积累的前端技术沉淀成一个可复用的后台管理模板。在接触投资之后，又在里面实现了**股息监控**和**宏观经济数据分析**等功能——从股票池管理、分红数据追踪，到货币供应量、社融、LPR 等宏观指标的可视化看板，后端也配套了完整的数据采集与接口服务。目前项目包含 11 个功能模块、90+ 页面，前后端全栈实现。

## 技术栈


| 类别           | 技术                                     |
| -------------- | ---------------------------------------- |
| **核心框架**   | Vue 3.5 + TypeScript + Vite 5            |
| **UI 组件库**  | Element Plus 2.6                         |
| **状态管理**   | Pinia 2 + pinia-plugin-persistedstate    |
| **路由**       | Vue Router 4                             |
| **HTTP 请求**  | Axios（请求/响应拦截器封装）             |
| **CSS 方案**   | UnoCSS（原子化）+ SCSS                   |
| **图表**       | ECharts 5 + ECharts-GL                   |
| **地图引擎**   | Cesium（3D 地球）+ OpenLayers（2D 地图） |
| **流程图**     | AntV X6                                  |
| **富文本**     | WangEditor 5                             |
| **代码编辑器** | CodeMirror 6                             |
| **国际化**     | vue-i18n（中/英/繁）                     |
| **3D 渲染**    | Three.js                                 |
| **代码规范**   | ESLint + Prettier + Husky                |

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

- **工作台** — 金融数据中心首页，大盘指数面板 + 功能卡片导航
- **股票实时行情** — 大盘指数面板 + 行业树筛选 + 实时行情分页表格
- **AI 个股诊断** — 输入股票代码，AI 自动整合行情/分红/K 线数据生成分析报告
- **股票池管理** — 股票池增删改查，关联行业/交易所字典，详情页含 K 线图、分红图表、财务数据
- **分红数据维护** — 分红记录 CRUD，对接后端 stock_dividend 表，股息率分析
- **股票监控池** — 可配置阈值规则的股票监控面板
- **告警历史** — 告警日志记录及筛选查询
- **基金信息** — 基金数据查询与详情

### 宏观数据

- **工作台** — 宏观经济概览仪表盘（M2/GDP、社融、PMI、CPI/PPI、LPR、外汇储备等核心指标一览）
- **货币与利率**
  - **货币供应量** — M1/M2/M0 增速趋势、KPI 卡片、同比分析
  - **LPR 利率** — 1 年期/5 年期 LPR 走势
  - **SHIBOR 利率** — 隔夜/1 周/1 月/3 月 SHIBOR 走势
- **融资信贷**
  - **社会融资规模** — 当月新增/存量同比、结构分析、信用脉冲图
- **物价指数**
  - **CPI/PPI** — CPI/PPI 同比走势对比
- **经济景气**
  - **PMI 指数** — 制造业/非制造业 PMI 走势（含荣枯线标注）
- **储备资产** — 外汇储备、黄金储备、去美元化趋势分析
- **市场情绪**
  - **股票开户数** — 新增投资者数量趋势
  - **两融余额** — 融资融券余额监控
- **数据管理** — 宏观数据 CRUD 管理（全量/增量采集、按频率归并）

### AI 交互

- **AI 助手侧边栏** — 全局浮动 AI 助手，支持多会话管理、Markdown 渲染、流式响应、语音输入
- **RAG 知识库问答** — 知识库绑定对话，检索增强生成
- **智能体交互** — Agent 对话，支持多轮上下文
- **图片生成** — AI 图片生成（提示词输入、参数配置、画廊展示）
- **Agent 管理** — 智能体创建/配置（提示词、技能、知识库、记忆），支持测试对话与执行链路追踪
- **场景管理** — AI 场景编排（Agent 配置、技能编排、部署管理）
- **Skills 管理** — AI 技能节点配置（参数编辑、分类管理）
- **提示词模板** — 可复用的 Prompt 模板管理与预览
- **知识库管理** — 文档上传/分块、向量检索测试
- **Token 统计** — 用量趋势、模型分布、场景排行
- **Token 额度** — 用户额度分配与用量监控
- **工作流编辑器** — 可视化工作流设计，支持 AI 技能节点嵌入

### 工作流管理

- **工作流列表** — 分页查询、状态管理
- **分类管理** — 工作流分类树形结构维护
- **工作流编辑器** — AntV X6 可视化画布，支持拖拽节点、连线、节点属性配置
- **执行实例** — 工作流实例运行监控与详情
- **人工任务** — 审批/处理任务管理
- **调度管理** — 定时调度规则配置
- **执行统计** — 工作流执行数据统计

### 博客管理

- **博客首页** — 文章列表、Hero 区域、项目展示、页脚
- **文章详情** — Markdown 渲染
- **管理后台** — 文章 CRUD、项目管理、分类管理

### 开发工具

- **组件封装** — 电子签名、表格封装、富文本编辑器、文件预览
- **图形化管理** — AntV X6 流程图设计
- **ECharts 图表** — 中国地图、迁徙图、柱状图、人物关系图、雷达图
- **开发文档** — 内部技术文档（电子签名、水印、SVG 图标、原型链、模板引擎）

### 二维地图（OpenLayers）

- **基础地图** — 高德底图 + 搜索定位 + 逆地理编码
- **图层类型** — 热力图层、矢量图层、切片图层
- **标注** — 地图标注绘制

### 三维 GIS（Cesium）

- **3D 基础** — Cesium 场景初始化
- **相机操作** — 飞行动作、移动动作
- **实体相关** — 飞机模型、扫描效果
- **粒子特效** — 雨雪效果
- **数据加载** — GeoJSON 加载、飞机航迹回放

### 数据大屏

- **智慧运营大屏** — 全屏大数据展示看板（多主题切换）
- **通用大屏模板** — Cesium 三维地球大屏模板

---

## 项目结构

```
seapack-template/
├── public/                         # 静态资源（GeoJSON、模型、图片）
├── mock/                           # Mock 数据
├── src/
│   ├── api/                        # 接口层（按模块拆分）
│   │   ├── ai/                     #   AI 接口（skill / agent / scene / rag / image / token…）
│   │   ├── macroData/              #   宏观数据接口（货币 / 融资 / 储备 / 物价 / 景气 / 情绪）
│   │   ├── stockFund/              #   股票基金接口（stock / fund / dividend / monitor / alert）
│   │   ├── workflow/               #   工作流 API
│   │   ├── blogs/                  #   博客 API
│   │   ├── login/                  #   登录认证
│   │   ├── file/                   #   文件上传
│   │   └── system/                 #   系统管理（用户/部门/角色/菜单/字典/行业）
│   ├── assets/
│   │   └── icons/                  #   SVG 图标库（90+ 自定义图标）
│   ├── components/                 # 公共组件
│   │   ├── AiAssistant/            #   AI 助手侧边栏（会话列表 / 聊天面板 / 场景选择 / 设置）
│   │   ├── AiAgentExecutor/        #   Agent 执行器组件
│   │   ├── baseCharts/             #   ECharts 封装
│   │   ├── baseComponents/         #   基础组件（SpTable / SpAction / SpDetailEditable / Breadcrumb…）
│   │   ├── X6Canvas/              #   AntV X6 画布封装（工具栏 / 节点面板 / 属性面板）
│   │   ├── X6Nodes/               #   X6 节点组件（审批 / 条件 / 延时 / 技能 / 子工作流…）
│   │   ├── FilePreview/            #   文件预览（PDF / Word / 图片）
│   │   ├── WangEditor/             #   富文本编辑器
│   │   ├── ResizableSplit/         #   可拖拽分割面板
│   │   └── …                      #   其他公共组件
│   ├── config/                     # 应用配置（模块定义、布局模式、图标注册）
│   ├── constants/                  # 常量定义（缓存键、应用键）
│   ├── directives/                 # 自定义指令（v-permission 权限、表格阴影）
│   ├── hooks/                      # 组合式函数
│   │   ├── useChatExecution.ts     #   AI 技能/场景执行
│   │   ├── useSpeechRecognition.ts #   语音输入（Web Speech API）
│   │   ├── useButtonPermission.ts  #   按钮权限
│   │   ├── useWatermark.ts         #   水印
│   │   └── …
│   ├── layout/                     # 布局组件
│   │   ├── main/                   #   主布局（Left / Top / LeftTop 三种模式）
│   │   ├── blogs/                  #   博客独立布局
│   │   ├── worldData/              #   GIS 地图布局（独立侧边栏）
│   │   └── components/             #   布局子组件（侧栏 / 导航栏 / 标签页 / 设置面板）
│   ├── locales/                    # 国际化（zh-CN / en / zh-TW）
│   ├── router/                     # 路由配置
│   │   ├── modules/                #   10 个路由模块（按功能拆分）
│   │   └── plugins/                #   路由插件（权限校验、进度条）
│   ├── store/                      # Pinia 状态管理
│   │   └── modules/
│   │       ├── user.ts             #   用户信息 + 权限菜单树
│   │       ├── permission.ts       #   路由收集 + 动态路由
│   │       ├── chat.ts             #   AI 对话（会话管理、消息历史、上下文裁剪）
│   │       ├── sceneBindings.ts    #   AI 场景绑定
│   │       ├── dictionary.ts       #   字典缓存
│   │       ├── cesium.ts           #   Cesium Viewer 实例
│   │       └── …
│   ├── styles/                     # 全局样式
│   ├── utils/                      # 工具函数（Axios / 路由过滤 / ECharts / 缓存）
│   └── views/                      # 页面视图（11 个模块目录）
│       ├── systemManagement/       #   系统管理
│       ├── stockFund/              #   股票基金（含 AI 个股诊断、分红监控）
│       ├── macroData/              #   宏观数据（货币/融资/物价/景气/储备/情绪）
│       ├── aiModule/               #   AI 交互（对话/Agent/场景/Skills/知识库/Token）
│       ├── workflow/               #   工作流管理
│       ├── blogs/                  #   博客管理
│       ├── devTools/               #   开发工具
│       ├── gis2d/                  #   二维地图
│       ├── gis3d/                  #   三维 GIS
│       ├── bigScreen/              #   智慧运营大屏
│       ├── bigData/                #   通用大屏模板
│       └── common/                 #   公共页面（工作台、错误页）
├── .env / .env.development         # 环境变量
├── vite.config.ts                  # Vite 构建配置
├── uno.config.ts                   # UnoCSS 配置
├── tsconfig.json                   # TypeScript 配置
└── eslint.config.js                # ESLint 配置
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


| 变量                   | 说明          | 默认值                  |
| ---------------------- | ------------- | ----------------------- |
| `VITE_APP_TITLE`       | 应用标题      | Sea Pack                |
| `VITE_PUBLIC_PATH`     | 部署路径      | `/`                     |
| `VITE_APP_API_URL`     | 后端接口地址  | `http://localhost:8090` |
| `VITE_MOCK_DEV_SERVER` | 是否启用 Mock | `false`                 |

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
