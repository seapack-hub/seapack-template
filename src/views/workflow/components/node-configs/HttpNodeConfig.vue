<template>
  <div class="config-section">
    <div class="section-title mb-8px text-12px text-gray-400">HTTP请求配置</div>
    <el-form-item label="URL">
      <el-input v-model="config.url" placeholder="https://api.example.com/xxx" @change="handleChange" />
    </el-form-item>
    <el-form-item label="方法">
      <el-select v-model="config.method" @change="handleChange">
        <el-option label="GET" value="GET" />
        <el-option label="POST" value="POST" />
        <el-option label="PUT" value="PUT" />
        <el-option label="DELETE" value="DELETE" />
      </el-select>
    </el-form-item>
    <el-form-item label="Headers">
      <el-input v-model="config.headersStr" type="textarea" :rows="2" placeholder="{&quot;Content-Type&quot;: &quot;application/json&quot;}" @change="parseHeaders" />
    </el-form-item>
    <el-form-item label="Body">
      <el-input v-model="config.bodyTemplate" type="textarea" :rows="3" placeholder="{&quot;key&quot;: &quot;{{variable}}&quot;}" @change="handleChange" />
    </el-form-item>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({}),
  },
})

const emit = defineEmits(['update:modelValue', 'change'])

const config = ref({
  url: '',
  method: 'POST',
  headers: {} as Record<string, string>,
  headersStr: '',
  bodyTemplate: '',
  timeout: 30,
})

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      config.value = { ...config.value, ...val }
      config.value.headersStr = JSON.stringify(config.value.headers, null, 2)
    }
  },
  { immediate: true, deep: true },
)

const parseHeaders = () => {
  try {
    config.value.headers = JSON.parse(config.value.headersStr || '{}')
  } catch (e) {
    // ignore parse error
  }
  handleChange()
}

const handleChange = () => {
  emit('update:modelValue', config.value)
  emit('change', config.value)
}
</script>
