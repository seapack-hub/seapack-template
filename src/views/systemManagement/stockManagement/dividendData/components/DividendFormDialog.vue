<template>
  <el-dialog v-model="visible" :title="isEdit ? '编辑分红' : '新增分红'" width="560px" @closed="onClosed">
    <el-form ref="formRef" :model="form" :rules="formRules" label-width="130px">
      <el-form-item label="股票代码" prop="stockCode">
        <el-select v-model="form.stockCode" placeholder="搜索选择" style="width:100%" filterable>
          <el-option v-for="s in stockList" :key="s.stockCode" :label="`${s.stockName} (${s.stockCode})`" :value="s.stockCode" />
        </el-select>
      </el-form-item>
      <el-row :gutter="12">
        <el-col :span="12">
          <el-form-item label="分红年度" prop="year">
            <el-date-picker v-model="form.year" type="year" placeholder="选择" style="width:100%" value-format="YYYY" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="分红类型" prop="dividendType">
            <el-select v-model="form.dividendType" placeholder="请选择" style="width:100%">
              <el-option v-for="opt in typeOpts" :key="opt.dictCode" :label="opt.dictName" :value="opt.dictCode" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="12">
        <el-col :span="12">
          <el-form-item label="每股派息(元)" prop="cashPerShare">
            <el-input-number v-model="form.cashPerShare" :min="0" :precision="4" style="width:100%" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="实施状态" prop="status">
            <el-select v-model="form.status" placeholder="请选择" style="width:100%">
              <el-option v-for="opt in statusOpts" :key="opt.dictCode" :label="opt.dictName" :value="opt.dictCode" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="12">
        <el-col :span="12">
          <el-form-item label="每10股送股">
            <el-input-number v-model="form.bonusSharesPer10" :min="0" :precision="2" style="width:100%" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="每10股转增">
            <el-input-number v-model="form.transferSharesPer10" :min="0" :precision="2" style="width:100%" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="分红方案">
        <el-input v-model="form.planText" placeholder="如 10派5元送3股转2股" />
      </el-form-item>
      <el-row :gutter="12">
        <el-col :span="12">
          <el-form-item label="公告日期">
            <el-date-picker v-model="form.announcementDate" type="date" placeholder="选择" style="width:100%" value-format="YYYY-MM-DD" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="除权除息日">
            <el-date-picker v-model="form.exDividendDate" type="date" placeholder="选择" style="width:100%" value-format="YYYY-MM-DD" />
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
import { StockInfoAPI } from '@/api/system/stockPool'
import { useDividendDict } from './useDividendDict'

const visible = defineModel<boolean>('visible', { required: true })
const isEdit = defineModel<boolean>('isEdit', { default: false })
const form = defineModel<any>('form', { default: () => ({
    stockCode: '',
    year: '',
    dividendType: 'FINAL',
    cashPerShare: 0,
    bonusSharesPer10: 0,
    transferSharesPer10: 0,
    planText: '',
    announcementDate: '',
    exDividendDate: '',
    status: 'PROPOSED',
  })
})

const emit = defineEmits<{ confirm: [formData: any, isEdit: boolean] }>()

const { typeOpts, statusOpts, load } = useDividendDict()
const stockList = ref<any[]>([])

onMounted(async () => {
  await load()
  const stocks = await StockInfoAPI.list().catch(() => [])
  stockList.value = Array.isArray(stocks) ? stocks : []
})

const formRules = {
  stockCode: [{ required: true, message: '请选择股票' }],
  year: [{ required: true, message: '请选择年度' }],
  cashPerShare: [{ required: true, message: '请输入每股派息' }],
}

const formRef = ref<any>(null)
const submitting = ref(false)

function onClosed() {
  form.value = {
    stockCode: '',
    year: '',
    dividendType: 'FINAL',
    cashPerShare: 0,
    bonusSharesPer10: 0,
    transferSharesPer10: 0,
    planText: '',
    announcementDate: '',
    exDividendDate: '',
    status: 'PROPOSED'
  }
  isEdit.value = false
  formRef.value?.resetFields()
}

async function onSubmit() {
  await formRef.value?.validate()
  submitting.value = true
  try { emit('confirm', form.value, isEdit.value) }
  finally { submitting.value = false }
}
</script>
