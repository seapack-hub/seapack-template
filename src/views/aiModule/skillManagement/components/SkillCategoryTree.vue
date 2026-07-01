<!--
  技能分类树组件
  左侧面板，展示全部分类入口和分类列表
  支持选中状态（蓝色左侧竖条）、hover 编辑/删除操作、客户端搜索过滤
-->
<template>
  <el-card class="category-panel h-100% flex flex-col" shadow="never">
    <template #header>
      <div class="flex items-center justify-between">
        <span class="text-16px text-[var(--el-text-color-primary)]">技能分类</span>
        <el-button type="primary" icon="plus" @click="$emit('add')" />
      </div>
    </template>
    <!-- 分类搜索过滤 -->
    <div class="category-search mb-6">
      <el-input
        :model-value="search"
        placeholder="搜索分类..."
        clearable
        size="small"
        prefix-icon="search"
        @update:model-value="$emit('update:search', $event)"
      />
    </div>
    <!-- 分类列表 -->
    <div class="category-list flex-1 overflow-y-auto py-[4px]">
      <!-- 加载中 -->
      <div v-if="loading" class="flex items-center justify-center py-20">
        <el-icon class="is-loading" :size="18"><Loading /></el-icon>
        <span class="ml-6 text-12px text-[var(--el-text-color-secondary)]">加载中...</span>
      </div>
      <!-- 空状态 -->
      <el-empty v-else-if="!filteredCategories.length" :description="search ? '未匹配到分类' : '暂无分类'" :image-size="60" />
      <!-- 全部分类入口 -->
      <template v-else>
        <div
          class="category-item"
          :class="{ 'is-active': !activeId }"
          @click="$emit('select', undefined)"
        >
          <SPIcon name="list" size="15" />
          <span class="item-label">全部分类</span>
        </div>
        <!-- 遍历分类 -->
        <div
          v-for="cat in filteredCategories"
          :key="cat.id"
          class="category-item"
          :class="{ 'is-active': activeId === cat.id }"
          @click="$emit('select', cat.id)"
        >
          <!-- 优先渲染 Element Plus 图标，若名称非 EP 图标则回退到 SVG 图标 -->
          <component :is="cat.icon" v-if="isEPIcon(cat.icon)" style="width: 15px; height: 15px; flex-shrink: 0;" />
          <SPIcon v-else :name="cat.icon || 'category'" size="15" />
          <span class="item-label">{{ cat.name }}</span>
          <!-- hover 时显示操作按钮 -->
          <span class="item-actions">
            <span class="action-btn" title="编辑" @click.stop="$emit('edit', cat)">
              <Edit style="width: 14px; height: 14px" />
            </span>
            <span class="action-btn action-btn--danger" title="删除" @click.stop="$emit('delete', cat)">
              <Delete style="width: 14px; height: 14px" />
            </span>
          </span>
        </div>
      </template>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Loading } from '@element-plus/icons-vue'
import * as ElementPlusIcons from '@element-plus/icons-vue'
import type { SkillCategory } from '@/api/ai/skillCategory';

/** Element Plus 图标名称集合，用于运行时判断图标渲染方式 */
const epIconNames = new Set(Object.keys(ElementPlusIcons))
function isEPIcon(name?: string): boolean {
  return !!name && epIconNames.has(name)
}

const props = defineProps<{
  /** 分类列表 */
  categories: SkillCategory[];
  /** 当前选中的分类ID，undefined 表示"全部分类" */
  activeId?: number;
  /** 客户端搜索关键字 */
  search?: string;
  /** 加载中状态 */
  loading?: boolean;
}>();

const emit = defineEmits<{
  /** 选中分类，undefined 表示全部分类 */
  select: [categoryId: number | undefined];
  /** 新增分类 */
  add: [];
  /** 编辑分类 */
  edit: [category: SkillCategory];
  /** 删除分类 */
  delete: [category: SkillCategory];
  /** 搜索关键字更新 */
  'update:search': [value: string];
}>();

/** 客户端搜索过滤：按名称/编码匹配 */
const filteredCategories = computed(() => {
  const kw = props.search?.trim().toLowerCase()
  if (!kw) return props.categories
  return props.categories.filter(
    cat => cat.name.toLowerCase().includes(kw) || cat.code.toLowerCase().includes(kw),
  )
})
</script>

<style scoped lang="scss">
.category-panel {
  ::v-deep(.el-card__body) {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    padding: 8px;
  }

  .category-list {
    scrollbar-width: thin;
    scrollbar-color: #d0d5dd transparent;
  }

  .category-search {
    padding: 0 2px;
  }

  .category-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 9px 14px;
    margin-bottom: 6px;
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

      .item-label {
        color: #1967d2;
        font-weight: 600;
      }

      .item-actions {
        opacity: 1;
      }
    }

    .item-label {
      line-height: 20px;
      width:200px;
      font-weight: 600;
    }

    .item-actions {
      margin-left: auto;
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
