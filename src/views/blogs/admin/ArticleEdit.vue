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
        <template v-for="b in aiBindings" :key="b.sceneId">
          <el-button
            v-if="(b.config?.displayType || 'button') === 'button'"
            :type="b.config?.type || 'primary'"
            @click="openAiDialog()"
          >
            <el-icon style="vertical-align: -2px; margin-right: 4px">
              <component :is="b.config?.icon || 'MagicStick'" />
            </el-icon>
            {{ b.config?.buttonText || b.agentName }}
          </el-button>
        </template>
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

    <!-- AI Agent 执行通用弹框：绑定博客编辑器工具栏位 -->
    <AiAgentExecutor
      v-model:visible="aiDialogVisible"
      module-key="blogsManagement"
      position-key="editor-toolbar"
      :context="aiContext"
      @done="handleAiResult"
    />

    <ArticleSettingsDrawer
      ref="settingsRef"
      v-model:visible="drawerVisible"
      :categories="categories"
      :is-edit="isEdit"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, provide } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useBlogStore } from '@/store/modules/blog.ts'
import { CategoryAPI, type BlogCategory } from '@/api/blogs/category.ts'
import { ElMessage } from 'element-plus'
import { Setting } from '@element-plus/icons-vue'
import { useSceneBindings } from '@/hooks/useSceneBindings'
import { renderToHtml } from '@/views/blogs/utils/sanitize'
import ArticleSettingsDrawer from '../components/ArticleSettingsDrawer.vue'

const route = useRoute()
const router = useRouter()
const store = useBlogStore()
const settingsRef = ref<InstanceType<typeof ArticleSettingsDrawer>>()
const editorCompRef = ref<any>(null)
const isEdit = computed(() => !!route.params.id)
const saving = ref(false)
const drawerVisible = ref(false)
const aiDialogVisible = ref(false)
const categories = ref<BlogCategory[]>([])

/** 从 Store 获取该位置所有启用的 AI 场景绑定 */
const { bindings: aiBindings } = useSceneBindings('blogsManagement', 'editor-toolbar')

/** AI 执行上下文：打开弹框时获取编辑器选中文本和文章标题 */
const aiContext = ref({ selectedText: '', articleTitle: '' })

function openAiDialog() {
  aiContext.value = {
    selectedText: editorCompRef.value?.getSelectedText?.() || '',
    articleTitle: form.title || '',
  }
  aiDialogVisible.value = true
}

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

/** AI 执行结果处理：将 markdown 转 HTML 后插入编辑器光标位置 */
async function handleAiResult(result: { content: string; agentName: string; agentId: number; elapsedMs: number }) {
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
}

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
