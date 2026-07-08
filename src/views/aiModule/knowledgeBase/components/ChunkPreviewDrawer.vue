<!--
  分片预览抽屉
  查看知识库下的分片列表
-->
<template>
  <el-drawer
    v-model="visible"
    :title="`分片预览 — ${knowledgeName}`"
    size="800px"
    @opened="onOpened"
  >
    <div class="flex items-center justify-between mb-12px">
      <span class="text-13px text-[var(--el-text-color-secondary)]">
        共 {{ chunkTotal }} 个分片
      </span>
      <el-button text type="primary" size="small" @click="fetchChunks">
        <el-icon><Refresh /></el-icon> 刷新
      </el-button>
    </div>

    <SpTable
      v-loading="loadingChunks"
      :data="chunks"
      :columns="chunkColumns"
      :show-index="true"
      size="small"
    >
      <template #content>
        <el-table-column label="内容" prop="content" min-width="400" slot-name="content">
          <template #default="{ row }">
            <div class="chunk-content">{{ row.content }}</div>
          </template>
        </el-table-column>
      </template>
    </SpTable>

    <div class="h-[40px] mt-10px">
      <Pagination
        v-model:total="chunkTotal"
        v-model:page="chunkQuery.pageNum"
        v-model:limit="chunkQuery.pageSize"
        @pagination="fetchChunks"
      />
    </div>
  </el-drawer>
</template>

<script setup lang="ts">
import { Refresh } from '@element-plus/icons-vue'
import { KnowledgeBaseAPI, type KnowledgeChunk } from '@/api/ai/knowledgeBase'
import { CHUNK_LIST_COLUMNS } from '../utils/tableColumns'

const visible = defineModel<boolean>('visible', { required: true })

const props = defineProps<{
  knowledgeId: number
  knowledgeName: string
}>()

const loadingChunks = ref(false)
const chunks = ref<KnowledgeChunk[]>([])
const chunkTotal = ref(0)
const chunkQuery = reactive({ pageNum: 1, pageSize: 20 })

const chunkColumns = [...CHUNK_LIST_COLUMNS]

function onOpened() {
  chunkQuery.pageNum = 1
  fetchChunks()
}

async function fetchChunks() {
  loadingChunks.value = true
  try {
    const res = await KnowledgeBaseAPI.getChunks(props.knowledgeId, chunkQuery)
    chunks.value = res.list || []
    chunkTotal.value = res.total || 0
  } finally {
    loadingChunks.value = false
  }
}
</script>

<style scoped>
.chunk-content {
  font-size: 12px;
  line-height: 1.6;
  color: var(--el-text-color-regular);
  max-height: 60px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  white-space: pre-wrap;
  word-break: break-all;
}
</style>
