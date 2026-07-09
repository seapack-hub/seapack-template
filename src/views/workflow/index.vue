<template>
  <div class="app-container w-100% h-100% flex flex-col">
    <el-card class="el-card-main flex-1 flex flex-col gap-10 overflow-hidden" shadow="never">
      <!-- 搜索栏 -->
      <div class="search-bar h-50px flex items-center gap-10px">
        <el-input
          v-model="queryParams.keyword"
          placeholder="搜索工作流名称"
          clearable
          style="width: 200px"
          @keyup.enter="handleQuery"
        />
        <el-select v-model="queryParams.status" placeholder="状态" clearable style="width: 120px">
          <el-option label="启用" :value="1" />
          <el-option label="禁用" :value="0" />
        </el-select>
        <el-button type="primary" @click="handleQuery">搜索</el-button>
        <el-button @click="handleReset">重置</el-button>
      </div>

      <!-- 工具栏 -->
      <div class="h-40px flex justify-between items-center">
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>新建工作流
        </el-button>
        <div class="flex items-center gap-10px">
          <el-radio-group v-model="viewMode" size="small">
            <el-radio-button value="card">卡片</el-radio-button>
            <el-radio-button value="list">列表</el-radio-button>
          </el-radio-group>
        </div>
      </div>

      <!-- 卡片模式 -->
      <Transition name="view-fade" mode="out-in">
        <div v-if="viewMode === 'card'" class="card-grid flex-1 overflow-y-auto">
          <div
            v-for="item in tableData"
            :key="item.id"
            class="workflow-card"
            @click="handleEdit(item)"
          >
            <div class="card-header flex items-center justify-between">
              <el-tag :type="item.status === 1 ? 'success' : 'info'" size="small">
                {{ item.status === 1 ? '启用' : '禁用' }}
              </el-tag>
              <el-dropdown trigger="click" @command="(cmd: string) => handleCommand(cmd, item)">
                <el-icon class="cursor-pointer"><MoreFilled /></el-icon>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="edit">编辑</el-dropdown-item>
                    <el-dropdown-item command="copy">复制</el-dropdown-item>
                    <el-dropdown-item command="delete" divided>删除</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
            <div class="card-title mt-10px mb-5px">{{ item.name }}</div>
            <div class="card-desc text-12px text-gray-400">{{ item.description || '暂无描述' }}</div>
            <div class="card-footer mt-10px flex items-center justify-between text-12px text-gray-400">
              <span>v{{ item.version || 1 }}</span>
              <span>{{ item.createdAt }}</span>
            </div>
          </div>

          <!-- 空状态 -->
          <el-empty v-if="tableData.length === 0 && !loading" description="暂无工作流" />
        </div>

        <!-- 列表模式 -->
        <div v-else class="flex-1 flex flex-col">
          <SpTable :columns="columns" :data="tableData" :show-index="false">
            <template #status="{ row }">
              <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">
                {{ row.status === 1 ? '启用' : '禁用' }}
              </el-tag>
            </template>
            <template #operate="{ row }">
              <el-button type="primary" link @click.stop="handleEdit(row)">编辑</el-button>
              <el-button type="primary" link @click.stop="handleCopy(row)">复制</el-button>
              <el-button type="danger" link @click.stop="handleDelete(row)">删除</el-button>
            </template>
          </SpTable>
          <Pagination
            v-model:total="total"
            v-model:page="queryParams.pageNum"
            v-model:limit="queryParams.pageSize"
            @pagination="handleQuery"
          />
        </div>
      </Transition>
    </el-card>

    <!-- 新建/编辑对话框 -->
    <el-dialog v-model="formVisible" :title="formIsEdit ? '编辑工作流' : '新建工作流'" width="500px">
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="80px">
        <el-form-item label="名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入工作流名称" />
        </el-form-item>
        <el-form-item label="编码" prop="code">
          <el-input v-model="formData.code" placeholder="请输入工作流编码" :disabled="formIsEdit" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="formData.description" type="textarea" :rows="3" placeholder="请输入描述" />
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="formData.status" :active-value="1" :inactive-value="0" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="formVisible = false">取消</el-button>
        <el-button type="primary" @click="handleFormConfirm">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, MoreFilled } from '@element-plus/icons-vue'
import { WorkflowAPI } from '@/api/workflow'
import type { WorkflowDefinition, WorkflowQuery } from '@/api/workflow/types'
import SpTable from '@/components/baseComponents/SpTable/index.vue'
import Pagination from '@/components/Pagination/index.vue'

const router = useRouter()
const viewMode = ref<'card' | 'list'>('card')
const loading = ref(false)
const tableData = ref<WorkflowDefinition[]>([])
const total = ref(0)
const formVisible = ref(false)
const formIsEdit = ref(false)
const formRef = ref()

const queryParams = reactive<WorkflowQuery>({
  keyword: '',
  status: undefined,
  categoryId: undefined,
  pageNum: 1,
  pageSize: 12,
})

const formData = reactive<Partial<WorkflowDefinition>>({
  name: '',
  code: '',
  description: '',
  status: 1,
})

const formRules = {
  name: [{ required: true, message: '请输入工作流名称', trigger: 'blur' }],
  code: [{ required: true, message: '请输入工作流编码', trigger: 'blur' }],
}

const columns = [
  { label: '名称', prop: 'name', minWidth: 150 },
  { label: '编码', prop: 'code', minWidth: 120 },
  { label: '版本', prop: 'version', width: 80, formatter: (row: WorkflowDefinition) => `v${row.version || 1}` },
  { label: '创建时间', prop: 'createdAt', width: 160 },
  { label: '操作', columnType: 'operate', width: 180, fixed: 'right' },
]

/** 查询列表 */
const handleQuery = async () => {
  loading.value = true
  try {
    const res = await WorkflowAPI.page(queryParams)
    tableData.value = res.records || []
    total.value = res.total || 0
  } finally {
    loading.value = false
  }
}

/** 重置查询 */
const handleReset = () => {
  queryParams.keyword = ''
  queryParams.status = undefined
  queryParams.pageNum = 1
  handleQuery()
}

/** 新建 */
const handleAdd = () => {
  formIsEdit.value = false
  Object.assign(formData, { name: '', code: '', description: '', status: 1 })
  formVisible.value = true
}

/** 编辑 */
const handleEdit = (row: WorkflowDefinition) => {
  router.push(`/workflow/editor/${row.id}`)
}

/** 复制 */
const handleCopy = async (row: WorkflowDefinition) => {
  try {
    await WorkflowAPI.copy(row.id!)
    ElMessage.success('复制成功')
    handleQuery()
  } catch (error) {
    ElMessage.error('复制失败')
  }
}

/** 删除 */
const handleDelete = async (row: WorkflowDefinition) => {
  try {
    await ElMessageBox.confirm(`确定删除工作流「${row.name}」吗？`, '提示', { type: 'warning' })
    await WorkflowAPI.delete(row.id!)
    ElMessage.success('删除成功')
    handleQuery()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

/** 下拉菜单命令 */
const handleCommand = (cmd: string, row: WorkflowDefinition) => {
  switch (cmd) {
    case 'edit': handleEdit(row); break
    case 'copy': handleCopy(row); break
    case 'delete': handleDelete(row); break
  }
}

/** 表单确认 */
const handleFormConfirm = async () => {
  try {
    await formRef.value?.validate()
    if (formIsEdit.value) {
      await WorkflowAPI.update(formData.id!, formData)
      ElMessage.success('更新成功')
    } else {
      await WorkflowAPI.insert(formData)
      ElMessage.success('创建成功')
    }
    formVisible.value = false
    handleQuery()
  } catch (error) {
    // validation failed
  }
}

onMounted(() => {
  handleQuery()
})
</script>

<style lang="scss" scoped>
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  padding: 8px 0;
}

.workflow-card {
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: var(--el-color-primary);
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  }

  .card-title {
    font-size: 14px;
    font-weight: 500;
    color: #303133;
  }
}

.view-fade-enter-active,
.view-fade-leave-active {
  transition: opacity 0.3s ease;
}

.view-fade-enter-from,
.view-fade-leave-to {
  opacity: 0;
}
</style>
