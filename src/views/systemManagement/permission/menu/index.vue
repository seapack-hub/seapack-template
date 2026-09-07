<template>
  <div class="app-container h-100% flex flex-col">
    <div class="main-layout flex-1 flex gap-16px min-h-0">
      <!-- 左侧：菜单树 -->
      <div class="left-panel flex-shrink-0 w-[260px] flex flex-col border border-[var(--el-border-color-lighter)] rounded-lg overflow-hidden bg-white">
        <!-- 树顶部工具栏 -->
        <div class="flex items-center justify-between px-14px py-10px border-b border-[var(--el-border-color-lighter)]">
          <span class="text-14px font-600 color-[var(--el-text-color-primary)]">菜单结构</span>
          <el-button type="primary" link size="small" @click="expandAll = !expandAll">
            {{ expandAll ? '全部折叠' : '全部展开' }}
          </el-button>
        </div>
        <!-- 搜索框 -->
        <div class="px-10px py-8px">
          <el-input v-model="filterText" placeholder="搜索菜单名称" clearable prefix-icon="Search" size="small" />
        </div>
        <!-- 树主体 -->
        <div class="flex-1 overflow-auto px-6px pb-8px">
          <el-tree
            ref="treeRef"
            :data="treeDisplayData"
            :props="{ children: 'children', label: 'name' }"
            node-key="id"
            default-expand-all
            highlight-current
            :expand-on-click-node="false"
            :filter-node-method="filterNode"
            @node-click="handleNodeClick"
          >
            <template #default="{ node, data }">
              <div class="tree-node flex items-center gap-6px flex-1 min-w-0 text-13px p-r-10">
                <Icon :name="typeIcon(data.type)" :size="16" />
                <span class="flex-1 truncate">{{ node.label }}</span>
                <span v-if="data.children && data.children.length" class="text-12px color-[var(--el-text-color-placeholder)]">{{ data.children.length }}</span>
              </div>
            </template>
          </el-tree>
        </div>
        <!-- 底部新增按钮 -->
        <div class="px-10px py-10px border-t border-[var(--el-border-color-lighter)]">
          <el-button type="success" class="w-100%" icon="plus" @click="openAddRoot()">新增顶级目录</el-button>
        </div>
      </div>

      <!-- 右侧：子项列表 -->
      <div class="right-panel flex-1 flex flex-col min-w-0 min-h-0">
        <el-card class="flex-1 flex flex-col overflow-hidden" shadow="never">
          <!-- 顶部面包屑 + 操作按钮 -->
          <div class="flex items-center justify-between flex-shrink-0">
            <div class="flex items-center gap-4px text-14px">
              <el-icon class="cursor-pointer color-[var(--el-text-color-secondary)]" @click="goRoot"><HomeFilled /></el-icon>
              <template v-for="(crumb, idx) in breadcrumbs" :key="crumb.id">
                <span class="color-[var(--el-text-color-placeholder)]">/</span>
                <span
                  class="cursor-pointer"
                  :class="idx === breadcrumbs.length - 1 ? 'color-[var(--el-text-color-primary)] font-600' : 'color-[var(--el-text-color-secondary)]'"
                  @click="selectNodeById(crumb.id)"
                >{{ crumb.name }}</span>
              </template>
            </div>
            <div class="flex items-center gap-8px h-[30px]">
              <template v-if="selectedIds.length > 0">
                <span class="text-13px color-[var(--el-text-color-secondary)]">已选 <b class="color-[var(--el-color-primary)]">{{ selectedIds.length }}</b> 项</span>
                <el-popconfirm title="确认批量删除选中项吗？" @confirm="handleBatchDelete">
                  <template #reference>
                    <el-button type="danger" size="small" icon="delete">批量删除</el-button>
                  </template>
                </el-popconfirm>
              </template>
              <el-button v-if="selectedNode" type="primary" icon="edit" size="small" :disabled="selectedIds.length > 0" @click="openEdit(selectedNode)">编辑当前</el-button>
              <el-button v-if="selectedNode && selectedNode.type !== 3" type="success" icon="plus" size="small" :disabled="selectedIds.length > 0" @click="openAddChild()">新增子项</el-button>
            </div>
          </div>

          <!-- 当前节点信息卡片 -->
          <div v-if="selectedNode" class="flex-shrink-0 mt-12px p-12px rounded-lg bg-[var(--el-fill-color-lighter)]">
            <div class="flex items-center gap-12px flex-wrap text-13px">
              <span class="font-600 color-[var(--el-text-color-primary)] inline-flex items-center gap-6px"><Icon :name="typeIcon(selectedNode.type)" :size="16" /> {{ selectedNode.name }}</span>
              <el-tag size="small" :type="selectedNode.status === 1 ? 'success' : 'danger'">{{ selectedNode.status === 1 ? '正常' : '禁用' }}</el-tag>
              <span class="color-[var(--el-text-color-secondary)]">{{ selectedNode.path }}</span>
              <span v-if="selectedNode.permKey" class="color-[var(--el-text-color-placeholder)] font-mono text-12px">{{ selectedNode.permKey }}</span>
            </div>
          </div>

          <!-- 子项列表表格 -->
          <div ref="tableContainerRef" class="flex-1 flex flex-col mt-12px min-h-0 overflow-hidden border border-[var(--el-border-color-lighter)] rounded">
            <el-table
              :data="childrenList"
              :show-header="true"
              row-key="id"
              :max-height="tableMaxHeight"
              :header-cell-style="{ background: '#f8fafd', fontWeight: '600', fontSize: '13px' }"
              @selection-change="handleSelectionChange"
            >
              <el-table-column type="selection" width="45" />
              <el-table-column label="权限名称" min-width="180">
                <template #default="{ row }">
                  <span class="inline-flex items-center gap-6px cursor-pointer" @click="enterNode(row)">
                    <Icon :name="typeIcon(row.type)" :size="16" />
                    <span class="font-500">{{ row.name }}</span>
                  </span>
                </template>
              </el-table-column>
              <el-table-column label="权限标识" prop="permKey" min-width="160" show-overflow-tooltip />
              <el-table-column label="类型" min-width="90" align="center">
                <template #default="{ row }">
                  <el-tag size="small" :type="row.type === 1 ? 'primary' : row.type === 2 ? 'success' : 'warning'">
                    {{ typeLabel(row.type) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="路由路径" prop="path" min-width="200" show-overflow-tooltip />
              <el-table-column label="排序" prop="sortOrder" width="70" align="center" />
              <el-table-column label="状态" width="80" align="center">
                <template #default="{ row }">
                  <el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small">{{ row.status === 1 ? '正常' : '禁用' }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="170" fixed="right" align="center">
                <template #default="{ row }">
                  <el-button v-if="row.type !== 3" type="primary" link size="small" @click="openAddChild(row)">新增子项</el-button>
                  <el-button type="primary" link size="small" @click="openEdit(row)">编辑</el-button>
                  <el-popconfirm title="确认删除该权限（及子项）吗？" @confirm="handleDelete(row)">
                    <template #reference>
                      <el-button type="danger" link size="small">删除</el-button>
                    </template>
                  </el-popconfirm>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-card>
      </div>
    </div>

    <MenuFormDialog v-model:visible="formVisible" v-model:is-edit="formIsEdit" v-model:form="formData" v-model:parent-name="parentName" v-model:parent-type="parentType" @confirm="onFormConfirm" />
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { PermissionAPI, type PermissionTree } from '@/api/system/permission/permission'
import Icon from '@/components/Icon/index.vue'
import MenuFormDialog from './components/MenuFormDialog.vue'

/* ── 树数据 ── */
const treeRef = ref<InstanceType<any>>(null)
const tableContainerRef = ref<HTMLElement | null>(null)
const treeData = ref<PermissionTree[]>([])
const filterText = ref('')
const expandAll = ref(true)
const tableMaxHeight = ref<number>(400)

/* ── 选中节点 ── */
const selectedNode = ref<PermissionTree | null>(null)
const breadcrumbs = ref<{ id: number; name: string }[]>([])
const selectedIds = ref<number[]>([])

/* ── 表单弹窗 ── */
const formVisible = ref(false)
const formIsEdit = ref(false)
const parentName = ref('')
const parentType = ref<number>(0)
const formData = ref<any>({ name: '', type: 1, path: '', component: '', permKey: '', sortOrder: 0, status: 1, parentId: 0 })

/* ── 计算属性：当前选中节点的直接子项 ── */
const childrenList = computed(() => {
  if (!selectedNode.value) {
    // 根级：显示所有顶级节点
    return treeData.value
  }
  return selectedNode.value.children || []
})

/* ── 计算属性：左侧树仅展示目录和菜单，过滤按钮类型 ── */
const treeDisplayData = computed(() => {
  function filterTree(list: PermissionTree[]): PermissionTree[] {
    return list
      .filter(node => node.type !== 3)
      .map(node => ({
        ...node,
        children: node.children ? filterTree(node.children) : [],
      }))
  }
  return filterTree(treeData.value)
})

/* ── 树过滤 ── */
watch(filterText, (val) => {
  treeRef.value?.filter(val)
})

function filterNode(value: string, data: any) {
  if (!value) return true
  return data.name.toLowerCase().includes(value.toLowerCase())
}

/* ── 展开/折叠全部 ── */
watch(expandAll, (val) => {
  const nodes = treeRef.value?.store?.root?.childNodes || []
  function toggle(list: any[]) {
    for (const node of list) {
      node.expanded = val
      if (node.childNodes?.length) toggle(node.childNodes)
    }
  }
  toggle(nodes)
})

/* ── 节点点击 ── */
function handleNodeClick(data: PermissionTree) {
  // 从原始 treeData 中查找完整节点（包含按钮子节点）
  const fullNode = findTreeNode(treeData.value, data.id)
  selectedNode.value = fullNode || data
  buildBreadcrumbs(data.id)
  selectedIds.value = []
  nextTick(calcTableHeight)
}

function enterNode(row: any) {
  // 在树数据中找到对应节点并选中
  const found = findTreeNode(treeData.value, row.id)
  if (found) {
    selectedNode.value = found
    buildBreadcrumbs(found.id)
    selectedIds.value = []
    // 同步树的高亮
    treeRef.value?.setCurrentKey(found.id)
    nextTick(calcTableHeight)
  }
}

function selectNodeById(id: number) {
  const found = findTreeNode(treeData.value, id)
  if (found) {
    selectedNode.value = found
    buildBreadcrumbs(found.id)
    selectedIds.value = []
    treeRef.value?.setCurrentKey(found.id)
    nextTick(calcTableHeight)
  }
}

function goRoot() {
  selectedNode.value = null
  breadcrumbs.value = []
  selectedIds.value = []
  treeRef.value?.setCurrentKey(null)
  nextTick(calcTableHeight)
}

/* ── 面包屑构建 ── */
function buildBreadcrumbs(targetId: number) {
  const path: { id: number; name: string }[] = []
  function walk(list: PermissionTree[], ancestors: { id: number; name: string }[]): boolean {
    for (const node of list) {
      const current = [...ancestors, { id: node.id, name: node.name }]
      if (node.id === targetId) {
        path.push(...current)
        return true
      }
      if (node.children && walk(node.children, current)) return true
    }
    return false
  }
  walk(treeData.value, [])
  breadcrumbs.value = path
}

/* ── 工具函数 ── */
function findTreeNode(list: PermissionTree[], id: number): PermissionTree | null {
  for (const node of list) {
    if (node.id === id) return node
    if (node.children) {
      const found = findTreeNode(node.children, id)
      if (found) return found
    }
  }
  return null
}

function typeIcon(type: number) {
  return { 1: 'contents', 2: 'menu', 3: 'button' }[type] || ''
}

function typeLabel(type: number) {
  return { 1: '目录', 2: '菜单', 3: '按钮' }[type] || ''
}

/* ── 选择操作 ── */
function handleSelectionChange(selection: any[]) {
  selectedIds.value = selection.map((item: any) => item.id)
}

/* ── CRUD ── */
function openAddRoot() {
  formData.value = { name: '', type: 1, path: '', component: '', permKey: '', sortOrder: 0, status: 1, parentId: 0 }
  parentName.value = ''
  parentType.value = 0
  formIsEdit.value = false
  formVisible.value = true
}

function openAddChild(row?: any) {
  const parent = row || selectedNode.value
  if (!parent) return
  const childType = parent.type === 1 ? 2 : 3
  formData.value = { name: '', type: childType, path: '', component: '', permKey: '', sortOrder: 0, status: 1, parentId: parent.id }
  parentName.value = parent.name
  parentType.value = parent.type
  formIsEdit.value = false
  formVisible.value = true
}

function openEdit(row: any) {
  formData.value = { ...row }
  parentName.value = ''
  parentType.value = row.parentId ? findParentType(treeData.value, row.parentId) : 0
  formIsEdit.value = true
  formVisible.value = true
}

function findParentType(list: PermissionTree[], parentId: number): number {
  for (const node of list) {
    if (node.id === parentId) return node.type
    if (node.children) {
      const found = findParentType(node.children, parentId)
      if (found) return found
    }
  }
  return 0
}

async function onFormConfirm(form: any, isEdit: boolean) {
  const api = isEdit ? (d: any) => PermissionAPI.update(form.id, d) : PermissionAPI.insert
  await api(form)
  ElMessage.success(isEdit ? '更新成功' : '新增成功')
  formVisible.value = false
  await fetchTree()
  // 刷新后保持当前选中
  if (selectedNode.value) {
    const refreshed = findTreeNode(treeData.value, selectedNode.value.id)
    if (refreshed) {
      selectedNode.value = refreshed
      treeRef.value?.setCurrentKey(refreshed.id)
    }
  }
}

async function handleDelete(row: any) {
  await PermissionAPI.delete(row.id)
  ElMessage.success('删除成功')
  await fetchTree()
  // 如果删除的是当前选中节点，回到根级
  if (selectedNode.value?.id === row.id) {
    goRoot()
  } else if (selectedNode.value) {
    const refreshed = findTreeNode(treeData.value, selectedNode.value.id)
    if (refreshed) selectedNode.value = refreshed
  }
}

async function handleBatchDelete() {
  for (const id of selectedIds.value) {
    await PermissionAPI.delete(id)
  }
  ElMessage.success('批量删除成功')
  selectedIds.value = []
  await fetchTree()
}

/* ── 数据加载 ── */
async function fetchTree() {
  const res = await PermissionAPI.getTree()
  treeData.value = Array.isArray(res) ? res : []
}

/* ── 表格高度自适应 ── */
function calcTableHeight() {
  nextTick(() => {
    const container = tableContainerRef.value
    if (!container) return
    const headerH = 40 // 表头高度
    const available = container.clientHeight - headerH
    tableMaxHeight.value = Math.max(available, 200)
  })
}

onMounted(() => {
  fetchTree()
  calcTableHeight()
  window.addEventListener('resize', calcTableHeight)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', calcTableHeight)
})
</script>

<style lang="scss" scoped>
/* 左侧面板 */
.left-panel {
  :deep(.el-tree) {
    --el-tree-node-hover-bg-color: var(--el-fill-color-light);
    .el-tree-node.is-current > .el-tree-node__content {
      background-color: var(--el-color-primary-light-9);
      color: var(--el-color-primary);
      font-weight: 500;
    }
  }
}

/* 右侧卡片 */
.right-panel {
  :deep(.el-card) {
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 8px;
  }
  :deep(.el-card__body) {
    height: 100%;
    display: flex;
    flex-direction: column;
  }
}
</style>
