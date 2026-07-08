<!--
  场景新增/编辑弹框
-->
<template>
  <el-dialog
    v-model="visible"
    :title="isEdit ? '编辑场景' : '新增场景'"
    width="600px"
    @closed="onClosed"
  >
    <el-form ref="formRef" :model="form" :rules="formRules" label-width="90px">
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
      <el-form-item label="图标">
        <el-input v-model="form.icon" placeholder="emoji 或图片 URL" />
      </el-form-item>
      <el-form-item label="卡片颜色">
        <div class="flex gap-8px flex-wrap">
          <div
            v-for="(preset, i) in COVER_COLOR_PRESETS"
            :key="i"
            class="color-preset"
            :class="{ 'ring-2 ring-white': form.coverColor === preset.value }"
            :style="{ background: preset.value }"
            @click="form.coverColor = preset.value"
          />
        </div>
      </el-form-item>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="前端模块">
            <el-input v-model="form.moduleKey" placeholder="如 stockFund" />
          </el-form-item>
        </el-col>
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
      </el-row>
      <el-form-item label="排序号">
        <el-input-number v-model="form.sortOrder" :min="0" :max="999" style="width: 200px" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="onSubmit">确认</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import type { Scene } from '@/api/ai/scene'
import { COVER_COLOR_PRESETS, SCENE_PUBLIC_OPTIONS } from '../utils/moduleOptions'

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

<style scoped>
.color-preset {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  cursor: pointer;
  transition: transform 0.15s;
}
.color-preset:hover {
  transform: scale(1.1);
}
</style>
