<!--
  用户 Token 额度管理主页面
  搜索栏 + 工具栏 + 统计卡片 + 表格 + 分页 + 弹窗
-->
<template>
  <div class="app-container w-100% h-100% flex flex-col">
    <!-- 统计卡片 -->
    <div class="grid grid-cols-4 gap-16px mb-8px">
      <StatCard
        v-for="item in statCards"
        :key="item.key"
        :title="item.title"
        :value="item.value"
        :icon="item.icon"
        :color="item.color"
        :description="item.description"
      />
    </div>

    <el-card class="el-card-main flex-1 flex flex-col gap-10 overflow-hidden" shadow="never">
      <!-- 搜索栏 -->
      <div class="search-bar">
        <el-form :inline="true" :model="queryParams" @submit.prevent="handleQuery">
          <el-form-item label="用户名称">
            <el-input v-model="queryParams.userName" placeholder="用户名模糊搜索" clearable style="width: 180px" @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="配额类型">
            <el-select v-model="queryParams.quotaType" placeholder="全部" clearable style="width: 180px">
              <el-option label="日额度" value="daily" />
              <el-option label="月额度" value="monthly" />
              <el-option label="总额度" value="total" />
            </el-select>
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="queryParams.status" placeholder="全部" clearable style="width: 180px">
              <el-option label="正常" value="normal" />
              <el-option label="已超限" value="exceeded" />
              <el-option label="已禁用" value="disabled" />
            </el-select>
          </el-form-item>
          <el-form-item label="是否启用">
            <el-select v-model="queryParams.isEnabled" placeholder="全部" clearable style="width: 180px">
              <el-option label="启用" :value="true" />
              <el-option label="禁用" :value="false" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="search" @click="handleQuery">搜索</el-button>
            <el-button icon="refresh" @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 工具栏 -->
      <div class="toolbar">
        <el-button type="success" icon="plus" @click="openAddDialog()">新增额度配置</el-button>
      </div>

      <!-- 表格 -->
      <div class="flex-1 flex flex-col justify-between overflow-hidden border">
        <SpTable
          class="flex-1"
          :loading="loading"
          :columns="columns"
          :data="tableData"
          :show-index="true"
        >
          <template #quotaType>
            <el-table-column label="配额类型" prop="quotaType" width="100" align="center" slot-name="quotaType">
              <template #default="{ row }">
                <el-tag size="small" :type="quotaTypeTagType(row.quotaType) as any" effect="light">
                  {{ quotaTypeLabel(row.quotaType) }}
                </el-tag>
              </template>
            </el-table-column>
          </template>
          
          <template #quotaLimit>
            <el-table-column label="额度上限" prop="quotaLimit" width="120" align="right" slot-name="quotaLimit">
              <template #default="{ row }">
                <span class="tabular-nums">
                  {{ row.quotaLimit === 0 ? '不限制' : row.quotaLimit.toLocaleString() }}
                </span>
              </template>
            </el-table-column>
          </template>
          <template #usage>
            <el-table-column label="已用/剩余" min-width="160" slot-name="usage">
              <template #default="{ row }">
                <QuotaUsageBar
                  :used="row.usedTokens || 0"
                  :limit="row.quotaLimit"
                  :alert-threshold="row.alertThreshold"
                />
              </template>
            </el-table-column>
          </template>
          <template #status>
            <el-table-column label="状态" prop="status" width="90" align="center" slot-name="status">
              <template #default="{ row }">
                <el-tag size="small" :type="statusTagType(row.status) as any" effect="light">
                  {{ statusLabel(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
          </template>
          <template #isEnabled>
            <el-table-column label="启用" prop="isEnabled" width="80" align="center" slot-name="isEnabled">
              <template #default="{ row }">
                <el-tag size="small" :type="row.isEnabled ? 'success' : 'info'" effect="light">
                  {{ row.isEnabled ? '已启用' : '已禁用' }}
                </el-tag>
              </template>
            </el-table-column>
          </template>
        </SpTable>

        <div class="h-[40px] mt-10px">
          <Pagination
            v-model:total="total"
            v-model:page="queryParams.pageNum"
            v-model:limit="queryParams.pageSize"
            @pagination="handleQuery"
          />
        </div>
      </div>
    </el-card>

    <!-- 新增/编辑弹窗 -->
    <QuotaSettingDialog
      :visible="formVisible"
      :is-edit="formIsEdit"
      :form-data="formData"
      :loading="formLoading"
      @update:visible="formVisible = $event"
      @confirm="onFormConfirm"
    />
  </div>
</template>

<script setup lang="ts">
import { User, CircleCheckFilled, WarningFilled, CircleCloseFilled } from '@element-plus/icons-vue'
import SpTable from '@/components/baseComponents/SpTable/index.vue'
import Pagination from '@/components/Pagination/index.vue'
import StatCard from './components/StatCard.vue'
import QuotaSettingDialog from './components/QuotaSettingDialog.vue'
import QuotaUsageBar from './components/QuotaUsageBar.vue'
import {
  useTokenQuota,
  quotaTypeLabel,
  quotaTypeTagType,
  statusLabel,
  statusTagType,
} from './utils/useTokenQuota'

const {
  loading,
  tableData,
  total,
  queryParams,
  handleQuery,
  handleReset,
  stats,
  loadStats,
  formVisible,
  formIsEdit,
  formLoading,
  formData,
  openAddDialog,
  openEditDialog,
  onFormConfirm,
  handleToggle,
  handleDelete,
  handleResetQuota,
} = useTokenQuota()

// 统计卡片配置
const statCards = computed(() => [
  {
    key: 'total',
    title: '配置用户数',
    value: stats.value.totalUsers,
    icon: User,
    color: 'primary' as const,
    description: '共配置额度的用户',
  },
  {
    key: 'enabled',
    title: '已启用',
    value: stats.value.enabledCount,
    icon: CircleCheckFilled,
    color: 'success' as const,
    description: '正常运行中',
  },
  {
    key: 'exceeded',
    title: '已超限',
    value: stats.value.exceededCount,
    icon: WarningFilled,
    color: 'danger' as const,
    description: '需要及时处理',
  },
  {
    key: 'disabled',
    title: '已禁用',
    value: stats.value.disabledCount,
    icon: CircleCloseFilled,
    color: 'info' as const,
    description: '已暂停使用',
  },
])

const columns = [
  { prop: 'userName', label: '用户', minWidth: 100, showOverflowTooltip: true },
  { slotName: 'quotaType', label: '配额类型', width: 100, align: 'center' as const },
  { slotName: 'quotaLimit', label: '额度上限', width: 120, align: 'right' as const },
  { slotName: 'usage', label: '已用/剩余', minWidth: 160 },
  { slotName: 'status', label: '状态', width: 90, align: 'center' as const },
  { slotName: 'isEnabled', label: '启用', width: 80, align: 'center' as const },
  {
    columnType: 'operate',
    label: '操作',
    width: '160px',
    fixed: 'right',
    buttons: [
      { type: 'primary', label: '编辑', size: 'small', renderType: 'link', click: ({ row }: any) => openEditDialog(row) },
      { type: 'primary', label: '重置', size: 'small', renderType: 'link', click: ({ row }: any) => handleResetQuota(row) },
      { type: 'warning', label: '启用', size: 'small', renderType: 'link', click: ({ row }: any) => handleToggle(row, true), vIFHandler: ({ row }: any) => !row.isEnabled },
      { type: 'info', label: '禁用', size: 'small', renderType: 'link', click: ({ row }: any) => handleToggle(row, false), vIFHandler: ({ row }: any) => row.isEnabled },
      { type: 'danger', label: '删除', size: 'small', renderType: 'link', popconFirm: { title: '确认删除该额度配置吗？' }, click: ({ row }: any) => handleDelete(row) },
    ],
  },
]

onMounted(() => {
  handleQuery()
  loadStats()
})
</script>

<style lang="scss" scoped>
.el-card-main ::v-deep(.el-card__body) {
  height: calc(100% - 40px);
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
</style>
