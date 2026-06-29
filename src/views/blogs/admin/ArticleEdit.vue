<!--
  ArticleEdit —— 文章编辑器（新建/编辑）

  功能：
    1. 支持 Markdown 编辑 + 实时预览（简易正则转换）
    2. 分类/标签/封面图标/封面颜色/置顶等元数据设置
    3. 存草稿与发布两种操作
    4. 编辑模式下回填已有数据
-->
<template>
  <div class="app-container w-100% h-100% flex flex-col">
    <PageHeader :title="isEdit ? '编辑文章' : '写文章'" :edit="false" :back="false">
      <template #button>
        <el-button @click="router.back()">返回</el-button>
        <el-button :loading="saving" @click="saveDraft">存草稿</el-button>
        <el-button type="primary" :loading="saving" @click="publish">发布</el-button>
      </template>
    </PageHeader>

    <el-form ref="formRef" :model="form" label-width="80px" class="edit-form">
      <!-- 基本信息 -->
      <el-card class="base-card admin-card" shadow="never">
        <template #header>
          <div class="card-header">
            <span>基本信息</span>
          </div>
        </template>

        <el-form-item label="标题" prop="title" :rules="[{ required: true, message: '请输入标题' }]">
          <el-input v-model="form.title" placeholder="请输入文章标题" maxlength="200" show-word-limit />
        </el-form-item>

        <el-row :gutter="24">
          <el-col :xs="24" :sm="12" :lg="8">
            <el-form-item label="分类" prop="category" :rules="[{ required: true, message: '请选择分类' }]">
              <el-select v-model="form.category" placeholder="选择分类" style="width: 100%">
                <el-option v-for="c in categories" :key="c.dictCode" :label="c.dictName" :value="c.dictCode" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :lg="8">
            <el-form-item label="标签" prop="tag">
              <el-select v-model="form.tag" placeholder="选择标签" style="width: 100%" clearable>
                <el-option label="Vue3" value="Vue3" />
                <el-option label="Java" value="Java" />
                <el-option label="GIS" value="GIS" />
                <el-option label="其他" value="其他" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :lg="8">
            <el-form-item label="标签色" prop="tagType">
              <el-select v-model="form.tagType" placeholder="标签颜色" style="width: 100%" clearable>
                <el-option label="默认" value="" />
                <el-option label="绿色" value="success" />
                <el-option label="橙色" value="warning" />
                <el-option label="红色" value="danger" />
                <el-option label="蓝色" value="info" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="24">
          <el-col :xs="24" :sm="12" :lg="6">
            <el-form-item label="封面图标" prop="coverIcon">
              <el-input v-model="form.coverIcon" placeholder="📝" maxlength="10" />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :lg="6">
            <el-form-item label="封面颜色" prop="coverColor">
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
          <el-col :xs="24" :sm="12" :lg="4">
            <el-form-item label="置顶">
              <el-switch v-model="form.isTop" :active-value="1" :inactive-value="0" />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :lg="8">
            <el-form-item label="封面预览">
              <div class="cover-preview" :style="{ background: form.coverColor }">
                <span class="cover-icon">{{ form.coverIcon || '📝' }}</span>
              </div>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="摘要" prop="summary">
          <el-input v-model="form.summary" type="textarea" :rows="3" placeholder="请输入文章摘要，将展示在文章卡片中" maxlength="500" show-word-limit />
        </el-form-item>
      </el-card>

      <!-- 正文内容 -->
      <el-card class="content-card admin-card" shadow="never">
        <template #header>
          <div class="card-header">
            <span>正文内容</span>
            <el-tag type="info" size="small" effect="plain">支持 Markdown 语法</el-tag>
          </div>
        </template>

        <el-form-item label="正文" prop="contentMd" :rules="[{ required: true, message: '请输入正文' }]">
          <div class="editor-wrapper">
            <textarea v-model="form.contentMd" class="md-editor" placeholder="支持 Markdown 语法..."></textarea>
            <div class="preview-pane">
              <div class="preview-header">实时预览</div>
              <!-- eslint-disable-next-line vue/no-v-html -->
              <div class="preview-body prose" v-html="previewHtml"></div>
            </div>
          </div>
        </el-form-item>
      </el-card>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useBlogStore } from '@/store/modules/blog.ts'
import { CategoryAPI, type BlogCategory } from '@/api/blogs/category.ts'
import { ElMessage } from 'element-plus'
import type { FormInstance } from 'element-plus'

const route = useRoute()
const router = useRouter()
const store = useBlogStore()
const formRef = ref<FormInstance>()
const isEdit = computed(() => !!route.params.id)
const saving = ref(false)
const categories = ref<BlogCategory[]>([])

/** 表单数据 */
const form = reactive({
  title: '',
  summary: '',
  contentMd: '',
  category: '',
  tag: '',
  tagType: '' as '' | 'success' | 'warning' | 'danger' | 'info',
  coverIcon: '📝',
  coverColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  status: 0 as 0 | 1,
  isTop: 0 as 0 | 1,
})

/** Markdown → HTML 简易转换（后续可替换为 marked 等库） */
const previewHtml = computed(() => {
  const md = form.contentMd || ''
  return md
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')
    .split('\n\n').filter(Boolean).map(p => {
      if (p.startsWith('<')) return p
      return `<p>${p.replace(/\n/g, '<br>')}</p>`
    }).join('\n')
})

/** 存草稿（status=0） */
async function saveDraft() { form.status = 0; await save() }

/** 发布（status=1） */
async function publish() { form.status = 1; await save() }

/** 提交保存 */
async function save() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return
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
      form.contentMd = article.contentMd
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
@use '@/views/blogs/admin/styles/admin-common.scss' as *;

.app-container { 
  padding: 20px; 
  gap: 10px; 
  box-sizing: border-box;
}
.edit-form {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.base-card, .content-card {
  :deep(.el-card__header) { padding: 14px 20px; }
  :deep(.el-card__body) { padding: 20px; }
}
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
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
.content-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  :deep(.el-card__body) {
    flex: 1;
    display: flex;
    flex-direction: column;
  }
  :deep(.el-form-item) {
    flex: 1;
    display: flex;
    flex-direction: column;
    margin-bottom: 0;
  }
  :deep(.el-form-item__content) {
    flex: 1;
    min-height: 0;
  }
}
.editor-wrapper {
  height: 520px;
  display: flex;
  gap: 16px;
  border: 1px solid #dcdfe6;
  border-radius: 8px;
  overflow: hidden;
}
.md-editor {
  flex: 1;
  height: 100%;
  padding: 16px;
  border: none;
  outline: none;
  resize: none;
  font-family: 'SF Mono', Monaco, 'Cascadia Code', Consolas, monospace;
  font-size: 14px;
  line-height: 1.7;
  color: #303133;
  background: #fafbfc;
}
.preview-pane {
  flex: 1;
  border-left: 1px solid #ebeef5;
  display: flex;
  flex-direction: column;
  background: #fff;
}
.preview-header {
  padding: 10px 16px;
  background: #f5f7fa;
  font-size: 13px;
  color: #606266;
  border-bottom: 1px solid #ebeef5;
  font-weight: 500;
}
.preview-body {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  font-size: 14px;
  line-height: 1.8;
}
:deep(h1), :deep(h2), :deep(h3) { margin: 16px 0 8px; color: #303133; }
:deep(p) { margin-bottom: 12px; color: #303133; }
:deep(code) { background: #f5f7fa; padding: 2px 6px; border-radius: 4px; font-size: 13px; color: #d63384; }
:deep(li) { margin-bottom: 4px; }
:deep(ul) { padding-left: 20px; margin-bottom: 12px; }
</style>
