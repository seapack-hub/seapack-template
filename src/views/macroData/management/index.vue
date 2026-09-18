<template>
  <div class="flex flex-col gap-16px">
    <!-- 筛选栏 -->
    <div class="flex flex-wrap items-end gap-16px box-border p-x-15 p-y-12 rounded-12px bg-white border border-[var(--el-border-color-lighter)] shadow-sm">
      <div class="flex flex-col gap-4px">
        <span class="text-13px color-[var(--el-text-color-secondary)]">频率</span>
        <el-select v-model="frequency" style="width: 140px" @change="onFrequencyChange">
          <el-option v-for="opt in FREQUENCY_OPTIONS" :key="opt.value" :label="opt.label" :value="opt.value" />
        </el-select>
      </div>

      <div class="flex flex-col gap-4px">
        <span class="text-13px color-[var(--el-text-color-secondary)]">指标</span>
        <el-select v-model="indicatorCode" filterable style="width: 240px" @change="handleQuery">
          <el-option v-for="m in filteredMeta" :key="m.indicatorCode" :label="`${m.indicatorName}（${m.indicatorCode}）`" :value="m.indicatorCode" />
        </el-select>
      </div>

      <div class="flex flex-col gap-4px">
        <span class="text-13px color-[var(--el-text-color-secondary)]">日期范围</span>
        <el-date-picker v-model="dateRange" type="daterange" start-placeholder="开始日期" end-placeholder="结束日期" value-format="YYYY-MM-DD" style="width: 280px" @change="handleQuery" />
      </div>

      <el-button type="primary" :icon="Search" @click="handleQuery">查询</el-button>
      <el-button :icon="RefreshRight" @click="handleReset">重置</el-button>
      <el-button v-permission="'macroData:macroDataManagement:add'" type="success" :icon="Plus" @click="openAddDialog">新增</el-button>
    </div>

    <!-- 数据表格 -->
    <div class="box-border p-x-15 p-y-12 rounded-12px bg-white border border-[var(--el-border-color-lighter)] shadow-sm">
      <div class="flex items-center justify-between p-b-10 border-b border-[var(--el-border-color-lighter)]">
        <div class="flex items-center gap-8px">
          <span class="text-15px font-600 color-[var(--el-text-color-primary)]">数据列表</span>
          <el-tag v-if="indicatorCode" type="info" size="small">{{ indicatorCode }}</el-tag>
          <el-tag v-if="tableData.length" type="success" size="small">共 {{ total }} 条</el-tag>
        </div>
      </div>

      <SpTable
        :columns="columns"
        :data="tableData"
        :loading="loading"
        :show-empty="true"
        :show-index="true"
        size="small"
        height="calc(100vh - 360px)"
      >
        <template #statDate>
          <el-table-column label="日期" prop="statDate" width="120" slot-name="statDate">
            <template #default="{ row }">
              {{ formatDate(row.statDate) }}
            </template>
          </el-table-column>
        </template>
        <template #metricValue>
          <el-table-column label="指标值" prop="metricValue" align="center" slot-name="metricValue">
            <template #default="{ row }">
              <span class="font-['DIN_Alternate',monospace] tabular-nums">{{ row.metricValue }}</span>
            </template>
          </el-table-column>
        </template>
        <template #metricValue2>
          <el-table-column label="第二数值" prop="metricValue2" align="center" slot-name="metricValue2">
            <template #default="{ row }">
              <span class="font-['DIN_Alternate',monospace] tabular-nums">{{ row.metricValue2 ?? '--' }}</span>
            </template>
          </el-table-column>
        </template>
        <template #momChange>
          <el-table-column label="环比变化" prop="momChange" align="center" slot-name="momChange">
            <template #default="{ row }">
              <span v-if="row.momChange != null" :class="row.momChange >= 0 ? 'color-[#67C23A]' : 'color-[#F56C6C]'">
                {{ row.momChange >= 0 ? '+' : '' }}{{ row.momChange }}
              </span>
              <span v-else class="color-[#c0c4cc]">--</span>
            </template>
          </el-table-column>
        </template>
        <template #operate>
          <el-table-column label="操作" width="140" fixed="right" align="left" slot-name="operate">
            <template #default="{ row }">
              <el-button v-permission="'macroData:macroDataManagement:edit'" type="primary" link size="small" @click="openEditDialog(row)">编辑</el-button>
              <el-popconfirm title="确认删除该条记录？" @confirm="handleDelete(row)">
                <template #reference>
                  <el-button v-permission="'macroData:macroDataManagement:delete'" type="danger" link size="small">删除</el-button>
                </template>
              </el-popconfirm>
            </template>
          </el-table-column>
        </template>
      </SpTable>

      <!-- 分页 -->
      <div class="flex justify-end m-t-12px">
        <el-pagination
          v-model:current-page="pageNum"
          v-model:page-size="pageSize"
          :page-sizes="[20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next"
          background
          @size-change="handleQuery"
          @current-change="handleQuery"
        />
      </div>
    </div>

    <!-- 新增/编辑弹窗 -->
    <DataFormDialog
      v-model:visible="dialogVisible"
      :mode="dialogMode"
      :form="dialogForm"
      :frequency="frequency"
      :filtered-meta="filteredMeta"
      :save-loading="saveLoading"
      @save="handleSave"
    />
  </div>
</template>

<script setup lang="ts">
import { Search, RefreshRight, Plus } from '@element-plus/icons-vue'
import SpTable from '@/components/baseComponents/SpTable/index.vue'
import DataFormDialog from './components/DataFormDialog.vue'
import { useMacroDataMgmt, FREQUENCY_OPTIONS } from './utils'

const {
  frequency,
  indicatorCode,
  dateRange,
  filteredMeta,
  columns,
  tableData,
  loading,
  total,
  pageNum,
  pageSize,
  handleQuery,
  onFrequencyChange,
  handleReset,
  dialogVisible,
  dialogMode,
  dialogForm,
  saveLoading,
  openAddDialog,
  openEditDialog,
  handleSave,
  handleDelete,
  formatDate,
} = useMacroDataMgmt()
</script>
