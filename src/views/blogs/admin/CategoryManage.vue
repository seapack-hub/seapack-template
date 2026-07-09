<!--
  CategoryManage —— 分类/标签管理（只读视图）

  功能：
    1. 展示博客分类列表（数据源：系统 dict 表 dictType=blog_category）
    2. 展示博客标签列表（数据源：系统 dict 表 dictType=blog_tag）
    3. 提示用户前往系统字典管理进行编辑
-->
<template>
  <div class="app-container w-100% h-100% flex flex-col">
    <PageHeader title="分类与标签管理" :edit="false" :back="false">
      <template #button>
        <el-button type="primary" @click="goToDict">去系统字典维护</el-button>
      </template>
    </PageHeader>

    <el-alert
      title="分类与标签数据由系统字典统一管理，点击右上角按钮可跳转至「系统管理 → 字典设置」维护 dictType = blog_category / blog_tag 的字典项"
      type="info" 
      :closable="false" 
      show-icon
    />

    <el-row :gutter="16" class="flex-1 min-h-0">
      <el-col :xs="24" :lg="12" class="h-100% mb-16px lg:mb-0">
        <el-card class="list-card admin-card h-100% flex flex-col" shadow="never">
          <template #header>
            <div class="card-header">
              <span>分类列表</span>
              <el-tag type="info" size="small" effect="plain">共 {{ categories.length }} 条</el-tag>
            </div>
          </template>
          <div class="table-wrapper flex-1">
            <SpTable :columns="CATEGORY_LIST_COLUMNS" :data="categories" :show-index="true" />
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :lg="12" class="h-100%">
        <el-card class="list-card admin-card h-100% flex flex-col" shadow="never">
          <template #header>
            <div class="card-header">
              <span>标签列表</span>
              <el-tag type="info" size="small" effect="plain">共 {{ tags.length }} 条</el-tag>
            </div>
          </template>
          <div class="table-wrapper flex-1">
            <SpTable :columns="TAG_LIST_COLUMNS" :data="tags" :show-index="true">
              <template #tagColor>
                <el-table-column label="颜色" min-width="100px" align="center" slot-name="tagColor">
                  <template #default="{ row }">
                    <el-tag v-if="getTagColor(row.remark)" :type="getTagColor(row.remark)" size="small" effect="dark">
                      {{ getTagColor(row.remark) }}
                    </el-tag>
                    <span v-else class="text-[#c0c4cc]">-</span>
                  </template>
                </el-table-column>
              </template>
            </SpTable>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useDictionaryStore } from '@/store/modules/dictionary'
import type { DictItem } from '../utils/type'
import { CATEGORY_LIST_COLUMNS, TAG_LIST_COLUMNS } from '../utils/tableColumns'

const dictStore = useDictionaryStore()
const router = useRouter()
const categories = ref<DictItem[]>([])
const tags = ref<DictItem[]>([])

/** 从 remark JSON 中解析颜色类型 */
function getTagColor(remark?: string) {
  try {
    const r = remark ? JSON.parse(remark) : {}
    return r.colorType || ''
  } catch { return '' }
}

/** 跳转到系统字典管理页面 */
function goToDict() {
  router.push('/systemManagement/baseInfo/dictSetting')
}

onMounted(async () => {
  categories.value = await dictStore.getDictionaryList('blog_category')
  tags.value = await dictStore.getDictionaryList('blog_tag')
})
</script>

<style scoped lang="scss">
@use '@/views/blogs/styles/admin-common.scss' as *;

.app-container { 
  padding: 20px; 
  gap: 10px; 
  box-sizing: border-box;
}
.list-card {
  :deep(.el-card__header) { padding: 14px 20px; }
  :deep(.el-card__body) {
    height: 100%;
    display: flex;
    flex-direction: column;
    padding: 16px;
  }
}
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}
.table-wrapper {
  border-radius: 6px;
  border: 1px solid var(--el-border-color-lighter);
  overflow: hidden;
}
</style>
