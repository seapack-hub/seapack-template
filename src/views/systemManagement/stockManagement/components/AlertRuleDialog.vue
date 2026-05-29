<template>
  <!-- 监控规则新增/编辑弹框 -->
  <el-dialog v-model="visible" :title="isEdit ? '编辑规则' : '新增规则'" width="500px" @closed="onClosed">
    <el-form ref="formRef" :model="form" :rules="formRules" label-width="130px">
      <el-form-item label="股票" prop="stockId">
        <el-select v-model="form.stockId" placeholder="请选择" style="width:100%" filterable>
          <el-option v-for="s in stockCandidates" :key="s.stockId" :label="`${s.stockName} (${s.stockCode})`" :value="s.stockId" />
        </el-select>
      </el-form-item>
      <el-form-item label="监控阈值(%)" prop="thresholdRate">
        <el-input-number v-model="form.thresholdRate" :min="0" :max="20" :precision="2" style="width:100%" />
        <div class="text-12px text-gray-400 mt-4px">股息率达到该值时触发告警</div>
      </el-form-item>
      <el-form-item label="通知渠道" prop="notifyChannels">
        <el-checkbox-group v-model="form.channelList">
          <el-checkbox v-for="opt in channelOptions" :key="opt.value" :label="opt.value" :value="opt.value">{{ opt.label }}</el-checkbox>
        </el-checkbox-group>
      </el-form-item>
      <el-form-item label="接收人" prop="contacts">
        <el-input v-model="form.contacts" placeholder="邮箱/手机号，多个用逗号分隔" />
        <div class="text-12px text-gray-400 mt-4px">多个联系人用英文逗号分隔</div>
      </el-form-item>
      <el-form-item label="状态" prop="isActive">
        <el-switch v-model="form.isActive" :active-value="1" :inactive-value="0" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="onSubmit">确认</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { stockCandidates, channelOptions } from './shared'

const visible = defineModel<boolean>('visible', { required: true })
const isEdit = defineModel<boolean>('isEdit', { default: false })
const form = defineModel<any>('form', { default: () => ({
  stockId: undefined, thresholdRate: undefined, notifyChannels: 'EMAIL', channelList: ['EMAIL'], contacts: '', isActive: 1,
}) })

const emit = defineEmits<{ confirm: [formData: any, isEdit: boolean] }>()

const formRules = {
  stockId: [{ required: true, message: '请选择股票' }],
  thresholdRate: [{ required: true, message: '请输入阈值' }],
  contacts: [{ required: true, message: '请输入接收人信息' }],
}

const formRef = ref<any>(null)
const submitting = ref(false)

/* 弹框关闭后重置表单 */
function onClosed() {
  form.value = { stockId: undefined, thresholdRate: undefined, notifyChannels: 'EMAIL', channelList: ['EMAIL'], contacts: '', isActive: 1 }
  isEdit.value = false
  formRef.value?.resetFields()
}

/* 提交表单：将 channelList 数组转逗号分隔字符串 → emit */
async function onSubmit() {
  await formRef.value?.validate()
  form.value.notifyChannels = (form.value.channelList || []).join(',')
  submitting.value = true
  try { emit('confirm', form.value, isEdit.value) }
  finally { submitting.value = false }
}
</script>
