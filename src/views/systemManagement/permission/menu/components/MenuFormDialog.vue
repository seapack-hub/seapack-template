<template>
  <el-dialog v-model="visible" :title="isEdit ? '编辑权限' : (parentName ? `新增子项 - ${parentName}` : '新增顶级目录')" width="500px" @closed="onClosed">
    <el-form ref="formRef" :model="form" :rules="formRules" label-width="110px">
      <el-form-item label="权限名称" prop="name">
        <el-input v-model="form.name" placeholder="请输入名称" />
      </el-form-item>
      <el-form-item label="资源类型" prop="type">
        <el-select v-model="form.type" placeholder="请选择" style="width: 100%">
          <el-option label="目录" :value="1" />
          <el-option label="菜单" :value="2" />
          <el-option label="按钮" :value="3" />
        </el-select>
      </el-form-item>
      <el-form-item v-if="form.type !== 3" label="路由路径" prop="path">
        <el-input v-model="form.path" placeholder="如 /user" />
      </el-form-item>
      <el-form-item v-if="form.type !== 3" label="组件路径" prop="component">
        <el-input v-model="form.component" placeholder="如 system/user/index.vue" />
      </el-form-item>
      <el-form-item label="权限标识" prop="permKey">
        <el-input v-model="form.permKey" placeholder="如 sys:user:edit" />
      </el-form-item>
      <el-form-item label="显示排序" prop="sortOrder">
        <el-input-number v-model="form.sortOrder" :min="0" :max="999" />
      </el-form-item>
      <el-form-item label="状态">
        <el-switch v-model="form.status" :active-value="1" :inactive-value="0" active-text="正常" inactive-text="禁用" />
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
const isEdit = defineModel<boolean>('isEdit', { required: true })
const form = defineModel<any>('form', { required: true })
const parentName = defineModel<string>('parentName', { required: true })

const emit = defineEmits<{ confirm: [formData: any, isEdit: boolean] }>()

const formRules = {
  name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择资源类型', trigger: 'change' }],
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
  try { emit('confirm', form.value, isEdit.value) }
  finally { submitting.value = false }
}
</script>
