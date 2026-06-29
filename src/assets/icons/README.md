# SVG 图标管理规范

## 目录结构

所有 SVG 图标按功能模块分目录存放，便于管理和查找：

```
src/assets/icons/
├── common/         # 通用/跨模块共享图标（address, arrow-down, home-main, tips 等）
├── nav/            # 导航栏/工具栏专用（backend, fullscreen-expand, search 等）
├── social/         # 社交平台外链（gitee, github, juejin）
├── system/         # 系统管理模块（dept, dict, menu, role, user 等）
├── blogs/          # 博客模块（article-create, blogs, document 等）
├── stockFund/      # 股票基金模块（fund, trend-charts 等）
├── ai/             # AI 交互模块（agent, ai-interaction, rag 等）
├── devTools/       # 开发工具模块（flow-chart, pie-chart, table, tool 等）
├── gis2d/          # 二维地图模块（base-map, china-map, openlayers 等）
├── gis3d/          # 三维 GIS 模块（cesium, fly, snow, rain 等）
├── bigScreen/      # 大屏模块（basic-dashboard, screen）
└── README.md       # 本文件
```

## 命名规范

1. **kebab-case**：全部小写字母，单词间用连字符分隔
   - ✅ `arrow-down.svg`, `file-upload.svg`
   - ❌ `arrow_down.svg`, `fileUpload.svg`

2. **语义化命名**：描述图标含义，而非位置
   - ✅ `backend.svg`（后台管理）
   - ❌ `houtai.svg`（拼音）

3. **无数字前缀**：避免以数字开头的文件名
   - ✅ `two-d-layers.svg`
   - ❌ `2D-layers.svg`

4. **唯一性**：所有文件名在全局必须唯一（不同目录下也不允许重名）

## 使用方式

通过 `<SPIcon>` 组件使用：

```vue
<SPIcon name="menu" size="20px" color="#409eff" />
```

其中 `name` 属性直接使用 SVG 文件名（不含 `.svg` 扩展名），与目录位置无关。

## 维护规则

1. **新增图标**：
   - 放到对应的模块目录中
   - 遵循 kebab-case 命名
   - 确认全局唯一（用 `Get-ChildItem -Recurse *.svg | ForEach-Object { $_.BaseName }` 检查）

2. **移除图标**：
   - 同步删除 `.svg` 文件即可
   - 建图前先在 `common/` 中查找是否有可复用的

3. **SVG 内容要求**：
   - 不包含 `fill` 属性（SPIcon 通过 `color` prop 控制颜色）
   - 不包含冗余的 `metadata`、`title`、`desc` 等元素
   - 建议用 SVGO 压缩：`npx svgo -f src/assets/icons/<dir> --multipass`

4. **新增 SVG 后必须重启 Vite 开发服务器**（`vite-plugin-svg-icons` 在构建时缓存所有图标）。

## 未归类图标

新增图标如不确定归属，先放到 `common/`。后续有明确归属时再移入对应模块目录。
