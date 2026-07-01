<!--
  技能执行测试弹窗
  左侧动态参数表单（按参数类型渲染不同组件）
  右侧展示执行结果（Token 消耗、耗时、输出内容）
-->
<template>
  <el-dialog v-model="visible" title="技能执行测试" width="800px" @closed="onClosed">
    <div v-loading="loadingParams" class="flex gap-16">
      <!-- 左侧：输入参数表单 -->
      <div class="flex-1 min-w-0">
        <div class="text-14px font-semibold mb-10">输入参数</div>
        <el-form v-if="params.length" ref="executeFormRef" :model="executeParams" label-width="100px" size="small">
          <el-form-item
            v-for="p in params"
            :key="p.paramName"
            :label="p.label"
            :required="p.required === 1"
          >
            <el-input
              v-if="p.paramType === 'string'"
              v-model="executeParams[p.paramName]"
              :placeholder="p.placeholder || `请输入${p.label}`"
            />
            <el-input-number
              v-else-if="p.paramType === 'number'"
              v-model="executeParams[p.paramName]"
              :placeholder="p.placeholder"
              style="width: 100%"
            />
            <el-switch
              v-else-if="p.paramType === 'boolean'"
              v-model="executeParams[p.paramName]"
            />
            <el-select
              v-else-if="p.paramType === 'select' && p.options"
              v-model="executeParams[p.paramName]"
              :placeholder="p.placeholder || '请选择'"
              style="width: 100%"
            >
              <el-option v-for="opt in p.options" :key="opt.value" :label="opt.label" :value="opt.value" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" :loading="executing" @click="onExecute">执行</el-button>
            <el-button @click="resetParams">重置</el-button>
          </el-form-item>
        </el-form>
        <el-empty v-else description="该技能未定义输入参数，点击下方按钮直接执行" />
        <div v-if="!params.length" class="mt-10">
          <el-button type="primary" :loading="executing" @click="onExecute">执行</el-button>
        </div>
      </div>
      <!-- 右侧：执行结果 -->
      <div class="flex-1 min-w-0 border-l pl-16">
        <div class="text-14px font-semibold mb-10">执行结果</div>
        <div v-if="!result && !executing" class="text-13px text-[var(--el-text-color-secondary)]">
          填写参数后点击"执行"查看结果
        </div>
        <div v-if="executing" class="flex items-center justify-center py-40">
          <el-icon class="is-loading" :size="24"><Loading /></el-icon>
          <span class="ml-10 text-13px text-[var(--el-text-color-secondary)]">正在执行...</span>
        </div>
        <div v-if="result && !executing" class="result-content">
          <div class="flex items-center gap-10 mb-8 text-12px text-[var(--el-text-color-secondary)]">
            <span>Token: {{ result.tokensPrompt || '-' }} / {{ result.tokensCompletion || '-' }}</span>
            <span>耗时: {{ result.durationMs ? `${result.durationMs}ms` : '-' }}</span>
          </div>
          <el-input
            v-model="result.content"
            type="textarea"
            :rows="12"
            readonly
            :autosize="{ minRows: 6, maxRows: 20 }"
          />
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus';
import { Loading } from '@element-plus/icons-vue';
import { SkillAPI, type SkillParam, type SkillExecuteResult } from '@/api/ai/skill';

const visible = defineModel<boolean>('visible', { required: true })
const props = defineProps<{ skillId: number }>()

const params = ref<SkillParam[]>([])
const executeParams = ref<Record<string, any>>({})
const result = ref<SkillExecuteResult | null>(null)
const loadingParams = ref(false)
const executing = ref(false)

watch(visible, async (val) => {
  if (val && props.skillId) {
    await fetchParams()
    resetParams()
  }
})

async function fetchParams() {
  loadingParams.value = true
  try {
    params.value = await SkillAPI.getParams(props.skillId) || []
  } finally { loadingParams.value = false }
}

function resetParams() {
  const data: Record<string, any> = {}
  params.value.forEach(p => {
    data[p.paramName] = p.defaultValue ?? (p.paramType === 'boolean' ? false : (p.paramType === 'number' ? 0 : ''))
  })
  executeParams.value = data
  result.value = null
}

const executeFormRef = ref<any>(null)

async function onExecute() {
  executing.value = true
  result.value = null
  try {
    // 收集参数（过滤掉空字符串）
    const input: Record<string, any> = {}
    Object.entries(executeParams.value).forEach(([k, v]) => {
      if (v !== '' && v !== undefined) input[k] = v
    })
    const res = await SkillAPI.execute(props.skillId, input)
    result.value = res
  } catch (e) {
    result.value = { content: `执行失败: ${(e as Error).message}`, tokensPrompt: 0, tokensCompletion: 0, durationMs: 0 }
  } finally { executing.value = false }
}

function onClosed() {
  params.value = []
  executeParams.value = {}
  result.value = null
}
</script>

<style scoped lang="scss">
.result-content {
  :deep(.el-textarea__inner) {
    font-family: 'Courier New', monospace;
    font-size: 13px;
    line-height: 1.6;
    white-space: pre-wrap;
  }
}
</style>
