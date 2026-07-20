<!--
  CardGrid — 卡片网格容器组件

  封装 CSS Grid 布局 + 空状态 + 分页器，
  替代各管理页面中重复的卡片模式代码块。

  使用方式：
    <CardGrid
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      :total="total"
      :loading="loading"
      empty-text="暂无模板"
      @pagination="handleQuery"
    >
      <SomeCard v-for="row in list" :key="row.id" :data="row" />
    </CardGrid>
-->
<template>
  <div class="card-grid-wrapper">
    <!-- 加载骨架（首次加载且无数据时展示） -->
    <div v-if="loading && total === 0" class="card-grid card-grid-skeleton">
      <div v-for="i in 6" :key="i" class="card-grid-skeleton-item">
        <el-skeleton animated>
          <template #template>
            <el-skeleton-item variant="rect" style="height: 180px; border-radius: 8px" />
          </template>
        </el-skeleton>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else-if="total === 0" class="card-grid-empty">
      <el-empty :description="emptyText" :image-size="200" />
    </div>

    <!-- 有数据：卡片网格 + 分页 -->
    <template v-else>
      <div class="card-grid" :style="gridStyle">
        <!-- 加载遮罩（翻页时） -->
        <div v-if="loading" class="card-grid-loading-mask">
          <el-icon class="is-loading" :size="24"><Loading /></el-icon>
        </div>
        <slot />
      </div>
      <div class="card-grid-pagination">
        <Pagination
          :total="total"
          :page="page"
          :limit="limit"
          :page-sizes="pageSizes"
          @pagination="$emit('pagination', $event)"
          @update:page="$emit('update:page', $event)"
          @update:limit="$emit('update:limit', $event)"
        />
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { Loading } from '@element-plus/icons-vue'
import Pagination from '@/components/Pagination/index.vue'

const props = withDefaults(defineProps<{
  /** 当前页码（v-model） */
  page: number
  /** 每页条数（v-model） */
  limit: number
  /** 总条数 */
  total: number
  /** 加载状态 */
  loading?: boolean
  /** 空状态描述文字 */
  emptyText?: string
  /** 网格列最小宽度 */
  minColumnWidth?: string
  /** 每页条数选项 */
  pageSizes?: number[]
}>(), {
  loading: false,
  emptyText: '暂无数据',
  minColumnWidth: '280px',
  pageSizes: () => [10, 20, 30, 50],
})

defineEmits<{
  pagination: [payload: { page: number; limit: number }]
  'update:page': [val: number]
  'update:limit': [val: number]
}>()

const gridStyle = computed(() => ({
  '--card-grid-min-width': props.minColumnWidth,
}))
</script>

<style lang="scss" scoped>
.card-grid-wrapper {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

// ===== 空状态（垂直居中） =====
.card-grid-empty {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px dashed var(--el-border-color-lighter);
  border-radius: 4px;
}

// ===== 卡片网格 =====
.card-grid {
  position: relative;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(var(--card-grid-min-width, 280px), 1fr));
  align-content: start;
  gap: 16px;
  overflow-y: auto;
  flex: 1;
  padding: 10px;
  box-sizing: border-box;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 4px;
}

// ===== 翻页加载遮罩 =====
.card-grid-loading-mask {
  position: absolute;
  inset: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 4px;
  pointer-events: none;
}

// ===== 分页器 =====
.card-grid-pagination {
  flex-shrink: 0;
}

// ===== 骨架屏 =====
.card-grid-skeleton {
  pointer-events: none;
  padding: 10px;
  gap: 16px;
}
.card-grid-skeleton-item {
  border-radius: 8px;
  overflow: hidden;
}
</style>
