<!--
  ArticleEdit.vue — 文章编辑页面

  AI 集成方式：
    - 使用全局 AiAssistant（不再有页面内 AI 按钮）
    - 页面注入上下文（文章标题、选中文本）到 chatStore
    - 注册结果回调处理器，支持将 AI 结果插入编辑器
-->
<template>
  <div class="article-editor">
    <PageHeader :title="isEdit ? '编辑文章' : '文章创建'" :edit="false" :back="false">
      <template #button>
        <el-button @click="drawerVisible = true">
          <el-icon style="vertical-align: -2px; margin-right: 4px"><setting /></el-icon>
          文章设置
        </el-button>
        <el-button :loading="saving" @click="saveDraft">存草稿</el-button>
        <el-button type="primary" :loading="saving" @click="publish">发布</el-button>
      </template>
    </PageHeader>

    <div class="editor-area">
      <ImportExportEditor
        ref="editorCompRef"
        :model-value="form.contentHtml ?? ''"
        :filename="form.title || 'article'"
        class="rich-editor"
        @update:model-value="form.contentHtml = $event"
      />
    </div>

    <ArticleSettingsDrawer
      ref="settingsRef"
      v-model:visible="drawerVisible"
      :categories="categories"
      :is-edit="isEdit"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref, provide } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useBlogStore } from '@/store/modules/blog.ts'
import { CategoryAPI, type BlogCategory } from '@/api/blogs/category.ts'
import { ElMessage } from 'element-plus'
import { Setting } from '@element-plus/icons-vue'
import { useChatStore } from '@/store/modules/chat'
import { renderToHtml } from '@/views/blogs/utils/sanitize'
import ArticleSettingsDrawer from '../components/ArticleSettingsDrawer.vue'

const route = useRoute()
const router = useRouter()
const store = useBlogStore()
const chatStore = useChatStore()
const settingsRef = ref<InstanceType<typeof ArticleSettingsDrawer>>()
const editorCompRef = ref<any>(null)
const isEdit = computed(() => !!route.params.id)
const saving = ref(false)
const drawerVisible = ref(false)
const categories = ref<BlogCategory[]>([])

export interface ArticleForm {
  title: string
  summary: string
  contentMd: string
  contentHtml: string
  category: string
  tag: string
  tagType: '' | 'success' | 'warning' | 'danger' | 'info'
  coverIcon: string
  coverColor: string
  status: 0 | 1
  isTop: 0 | 1
  sort: number
}

const form = reactive<ArticleForm>({
  title: '',
  summary: '',
  contentMd: '',
  contentHtml: '',
  category: '',
  tag: '',
  tagType: '',
  coverIcon: '📝',
  coverColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  status: 0,
  isTop: 0,
  sort: 0,
})

provide('articleForm', form)

// ===== AI 集成：注入页面上下文 + 注册结果回调 =====

/** 注入页面上下文（文章标题、选中文本） */
function updatePageContext() {
  chatStore.setPageContext({
    pageName: '文章编辑',
    moduleKey: 'blogsManagement',
    data: {
      articleTitle: form.title,
      articleSummary: form.summary,
      selectedText: editorCompRef.value?.getSelectedText?.() || '',
    },
  })
}

/** 注册结果回调：将 AI 生成的内容插入编辑器 */
chatStore.registerResultHandler({
  name: '插入编辑器',
  handler: async (result) => {
    if (!result.content) {
      ElMessage.error('AI 执行失败，请重试')
      return
    }
    try {
      const html = await renderToHtml(result.content)
      editorCompRef.value?.insertContent(html)
      ElMessage.success(`${result.agentName} 内容已插入`)
    } catch (e) {
      ElMessage.error('内容格式转换失败，请重试')
    }
  },
})

/** 页面卸载时清理 */
onUnmounted(() => {
  chatStore.unregisterResultHandler('插入编辑器')
  chatStore.setPageContext(null)
})

// ===== 页面操作 =====

async function saveDraft() { form.status = 0; await save() }

async function publish() { form.status = 1; await save() }

async function save() {
  const valid = await settingsRef.value?.formRef?.validate().catch(() => false)
  if (!valid) {
    drawerVisible.value = true
    ElMessage.warning('请完善文章设置')
    return
  }
  form.contentMd = editorCompRef.value?.getContentMd?.() || ''
  saving.value = true
  try {
    if (isEdit.value) {
      await store.updateArticle(Number(route.params.id), { ...form })
      ElMessage.success('更新成功')
    } else {
      await store.createArticle({ ...form })
      ElMessage.success('发布成功')
    }
    router.push({ name: 'articleList' })
  } finally { saving.value = false }
}

onMounted(async () => {
  const cats = await CategoryAPI.getList()
  categories.value = cats || []
  if (isEdit.value) {
    const id = Number(route.params.id)
    const article = await store.fetchArticleById(id)
    if (article) {
      form.title = article.title
      form.summary = article.summary
      form.contentMd = article.contentMd || ''
      form.contentHtml = article.contentHtml || article.contentMd || ''
      form.category = article.category
      form.tag = article.tag
      form.tagType = article.tagType
      form.coverIcon = article.coverIcon
      form.coverColor = article.coverColor
      form.status = article.status
      form.isTop = article.isTop
      form.sort = article.sort ?? 0
    }
  }
  // 注入页面上下文
  updatePageContext()
})
</script>

<style scoped lang="scss">
.article-editor {
  padding: 20px;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #f5f7fa;
  box-sizing: border-box;
}

.editor-area {
  flex: 1;
  min-height: 0;
  margin-top: 10px;
  display: flex;
  flex-direction: column;
}

:deep(.rich-editor) {
  flex: 1;
  min-height: 0;
}
</style>
