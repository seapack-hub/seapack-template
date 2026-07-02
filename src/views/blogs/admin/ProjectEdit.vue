<!--
  ProjectEdit —— 项目编辑器（新建/编辑）

  功能：
    1. 编辑项目名称/描述/图标/颜色/链接/排序/状态
    2. 图标颜色和背景色实时预览
    3. 编辑模式下回填已有数据
-->
<template>
  <div class="app-container w-100% h-100% flex flex-col">
    <PageHeader :title="isEdit ? '编辑项目' : '新增项目'" :edit="false" :back="false">
      <template #button>
        <el-button @click="router.back()">返回</el-button>
        <el-button type="primary" :loading="saving" @click="submit">保存</el-button>
      </template>
    </PageHeader>

    <el-form ref="formRef" :model="form" label-width="100px" class="edit-form">
      <el-card class="admin-card" shadow="never">
        <template #header>
          <div class="card-header"><span>基本信息</span></div>
        </template>

        <el-form-item label="项目名称" prop="name" :rules="[{ required: true, message: '请输入项目名称' }]">
          <el-input v-model="form.name" placeholder="请输入项目名称" maxlength="100" show-word-limit>
            <template #suffix>
              <el-tooltip content="AI 生成名称" placement="top">
                <el-button link type="primary" size="small" :icon="MagicStick" @click="openAiDialog('name')" />
              </el-tooltip>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item label="项目描述" prop="description">
          <el-input v-model="form.description" type="textarea" :rows="3" placeholder="请输入项目描述" maxlength="500" show-word-limit>
            <template #suffix>
              <el-tooltip content="AI 生成描述" placement="top">
                <el-button link type="primary" size="small" :icon="MagicStick" @click="openAiDialog('description')" />
              </el-tooltip>
            </template>
          </el-input>
        </el-form-item>

        <el-row :gutter="24">
          <el-col :xs="24" :sm="12" :lg="6">
            <el-form-item label="图标名" prop="icon">
              <el-input v-model="form.icon" placeholder="如 home / gis" />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :lg="6">
            <el-form-item label="图标颜色" prop="color">
              <el-input v-model="form.color" placeholder="#409eff">
                <template #prefix>
                  <div class="color-prefix" :style="{ background: form.color || '#409eff' }" />
                </template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :lg="6">
            <el-form-item label="背景色" prop="bgColor">
              <el-input v-model="form.bgColor" placeholder="rgba(64,158,255,0.1)">
                <template #prefix>
                  <div class="color-prefix" :style="{ background: form.bgColor || 'rgba(64,158,255,0.1)' }" />
                </template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :lg="6">
            <el-form-item label="图标预览">
              <div class="icon-preview" :style="{ background: form.bgColor || 'rgba(64,158,255,0.1)' }">
                <SPIcon v-if="form.icon" :name="form.icon" :size="22" :color="form.color || '#409eff'" />
                <span v-else class="text-12px color-#c0c4cc">无</span>
              </div>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="24">
          <el-col :xs="24" :sm="12" :lg="8">
            <el-form-item label="项目链接" prop="url">
              <el-input v-model="form.url" placeholder="https://github.com/xxx" />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :lg="4">
            <el-form-item label="排序号" prop="sort">
              <el-input-number v-model="form.sort" :min="0" :max="999" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :lg="4">
            <el-form-item label="状态">
              <el-switch v-model="form.status" :active-value="1" :inactive-value="0" active-text="显示" inactive-text="隐藏" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-card>
    </el-form>

    <!-- AI 技能执行通用弹框 -->
    <AiSkillExecutor
      v-model:visible="aiDialogVisible"
      module-key="blogsManagement"
      position="project-editor"
      :skill-id="activeSkillId"
      :context="aiContext"
      @done="handleAiResult"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ProjectAPI } from '@/api/blogs/project.ts'
import { ElMessage } from 'element-plus'
import { MagicStick } from '@element-plus/icons-vue'
import { useAiBindings } from '@/hooks/useAiBindings'
import type { FormInstance } from 'element-plus'
import type { AiExecutionResult } from '@/api/ai/skill'

const route = useRoute()
const router = useRouter()
const formRef = ref<FormInstance>()
const isEdit = computed(() => !!route.params.id)
const saving = ref(false)

/** AI 辅助 */
const { bindings: aiBindings } = useAiBindings('blogsManagement', 'project-editor')
const aiDialogVisible = ref(false)
const activeSkillId = ref<number | undefined>()
const aiTarget = ref<'name' | 'description'>('description')
const aiContext = ref({ projectName: '', projectDescription: '' })

function openAiDialog(target: 'name' | 'description') {
  aiTarget.value = target
  activeSkillId.value = undefined
  aiContext.value = {
    projectName: form.name || '',
    projectDescription: form.description || '',
  }
  aiDialogVisible.value = true
}

function handleAiResult(result: AiExecutionResult) {
  if (!result.success) {
    ElMessage.error('AI 生成失败，请重试')
    return
  }
  const content = result.content.replace(/^["'「」【】\s]+|["'「」【】\s]+$/g, '')
  if (aiTarget.value === 'name') {
    form.name = content.slice(0, 100)
  } else {
    form.description = content.slice(0, 500)
  }
  ElMessage.success(`${result.skillName} 内容已填充`)
}

const form = reactive({
  name: '',
  description: '',
  icon: '',
  color: '#409eff',
  bgColor: 'rgba(64,158,255,0.1)',
  url: '',
  sort: 0,
  status: 1 as 0 | 1,
})

async function submit() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return
  saving.value = true
  try {
    if (isEdit.value) {
      await ProjectAPI.update(Number(route.params.id), { ...form })
      ElMessage.success('更新成功')
    } else {
      await ProjectAPI.create({ ...form })
      ElMessage.success('新增成功')
    }
    router.push({ name: 'projectList' })
  } finally { saving.value = false }
}

onMounted(async () => {
  if (isEdit.value) {
    const id = Number(route.params.id)
    const project = await ProjectAPI.getDetail(id)
    if (project) {
      form.name = project.name
      form.description = project.description
      form.icon = project.icon
      form.color = project.color
      form.bgColor = project.bgColor
      form.url = project.url
      form.sort = project.sort
      form.status = project.status
    }
  }
})
</script>

<style scoped lang="scss">
@use '@/views/blogs/styles/admin-common.scss' as *;

.app-container { padding: 20px; gap: 10px; box-sizing: border-box; }
.edit-form { flex: 1; min-height: 0; overflow-y: auto; }
.admin-card :deep(.el-card__header) { padding: 14px 20px; }
.admin-card :deep(.el-card__body) { padding: 20px; }
.card-header { display: flex; align-items: center; font-size: 16px; font-weight: 600; color: var(--el-text-color-primary); }
.color-prefix { width: 16px; height: 16px; border-radius: 4px; border: 1px solid var(--el-border-color-lighter); margin-top: 7px; }
.icon-preview { width: 44px; height: 44px; border-radius: 10px; display: flex; align-items: center; justify-content: center; border: 1px solid var(--el-border-color-lighter); }
</style>
