<template>
  <div class="config-section">
    <div class="section-title">AI技能配置</div>
    <el-form-item label="技能">
      <el-select v-model="config.skillId" placeholder="选择技能" filterable :loading="loading" @change="handleChange">
        <el-option v-for="skill in skillList" :key="skill.id ?? skill.name" :label="skill.name" :value="skill.id as any" />
      </el-select>
    </el-form-item>
    <el-form-item label="技能参数">
      <div class="param-mapping">
        <div v-for="(_value, key) in config.skillParams" :key="key" class="param-item flex items-center gap-8px mb-8px">
          <span class="text-12px text-gray-500 w-80px">{{ key }}:</span>
          <el-input v-model="config.skillParams[key]" size="small" @change="handleChange" />
        </div>
        <el-button size="small" @click="showAddParam = true">添加参数</el-button>
      </div>
    </el-form-item>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { SkillAPI } from '@/api/ai/skill'
import type { Skill } from '@/api/ai/types/skill'

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

const skillList = ref<Skill[]>([])
const loading = ref(false)

async function loadSkills() {
  loading.value = true
  try {
    skillList.value = await SkillAPI.list() || []
  } catch {
    skillList.value = []
  } finally {
    loading.value = false
  }
}

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

onMounted(loadSkills)
</script>

<style lang="scss" scoped>
.section-title {
  font-size: 12px;
  font-weight: 500;
  color: #909399;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding-bottom: 6px;
  margin-bottom: 8px;
  border-bottom: 1px dashed #ebeef5;
}
</style>
