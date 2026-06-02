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
          <el-option v-for="item in exchangeOptions" :key="item.dictCode" :label="item.dictName" :value="item.dictCode" />
        </el-select>
      </el-form-item>
      <el-form-item label="所属行业" prop="industry">
        <el-cascader
          v-model="industryPath"
          :options="cascaderOpts"
          :props="{ 
            value: 'id', 
            label: 'label', 
            children: 'children', 
            leaf: 'leaf', 
            expandTrigger: 'hover'
          }"
          placeholder="请选择行业（仅叶子节点可选）"
          clearable
          filterable
          style="width: 100%"
          :show-all-levels="false"
          @change="onIndustryChange"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="onSubmit">确认</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { IndustrySectorAPI, type IndustrySector } from '@/api/system/industrySector'
import { getDictByType } from '@/api/system/dict'

const exchangeOptions = ref<any[]>([])

const visible = defineModel<boolean>('visible', { required: true })
const isEdit = defineModel<boolean>('isEdit', { default: false })
const form = defineModel<any>('form', { default: () => ({ stockCode: '', stockName: '', exchange: '', industry: '' }) })

const emit = defineEmits<{ confirm: [formData: any, isEdit: boolean] }>()

const industryPath = ref<(string | number)[]>([])
const cascaderOpts = ref<any[]>([])
const labelToIdPath = ref<Record<string, number[]>>({})  // leaf label → [parentId, ..., leafId]
const idToLabel = ref<Record<number, string>>({})  // id → label (reverse lookup)

/** 递归收集：叶子 label → ID 路径 + 所有 ID → label */
function buildPathMap(list: IndustrySector[], prefix: number[] = []) {
  for (const n of list) {
    idToLabel.value[n.id] = n.label
    const path = [...prefix, n.id]
    if (n.children?.length) {
      buildPathMap(n.children, path)
    } else {
      labelToIdPath.value[n.label] = path
    }
  }
}

/** API 树 → el-cascader 选项（仅叶子节点可选） */
function toCascader(list: IndustrySector[]): any[] {
  return list.map(n => {
    const hasChildren = !!(n.children?.length)
    return {
      label: n.label,
      id:n.id,
      children: hasChildren ? toCascader(n.children!) : undefined,
      leaf: !hasChildren,
    }
  })
}

/** 打开弹框时加载行业树 + 交易所字典 */
watch(visible, async (val) => {
  if (!val) return
  try {
    const [treeRes, dictRes] = await Promise.all([
      IndustrySectorAPI.getTree(),
      getDictByType('exchange_type'),
    ])
    const list = Array.isArray(treeRes) ? treeRes : []
    cascaderOpts.value = toCascader(list)
    labelToIdPath.value = {}
    idToLabel.value = {}
    buildPathMap(list)
    exchangeOptions.value = Array.isArray(dictRes) ? dictRes : []
    if (form.value.industry) {
      industryPath.value = labelToIdPath.value[idToLabel.value[form.value.industry]]
    }
  } catch {
    cascaderOpts.value = []
  }
})

/** cascader 选择后仅取叶子节点 label 存入 form.industry */
function onIndustryChange(val: any) {
  form.value.industry = val?.length ? val[val.length - 1] : ''
}

const formRules = {
  stockCode: [{ required: true, message: '请输入股票代码' }],
  stockName: [{ required: true, message: '请输入股票名称' }],
  exchange: [{ required: true, message: '请选择交易所' }],
}

const formRef = ref<any>(null)
const submitting = ref(false)

function onClosed() {
  form.value = { stockCode: '', stockName: '', exchange: '', industry: '' }
  industryPath.value = []
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
