# SeaPack 组件化实践：SpTable 通用表格组件设计

> 本文是 SeaPack 项目技术系列的第三篇，聚焦 **通用组件封装**。我会完整拆解项目里使用最广的一个基础组件 —— `SpTable`，讲清楚它如何用「一份列配置」描述整张表格，如何把操作列、按钮权限、分页这些重复逻辑一次性收敛，以及这套设计背后体现的组件化思维。

> 阅读收益：这篇是全系列**最能体现组件设计能力**的一篇。如果你正在做后台管理系统，或者想理解「配置驱动 UI」是怎么落地的，这篇会给你一套可以直接抄走的思路。

---

## 一、为什么要封装 SpTable

后台管理系统里，**表格是使用频率最高、重复度也最高的 UI**。一个中大型系统动辄几十上百个列表页，如果每个页面都直接裸写 Element Plus 的 `el-table`，会遇到几个反复出现的问题：

| 痛点 | 裸写 `el-table` 的表现 |
|------|----------------------|
| **模板冗长** | 每一列都要写一段 `<el-table-column>`，一个 10 列的表格模板轻松上百行 |
| **操作列重复** | 每个列表页的「编辑/删除/详情」按钮结构几乎一样，却要一遍遍复制 |
| **权限散落** | 按钮级权限判断（`v-if="hasPerm(...)"`）散落在每个页面的模板里，难以统一 |
| **空值/溢出不统一** | 有的页面处理了 `null → '--'`、`show-overflow-tooltip`，有的忘了，体验参差不齐 |
| **样式不一致** | 表头背景、行高、字号每页各写各的，视觉不统一 |

SpTable 的设计目标非常明确：

> **让业务开发者只写一份「列配置数组」，就能得到一张样式统一、自带权限、自带空值处理、操作列可配置的完整表格；同时保留完全自定义的逃生舱口。**

它不是要「替代」`el-table`，而是站在 `el-table` 肩膀上，把**重复的、有约定的部分**沉淀下来，把**灵活的部分**通过透传和插槽开放出去。

---

## 二、整体架构：一个核心组件 + 一套配套件

SpTable 并不是一个孤立的大组件，而是一套**职责分明的小组件群**。核心文件只有三个：

```
src/components/baseComponents/SpTable/
├── index.vue                      # 主组件：列渲染分发 + 表格骨架
├── type.ts                        # 列配置 DSL 的类型定义
└── components/
    └── operateButton.vue          # 操作列：按钮渲染 / 折叠 / 确认
```

但它的能力是**联合周边配套组件**共同完成的：

```
                    ┌─────────────────────────────────────────┐
                    │              SpTable (index.vue)          │
                    │  · 透传 el-table 属性 ($attrs)            │
                    │  · 按 columns 配置分发渲染每一列          │
                    │  · 统一空值 / 溢出 / 表头样式             │
                    └───────────────┬─────────────────────────┘
                                    │ columnType === 'operate'
                                    ▼
                    ┌─────────────────────────────────────────┐
                    │        operateButton.vue                  │
                    │  · 三种按钮形态（跳转 / 确认 / 普通）      │
                    │  · 超过阈值自动折叠到「更多」下拉          │
                    └──────┬──────────────────────┬────────────┘
                           │                      │
              ┌────────────▼───────┐   ┌──────────▼──────────┐
              │ SpButtonPermission │   │      SpAction        │
              │  声明式按钮级权限   │   │  动作抽象（跳转/弹窗）│
              └────────────┬───────┘   └─────────────────────┘
                           │
              ┌────────────▼────────────┐
              │  useButtonPermission()  │  ← 权限判断 Hook（新旧系统兼容）
              └─────────────────────────┘

     页面里与 SpTable 组合使用（关注点分离，非内部耦合）：
     ┌───────────────────────┐
     │  Pagination (独立组件) │  ← defineModel 双向绑定 page / limit
     └───────────────────────┘
```

三层职责划分：

| 层级 | 组件 | 职责 |
|------|------|------|
| **骨架层** | `SpTable/index.vue` | 表格容器、列渲染分发、样式统一、空值处理 |
| **交互层** | `operateButton.vue` | 操作列按钮的渲染、折叠、二次确认 |
| **能力层** | `SpButtonPermission` / `SpAction` / `useButtonPermission` | 权限控制、动作抽象、权限判断 |

**这里体现的第一个组件化原则：单一职责 + 组合优于继承。** SpTable 自己不关心「按钮怎么鉴权」「跳转怎么实现」，它只负责「把配置翻译成列」，具体的权限和动作能力交给配套组件。每个组件都很小、很好测试、很好复用。

---

## 三、列配置 DSL 设计思路

这是 SpTable 的灵魂。所谓 DSL（领域特定语言），在这里就是**用一个普通 JS 对象来描述一列的所有行为**，业务开发者不再写模板，而是写配置。

### 3.1 一个配置对象 = 一列

先看用户管理页真实的列配置（`UserColumns.ts`）：

```ts
export function createUserColumns(handlers: UserColumnHandlers) {
  return [
    { type: 'selection', width: '50px', align: 'center' },
    { label: '用户名', prop: 'userName', minWidth: '120px' },
    { label: '昵称', prop: 'nickName', minWidth: '120px', align: 'center' },
    { label: '性别', prop: 'gender', minWidth: '70px', align: 'center', slotName: 'gender' },
    { label: '部门', prop: 'deptName', minWidth: '120px', align: 'center' },
    { label: '手机号码', prop: 'mobile', minWidth: '130px', align: 'center' },
    { label: '状态', prop: 'status', minWidth: '80px', align: 'center', slotName: 'status' },
    { label: '创建时间', prop: 'createTime', minWidth: '170px', align: 'center' },
    {
      columnType: 'operate', label: '操作', width: '230px', fixed: 'right',
      buttons: [
        { type: 'primary', label: '分配角色', size: 'small', renderType: 'link', buttonPermission: 'systemManagement:baseInfo:user:assignRoles', click: ({ row }: any) => handlers.onAssignRole(row) },
        { type: 'primary', label: '重置密码', size: 'small', renderType: 'link', buttonPermission: 'systemManagement:baseInfo:user:resetPassword', click: ({ row }: any) => handlers.onResetPwd(row) },
        { type: 'primary', label: '编辑', size: 'small', renderType: 'link', buttonPermission: 'systemManagement:baseInfo:user:edit', click: ({ row }: any) => handlers.onEdit(row) },
        { type: 'danger', label: '删除', size: 'small', renderType: 'link', buttonPermission: 'systemManagement:baseInfo:user:delete', popconFirm: { title: '确认删除该用户吗？' }, click: ({ row }: any) => handlers.onDelete(row) },
      ],
    },
  ]
}
```

一眼看过去，**整个用户表格的结构清清楚楚**：8 个数据列 + 1 个操作列，哪些列用插槽自定义、哪些按钮需要什么权限、点击做什么，全部一目了然。这比在模板里堆几十行 `<el-table-column>` 可读性高得多。

### 3.2 核心字段解读

`type.ts` 里定义了这份 DSL 的类型契约：

```ts
// 定义表格列配置类型
export type columnsType = Array<{
  columnType?: 'operate' | string   // 列类型：operate 表示操作列
  slotName?: string                 // 具名插槽名：该列改用插槽自定义渲染
  dictType?: string                 // 字典类型：配合字典做值翻译
  tips?: string                     // 表头补充说明：渲染带 tooltip 的表头
  permission?: string               // 操作列整体权限标识
  buttons?: any[]                   // 操作列按钮配置
  [key: string]: any                // 其余属性透传给 el-table-column
}>
```

各字段的分工：

| 字段 | 作用 | 典型场景 |
|------|------|---------|
| `columnType: 'operate'` | 声明这是**操作列**，走 `operateButton` 渲染 | 表格最后一列的编辑/删除 |
| `slotName` | 声明该列用**具名插槽**自定义，SpTable 只占位 | 性别/状态用 `el-tag`、图片列、进度条 |
| `type: 'selection'` | 声明**多选框列** | 批量删除 |
| `type: 'expand'` | 声明**展开行列** | 行内展开详情 |
| `tips` | 表头带**问号提示**图标 | 字段含义需要解释的列 |
| `buttons` | 操作列的**按钮配置数组** | 见第五节 |
| `[key: string]: any` | **兜底透传**，其余属性原样交给 `el-table-column` | `label`/`prop`/`width`/`align`/`fixed`/`sortable`… |

### 3.3 关键设计：开放式透传 `[key: string]: any`

这是整套 DSL 里**最重要的一个决定**。

很多配置驱动的封装会犯一个错误：把所有能配的字段都枚举进类型定义，结果 `el-table-column` 有几十个属性（`sortable`、`resizable`、`formatter`、`className`……），一旦 Element Plus 升级新增了属性，封装层就得跟着改，成了「维护负担」。

SpTable 的做法是：**只显式声明「需要特殊处理」的字段（`columnType`/`slotName`/`type`/`tips`/`buttons`），其余一律通过 `[key: string]: any` 透传**。渲染时用一个 `v-bind="item"` 把整个配置对象铺到 `el-table-column` 上：

```vue
<el-table-column v-else v-bind="{ showOverflowTooltip: true, ...item }" />
```

这样一来：
- **零维护成本**：Element Plus 加任何新属性，业务侧直接在配置里写就行，封装层不用动
- **不丢能力**：原生 `el-table-column` 能做的，配置里都能做
- **约定优先**：只有需要「特殊渲染」的字段才被 SpTable 拦截处理，其余保持原生行为

> **组件化原则：封装要「做加法」而不是「做减法」。** 好的封装不应该削减底层组件的能力，而应该在其之上叠加约定。透传就是保留能力的逃生舱口。

---

## 四、列渲染分发：一棵清晰的决策树

拿到 `columns` 配置后，SpTable 的模板本质上是一棵 **`v-if / v-else-if` 决策树**，按优先级判断每一列该怎么渲染：

```vue
<template v-for="(item, index) in columns" :key="index">
  <!-- ① 操作列：固定右侧，交给 OperateButton -->
  <template v-if="item.columnType === 'operate'">
    <el-table-column v-if="showOperateButton(item)" v-bind="{ fixed: 'right', ...item }">
      <template #default="scope">
        <OperateButton :buttons="item.buttons" :scope v-bind="$attrs" />
      </template>
    </el-table-column>
  </template>

  <!-- ② 具名插槽列：把渲染权完全交给业务 -->
  <slot v-else-if="item.slotName" :name="item.slotName" />

  <!-- ③ 特殊列：多选 / 展开行 -->
  <template v-else-if="item.type">
    <el-table-column v-if="item.type === 'selection'" v-bind="{ width: '50px', fixed: 'left', ...item }" />
    <el-table-column v-else-if="item.type === 'expand'" v-bind="{ fixed: 'left', ...item }">
      <template #default="expandScope">
        <slot name="expand" :props="expandScope" />
      </template>
    </el-table-column>
  </template>

  <!-- ④ 表头提示列：label 后跟一个 tooltip 图标 -->
  <el-table-column v-else-if="item.tips" v-bind="{ showOverflowTooltip: true, ...item }">
    <template #header>
      <div class="size-full flex items-center">
        {{ item.label }}
        <el-tooltip placement="top" :content="item.tips">
          <Icon name="tips" :size="15" />
        </el-tooltip>
      </div>
    </template>
  </el-table-column>

  <!-- ⑤ 普通列：兜底 -->
  <el-table-column v-else v-bind="{ showOverflowTooltip: true, ...item }" />
</template>
```

渲染优先级：**操作列 > 插槽列 > 特殊列 > 提示列 > 普通列**。这个顺序是有讲究的——越「特殊」的列越优先判断，普通列作为最后的兜底。

### 4.1 统一处理：空值与溢出

注意普通列和提示列都带了 `showOverflowTooltip: true`，并且当 `showEmpty` 为真时统一注入一个 `formatter`：

```vue
v-bind="showEmpty ? {
  formatter: (_row, _column, cellValue) => cellValue ?? '--',  // 空值统一显示 --
  showOverflowTooltip: true,
  ...item
} : {
  showOverflowTooltip: true,
  ...item
}"
```

**这就是「约定」的价值**：业务开发者什么都不用做，全项目的表格空值都显示成 `--`、内容溢出都自动带 tooltip。视觉一致性由组件保证，而不是靠每个开发者自觉。而且 `...item` 放在最后，意味着业务仍然可以在单列配置里覆盖 `formatter`，约定不牺牲灵活性。

### 4.2 完全自定义的逃生舱口：默认插槽

整个列循环被一个默认插槽 `<slot>...</slot>` 包裹：

```vue
<el-table ...>
  <slot>
    <!-- 上面那棵决策树是插槽的“默认内容” -->
  </slot>
  <template #empty>
    <slot name="empty"><SpEmpty /></slot>
  </template>
</el-table>
```

如果某个页面的表格结构特殊到配置 DSL 也覆盖不了，业务可以**直接往默认插槽里写原生 `el-table-column`**，完全绕过配置渲染。空状态也提供了 `empty` 插槽，默认渲染统一的 `<SpEmpty />`。

> **组件化原则：任何抽象都要留后门。** 配置驱动能覆盖 90% 的场景，但一定要为剩下的 10% 留出「不用配置也能玩」的逃生舱口，否则封装就会从「帮手」变成「枷锁」。

---

## 五、操作列：SpTable 最复杂也最出彩的部分

操作列由 `operateButton.vue` 负责，它把「行操作按钮」这件事做到了极致。

### 5.1 三种按钮形态

根据配置字段，按钮自动分成三类渲染：

```vue
<!-- ① 复杂操作按钮：需要打开弹窗 / 抽屉 / 新页面（编辑、查看详情） -->
<SpAction v-if="btnItem.targetView || btnItem.metaKey" v-bind="btnItem" :row="scope.row" />

<!-- ② 带确认的按钮：删除等破坏性操作，二次确认防误触 -->
<el-popconfirm v-else-if="btnItem.popconFirm" v-bind="getProps(btnItem.popconFirm)" @confirm="btnItem.click(scope)">
  <template #reference>
    <el-link v-bind="btnItem" underline="never">{{ btnItem.label }}</el-link>
  </template>
</el-popconfirm>

<!-- ③ 普通链接按钮：简单点击操作（刷新、导出） -->
<el-link v-else v-bind="btnItem" underline="never" @click="btnItem.click(scope)">{{ btnItem.label }}</el-link>
```

| 形态 | 触发字段 | 用途 |
|------|---------|------|
| 复杂操作 | `targetView` / `metaKey` | 交给 `SpAction` 处理跳转/弹窗 |
| 带确认 | `popconFirm` | 破坏性操作二次确认 |
| 普通链接 | 无上述字段 | 直接 `click(scope)` |

**每一个按钮外面都包了一层 `SpButtonPermission`**，权限控制统一在这一层完成，按钮本身不需要关心鉴权。

### 5.2 按钮自动折叠到「更多」

行操作按钮一多，操作列就会被撑爆。SpTable 内置了**自动折叠**：

```ts
// operateButtonCount 默认 3
const allShowButtons = computed(() => {
  return props.buttons?.filter((item) => {
    const hasPerm = item?.buttonPermission ? buttonHasPermission(item.buttonPermission) : true
    const hasVif = item?.vIFHandler ? item.vIFHandler(props.scope) : true
    return hasPerm && hasVif    // 同时过滤「权限」和「行级显隐」
  })
})

// 超过阈值：直接显示前 (N-1) 个
const showButtons = computed(() => {
  const buttons = allShowButtons.value
  return buttons.length > props.operateButtonCount
    ? buttons.filter((_item, index) => index < props.operateButtonCount - 1)
    : buttons
})

// 剩下的收进「更多」下拉
const dropDownButtons = computed(() => {
  const buttons = allShowButtons.value
  return buttons.length > props.operateButtonCount
    ? buttons.filter((_item, index) => index >= props.operateButtonCount - 1)
    : []
})
```

规则很直观：**按钮数不超过阈值（默认 3）就全部平铺；一旦超过，直接显示前 2 个，其余全部收进「更多」下拉菜单**。用户管理页有 4 个操作（分配角色/重置密码/编辑/删除），就会渲染成「分配角色 · 重置密码 · 更多▾」。

关键点在于：**折叠发生在权限过滤之后**。`allShowButtons` 先剔除掉没权限、不满足行级条件的按钮，再基于「真实可见的按钮数」决定要不要折叠。这样不会出现「明明只有一个可见按钮，却因为配置里写了 4 个而莫名出现『更多』下拉」的尴尬。

### 5.3 行级显隐与禁用：`vIFHandler` / `disabledHandler`

有些按钮的显隐/禁用**依赖当前行数据**（比如「已通过」的订单不能再「审核」）。SpTable 用两个函数式配置解决：

```vue
<el-link
  v-if="btnItem?.vIFHandler ? btnItem.vIFHandler(scope) : true"
  :disabled="btnItem?.disabledHandler ? btnItem.disabledHandler(scope) : false"
  @click="btnItem.click(scope)"
>
```

业务在配置里传函数，函数接收整行的 `scope`，返回布尔值：

```ts
{ label: '审核', vIFHandler: ({ row }) => row.status === 'pending', click: onAudit }
{ label: '编辑', disabledHandler: ({ row }) => row.locked, click: onEdit }
```

**用函数把「判断逻辑」也变成配置的一部分**，这是配置驱动 UI 的高级形态——不仅数据是配置，行为也是配置。

### 5.4 破坏性操作的二次确认

删除类操作通过 `popconFirm` 字段声明，自动套上 `el-popconfirm`：

```ts
{ label: '删除', popconFirm: { title: '确认删除该用户吗？' }, click: onDelete }
```

`getProps` 做了个贴心的兼容——`popconFirm` 既可以是字符串（直接当标题），也可以是对象（完整的 popconfirm 配置）：

```ts
const getProps = (data) => typeof data === 'object' ? data : { title: data }
```

连「更多」下拉里的按钮点击也做了确认处理（`dropdownClick`），保证折叠起来的删除操作同样有二次确认，不会因为藏进下拉就丢失安全性。

---

## 六、按钮权限：声明式 + 新旧系统兼容

权限是 SpTable 区别于「普通表格封装」的核心竞争力。它把权限判断收敛到了一条清晰的链路里。

### 6.1 SpButtonPermission：一个纯粹的权限包装器

```vue
<template>
  <!-- 有权限才渲染插槽内容，否则什么都不渲染 -->
  <slot v-if="hasPermission" v-bind="$attrs" />
</template>

<script setup lang="ts">
const props = defineProps({
  buttonPermission: {
    // 支持字符串 'user:add'，也支持对象 { permission, type, name }
    type: [Object, String],
    default: null,
  },
})
const { buttonHasPermission } = useButtonPermission()
const hasPermission = computed(() => {
  if (!props.buttonPermission) return true   // 没配权限 = 公开按钮
  return buttonHasPermission(props.buttonPermission)
})
</script>
```

这个组件小到只有几行，但设计很干净：**它是一个「权限闸门」，无权限时直接不渲染子节点**（而不是 `v-show` 隐藏）。DOM 里根本不存在这个按钮，审查元素也看不到，比 CSS 隐藏更安全。

### 6.2 useButtonPermission：兼容两套权限体系

真正干活的是这个 Hook，它同时兼容项目的**新旧两套权限系统**：

```ts
const buttonHasPermission = (buttonPermission: any) => {
  const permKey = getPermKey(buttonPermission)   // 从字符串或对象里提取权限标识
  if (!permKey) return true

  /* 新系统：后端下发的完整权限集合 userStore.buttonPerms */
  const { buttonPerms } = userStore
  if (buttonPerms.length > 0) {
    if (buttonPerms.includes('*:*:*') || buttonPerms.includes('*')) return true  // 超管通配
    return buttonPerms.includes(permKey)
  }

  /* 旧系统：静态路由元数据 route.meta.buttonList */
  const metaKey = String(route.name)
  const buttonList = route?.meta?.buttonList ?? []
  if (buttonList?.length) {
    const type = buttonPermission?.type ?? 'row'
    return buttonList.some((item) => item?.buttonMetaKey === `${metaKey}.${type}.${permKey}`)
  }
  return false
}
```

**为什么这个设计值得写进文章？** 因为它体现了「渐进式演进」的现实考量：项目从旧的静态路由权限迁移到新的后端下发权限，不可能一夜之间全部改完。这个 Hook 让两套体系**平滑共存**——有 `buttonPerms` 就走新逻辑，否则回退到旧的 `route.meta`。业务侧的配置写法（`buttonPermission: 'xxx:yyy:zzz'`）完全不变，底层权限体系怎么演进对业务透明。

> **组件化原则：把易变的东西隔离在抽象背后。** 权限来源是会变的，但按钮的声明方式不该跟着变。Hook 就是那道隔离墙。

### 6.3 整列显隐：一个按钮都没权限就隐藏整列

回到 SpTable 主组件，操作列的显隐用了这样一段逻辑：

```ts
const showOperateButton = (item: any) => {
  const buttons = item.buttons
  if (!buttons || buttons.length === 0) return false
  // 只要有任意一个按钮通过权限（或没配权限），就显示整列
  return buttons.some((btn) => {
    if (!btn.buttonPermission) return true
    return buttonHasPermission(btn.buttonPermission)
  })
}
```

细节很到位：**如果当前用户对这一行的所有操作都没权限，整个操作列直接不渲染**，而不是留一个空白列。这个判断和按钮级的 `SpButtonPermission` 形成了两级权限控制——列级 + 按钮级。

---

## 七、动作抽象：SpAction 让「点击之后做什么」也变成配置

操作列里的「复杂操作」（`targetView` / `metaKey`）会交给 `SpAction` 处理。它把「点击一个按钮之后可能发生的各种事」抽象成了统一的配置：

```ts
const props = defineProps({
  label: { type: String },
  // 渲染形态：按钮 / 链接 / 插槽
  renderType: { type: String, default: 'button', validator: v => ['button','link','slot'].includes(v) },
  // 动作：可以是 Promise、函数，或约定的 'openView'
  action: { type: [String, Promise, Function], default: null },
  // 打开方式：弹窗 / 新页面 / 路由跳转 / 新窗口
  openViewType: { type: String, default: 'dialog', validator: v => ['dialog','newPage','routePage','blank'].includes(v) },
  targetView: { type: null, default: null },   // 指定要打开的组件
  metaKey: { type: String, default: '' },       // 详情页标识
  row: { type: Object },                        // 当前行数据
  // ...
})
```

点击时的分发逻辑：

```ts
const handleAction = () => {
  const action = props.action
  if (action instanceof Promise) { action }
  else if (action instanceof Function) { action() }
  else { if (action === 'openView') openView() }   // 约定动作：打开视图
}
```

`openView` 会根据 `openViewType` 决定是路由跳转（`router.push`）还是新窗口打开（`window.open`），并把当前行数据、动作类型、环境参数安全序列化后带过去：

```ts
// 安全序列化：剔除函数，避免 JSON.stringify 报错
function safeJsonStringify(obj) {
  try {
    return JSON.stringify(obj, (_k, v) => (typeof v === 'function' ? undefined : v))
  } catch { return '{}' }
}
```

有了 SpAction，「点击编辑打开弹窗」「点击详情跳转新页」「点击链接新窗口打开」这些**本来要写一堆命令式代码的动作，全部变成了配置字段**。业务只需要声明「我要什么行为」，不需要关心「怎么实现」。

---

## 八、分页：刻意的关注点分离

一个容易被误读的点：**SpTable 本身并不包含分页**。分页是一个独立的 `Pagination` 组件，在页面里与 SpTable **组合**使用。

这不是偷懒，而是**刻意的设计选择**。表格渲染和分页是两件事：有的表格不需要分页（一次性加载全部），有的分页要放在表格外面，有的甚至一个分页控制多个表格。把分页塞进 SpTable 内部会造成强耦合、降低灵活性。

`Pagination` 组件用 Vue 3.4 的 `defineModel` 做双向绑定，用起来极其干净：

```vue
<script setup lang="ts">
const currentPage = defineModel('page', { type: Number, required: true, default: 1 })
const pageSize = defineModel('limit', { type: Number, required: true, default: 10 })
const emit = defineEmits(['pagination'])

function handleSizeChange(val) { emit('pagination', { page: currentPage.value, limit: val }) }
function handleCurrentChange(val) { emit('pagination', { page: val, limit: pageSize.value }) }
</script>
```

页面里的组合方式（用户管理页真实代码）：

```vue
<SpTable class="flex-1" :loading="loading" :columns="columns" :data="pageData" @selection-change="handleSelectionChange">
  <!-- 具名插槽自定义列 -->
</SpTable>
<Pagination
  v-if="total > 0"
  v-model:total="total"
  v-model:page="queryParams.pageNum"
  v-model:limit="queryParams.pageSize"
  @pagination="handleQuery"
/>
```

`queryParams.pageNum / pageSize` 与分页组件双向绑定，翻页时 `emit('pagination')` 触发 `handleQuery` 重新拉数据。**SpTable 负责「显示数据」，Pagination 负责「切换数据窗口」，页面负责「取数据」，三者各司其职、通过 props/emit 松耦合协作。**

> **组件化原则：不要造「全家桶」。** 把独立的能力拆成独立组件，用组合的方式拼装，比造一个大而全的「表格+分页+搜索」超级组件更灵活、更好维护。

---

## 九、实战：只写配置生成一张完整的用户表格

把前面所有能力串起来，看用户管理页是怎么用 SpTable 的。

### 9.1 第一步：用工厂函数产出列配置

`UserColumns.ts` 里，列配置被抽成一个**工厂函数**，把事件处理器（`handlers`）注入进去：

```ts
export interface UserColumnHandlers {
  onEdit: (row: any) => void
  onDelete: (row: any) => void
  onResetPwd: (row: any) => void
  onAssignRole: (row: any) => void
}

export function createUserColumns(handlers: UserColumnHandlers) {
  return [
    { type: 'selection', width: '50px', align: 'center' },
    { label: '用户名', prop: 'userName', minWidth: '120px' },
    { label: '性别', prop: 'gender', slotName: 'gender' },          // 插槽自定义
    { label: '状态', prop: 'status', slotName: 'status' },          // 插槽自定义
    {
      columnType: 'operate', label: '操作', width: '230px', fixed: 'right',
      buttons: [
        { label: '编辑', renderType: 'link', buttonPermission: 'systemManagement:baseInfo:user:edit', click: ({ row }) => handlers.onEdit(row) },
        { label: '删除', type: 'danger', renderType: 'link', buttonPermission: 'systemManagement:baseInfo:user:delete', popconFirm: { title: '确认删除该用户吗？' }, click: ({ row }) => handlers.onDelete(row) },
        // ...
      ],
    },
  ]
}
```

**为什么用工厂函数而不是直接导出一个数组常量？** 因为操作按钮的 `click` 需要引用页面里的方法（打开弹窗、调接口、刷新列表）。工厂函数让「列结构定义」和「具体业务逻辑」解耦：结构在独立文件里，逻辑通过 `handlers` 从页面注入。这样列配置文件是纯粹的、无副作用的、可复用的。

### 9.2 第二步：页面里注入逻辑 + 两个插槽

```vue
<template>
  <SpTable class="flex-1" :loading="loading" :columns="columns" :data="pageData" @selection-change="handleSelectionChange">
    <!-- 只需为「需要自定义渲染」的列写插槽，其余列全自动 -->
    <template #gender>
      <el-table-column label="性别" min-width="70px" align="center" slot-name="gender">
        <template #default="{ row }">
          <el-tag :type="row.gender == 1 ? 'success' : 'info'">{{ row.gender == 1 ? '男' : '女' }}</el-tag>
        </template>
      </el-table-column>
    </template>
    <template #status>
      <el-table-column label="状态" min-width="80px" align="center" slot-name="status">
        <template #default="{ row }">
          <el-tag :type="row.status == 1 ? 'success' : 'danger'">{{ row.status == 1 ? '正常' : '禁用' }}</el-tag>
        </template>
      </el-table-column>
    </template>
  </SpTable>
</template>

<script setup lang="ts">
// 把业务逻辑注入列配置工厂
const columns = createUserColumns({
  onEdit(row) { openEditDialog(row) },
  onDelete(row) {
    ElMessageBox.confirm(`确认删除用户【${row.userName}】？`, '警告', { type: 'warning' })
      .then(async () => { await UserAPI.delete(row.id); ElMessage.success('删除成功'); handleQuery() })
      .catch(() => {})
  },
  onResetPwd(row) { /* ... */ },
  onAssignRole(row) { /* ... */ },
})
</script>
```

### 9.3 效果对比

同一个用户表格，两种写法的代码量和心智负担对比：

| 维度 | 裸写 `el-table` | 用 SpTable |
|------|----------------|-----------|
| 8 个数据列 | 8 段 `<el-table-column>` 模板 | 配置数组里 8 个对象 |
| 操作列 4 个按钮 | 手写按钮 + 手写「更多」折叠逻辑 | `buttons` 配置，自动折叠 |
| 按钮权限 | 每个按钮写 `v-if="hasPerm(...)"` | 配置里一个 `buttonPermission` 字段 |
| 删除二次确认 | 手写 `el-popconfirm` 包裹 | 配置里一个 `popconFirm` 字段 |
| 空值 / 溢出 tooltip | 每列手写 `formatter` / 属性 | 组件默认统一处理 |
| 表头/行/字号样式 | 每页各写各的 | 组件内置默认样式 |
| **业务真正要写的** | 上述全部 | **只有 2 个自定义插槽 + 4 个 handler** |

业务开发者的心智从「我要怎么拼这张表格」变成了「我要声明这张表格长什么样、点击之后做什么」。**这就是配置驱动 UI 的核心价值：把「怎么做」沉淀进组件，让业务只关心「做什么」。**

---

## 十、藏在细节里的工程考量

好的组件不止是功能齐全，更在于那些「不写出来没人注意，一踩就疼」的细节。

### 10.1 强制重渲染：解决动态列不刷新

`el-table` 有个经典坑：**动态改变列（增删列、改列顺序）时，表格不会自动重新渲染**。SpTable 用一个 `refreshTable` 标志位绕过：

```ts
const refreshTable = ref(true)

// columns 变化时，先 false 再 true，强制销毁重建表格
watch(() => props.columns, () => {
  refreshTable.value = false
  setTimeout(() => { refreshTable.value = true }, 0)
}, { deep: true })
```

模板根节点 `v-if="refreshTable"`，配合 `setTimeout(0)` 在下一个宏任务恢复，等于「卸载再挂载」，让列变化一定生效。这是踩过坑之后才会有的处理。

### 10.2 `$attrs` 全量透传：不丢失任何原生能力

```vue
<el-table v-bind="{ ...$attrs, border: true }" ...>
```

SpTable 用 `v-bind="$attrs"` 把所有未声明的属性（`data`、`@selection-change`、`row-key`、`height`……）原样透传给 `el-table`，还顺手强制了 `border: true` 保证视觉统一。**业务可以像用原生 `el-table` 一样用 SpTable，任何原生属性、任何原生事件都照常工作。**

### 10.3 `defineExpose`：把内部实例开放出去

```ts
defineExpose({ SpTableRef })
```

有些场景需要调用 `el-table` 的实例方法（如 `clearSelection()` 清空多选、`doLayout()` 重新布局）。SpTable 通过 `defineExpose` 把内部 ref 暴露出来，业务用 `ref` 拿到组件后可以直接调用，**封装没有把底层能力「锁死」**。

### 10.4 默认样式内聚

表头背景、行高、字号这些「设计系统级」的样式，作为 props 的默认值内聚在组件里：

```ts
headerCellStyle: { type: Object, default: () => ({ 'font-size': '14px', 'font-weight': 500, background: '#f3f5fa', color: '#99A3AF' }) },
rowStyle: { type: Object, default: () => ({ height: '48px' }) },
```

全项目表格视觉统一，同时每个默认值都能被业务覆盖。**约定提供一致性，props 提供灵活性，两者不冲突。**

---

## 十一、组件化思维总结

SpTable 这一个组件，几乎把「后台通用组件该怎么设计」的要点演示了一遍：

| 设计手法 | 解决的问题 | 体现的原则 |
|----------|-----------|-----------|
| 列配置 DSL（`columns`） | 模板冗长、重复 | 配置驱动 UI，声明式优于命令式 |
| `[key: string]: any` 透传 | 封装丢失原生能力 | 做加法不做减法，保留逃生舱口 |
| 渲染决策树 | 不同列类型分发 | 约定优先，特殊列优先判断 |
| 默认插槽兜底 | 配置覆盖不到的场景 | 任何抽象都要留后门 |
| `operateButton` 折叠 | 操作按钮过多撑爆列 | 把重复交互收敛进组件 |
| `vIFHandler` / `disabledHandler` | 行级动态显隐 | 让「行为」也成为配置 |
| `SpButtonPermission` 包装器 | 权限代码散落 | 声明式权限，无权限直接不渲染 |
| `useButtonPermission` 新旧兼容 | 权限体系演进 | 把易变的东西隔离在抽象背后 |
| `SpAction` 动作抽象 | 跳转/弹窗命令式代码 | 用配置描述「做什么」 |
| 独立 `Pagination` 组合 | 分页强耦合 | 关注点分离，不造全家桶 |
| `refreshTable` 强制重渲染 | 动态列不刷新 | 踩坑后的工程兜底 |
| `$attrs` / `defineExpose` | 能力被锁死 | 封装不牺牲灵活性 |

如果要把这套设计浓缩成三条心法：

1. **收敛重复，开放灵活**：把有约定的、重复的部分（样式、权限、空值、操作列）沉淀进组件；把多变的、个性的部分（列结构、自定义渲染、业务逻辑）通过配置、插槽、透传开放出去。
2. **组合优于耦合**：SpTable + operateButton + SpButtonPermission + SpAction + Pagination，每个都是小而专的组件，用组合拼出完整能力，而不是造一个大而全的超级组件。
3. **声明式优于命令式**：让业务开发者描述「表格长什么样、点击做什么」，而不是「怎么一步步渲染、怎么鉴权、怎么跳转」。

一个通用组件的价值，不在于它有多复杂，而在于**它让使用它的人可以有多简单**。SpTable 把复杂留给了自己，把简单交给了业务——这大概就是组件化最好的样子。

---

*下一篇预告：第 4 篇将聊 SpTable 的「姊妹组件」—— `SpDetailForm` / `SpDetailEditable` 详情与编辑双态组件，看同一套配置驱动思路如何应用到「详情页 / 表单」场景。*
