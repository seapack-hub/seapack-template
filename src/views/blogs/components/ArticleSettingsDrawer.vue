<template>
  <el-drawer
    v-model="drawerModel"
    :title="isEdit ? '编辑文章设置' : '文章设置'"
    size="480px"
    direction="rtl"
    class="settings-drawer"
  >
    <el-form ref="formRef" :model="form" label-width="80px" class="settings-form">
      <el-form-item label="标题" prop="title" :rules="[{ required: true, message: '请输入标题', trigger: 'blur' }]">
        <el-input v-model="form.title" placeholder="请输入文章标题" maxlength="200" show-word-limit>
          <template #suffix>
            <el-tooltip content="AI 生成标题" placement="top">
              <el-button link type="primary" size="small" :icon="MagicStick" @click="openAiDialogForTitle" />
            </el-tooltip>
          </template>
        </el-input>
      </el-form-item>

      <el-form-item label="分类" prop="category" :rules="[{ required: true, message: '请选择分类', trigger: 'change' }]">
        <el-select v-model="form.category" placeholder="选择分类" style="width: 100%">
          <el-option v-for="c in categories" :key="c.dictCode" :label="c.dictName" :value="c.dictCode" />
        </el-select>
      </el-form-item>

      <el-form-item label="标签" prop="tag">
        <el-select v-model="form.tag" placeholder="选择标签" style="width: 100%" clearable>
          <el-option label="Vue3" value="Vue3" />
          <el-option label="Java" value="Java" />
          <el-option label="GIS" value="GIS" />
          <el-option label="其他" value="其他" />
        </el-select>
      </el-form-item>

      <el-form-item label="标签色" prop="tagType">
        <el-select v-model="form.tagType" placeholder="标签颜色" style="width: 100%" clearable>
          <el-option label="默认" value="" />
          <el-option label="绿色" value="success" />
          <el-option label="橙色" value="warning" />
          <el-option label="红色" value="danger" />
          <el-option label="蓝色" value="info" />
        </el-select>
      </el-form-item>

      <el-divider />

      <div class="section-title">封面设置</div>

      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="图标" prop="coverIcon">
            <el-input v-model="form.coverIcon" placeholder="📝" maxlength="10" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="颜色" prop="coverColor">
            <el-select v-model="form.coverColor" placeholder="封面渐变" style="width: 100%">
              <el-option label="紫色" value="linear-gradient(135deg, #667eea 0%, #764ba2 100%)" />
              <el-option label="绿色" value="linear-gradient(135deg, #11998e 0%, #38ef7d 100%)" />
              <el-option label="粉红" value="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)" />
              <el-option label="橙色" value="linear-gradient(135deg, #f6d365 0%, #fda085 100%)" />
              <el-option label="粉紫" value="linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)" />
              <el-option label="米色" value="linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="预览">
        <div class="cover-preview" :style="{ background: form.coverColor }">
          <span class="cover-icon">{{ form.coverIcon || '📝' }}</span>
        </div>
      </el-form-item>

      <el-form-item label="置顶">
        <el-switch v-model="form.isTop" :active-value="1" :inactive-value="0" />
      </el-form-item>

      <el-divider />

      <el-form-item label="摘要" prop="summary">
        <el-input v-model="form.summary" type="textarea" :rows="4" placeholder="请输入文章摘要，将展示在文章卡片中" maxlength="500" show-word-limit>
          <template #suffix>
            <el-tooltip content="AI 生成摘要" placement="top">
              <el-button link type="primary" size="small" :icon="MagicStick" @click="openAiDialogForSummary" />
            </el-tooltip>
          </template>
        </el-input>
      </el-form-item>
    </el-form>

    <!-- AI Agent 执行通用弹框 -->
    <AiAgentExecutor
      v-model:visible="aiDialogVisible"
      module-key="blogsManagement"
      position="settings-drawer"
      :context="aiContext"
      @done="handleAiResult"
    />

    <template #footer>
      <el-button @click="drawerModel = false">取消</el-button>
      <el-button type="primary" @click="drawerModel = false">确定</el-button>
    </template>
  </el-drawer>
</template>

<script setup lang="ts">
import { inject } from 'vue'
import type { FormInstance } from 'element-plus'
import type { BlogCategory } from '@/api/blogs/category'
import type { ArticleForm } from '../admin/ArticleEdit.vue'
import { ElMessage } from 'element-plus'
import { useSceneBindings } from '@/hooks/useSceneBindings'
import { MagicStick } from '@element-plus/icons-vue'

const props = defineProps<{
  visible: boolean
  categories: BlogCategory[]
  isEdit: boolean
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
}>()

const formRef = ref<FormInstance>()
const form = inject('articleForm') as ArticleForm

const drawerModel = computed({
  get: () => props.visible,
  set: (val: boolean) => emit('update:visible', val),
})

/** AI 集成 */
const { bindings: aiBindings } = useSceneBindings('blogsManagement', 'settings-drawer')
const aiDialogVisible = ref(false)
const aiContext = ref({ articleTitle: '', articleSummary: '', articleContent: '' })

function openAiDialogForTitle() {
  aiContext.value = {
    articleTitle: form.title || '',
    articleSummary: form.summary || '',
    articleContent: '',
  }
  aiDialogVisible.value = true
}

function openAiDialogForSummary() {
  aiContext.value = {
    articleTitle: form.title || '',
    articleSummary: form.summary || '',
    articleContent: '',
  }
  aiDialogVisible.value = true
}

function handleAiResult(result: { content: string; agentName: string; agentId: number; elapsedMs: number }) {
  if (!result.content) {
    ElMessage.error('AI 生成失败，请重试')
    return
  }
  // 根据技能和上下文智能判断填充到标题还是摘要
  if (!form.title || result.content.length < 80) {
    form.title = result.content.replace(/^["'「」【】\s]+|["'「」【】\s]+$/g, '').slice(0, 200)
  } else {
    form.summary = result.content.slice(0, 500)
  }
  ElMessage.success(`${result.agentName} 内容已填充`)
}

defineExpose({ formRef })
</script>

<style scoped lang="scss">
.settings-form {
  padding: 0 4px;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin-bottom: 12px;
}

.cover-preview {
  width: 64px;
  height: 40px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  .cover-icon { font-size: 20px; }
}

:deep(.settings-drawer) {
  .el-drawer__header {
    margin-bottom: 0;
    padding: 20px 20px 0;
    font-size: 18px;
    font-weight: 600;
  }
  .el-drawer__body {
    padding: 16px 20px;
    overflow-y: auto;
  }
  .el-divider {
    margin: 20px 0;
  }
}
</style>
