<!--
  QuotaSettingDialog — 额度配置弹窗

  Props:
    - visible: 弹窗显示状态
    - isEdit: 是否编辑模式
    - formData: 表单数据
    - loading: 提交中状态

  Emits:
    - update:visible: 关闭弹窗
    - confirm: 提交表单（返回本地表单数据）
-->
<template>
  <el-dialog
    :model-value="visible"
    :title="isEdit ? '编辑额度配置' : '新增额度配置'"
    width="500px"
    @close="$emit('update:visible', false)"
  >
    <el-form
      ref="formRef"
      :model="localForm"
      :rules="rules"
      label-width="100px"
      label-position="right"
    >
      <el-form-item label="用户" prop="userId">
        <el-select
          v-model="localForm.userId"
          filterable
          remote
          :remote-method="searchUsers"
          :loading="userLoading"
          placeholder="搜索用户"
          :disabled="isEdit"
          style="width: 100%"
        >
          <el-option
            v-for="user in userList"
            :key="user.id"
            :label="user.userName"
            :value="user.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="配额类型" prop="quotaType">
        <el-select v-model="localForm.quotaType" :disabled="isEdit" style="width: 100%">
          <el-option label="日额度" value="daily" />
          <el-option label="月额度" value="monthly" />
          <el-option label="总额度" value="total" />
        </el-select>
      </el-form-item>

      <el-form-item label="额度上限" prop="quotaLimit">
        <el-input-number
          v-model="localForm.quotaLimit"
          :min="0"
          :step="10000"
          controls-position="right"
          style="width: 100%"
        />
        <div class="text-12px color-[var(--el-text-color-secondary)] mt-4px">
          设置为 0 表示不限制
        </div>
      </el-form-item>

      <el-form-item label="预警阈值" prop="alertThreshold">
        <el-slider
          v-model="localForm.alertThreshold"
          :min="10"
          :max="100"
          :step="5"
          :format-tooltip="(val: number) => `${val}%`"
          show-input
        />
        <div class="text-12px color-[var(--el-text-color-secondary)]">
          使用量达到额度的 {{ localForm.alertThreshold }}% 时触发预警
        </div>
      </el-form-item>

      <el-form-item label="启用" prop="isEnabled">
        <el-switch v-model="localForm.isEnabled" />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="$emit('update:visible', false)">取消</el-button>
      <el-button type="primary" :loading="loading" @click="handleConfirm">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { UserAPI } from '@/api/system/baseInfo/user'
import type { User } from '@/api/system/baseInfo/user'
import type { QuotaFormData } from '@/api/ai/tokenQuota'

const props = defineProps<{
  visible: boolean
  isEdit: boolean
  formData: QuotaFormData
  loading: boolean
}>()

const emit = defineEmits<{
  'update:visible': [val: boolean]
  confirm: [data: QuotaFormData]
}>()

const formRef = ref<FormInstance>()

// ===== 本地表单状态 =====
const localForm = reactive<QuotaFormData>({
  userId: undefined,
  userName: undefined,
  quotaType: 'daily',
  quotaLimit: 100000,
  alertThreshold: 80,
  isEnabled: true,
})

const rules = reactive<FormRules>({
  userId: [{ required: true, message: '请选择用户', trigger: 'change' }],
  quotaType: [{ required: true, message: '请选择配额类型', trigger: 'change' }],
  quotaLimit: [{ required: true, message: '请输入额度上限', trigger: 'blur' }],
})

// ===== 用户搜索 =====
const userLoading = ref(false)
const userList = ref<User[]>([])

async function searchUsers(query: string) {
  if (!query) {
    userList.value = []
    return
  }
  userLoading.value = true
  try {
    const { list } = await UserAPI.getPage({ pageNum: 1, pageSize: 20, keywords: query })
    userList.value = list || []
  } catch {
    userList.value = []
  } finally {
    userLoading.value = false
  }
}

// 弹窗打开时同步 prop 到本地状态
watch(() => props.visible, (val) => {
  if (val) {
    formRef.value?.clearValidate()
    // 同步父组件数据到本地
    Object.assign(localForm, props.formData)
  }
})

function handleConfirm() {
  formRef.value?.validate((valid) => {
    if (valid) {
      emit('confirm', { ...localForm })
    }
  })
}
</script>
