<template>
  <el-card class="dict-type-panel h-100% flex flex-col" shadow="never">
    <template #header>
      <div class="flex items-center justify-between">
        <span class="text-16px text-[var(--el-text-color-primary)]">字典类型</span>
        <div class="flex items-center gap-3px">
          <el-button type="" icon="refresh" :loading="loading" circle size="small" @click="$emit('refresh')" />
          <el-button type="" icon="plus" circle size="small" @click="$emit('add')" />
        </div>
      </div>
    </template>

    <!-- 搜索过滤 -->
    <div class="type-search mb-6">
      <el-input
        v-model="searchKeyword"
        placeholder="搜索类型..."
        clearable
        prefix-icon="search"
      />
    </div>

    <!-- 类型列表 -->
    <div class="type-list flex-1 overflow-y-auto py-[4px]">
      <!-- 加载中 -->
      <div v-if="loading" class="flex items-center justify-center py-20">
        <el-icon class="is-loading" :size="18"><Loading /></el-icon>
        <span class="ml-6 text-12px text-[var(--el-text-color-secondary)]">加载中...</span>
      </div>
      <!-- 空状态 -->
      <el-empty v-else-if="!filteredTypes.length" :description="searchKeyword ? '未匹配到类型' : '暂无字典类型'" :image-size="60" />
      <!-- 列表 -->
      <template v-else>
        <!-- 全部类型入口 -->
        <div
          class="type-item"
          :class="{ 'is-active': !selectedType }"
          @click="$emit('select', '')"
        >
          <div class="item-content">
            <span class="item-name">全部类型</span>
          </div>
          <el-badge v-if="totalCount" :value="totalCount" type="primary" class="item-badge" />
        </div>
        <!-- 各类型 -->
        <div
          v-for="item in filteredTypes"
          :key="item.dictType"
          class="type-item"
          :class="{ 'is-active': item.dictType === selectedType }"
          @click="$emit('select', item.dictType)"
        >
          <div class="item-content">
            <span class="item-code">{{ item.dictType }}</span>
            <span class="item-name">{{ item.dictName }}</span>
          </div>
          <el-badge v-if="item.count" :value="item.count" type="primary" class="item-badge" />
          <!-- hover 操作按钮 -->
          <span class="item-actions">
            <span class="action-btn" title="编辑" @click.stop="$emit('edit-type', item)">
              <Edit style="width: 14px; height: 14px" />
            </span>
            <span class="action-btn action-btn--danger" title="删除" @click.stop="$emit('delete-type', item.dictType)">
              <Delete style="width: 14px; height: 14px" />
            </span>
          </span>
        </div>
      </template>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { Edit, Delete, Loading } from '@element-plus/icons-vue'
import type { DictTypeInfo } from '@/api/system/baseInfo/dict.ts'

const props = defineProps<{
  types: DictTypeInfo[]
  selectedType?: string
  loading?: boolean
}>()

defineEmits<{
  select: [dictType: string]
  add: []
  refresh: []
  'edit-type': [item: DictTypeInfo]
  'delete-type': [dictType: string]
}>()

const searchKeyword = ref('')

const totalCount = computed(() => props.types.reduce((sum, t) => sum + (t.count || 0), 0))

const filteredTypes = computed(() => {
  if (!searchKeyword.value) return props.types
  const kw = searchKeyword.value.toLowerCase()
  return props.types.filter(t =>
    t.dictType.toLowerCase().includes(kw)
    || t.dictName.toLowerCase().includes(kw)
    || (t.remark && t.remark.toLowerCase().includes(kw)),
  )
})
</script>

<style scoped lang="scss">
.dict-type-panel {
  width: 280px;
  min-width: 280px;
  border-right: 1px solid var(--el-border-color-lighter);

  ::v-deep(.el-card__body) {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    padding: 8px;
  }

  .type-list {
    scrollbar-width: thin;
    scrollbar-color: #d0d5dd transparent;
  }

  .type-search {
    padding: 0 2px;
  }

  .type-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 9px 14px;
    margin: 6px 12px 15px 0;
    border: 1px solid #ebeef5;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
    position: relative;
    font-size: 13px;
    color: var(--el-text-color-regular);
    background: #fff;

    &:hover {
      border-color: #d0d5dd;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);

      .item-actions {
        opacity: 1;
      }
    }

    &.is-active {
      border-color: #409eff;
      background: linear-gradient(135deg, #f0f7ff 0%, #e8f3ff 100%);
      box-shadow: 0 1px 4px rgba(64, 158, 255, 0.12);

      &::before {
        content: '';
        position: absolute;
        left: -1px;
        top: -1px;
        bottom: -1px;
        width: 3px;
        border-radius: 8px 0 0 8px;
        background: #409eff;
      }

      .item-code {
        color: #1967d2;
        font-weight: 600;
      }

      .item-actions {
        opacity: 1;
      }
    }

    .item-content {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .item-code {
      font-size: 13px;
      font-weight: 500;
      line-height: 18px;
      color: var(--el-text-color-primary);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .item-name {
      font-size: 11px;
      line-height: 16px;
      color: var(--el-text-color-secondary);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    // 数量徽标：定位到右上角
    ::v-deep(.item-badge) {
      position: absolute;
      top: -10px;
      right: -8px;
    }

    .item-actions {
      margin-left: 4px;
      display: flex;
      align-items: center;
      gap: 4px;
      opacity: 0;
      transition: opacity 0.15s ease;
    }

    .action-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 26px;
      height: 26px;
      border-radius: 6px;
      cursor: pointer;
      color: #8c8f96;
      transition: all 0.15s ease;

      &:hover {
        background: #e3e6eb;
        color: #555;
      }
    }

    .action-btn--danger:hover {
      background: #fce8e6;
      color: #d93025;
    }
  }
}
</style>
