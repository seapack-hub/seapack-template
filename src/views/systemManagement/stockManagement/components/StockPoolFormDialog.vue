<template>
  <!-- 股票池新增/编辑弹框 -->
  <el-dialog v-model="visible" :title="isEdit ? '编辑股票' : '新增股票'" width="480px" @closed="onClosed">
    <el-form ref="formRef" :model="form" :rules="formRules" label-width="100px">
      <el-form-item label="股票代码" prop="stockCode">
        <el-input v-model="form.stockCode" placeholder="如 600519" :disabled="isEdit" />
      </el-form-item>
      <el-form-item label="股票名称" prop="stockName">
        <el-input v-model="form.stockName" placeholder="如 贵州茅台" />
      </el-form-item>
      <el-form-item label="交易所" prop="exchange">
        <el-select v-model="form.exchange" placeholder="请选择" style="width: 100%">
          <el-option label="沪市" value="SH" />
          <el-option label="深市" value="SZ" />
        </el-select>
      </el-form-item>
      <el-form-item label="所属行业" prop="industry">
        <el-select v-model="form.industry" placeholder="请选择" style="width: 100%" filterable>
          <el-option v-for="opt in industryOpts" :key="opt.value" :label="opt.label" :value="opt.value" />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="onSubmit">确认</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
/* 通过 defineModel 双向绑定父组件的 visible / isEdit / form */
const visible = defineModel<boolean>('visible', { required: true })
const isEdit = defineModel<boolean>('isEdit', { default: false })
const form = defineModel<any>('form', { default: () => ({ stockCode: '', stockName: '', exchange: '', industry: '' }) })

const emit = defineEmits<{ confirm: [formData: any, isEdit: boolean] }>()

/* 行业下拉选项 */
const industryOpts = [
  { label: '银行', value: '银行' }, { label: '煤炭', value: '煤炭' }, { label: '电力', value: '电力' },
  { label: '钢铁', value: '钢铁' }, { label: '化工', value: '化工' }, { label: '食品饮料', value: '食品饮料' },
  { label: '医药', value: '医药' }, { label: '科技', value: '科技' }, { label: '金融', value: '金融' },
  { label: '地产', value: '地产' }, { label: '新能源', value: '新能源' }, { label: '消费', value: '消费' },
  { label: '制造', value: '制造' },
]

/* 表单校验规则 */
const formRules = {
  stockCode: [{ required: true, message: '请输入股票代码' }],
  stockName: [{ required: true, message: '请输入股票名称' }],
  exchange: [{ required: true, message: '请选择交易所' }],
}

const formRef = ref<any>(null)
const submitting = ref(false)

/* 弹框关闭后重置表单 */
function onClosed() {
  form.value = { stockCode: '', stockName: '', exchange: '', industry: '' }
  isEdit.value = false
  formRef.value?.resetFields()
}

/* 提交表单：校验通过后 emit confirm 给父组件处理 */
async function onSubmit() {
  await formRef.value?.validate()
  submitting.value = true
  try { emit('confirm', form.value, isEdit.value) }
  finally { submitting.value = false }
}
</script>
