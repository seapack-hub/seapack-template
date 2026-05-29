<template>
  <!-- 新增/编辑股票弹框 -->
  <el-dialog
    v-model="visible"
    :title="isEdit ? '编辑股票' : '新增股票'"
    width="480px"
    @closed="onClosed"
  >
    <el-form ref="formRef" :model="form" :rules="stockFormRules" label-width="100px">
      <el-form-item label="股票代码" prop="stockCode">
        <el-input v-model="form.stockCode" placeholder="如 600519" :disabled="isEdit" />
      </el-form-item>
      <el-form-item label="股票名称" prop="stockName">
        <el-input v-model="form.stockName" placeholder="如 贵州茅台" />
      </el-form-item>
      <el-form-item label="交易所" prop="exchange">
        <el-select v-model="form.exchange" placeholder="请选择" style="width: 100%">
          <el-option v-for="opt in exchangeOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="onCancel">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="onSubmit">确认</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { exchangeOptions, stockFormRules, resetStockForm } from './utils'

// 弹框显隐控制
const visible = defineModel<boolean>('visible', { required: true })
// 是否为编辑模式
const isEdit = defineModel<boolean>('isEdit', { default: false })
// 表单数据对象
const form = defineModel<any>('form', { default: () => ({ stockCode: '', stockName: '', exchange: '' }) })

const emit = defineEmits<{
  // 确认回调：参数为表单数据和编辑标记
  confirm: [formData: any, isEdit: boolean]
}>()

const formRef = ref<any>(null)
const submitting = ref(false)

/** 关闭弹框后的清理 */
function onClosed() {
  // 关闭时重置表单数据，清除编辑状态
  resetStockForm(form.value)
  isEdit.value = false
  // 重置表单校验状态
  formRef.value?.resetFields()
}

/** 点击取消 */
function onCancel() {
  visible.value = false
}

/** 点击确认提交 */
async function onSubmit() {
  // 校验表单必填项
  await formRef.value?.validate()
  submitting.value = true
  try {
    emit('confirm', form.value, isEdit.value)
  } finally {
    submitting.value = false
  }
}
</script>
