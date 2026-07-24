<!--
  场景新增/编辑弹框
-->
<template>
  <el-dialog
    v-model="visible"
    :title="isEdit ? '编辑场景' : '新增场景'"
    width="700px"
    @closed="onClosed"
  >
    <el-form ref="formRef" :model="form" :rules="formRules" label-width="90px">
      <!-- 基本信息 -->
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="场景名称" prop="name">
            <el-input v-model="form.name" placeholder="如 智能客服" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="场景编码" prop="code">
            <el-input v-model="form.code" placeholder="如 smart_customer_service" :disabled="isEdit" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="描述" prop="description">
        <el-input v-model="form.description" type="textarea" :rows="2" placeholder="场景用途说明" />
      </el-form-item>

      <!-- 外观设置 -->
      <div class="form-section">
        <div class="form-section__title">外观设置</div>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="图标">
              <IconPicker v-model="form.icon" clearable />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="卡片颜色">
              <div class="color-picker-row">
                <el-color-picker v-model="form.coverColor" show-alpha :predefine="PREDEFINE_COLORS" />
                <div class="color-preview" :style="{ background: coverGradient }">
                  <Icon v-if="form.icon" :name="form.icon" :size="20" color="#fff" />
                  <span v-else class="color-preview__text">{{ form.name?.charAt(0) || 'S' }}</span>
                </div>
              </div>
            </el-form-item>
          </el-col>
        </el-row>
      </div>

      <!-- 其他设置 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="可见性">
            <el-select v-model="form.isPublic" style="width: 100%">
              <el-option v-for="opt in SCENE_PUBLIC_OPTIONS" :key="opt.value" :label="opt.label" :value="opt.value" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="状态">
            <el-switch v-model="form.status" :active-value="1" :inactive-value="0" active-text="启用" inactive-text="禁用" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="排序号">
            <el-input-number v-model="form.sortOrder" :min="0" :max="999" style="width: 100%" />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="onSubmit">确认</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import type { Scene } from '@/api/ai/scene'
import IconPicker from '@/components/IconPicker/index.vue'
import Icon from '@/components/Icon/index.vue'
import { PREDEFINE_COLORS, SCENE_PUBLIC_OPTIONS } from '../utils/moduleOptions'

const visible = defineModel<boolean>('visible', { required: true })
const isEdit = defineModel<boolean>('isEdit', { default: false })
const form = defineModel<Scene>('form', { required: true })

const emit = defineEmits<{ confirm: [formData: Scene, isEdit: boolean] }>()

const formRules = {
  name: [{ required: true, message: '请输入场景名称', trigger: 'blur' }],
  code: [{ required: true, message: '请输入场景编码', trigger: 'blur' }],
}

const formRef = ref<any>(null)
const submitting = ref(false)

/** 图标背景渐变预览 */
const coverGradient = computed(() => {
  const c = form.value.coverColor
  if (!c) return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  return `linear-gradient(135deg, ${c}, ${lighten(c, 40)})`
})

function lighten(hex: string, percent: number): string {
  const n = parseInt(hex.replace('#', ''), 16)
  const r = Math.min(255, ((n >> 16) & 0xff) + Math.round(255 * percent / 100))
  const g = Math.min(255, ((n >> 8) & 0xff) + Math.round(255 * percent / 100))
  const b = Math.min(255, (n & 0xff) + Math.round(255 * percent / 100))
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`
}

function onClosed() {
  isEdit.value = false
  formRef.value?.resetFields()
}

async function onSubmit() {
  await formRef.value?.validate()
  submitting.value = true
  try {
    emit('confirm', form.value, isEdit.value)
  } finally {
    submitting.value = false
  }
}
</script>

<style lang="scss" scoped>
.form-section {
  margin: 8px 0 16px;
  padding: 12px;
  background: var(--el-fill-color-lighter);
  border-radius: 8px;

  &__title {
    font-size: 12px;
    font-weight: 600;
    color: var(--el-text-color-secondary);
    margin-bottom: 12px;
  }
}

.color-picker-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.color-preview {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  &__text {
    color: #fff;
    font-size: 14px;
    font-weight: 700;
  }
}
</style>
