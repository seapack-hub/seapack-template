/**
 * useSkillTest — 技能调试 composable
 *
 * 管理技能测试的 SSE 流式交互状态，供 SkillTestDialog 消费。
 */
import { SkillAPI, abortSkillTest, type Skill, type SkillParam } from '@/api/ai/skill'

export interface SkillTestPhase {
  phase: string
  message: string
}

export interface SkillTestResult {
  outputType: string
  statusCode: number
  httpMethod: string
  url: string
  durationMs: number
  body: any
}

export interface SkillTestError {
  message: string
}

export function useSkillTest() {
  // ===== 状态 =====
  const testing = ref(false)
  const currentPhase = ref<SkillTestPhase | null>(null)
  const testResult = ref<SkillTestResult | null>(null)
  const testError = ref<SkillTestError | null>(null)
  const phases = ref<string[]>([])

  // ===== 参数相关 =====
  const skillParams = ref<SkillParam[]>([])
  const paramLoading = ref(false)
  const paramValues = ref<Record<string, any>>({})

  /** 加载技能参数定义并初始化默认值 */
  async function loadParams(skill: Skill) {
    if (!skill.id) return
    paramLoading.value = true
    try {
      const params = await SkillAPI.getParams(skill.id)
      skillParams.value = params || []
      // 初始化参数默认值
      const defaults: Record<string, any> = {}
      for (const p of skillParams.value) {
        if (p.defaultValue !== undefined && p.defaultValue !== null && p.defaultValue !== '') {
          // number 类型转数字
          if (p.paramType === 'number') {
            const n = Number(p.defaultValue)
            defaults[p.paramName] = isNaN(n) ? undefined : n
          } else if (p.paramType === 'boolean') {
            defaults[p.paramName] = p.defaultValue === 'true'
          } else {
            defaults[p.paramName] = p.defaultValue
          }
        } else {
          defaults[p.paramName] = p.paramType === 'number' ? undefined : ''
        }
      }
      paramValues.value = defaults
    } catch {
      skillParams.value = []
      paramValues.value = {}
    } finally {
      paramLoading.value = false
    }
  }

  /** 校验必填参数 */
  function validateParams(): boolean {
    for (const p of skillParams.value) {
      if (p.required === 1) {
        const val = paramValues.value[p.paramName]
        if (val === undefined || val === null || val === '') {
          ElMessage.warning(`请填写必填参数: ${p.label || p.paramName}`)
          return false
        }
      }
    }
    return true
  }

  // ===== 执行测试 =====
  let abortController: AbortController | null = null

  async function executeTest(skill: Skill) {
    if (!validateParams()) return
    if (testing.value) return

    testing.value = true
    currentPhase.value = null
    testResult.value = null
    testError.value = null
    phases.value = []

    abortController = new AbortController()

    try {
      await SkillAPI.testSkillStream(
        skill.id!,
        paramValues.value,
        (event) => {
          switch (event.type) {
            case 'phase': {
              const phase: SkillTestPhase = { phase: event.phase, message: event.message }
              currentPhase.value = phase
              // 记录去重的阶段列表
              if (!phases.value.includes(event.phase)) {
                phases.value.push(event.phase)
              }
              break
            }
            case 'result': {
              testResult.value = {
                outputType: event.outputType || 'json',
                statusCode: event.statusCode,
                httpMethod: event.httpMethod,
                url: event.url,
                durationMs: event.durationMs,
                body: event.body,
              }
              break
            }
            case 'error': {
              testError.value = { message: event.message }
              break
            }
          }
        },
        abortController.signal,
      )
    } catch (err: any) {
      if (err?.name !== 'AbortError') {
        testError.value = { message: err?.message || '请求异常' }
      }
    } finally {
      testing.value = false
      abortController = null
    }
  }

  /** 取消当前测试 */
  function cancelTest() {
    abortController?.abort()
    abortSkillTest()
    testing.value = false
    currentPhase.value = null
  }

  /** 重置所有状态 */
  function resetState() {
    testing.value = false
    currentPhase.value = null
    testResult.value = null
    testError.value = null
    phases.value = []
    paramValues.value = {}
  }

  return {
    // 状态
    testing,
    currentPhase,
    testResult,
    testError,
    phases,
    // 参数
    skillParams,
    paramLoading,
    paramValues,
    loadParams,
    validateParams,
    // 操作
    executeTest,
    cancelTest,
    resetState,
  }
}
