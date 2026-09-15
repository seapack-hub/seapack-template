/**
 * 个股诊断逻辑 Composable
 *
 * 封装 AI 个股诊断的状态管理、SSE 流式调用、步骤进度追踪，
 * 通过 orchestration 模式与后端 Agent 系统对接。
 *
 * 后端路由流程：
 *   POST /ai/dialog/orchestration (mode=orchestration, sceneId=xxx)
 *   → 后端根据 sceneId 收集候选 Agent
 *   → 有编排定义 → 执行编排
 *   → 只有1个 Agent → 直接使用
 *   → 多个 Agent → LLM 智能选择
 */
import { executeOrchestrationStream, abortChat, cancelChatStream } from '@/api/ai/chatExecute';
import { SceneAPI, type Scene } from '@/api/ai/scene';
import type { OrchestrationSSEEvent } from '@/api/ai/types/orchestration';

/** 步骤详情项 */
export interface StepDetailItem {
  detailType: string;
  data?: Record<string, any>;
}

/** 步骤进度信息 */
export interface StepProgress {
  stepIndex: number;
  stepName: string;
  stepType?: string;
  status: 'running' | 'success' | 'fail' | 'skip';
  durationMs?: number;
  progressList?: string[];
  detailList?: StepDetailItem[];
}

/** 分析结果 */
export interface AnalysisReport {
  content: string;
  stockCode: string;
  stockName?: string;
  /** 完整步骤进度 */
  steps: StepProgress[];
  /** Token 消耗 */
  tokens?: { prompt: number; completion: number };
  /** 总耗时 ms */
  totalDurationMs?: number;
}

/**
 * 构建分析提问语
 */
function buildQuestion(stockCode: string, dimension: string, extra?: string): string {
  const dimensionMap: Record<string, string> = {
    all: '请从技术面、基本面和分红三个维度进行综合分析',
    technical: '请重点从技术面分析（K线形态、均线系统、MACD、RSI、成交量、支撑位与压力位）',
    fundamental: '请重点从基本面分析（财务指标、盈利能力、成长性、估值水平、行业地位）',
    dividend: '请重点分析分红能力（历史分红记录、股息率、分红持续性与稳定性）',
  };
  let q = `请分析股票代码 ${stockCode} 的个股诊断报告，${dimensionMap[dimension] || dimensionMap.all}。`;
  if (extra?.trim()) {
    q += `用户补充问题：${extra.trim()}`;
  }
  return q;
}

export function useStockAnalysis() {
  // ===== 场景状态 =====
  /** 所有可用场景列表 */
  const sceneList = ref<Scene[]>([]);
  /** 当前选中的场景 */
  const selectedScene = ref<Scene | null>(null);
  /** 场景列表加载中 */
  const scenesLoading = ref(false);

  // ===== 输入状态 =====
  const stockCode = ref('');
  const exchange = ref('');
  const dimension = ref('all');
  const extraQuestion = ref('');

  // ===== 执行状态 =====
  const loading = ref(false);
  const error = ref('');
  /** 流式输出的 Markdown 内容 */
  const content = ref('');
  /** 步骤进度 */
  const steps = ref<StepProgress[]>([]);
  /** 当前正在追踪的步骤索引 */
  const currentStepIndex = ref(-1);
  /** Token 消耗 */
  const tokenUsage = ref<{ prompt: number; completion: number } | null>(null);
  /** 总耗时 */
  const totalDurationMs = ref(0);
  /** 路由信息 */
  const routeInfo = ref<{ route: string; agents?: { id: number; name: string; reason?: string }[] } | null>(null);

  // ===== 场景管理 =====

  /** 加载场景列表（仅在弹出时调用一次） */
  async function loadScenes() {
    if (sceneList.value.length > 0) return;
    scenesLoading.value = true;
    try {
      sceneList.value = await SceneAPI.list();
    } catch {
      sceneList.value = [];
    } finally {
      scenesLoading.value = false;
    }
  }

  /** 选择场景 */
  function selectScene(scene: Scene) {
    selectedScene.value = scene;
  }

  /** 取消场景选择 */
  function unbindScene() {
    selectedScene.value = null;
  }

  // ===== 核心执行 =====

  /**
   * 执行个股诊断（SSE 流式）
   */
  async function analyze() {
    const targetCode = stockCode.value.trim();
    if (!targetCode) {
      ElMessage.warning('请输入股票代码');
      return;
    }
    if (!/^\d{6}$/.test(targetCode)) {
      ElMessage.warning('股票代码应为 6 位数字');
      return;
    }

    // 验证场景
    if (!selectedScene.value?.id) {
      ElMessage.warning('请先选择一个 AI 场景');
      return;
    }

    // 中止上一次请求
    abortChat();

    // 重置状态
    loading.value = true;
    error.value = '';
    content.value = '';
    steps.value = [];
    currentStepIndex.value = -1;
    tokenUsage.value = null;
    totalDurationMs.value = 0;
    routeInfo.value = null;

    const question = buildQuestion(targetCode, dimension.value, extraQuestion.value);
    const requestId = `dx_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const conversationId = `conv_${Date.now()}`;

    try {
      await executeOrchestrationStream(
        {
          sceneId: selectedScene.value.id,
          message: question,
          conversationId,
          requestId,
        },
        handleSSEEvent,
      );
    } catch (err: any) {
      // 用户主动取消不算错误
      if (err?.name === 'AbortError') {
        loading.value = false;
        return;
      }
      error.value = err?.message || '分析失败，请稍后重试';
      ElMessage.error(error.value);
      loading.value = false;
    }
  }

  /**
   * 处理 SSE 事件
   */
  function handleSSEEvent(event: OrchestrationSSEEvent) {
    switch (event.type) {
      // ===== 路由阶段 =====
      case 'routing':
        steps.value.push({
          stepIndex: 0,
          stepName: '路由分析',
          stepType: 'routing',
          status: 'running',
        });
        currentStepIndex.value = 0;
        break;

      case 'route_result': {
        const routeStep = steps.value.find(s => s.stepType === 'routing');
        if (routeStep) {
          routeStep.status = 'success';
          routeStep.durationMs = event.durationMs;
          if (!routeStep.progressList) routeStep.progressList = [];
          const routeLabels: Record<string, string> = {
            orchestration: '编排执行',
            agent: 'Agent 对话',
            llm: '通用 LLM',
            dynamic_orchestration: '动态编排',
          };
          routeStep.progressList.push(
            routeLabels[event.route || ''] || event.route || '未知路由',
          );
        }
        routeInfo.value = {
          route: event.route || '',
          agents: event.agents,
        };
        break;
      }

      // ===== Agent 选择 =====
      case 'agent_select': {
        const routeStep = steps.value.find(s => s.stepType === 'routing');
        if (routeStep && event.agents) {
          if (!routeStep.progressList) routeStep.progressList = [];
          const names = event.agents.map(a => a.name).join(', ');
          routeStep.progressList.push(`选中: ${names}`);
        }
        break;
      }

      // ===== 步骤生命周期 =====
      case 'step_start': {
        const idx = event.stepIndex ?? steps.value.length;
        steps.value.push({
          stepIndex: idx,
          stepName: event.stepName || event.stepType || '处理中',
          stepType: event.stepType,
          status: 'running',
          progressList: [],
          detailList: [],
        });
        currentStepIndex.value = idx;
        break;
      }

      case 'step_progress': {
        const step = findStep(event.stepIndex);
        if (step && event.message) {
          if (!step.progressList) step.progressList = [];
          step.progressList.push(event.message);
        }
        break;
      }

      case 'step_detail': {
        const step = findStep(event.stepIndex);
        if (step) {
          if (!step.detailList) step.detailList = [];
          step.detailList.push({
            detailType: event.detailType || '',
            data: event.data,
          });
        }
        break;
      }

      case 'step_done': {
        const step = findStep(event.stepIndex);
        if (step) {
          step.status = (event.status as StepProgress['status']) || 'success';
          step.durationMs = event.durationMs;
        }
        break;
      }

      case 'step_error': {
        const step = findStep(event.stepIndex);
        if (step) {
          step.status = 'fail';
          step.durationMs = event.durationMs;
          if (!step.progressList) step.progressList = [];
          step.progressList.push(`错误: ${event.message || '未知错误'}`);
        }
        break;
      }

      // ===== 内容输出 =====
      case 'content':
        if (event.text) {
          content.value += event.text;
        }
        break;

      // ===== 完成 =====
      case 'done':
        loading.value = false;
        totalDurationMs.value = event.totalDurationMs || 0;
        if (event.tokens) {
          tokenUsage.value = event.tokens;
        }
        // 确保所有 running 状态的步骤标记为 success
        steps.value.forEach(s => {
          if (s.status === 'running') s.status = 'success';
        });
        break;

      // ===== 用户中断 =====
      case 'stop':
        loading.value = false;
        steps.value.forEach(s => {
          if (s.status === 'running') s.status = 'skip';
        });
        if (content.value) {
          content.value += '\n\n---\n\n*分析已中断*';
        }
        break;

      // ===== 错误 =====
      case 'error':
        error.value = event.message || '分析过程中发生错误';
        loading.value = false;
        ElMessage.error(error.value);
        break;
    }
  }

  /**
   * 查找步骤
   * 优先按 stepIndex 精确匹配；
   * 找不到时（后端子步骤 stepIndex 可能为 0）回退到最近一个 running 步骤，
   * 最后兜底到最后一个步骤。
   */
  function findStep(stepIndex?: number): StepProgress | undefined {
    if (stepIndex != null) {
      const exact = steps.value.find(s => s.stepIndex === stepIndex);
      if (exact) return exact;
      // 后端 AgentSkillExecutor 等子模块 stepIndex 固定为 0，
      // 此时回退到当前正在执行的步骤
      const running = steps.value.find(s => s.status === 'running');
      if (running) return running;
    }
    return steps.value[steps.value.length - 1];
  }

  /**
   * 取消当前分析
   */
  function cancelAnalysis() {
    abortChat();
    cancelChatStream();
    loading.value = false;
    steps.value.forEach(s => {
      if (s.status === 'running') s.status = 'skip';
    });
  }

  /**
   * 重新分析当前股票
   */
  function reanalyze() {
    analyze();
  }

  /**
   * 重置所有状态
   */
  function reset() {
    abortChat();
    stockCode.value = '';
    exchange.value = '';
    dimension.value = 'all';
    extraQuestion.value = '';
    content.value = '';
    steps.value = [];
    currentStepIndex.value = -1;
    tokenUsage.value = null;
    totalDurationMs.value = 0;
    routeInfo.value = null;
    error.value = '';
  }

  // ===== Computed =====

  const reportTitle = computed(() => {
    if (stockCode.value) {
      return `${stockCode.value} - AI 个股诊断报告`;
    }
    return 'AI 个股诊断报告';
  });

  const report = computed(() => {
    if (!content.value && !loading.value) return null;
    return {
      content: content.value,
      stockCode: stockCode.value,
      steps: steps.value,
      tokens: tokenUsage.value,
      totalDurationMs: totalDurationMs.value,
    } as AnalysisReport;
  });

  return {
    // 场景
    sceneList,
    selectedScene,
    scenesLoading,
    loadScenes,
    selectScene,
    unbindScene,
    // 输入
    stockCode,
    exchange,
    dimension,
    extraQuestion,
    // 状态
    loading,
    error,
    content,
    steps,
    tokenUsage,
    totalDurationMs,
    routeInfo,
    reportTitle,
    report,
    // 方法
    analyze,
    cancelAnalysis,
    reset,
    reanalyze,
  };
}
