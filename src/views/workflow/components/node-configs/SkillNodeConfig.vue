<template>
  <div class="config-section">
    <div class="section-title mb-8px text-12px text-gray-400">AI技能配置</div>
    <el-form-item label="技能">
      <el-select v-model="config.skillId" placeholder="选择技能" filterable @change="handleChange">
        <el-option v-for="skill in skillList" :key="skill.id" :label="skill.name" :value="skill.id" />
      </el-select>
    </el-form-item>
    <el-form-item label="技能参数">
      <div class="param-mapping">
        <div v-for="(value, key) in config.skillParams" :key="key" class="param-item flex items-center gap-8px mb-8px">
          <span class="text-12px text-gray-500 w-80px">{{ key }}:</span>
          <el-input v-model="config.skillParams[key]" size="small" @change="handleChange" />
        </div>
        <el-button size="small" @click="showAddParam = true">添加参数</el-button>
      </div>
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
  skillId: undefined as number | undefined,
  skillParams: {} as Record<string, any>,
})

const skillList = ref([
  { id: 1, name: '股票分析' },
  { id: 2, name: '基金诊断' },
  { id: 3, name: '研报生成' },
])

const showAddParam = ref(false)

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      config.value = { ...config.value, ...val }
    }
  },
  { immediate: true, deep: true },
)

const handleChange = () => {
  emit('update:modelValue', config.value)
  emit('change', config.value)
}
</script>
