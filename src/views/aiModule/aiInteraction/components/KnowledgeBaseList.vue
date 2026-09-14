<template>
  <div class="kb-list">
    <div class="kb-header">
      <el-icon><Collection /></el-icon>
      <span class="kb-title">知识库</span>
      <el-tag v-if="selectedId" size="small" type="success" effect="dark" class="kb-badge">已选</el-tag>
    </div>
    <el-scrollbar class="kb-scroll">
      <div v-if="loading" class="kb-loading">
        <el-icon class="is-loading" :size="16"><Loading /></el-icon>
        <span>加载中...</span>
      </div>
      <div v-else-if="list.length === 0" class="kb-empty">
        <el-icon :size="20" color="#c0c4cc"><FolderDelete /></el-icon>
        <span>暂无知识库</span>
      </div>
      <template v-else>
        <div
          v-for="kb in list"
          :key="kb.id"
          class="kb-item"
          :class="{ active: selectedId === kb.id }"
          @click="handleSelect(kb)"
        >
          <div class="kb-item-icon">
            <el-icon :size="18" :color="selectedId === kb.id ? '#409eff' : '#909399'">
              <Collection />
            </el-icon>
          </div>
          <div class="kb-item-info">
            <span class="kb-item-name" :title="kb.name">{{ kb.name }}</span>
            <span v-if="kb.description" class="kb-item-desc" :title="kb.description">{{ kb.description }}</span>
          </div>
        </div>
      </template>
    </el-scrollbar>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Collection, FolderDelete, Loading } from '@element-plus/icons-vue'
import { KnowledgeBaseAPI, type KnowledgeBase } from '@/api/ai/knowledgeBase'

const emit = defineEmits<{
  select: [id: number | null]
}>()

const list = ref<KnowledgeBase[]>([])
const loading = ref(false)
const selectedId = ref<number | null>(null)

async function fetchList() {
  loading.value = true
  try {
    const res = await KnowledgeBaseAPI.list()
    list.value = res || []
  } catch {
    list.value = []
  } finally {
    loading.value = false
  }
}

function handleSelect(kb: KnowledgeBase) {
  if (selectedId.value === kb.id) {
    // 再次点击取消选择
    selectedId.value = null
    emit('select', null)
  } else {
    selectedId.value = kb.id!
    emit('select', kb.id!)
  }
}

onMounted(() => {
  fetchList()
})
</script>

<style scoped lang="scss">
.kb-list {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.kb-header {
  height: 48px;
  padding: 0 14px;
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
  font-size: 13px;
  font-weight: 600;
  color: #303133;
  border-bottom: 1px solid #f0f0f0;
}

.kb-badge {
  margin-left: auto;
}

.kb-scroll {
  flex: 1;
  padding: 8px 10px;
}

.kb-loading,
.kb-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 24px 0;
  color: #c0c4cc;
  font-size: 12px;
}

.kb-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;
  border: 1px solid #ebeef5;
  background: #fafafa;
  transition: all 0.2s;
  margin-bottom: 8px;

  &:hover {
    background-color: #f0f5ff;
    border-color: #b3d8ff;
    box-shadow: 0 2px 8px rgba(64, 158, 255, 0.1);
  }

  &.active {
    background: linear-gradient(135deg, #ecf5ff 0%, #e8f3ff 100%);
    border: 1px solid #409eff;
    box-shadow: 0 2px 12px rgba(64, 158, 255, 0.15);
  }
}

.kb-item-icon {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  background: #f0f2f5;
  transition: background 0.2s;
}

.kb-item.active .kb-item-icon {
  background: #d9ecff;
}

.kb-item-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.kb-item-name {
  font-size: 13px;
  font-weight: 600;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.kb-item.active .kb-item-name {
  color: #409eff;
}

.kb-item-desc {
  font-size: 11px;
  color: #909399;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 1.4;
}
</style>
