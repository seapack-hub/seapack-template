/**
 * chat.ts —— AI 对话会话管理 Store
 *
 * 管理多轮对话的全生命周期，支持：
 *   - 多会话：创建、切换、重命名、删除
 *   - 持久化：通过 pinia-plugin-persistedstate 自动保存到 localStorage
 *   - 上下文窗口控制：发送前自动裁剪超出 token 限制的旧消息
 *   - 系统提示词：每个会话独立管理 system prompt
 *   - Token 计数：实时估算当前上下文的 token 总量
 *   - 页面上下文：页面可选注入当前页面信息
 *   - 结果回写：页面可注册回调处理 AI 结果
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { ChatMessage } from '@/api/ai/index';
import type { AgentTraceSnapshot } from '@/api/ai/types/agent';
import { countMessagesTokens, trimContext } from '@/utils/tokenCounter';

/** 会话数据结构 */
export interface Session {
  /** 会话唯一标识（UUID） */
  id: string;
  /** 会话标题（自动取第一条用户消息，或设为 "新对话"） */
  title: string;
  /** 消息列表 */
  messages: ChatMessage[];
  /** 系统提示词 */
  systemPrompt: string;
  /** 绑定的知识库命名空间 */
  namespace: string;
  /** 对话模式：llm（裸 LLM 对话）| agent（绑定 Agent 的专业对话）| orchestration（编排模式） */
  mode: 'llm' | 'agent' | 'orchestration';
  /** Agent 模式下绑定的 Agent 信息，LLM 和编排模式时为 null */
  agentBinding: AgentBinding | null;
  /** 编排模式下绑定的编排信息，LLM 和 Agent 模式时为 null */
  orchestrationBinding: OrchestrationBinding | null;
  /** 创建时间戳 */
  createdAt: number;
  /** 最后活跃时间戳 */
  updatedAt: number;
}

/** Agent 绑定信息 */
export interface AgentBinding {
  agentId: number;
  agentName: string;
  sceneId: number;
  sceneName: string;
  agentModel?: string;
  agentTemperature?: number;
  agentMaxTokens?: number;
  agentSystemPrompt?: string;
  knowledgeIds?: number[];
}

/** 编排绑定信息 */
export interface OrchestrationBinding {
  orchestrationId: number;
  orchestrationName: string;
  orchestrationCode: string;
  orchestrationDescription?: string;
  strategy: string;
  sceneId: number;
  sceneName: string;
  stepCount: number;
}

/** 页面上下文（页面可选注入） */
export interface PageContext {
  /** 页面名称 */
  pageName: string;
  /** 模块标识 */
  moduleKey?: string;
  /** 页面数据（选中文本、表单内容等） */
  data?: Record<string, any>;
}

/** 结果回调处理器 */
export interface ResultHandler {
  /** 处理器名称 */
  name: string;
  /** 处理函数 */
  handler: (result: { content: string; agentName: string; agentId: number; elapsedMs: number }) => void;
}

/** 默认系统提示词 */
const DEFAULT_SYSTEM_PROMPT = '你是一个智能助手，请基于提供的上下文准确回答用户问题。';

/** 最大上下文 token 数（超出时自动裁剪） */
const MAX_CONTEXT_TOKENS = 8000;

/**
 * 生成简易 UUID
 */
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

/**
 * 创建新会话的工厂函数
 */
function createSession(systemPrompt = ''): Session {
  const now = Date.now();
  return {
    id: generateId(),
    title: '新对话',
    messages: [],
    systemPrompt: systemPrompt || DEFAULT_SYSTEM_PROMPT,
    namespace: '',
    mode: 'llm',            // 默认 LLM 通用对话模式
    agentBinding: null,      // 默认不绑定 Agent
    orchestrationBinding: null, // 默认不绑定编排
    createdAt: now,
    updatedAt: now,
  };
}

export const useChatStore = defineStore(
  'chat',
  () => {
    // ==================== State ====================

    /** 所有会话列表 */
    const sessions = ref<Session[]>([]);

    /** 当前选中的会话 ID */
    const currentSessionId = ref('');

    /** AI 回复加载状态（不持久化） */
    const loading = ref(false);

    /** 页面上下文（页面可选注入，不持久化） */
    const pageContext = ref<PageContext | null>(null);

    /** 结果回调处理器列表（页面可注册，不持久化） */
    const resultHandlers = ref<ResultHandler[]>([]);

    /** 当前 Agent 链路追踪快照（Agent/编排模式下由 SSE done 事件填充） */
    const currentTrace = ref<AgentTraceSnapshot | null>(null);

    // ==================== Getters ====================

    /** 当前会话对象 */
    const currentSession = computed(() => {
      return sessions.value.find((s) => s.id === currentSessionId.value);
    });

    /** 当前会话的消息列表 */
    const messages = computed(() => {
      return currentSession.value?.messages ?? [];
    });

    /** 当前会话的系统提示词 */
    const systemPrompt = computed({
      get: () => currentSession.value?.systemPrompt ?? DEFAULT_SYSTEM_PROMPT,
      set: (val: string) => {
        if (currentSession.value) {
          currentSession.value.systemPrompt = val;
          touchSession();
        }
      },
    });

    /** 当前会话的命名空间 */
    const namespace = computed(() => {
      return currentSession.value?.namespace ?? '';
    });

    /** 当前上下文的预估 token 总数 */
    const tokenCount = computed(() => {
      const msgs = currentSession.value?.messages ?? [];
      return countMessagesTokens(msgs);
    });

    /** 是否有超过一条会话 */
    const hasMultipleSessions = computed(() => sessions.value.length > 1);

    /** 当前会话是否为 Agent 模式 */
    const isAgentMode = computed(() => currentSession.value?.mode === 'agent');

    /** 当前会话绑定的 Agent 信息（LLM 模式时为 null） */
    const currentAgentBinding = computed(() => currentSession.value?.agentBinding ?? null);

    /** 当前会话是否为编排模式 */
    const isOrchestrationMode = computed(() => currentSession.value?.mode === 'orchestration');

    /** 当前会话绑定的编排信息（LLM/Agent 模式时为 null） */
    const currentOrchestrationBinding = computed(() => currentSession.value?.orchestrationBinding ?? null);

    // ==================== Actions ====================

    /**
     * 更新会话的 updatedAt 时间戳
     */
    function touchSession() {
      if (currentSession.value) {
        currentSession.value.updatedAt = Date.now();
      }
    }

    /**
     * 创建新会话并切换过去
     *
     * @param systemPrompt 可选的自定义 system prompt
     * @returns 新会话 ID
     */
    function createSessionAndSwitch(systemPrompt = ''): string {
      const session = createSession(systemPrompt);
      sessions.value.push(session);
      currentSessionId.value = session.id;
      return session.id;
    }

    /**
     * 删除指定会话
     *
     * @param sessionId 要删除的会话 ID
     */
    function deleteSession(sessionId: string) {
      const idx = sessions.value.findIndex((s) => s.id === sessionId);
      if (idx === -1) return;
      sessions.value.splice(idx, 1);

      // 如果删除的是当前会话，切换到下一个可用会话
      if (currentSessionId.value === sessionId) {
        if (sessions.value.length > 0) {
          // 优先切换到同索引，如果越界则切换到最后一个
          currentSessionId.value = sessions.value[Math.min(idx, sessions.value.length - 1)].id;
        } else {
          // 没有会话了，创建一个新的
          createSessionAndSwitch();
        }
      }
    }

    /**
     * 重命名会话标题
     */
    function renameSession(sessionId: string, title: string) {
      const session = sessions.value.find((s) => s.id === sessionId);
      if (session) {
        session.title = title.slice(0, 50); // 限制标题长度
        touchSession();
      }
    }

    /**
     * 添加消息到当前会话
     */
    function addMessage(msg: ChatMessage) {
      if (!currentSession.value) return;
      currentSession.value.messages.push(msg);
      touchSession();

      // 如果是第一条用户消息，自动生成标题
      if (msg.role === 'user' && currentSession.value.title === '新对话') {
        const title = msg.content.slice(0, 30) + (msg.content.length > 30 ? '...' : '');
        currentSession.value.title = title;
      }
    }

    /**
     * 更新最后一条消息（用于流式追加 AI 回复）
     */
    function updateLastMessage(text: string) {
      const session = currentSession.value;
      if (!session) return;
      const lastMsg = session.messages[session.messages.length - 1];
      if (lastMsg && lastMsg.role === 'assistant') {
        lastMsg.content += text;
      }
      touchSession();
    }

    /**
     * 设置最后一条消息的 token 消耗统计
     */
    function setLastMessageTokens(prompt: number, completion: number) {
      const session = currentSession.value;
      if (!session) return;
      const lastMsg = session.messages[session.messages.length - 1];
      if (lastMsg && lastMsg.role === 'assistant') {
        lastMsg.tokensPrompt = prompt;
        lastMsg.tokensCompletion = completion;
      }
      touchSession();
    }

    /**
     * 获取发送给 API 的完整消息列表（含 system prompt + 上下文裁剪）
     *
     * @returns 裁剪后的消息数组，头部自动插入 system prompt
     */
    function getContextMessages(): ChatMessage[] {
      const session = currentSession.value;
      if (!session) return [];

      // 构建完整消息列表：system prompt + 对话历史
      const allMessages: ChatMessage[] = [
        { role: 'system', content: session.systemPrompt },
        ...session.messages,
      ];

      // 上下文裁剪（超出 MAX_CONTEXT_TOKENS 时自动移除最早的对话）
      return trimContext(allMessages, MAX_CONTEXT_TOKENS);
    }

    /**
     * 清空当前会话的所有消息（保留 system prompt 和 namespace）
     */
    function clearMessages() {
      if (currentSession.value) {
        currentSession.value.messages = [];
        currentSession.value.title = '新对话';
        touchSession();
      }
    }

    /**
     * 切换当前会话的对话模式
     * @param mode 'llm' = 通用 LLM 对话 | 'agent' = Agent 专业对话 | 'orchestration' = 编排模式
     */
    function setMode(mode: 'llm' | 'agent' | 'orchestration') {
      if (!currentSession.value) return;
      currentSession.value.mode = mode;
      touchSession();
    }

    /**
     * 将 Agent 绑定到当前会话
     * 绑定后自动切换到 Agent 模式，并使用 Agent 的系统提示词（如有）
     *
     * @param binding Agent 绑定信息，包含 agentId、agentName、场景配置等
     */
    function bindAgent(binding: AgentBinding) {
      if (!currentSession.value) return;
      currentSession.value.agentBinding = binding;
      currentSession.value.mode = 'agent';
      // 如果 Agent 有自定义系统提示词，覆盖会话的 systemPrompt
      if (binding.agentSystemPrompt) {
        currentSession.value.systemPrompt = binding.agentSystemPrompt;
      }
      touchSession();
    }

    /**
     * 解绑当前会话的 Agent，恢复到 LLM 通用对话模式
     */
    function unbindAgent() {
      if (!currentSession.value) return;
      currentSession.value.agentBinding = null;
      currentSession.value.mode = 'llm';
      touchSession();
    }

    /**
     * 将编排绑定到当前会话
     * 绑定后自动切换到编排模式
     *
     * @param binding 编排绑定信息
     */
    function bindOrchestration(binding: OrchestrationBinding) {
      if (!currentSession.value) return;
      currentSession.value.orchestrationBinding = binding;
      currentSession.value.mode = 'orchestration';
      touchSession();
    }

    /**
     * 解绑当前会话的编排，恢复到 LLM 通用对话模式
     */
    function unbindOrchestration() {
      if (!currentSession.value) return;
      currentSession.value.orchestrationBinding = null;
      currentSession.value.mode = 'llm';
      touchSession();
    }

    /**
     * 初始化：如果没有会话则创建默认会话
     * 同时迁移旧版 localStorage 数据（补充新增字段）
     */
    function ensureSession() {
      // 迁移旧数据：为旧版 session 补充 mode、agentBinding、orchestrationBinding 字段
      sessions.value.forEach(s => {
        if (!s.mode) s.mode = 'llm'
        if (s.agentBinding === undefined) s.agentBinding = null
        if (s.orchestrationBinding === undefined) s.orchestrationBinding = null
      })

      if (sessions.value.length === 0) {
        createSessionAndSwitch();
      } else if (!currentSessionId.value || !currentSession.value) {
        // 如果 currentSessionId 无效，切换到第一个
        currentSessionId.value = sessions.value[0].id;
      }
    }

    // ==================== 页面上下文（不持久化） ====================

    /**
     * 设置页面上下文（页面可选调用）
     * 页面注入后，AI 助手可获取当前页面信息用于增强对话
     */
    function setPageContext(context: PageContext | null) {
      pageContext.value = context;
    }

    /**
     * 注册结果回调处理器（页面可选调用）
     * 注册后，AI 助手的结果区域会显示对应操作按钮
     */
    function registerResultHandler(handler: ResultHandler) {
      // 避免重复注册
      const exists = resultHandlers.value.find(h => h.name === handler.name);
      if (!exists) {
        resultHandlers.value.push(handler);
      }
    }

    /**
     * 取消注册结果回调处理器
     */
    function unregisterResultHandler(name: string) {
      const idx = resultHandlers.value.findIndex(h => h.name === name);
      if (idx >= 0) {
        resultHandlers.value.splice(idx, 1);
      }
    }

    /**
     * 调用指定的结果回调处理器
     */
    function callResultHandler(name: string, result: { content: string; agentName: string; agentId: number; elapsedMs: number }) {
      const handler = resultHandlers.value.find(h => h.name === name);
      if (handler) {
        handler.handler(result);
      }
    }

    // ==================== 链路追踪（不持久化） ====================

    /**
     * 设置当前链路追踪快照（Agent/编排 SSE 完成时调用）
     */
    function setCurrentTrace(trace: AgentTraceSnapshot | null) {
      currentTrace.value = trace;
    }

    /**
     * 清空当前链路追踪快照
     */
    function clearCurrentTrace() {
      currentTrace.value = null;
    }

    return {
      // state
      sessions,
      currentSessionId,
      loading,
      pageContext,
      resultHandlers,
      currentTrace,
      // getters
      currentSession,
      messages,
      systemPrompt,
      namespace,
      tokenCount,
      hasMultipleSessions,
      isAgentMode,
      currentAgentBinding,
      isOrchestrationMode,
      currentOrchestrationBinding,
      // actions
      createSessionAndSwitch,
      deleteSession,
      renameSession,
      addMessage,
      updateLastMessage,
      setLastMessageTokens,
      getContextMessages,
      clearMessages,
      setMode,
      bindAgent,
      unbindAgent,
      bindOrchestration,
      unbindOrchestration,
      ensureSession,
      // 页面上下文 & 结果回写
      setPageContext,
      registerResultHandler,
      unregisterResultHandler,
      callResultHandler,
      // 链路追踪
      setCurrentTrace,
      clearCurrentTrace,
    };
  },
  {
    // 持久化：自动保存 sessions 和 currentSessionId 到 localStorage
    persist: {
      // 只持久化 sessions 和 currentSessionId，loading 不持久化
      paths: ['sessions', 'currentSessionId'],
    },
  },
);
