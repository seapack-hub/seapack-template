<!--
  场景新增/编辑弹框
-->
<template>
  <el-dialog
    v-model="visible"
    :title="isEdit ? '编辑场景' : '新增场景'"
    width="800px"
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
      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="描述" prop="description">
            <el-input v-model="form.description" type="textarea" :rows="2" placeholder="场景用途说明" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="图标">
            <IconPicker v-model="form.icon" clearable />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="卡片颜色">
            <div class="flex items-center justify-start gap-8px">
              <el-color-picker v-model="form.coverColor" show-alpha :predefine="PREDEFINE_COLORS" />
              <span class="text-12px text-gray-400">支持任意颜色值</span>
            </div>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="前端模块">
            <el-cascader
              v-model="form.moduleKey"
              :options="cascaderOptions"
              :props="{ expandTrigger: 'hover', emitPath: false, value: 'value', label: 'label', children: 'children' }"
              clearable
              placeholder="选择关联页面"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="可见性">
            <el-select v-model="form.isPublic" style="width: 100%">
              <el-option v-for="opt in SCENE_PUBLIC_OPTIONS" :key="opt.value" :label="opt.label" :value="opt.value" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="状态">
            <el-switch v-model="form.status" :active-value="1" :inactive-value="0" active-text="启用" inactive-text="禁用" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="排序号">
            <el-input-number v-model="form.sortOrder" :min="0" :max="999" style="width: 200px" />
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
import { PREDEFINE_COLORS, SCENE_PUBLIC_OPTIONS, getModuleCascaderOptions } from '../utils/moduleOptions'

const cascaderOptions = getModuleCascaderOptions()

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
</style>
