<!--
  编排表单弹窗 — 新建/编辑编排
-->
<template>
  <el-dialog v-model="visible" :title="isEdit ? '编辑编排' : '新建编排'" width="560px" append-to-body>
    <el-form :model="form" label-width="90px">
      <el-form-item label="编排名称">
        <el-input v-model="form.name" placeholder="如：写作+翻译流程" maxlength="128" />
      </el-form-item>
      <el-form-item label="编码">
        <el-input v-model="form.code" placeholder="如：write_translate" maxlength="64" :disabled="isEdit" />
      </el-form-item>
      <el-form-item label="执行策略">
        <el-select v-model="form.strategy" class="w-full">
          <el-option v-for="s in STRATEGY_OPTIONS" :key="s.value" :label="s.label" :value="s.value">
            <div class="flex flex-col">
              <span>{{ s.label }}</span>
              <span class="text-11px c-[var(--el-text-color-secondary)]">{{ s.description }}</span>
            </div>
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="描述">
        <el-input v-model="form.description" type="textarea" :rows="2" maxlength="512" />
      </el-form-item>
      <el-form-item label="状态">
        <el-radio-group v-model="form.status">
          <el-radio :value="1">启用</el-radio>
          <el-radio :value="0">禁用</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="排序号">
        <el-input-number v-model="form.sortOrder" :min="0" :max="999" class="w-full" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="onSubmit">确认</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import type { Orchestration } from '@/api/ai/orchestration'
import { STRATEGY_OPTIONS } from '@/api/ai/types/orchestration'

const visible = defineModel<boolean>('visible', { required: true })
const isEdit = defineModel<boolean>('isEdit', { required: true })
const form = defineModel<Partial<Orchestration>>('form', { required: true })

const emit = defineEmits<{
  (e: 'submit'): void
}>()

function onSubmit() {
  emit('submit')
}
</script>
