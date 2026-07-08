<!--
  检索测试抽屉
  输入查询文本 → 返回 TopK 相似片段
-->
<template>
  <el-drawer
    v-model="visible"
    :title="`检索测试 — ${knowledgeName}`"
    size="700px"
  >
    <!-- 查询输入 -->
    <div class="query-section">
      <el-input
        v-model="queryText"
        type="textarea"
        :rows="3"
        placeholder="输入查询文本，测试知识库检索效果..."
        :disabled="searching"
      />
      <div class="flex items-center gap-8px mt-8px">
        <span class="text-12px text-[var(--el-text-color-secondary)]">返回条数</span>
        <el-input-number v-model="topK" :min="1" :max="20" size="small" style="width: 100px" />
        <el-button type="primary" :loading="searching" :disabled="!queryText.trim()" @click="handleRetrieve">
          <el-icon><Search /></el-icon> 检索
        </el-button>
      </div>
    </div>

    <!-- 结果列表 -->
    <div class="mt-16px">
      <div v-if="results.length > 0" class="flex items-center justify-between mb-12px">
        <span class="text-14px font-600">检索结果</span>
        <el-tag type="info" size="small">共 {{ results.length }} 条</el-tag>
      </div>

      <div v-if="searching" class="flex justify-center py-40">
        <el-icon class="is-loading" :size="24"><Loading /></el-icon>
      </div>

      <div v-else-if="results.length === 0 && searched" class="py-40">
        <el-empty description="未找到相关片段" :image-size="80" />
      </div>

      <div v-else class="result-list">
        <div v-for="(item, idx) in results" :key="idx" class="result-item">
          <div class="result-header">
            <span class="result-index">#{{ idx + 1 }}</span>
            <el-tag size="small" :type="getScoreType(item.score)">
              相似度 {{ (item.score * 100).toFixed(1) }}%
            </el-tag>
            <span v-if="item.documentName" class="text-12px text-[var(--el-text-color-secondary)]">
              {{ item.documentName }}
            </span>
          </div>
          <div class="result-content">{{ item.content }}</div>
        </div>
      </div>
    </div>
  </el-drawer>
</template>

<script setup lang="ts">
import { Search, Loading } from '@element-plus/icons-vue'
import { KnowledgeBaseAPI, type RetrievalResult } from '@/api/ai/knowledgeBase'

const visible = defineModel<boolean>('visible', { required: true })

const props = defineProps<{
  knowledgeId: number
  knowledgeName: string
}>()

const queryText = ref('')
const topK = ref(5)
const searching = ref(false)
const results = ref<RetrievalResult[]>([])
const searched = ref(false)

async function handleRetrieve() {
  if (!queryText.value.trim()) return
  searching.value = true
  searched.value = true
  results.value = []
  try {
    results.value = await KnowledgeBaseAPI.retrieve(props.knowledgeId, {
      query: queryText.value,
      topK: topK.value,
    }) || []
  } catch (err: any) {
    ElMessage.error(`检索失败: ${err.message}`)
  } finally {
    searching.value = false
  }
}

function getScoreType(score: number): string {
  if (score >= 0.8) return 'success'
  if (score >= 0.6) return 'warning'
  return 'info'
}
</script>

<style scoped>
.query-section {
  padding: 16px;
  background: var(--el-fill-color-lighter);
  border-radius: 8px;
}
.result-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.result-item {
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  padding: 12px 16px;
  transition: box-shadow 0.2s;
}
.result-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}
.result-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}
.result-index {
  font-size: 13px;
  font-weight: 600;
  color: var(--el-color-primary);
}
.result-content {
  font-size: 13px;
  line-height: 1.7;
  color: var(--el-text-color-regular);
  white-space: pre-wrap;
  word-break: break-all;
  max-height: 120px;
  overflow-y: auto;
}
</style>
