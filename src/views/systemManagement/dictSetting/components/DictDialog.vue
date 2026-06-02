<template>
  <el-dialog v-model="visible" :title="isEdit ? '编辑字典' : '新增字典'" width="500px" @closed="onClosed">
    <el-form ref="formRef" :model="form" :rules="formRules" label-width="100px">
      <el-form-item label="字典类型" prop="dictType">
        <el-input v-model="form.dictType" placeholder="如 fund_type" :disabled="isEdit" />
      </el-form-item>
      <el-form-item label="字典编码" prop="dictCode">
        <el-input v-model="form.dictCode" placeholder="如 SH" :disabled="isEdit" />
      </el-form-item>
      <el-form-item label="字典名称" prop="dictName">
        <el-input v-model="form.dictName" placeholder="如 沪市" />
      </el-form-item>
      <el-form-item label="排序号" prop="orderNum">
        <el-input-number v-model="form.orderNum" :min="0" :max="9999" style="width: 100%" />
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input v-model="form.remark" type="textarea" :rows="3" placeholder="可选" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="onSubmit">确认</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
const visible = defineModel<boolean>('visible', { required: true })
const isEdit = defineModel<boolean>('isEdit', { default: false })
const form = defineModel<any>('form', { default: () => ({ dictType: '', dictCode: '', dictName: '', orderNum: 0, remark: '' }) })

const emit = defineEmits<{ confirm: [formData: any, isEdit: boolean] }>()

const formRules = {
  dictType: [{ required: true, message: '请输入字典类型' }],
  dictCode: [{ required: true, message: '请输入字典编码' }],
  dictName: [{ required: true, message: '请输入字典名称' }],
}

const formRef = ref<any>(null)
const submitting = ref(false)

function onClosed() {
  form.value = { dictType: '', dictCode: '', dictName: '', orderNum: 0, remark: '' }
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
