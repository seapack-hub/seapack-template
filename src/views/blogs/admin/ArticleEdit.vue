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
      <Editor v-model="form.contentHtml" class="rich-editor" />
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
import { computed, onMounted, reactive, ref, provide } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useBlogStore } from '@/store/modules/blog.ts'
import { CategoryAPI, type BlogCategory } from '@/api/blogs/category.ts'
import { ElMessage } from 'element-plus'
import { Setting } from '@element-plus/icons-vue'
import Editor from '@/components/WangEditor/index.vue'
import ArticleSettingsDrawer from './components/ArticleSettingsDrawer.vue'

const route = useRoute()
const router = useRouter()
const store = useBlogStore()
const settingsRef = ref<InstanceType<typeof ArticleSettingsDrawer>>()
const isEdit = computed(() => !!route.params.id)
const saving = ref(false)
const drawerVisible = ref(false)
const categories = ref<BlogCategory[]>([])

export interface ArticleForm {
  title: string
  summary: string
  contentHtml: string
  category: string
  tag: string
  tagType: '' | 'success' | 'warning' | 'danger' | 'info'
  coverIcon: string
  coverColor: string
  status: 0 | 1
  isTop: 0 | 1
}

const form = reactive<ArticleForm>({
  title: '',
  summary: '',
  contentHtml: '',
  category: '',
  tag: '',
  tagType: '',
  coverIcon: '📝',
  coverColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  status: 0,
  isTop: 0,
})

provide('articleForm', form)

async function saveDraft() { form.status = 0; await save() }

async function publish() { form.status = 1; await save() }

async function save() {
  const valid = await settingsRef.value?.formRef?.validate().catch(() => false)
  if (!valid) {
    drawerVisible.value = true
    ElMessage.warning('请完善文章设置')
    return
  }
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
      form.contentHtml = article.contentHtml || article.contentMd || ''
      form.category = article.category
      form.tag = article.tag
      form.tagType = article.tagType
      form.coverIcon = article.coverIcon
      form.coverColor = article.coverColor
      form.status = article.status
      form.isTop = article.isTop
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
  display: flex;
  flex-direction: column;
  min-height: 0;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  overflow: hidden;

  .editor-wrapper {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
  }

  #editor-container {
    flex: 1 !important;
    height: auto !important;
    overflow-y: auto !important;
  }
}
</style>
