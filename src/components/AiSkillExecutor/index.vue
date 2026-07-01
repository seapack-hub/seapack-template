<!--
  AI 技能执行通用弹框

  职责：
    根据 moduleKey + position 从 Store 中过滤绑定技能，
    支持多技能选择 + 动态参数表单 + 执行结果预览。
    消费方监听 @done 事件获取统一格式的执行结果。

  使用方式：
    <AiSkillExecutor
      v-model:visible="dialogVisible"
      module-key="blogsManagement"
      position="editor-toolbar"
      :context="{ selectedText, articleTitle }"
      @done="handleAiResult"
    />

  数据流：
    Store（初始化全量加载）→ useAiBindings 过滤 → 多技能选择器 → 参数表单 → execute API → AiExecutionResult → emit
-->
<template>
  <el-dialog
    v-model="dialogVisible"
    :title="dialogTitle"
    width="1050px"
    :close-on-click-modal="false"
    class="ai-executor-dialog"
    @closed="onClosed"
  >
    <!-- 空状态 -->
    <div v-if="loaded && !bindings.length" class="flex flex-col items-center justify-center py-48">
      <el-empty description="该位置未配置 AI 技能" :image-size="80" />
    </div>

    <!-- 加载中 -->
    <div v-else-if="loading" class="flex flex-col items-center justify-center py-48 gap-[10px]">
      <el-icon class="is-loading" :size="28"><Loading /></el-icon>
      <p class="m-0 text-[14px] text-[var(--el-text-color-secondary)]">加载技能配置中...</p>
    </div>

    <!-- 正常状态 -->
    <template v-else>
      <!-- 多技能选择器 -->
      <SkillSelector
        v-if="!skillId && bindings.length > 1"
        v-model="selectedBinding"
        :bindings="bindings"
      />

      <!-- 双栏布局 -->
      <div v-loading="executing" class="flex min-h-[380px]" :class="{ 'min-h-[320px]': !skillId && bindings.length > 1 }">
        <!-- 左：参数表单 -->
        <ParamForm
          v-model:form-data="executeParams"
          :params="currentParams"
          :executing="executing"
          :skill-name="currentBinding?.skillName"
          class="flex-1"
          @execute="onExecute"
          @reset="resetParams"
        />

        <!-- 分隔 -->
        <div class="flex-shrink-0 w-[1px] mx-[18px] bg-[var(--el-border-color-lighter)] self-stretch" />

        <!-- 右：执行结果 -->
        <ResultPanel
          :result="result"
          :executing="executing"
          class="flex-1"
        />
      </div>
    </template>

    <!-- 底部 -->
    <template #footer>
      <div class="flex justify-end gap-[10px]">
        <template v-if="loaded && !bindings.length">
          <el-button @click="dialogVisible = false">关闭</el-button>
        </template>
        <template v-else>
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button
            v-if="result && !executing"
            type="primary"
            @click="onConfirm"
          >
            <el-icon><CircleCheck /></el-icon>插入内容
          </el-button>
        </template>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { Loading, CircleCheck } from '@element-plus/icons-vue'
import { SkillAPI, type SkillParam, type SkillExecuteResult, type SkillBindingInfo, type AiExecutionResult } from '@/api/ai/skill'
import { useAiBindings } from '@/hooks/useAiBindings'
import SkillSelector from './components/SkillSelector.vue'
import ParamForm from './components/ParamForm.vue'
import ResultPanel from './components/ResultPanel.vue'

const props = defineProps<{
  /** 模块标识，对应 config/modules.ts 的 key */
  moduleKey: string
  /** 模块内位置，如 'editor-toolbar' / 'sidebar' */
  position: string
  /** 可选上下文数据（如选中文本、文章标题等），执行时合并到参数中 */
  context?: Record<string, any>
  /** 指定技能 ID，传入时跳过技能选择器，直接使用该技能 */
  skillId?: number
}>()

const emit = defineEmits<{
  /** 执行成功，返回统一格式的结果 */
  done: [result: AiExecutionResult]
  /** 该位置无可用绑定配置 */
  empty: []
}>()

const visible = defineModel<boolean>('visible', { required: true })
const dialogVisible = computed({
  get: () => visible.value,
  set: (val: boolean) => { visible.value = val },
})

const { bindings, loading, loaded } = useAiBindings(props.moduleKey, props.position)

// 选中的绑定（多技能时由用户选择，单技能自动选中）
const selectedBinding = ref<SkillBindingInfo | null>(null)

// 当绑定列表更新时选中目标技能
watch(bindings, (val) => {
  if (val.length === 0) {
    selectedBinding.value = null
    return
  }
  if (props.skillId) {
    const found = val.find(b => b.skillId === props.skillId)
    if (found) selectedBinding.value = found
    else selectedBinding.value = val[0]
  } else if (!selectedBinding.value) {
    selectedBinding.value = val[0]
  }
}, { immediate: true })

const currentBinding = computed(() => selectedBinding.value)

const currentParams = computed<SkillParam[]>(() => {
  return currentBinding.value?.params || []
})

const executeParams = ref<Record<string, any>>({})
const result = ref<SkillExecuteResult | null>(null)
const executing = ref(false)

const dialogTitle = computed(() => {
  return currentBinding.value?.skillName || 'AI 技能执行'
})

// 切换技能时重置
watch(currentBinding, () => {
  resetParams()
})

/** 重置参数表单为默认值 */
function resetParams() {
  const data: Record<string, any> = {}
  currentParams.value.forEach(p => {
    data[p.paramName] = p.defaultValue ?? (p.paramType === 'boolean' ? false : (p.paramType === 'number' ? 0 : ''))
  })
  executeParams.value = data
  result.value = null
}

/** 执行技能 */
async function onExecute() {
  if (!currentBinding.value) return
  executing.value = true
  result.value = null
  try {
    const input: Record<string, any> = {}
    Object.entries(executeParams.value).forEach(([k, v]) => {
      if (v !== '' && v !== undefined) input[k] = v
    })
    if (props.context) {
      Object.entries(props.context).forEach(([k, v]) => {
        if (!(k in input)) input[k] = v
      })
    }
    const res = await SkillAPI.execute(currentBinding.value.skillId!, input)
    result.value = res
  } catch (e) {
    result.value = {
      content: `执行失败: ${(e as Error).message}`,
      tokensPrompt: 0,
      tokensCompletion: 0,
      durationMs: 0,
    }
  } finally {
    executing.value = false
  }
}

/** 确认插入 */
function onConfirm() {
  if (!result.value || !currentBinding.value) return
  const skill = currentBinding.value
  const aiResult: AiExecutionResult = {
    success: !!result.value.content && !result.value.content.startsWith('执行失败'),
    content: result.value.content,
    contentType: (skill.outputFormat as AiExecutionResult['contentType']) || 'text',
    skillName: skill.skillName,
    skillId: skill.skillId!,
    elapsedMs: result.value.durationMs || 0,
  }
  emit('done', aiResult)
  visible.value = false
}

/** 弹框关闭时清理 */
function onClosed() {
  result.value = null
  executeParams.value = {}
}

// 监听空状态
watch([bindings, loaded], ([b, l]) => {
  if (l && b.length === 0) {
    emit('empty')
  }
})
</script>

<!-- el-dialog Teleport 到 body，必须用非 scoped 样式才能命中 -->
<style lang="scss">
.ai-executor-dialog .el-dialog__body {
  padding: 16px 20px 20px !important;
}
</style>
