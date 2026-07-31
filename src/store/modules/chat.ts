/**
 * chat.ts —— AI 对话会话管理 Store
 *
 * 管理多轮对话的全生命周期，支持：
 *   - 多会话：创建、切换、重命名、删除
 *   - 持久化：通过 pinia-plugin-persistedstate 自动保存到 localStorage
 *   - 上下文窗口控制：发送前自动裁剪超出 token 限制的旧消息
 *   - 系统提示词：每个会话独立管理 system prompt
 *   - Token 计数：实时估算当前上下文的 token 总量
 *   - 场景绑定：选择场景后，后端自动路由到合适的 Agent
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
  /** 对话ID：进入对话界面时生成一次，同一会话的所有轮次共享（后端落库 conversation_id） */
  conversationId: string;
  /** 会话标题（自动取第一条用户消息，或设为 "新对话"） */
  title: string;
  /** 消息列表 */
  messages: ChatMessage[];
  /** 系统提示词 */
  systemPrompt: string;
  /** 绑定的知识库命名空间 */
  namespace: string;
  /** 对话模式：llm（通用对话）| scene（场景对话，后端自动路由 Agent） */
  mode: 'llm' | 'scene';
  /** 场景绑定信息，LLM 模式时为 null */
  sceneBinding: SceneBinding | null;
  /** 创建时间戳 */
  createdAt: number;
  /** 最后活跃时间戳 */
  updatedAt: number;
}

/** 场景绑定信息（只记录场景 ID 和名称，Agent 由后端自动路由） */
export interface SceneBinding {
  sceneId: number;
  sceneName: string;
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
  handler: (result: { content: string; sceneName: string; elapsedMs: number }) => void;
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
 * 生成对话ID（进入对话界面时生成一次，整个会话期间不变）
 */
function generateConversationId(): string {
  const uid = localStorage.getItem('user_id') || 'anonymous';
  return `conv_${Date.now()}_${Math.random().toString(36).slice(2, 8)}_${uid}`;
}

/**
 * 创建新会话的工厂函数
 */
function createSession(systemPrompt = ''): Session {
  const now = Date.now();
  return {
    id: generateId(),
    conversationId: generateConversationId(),
    title: '新对话',
    messages: [],
    systemPrompt: systemPrompt || DEFAULT_SYSTEM_PROMPT,
    namespace: '',
    mode: 'llm',
    sceneBinding: null,
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

    /** 当前链路追踪快照（场景模式下由 SSE done 事件填充） */
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

    /** 当前会话是否为场景模式 */
    const isSceneMode = computed(() => currentSession.value?.mode === 'scene');

    /** 当前会话绑定的场景信息（LLM 模式时为 null） */
    const currentSceneBinding = computed(() => currentSession.value?.sceneBinding ?? null);

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
     */
    function createSessionAndSwitch(systemPrompt = ''): string {
      const session = createSession(systemPrompt);
      sessions.value.push(session);
      currentSessionId.value = session.id;
      return session.id;
    }

    /**
     * 删除指定会话
     */
    function deleteSession(sessionId: string) {
      const idx = sessions.value.findIndex((s) => s.id === sessionId);
      if (idx === -1) return;
      sessions.value.splice(idx, 1);

      if (currentSessionId.value === sessionId) {
        if (sessions.value.length > 0) {
          currentSessionId.value = sessions.value[Math.min(idx, sessions.value.length - 1)].id;
        } else {
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
        session.title = title.slice(0, 50);
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
     */
    function getContextMessages(): ChatMessage[] {
      const session = currentSession.value;
      if (!session) return [];

      const allMessages: ChatMessage[] = [
        { role: 'system', content: session.systemPrompt },
        ...session.messages,
      ];

      return trimContext(allMessages, MAX_CONTEXT_TOKENS);
    }

    /**
     * 清空当前会话的所有消息
     */
    function clearMessages() {
      if (currentSession.value) {
        currentSession.value.messages = [];
        currentSession.value.title = '新对话';
        touchSession();
      }
    }

    /**
     * 将场景绑定到当前会话
     * 绑定后自动切换到场景模式，后端根据 sceneId 自动路由 Agent
     */
    function bindScene(sceneId: number, sceneName: string) {
      if (!currentSession.value) return;
      currentSession.value.sceneBinding = { sceneId, sceneName };
      currentSession.value.mode = 'scene';
      touchSession();
    }

    /**
     * 解绑当前会话的场景，恢复到 LLM 通用对话模式
     */
    function unbindScene() {
      if (!currentSession.value) return;
      currentSession.value.sceneBinding = null;
      currentSession.value.mode = 'llm';
      touchSession();
    }

    /**
     * 初始化：如果没有会话则创建默认会话
     */
    function ensureSession() {
      sessions.value.forEach(s => {
        if (!s.mode) s.mode = 'llm';
        if (s.sceneBinding === undefined) s.sceneBinding = null;
        // 迁移旧版会话：补充 conversationId
        if (!s.conversationId) s.conversationId = generateConversationId();
        // 迁移旧版 agentBinding/orchestrationBinding → sceneBinding
        const anyS = s as any;
        if (anyS.agentBinding && !s.sceneBinding) {
          s.sceneBinding = { sceneId: anyS.agentBinding.sceneId, sceneName: anyS.agentBinding.sceneName };
          s.mode = 'scene';
          anyS.agentBinding = null;
          anyS.orchestrationBinding = null;
        } else if (anyS.orchestrationBinding && !s.sceneBinding) {
          s.sceneBinding = { sceneId: anyS.orchestrationBinding.sceneId, sceneName: anyS.orchestrationBinding.orchestrationName };
          s.mode = 'scene';
          anyS.agentBinding = null;
          anyS.orchestrationBinding = null;
        }
      });

      if (sessions.value.length === 0) {
        createSessionAndSwitch();
      } else if (!currentSessionId.value || !currentSession.value) {
        currentSessionId.value = sessions.value[0].id;
      }
    }

    // ==================== 页面上下文（不持久化） ====================

    function setPageContext(context: PageContext | null) {
      pageContext.value = context;
    }

    function registerResultHandler(handler: ResultHandler) {
      const exists = resultHandlers.value.find(h => h.name === handler.name);
      if (!exists) {
        resultHandlers.value.push(handler);
      }
    }

    function unregisterResultHandler(name: string) {
      const idx = resultHandlers.value.findIndex(h => h.name === name);
      if (idx >= 0) {
        resultHandlers.value.splice(idx, 1);
      }
    }

    function callResultHandler(name: string, result: { content: string; sceneName: string; elapsedMs: number }) {
      const handler = resultHandlers.value.find(h => h.name === name);
      if (handler) {
        handler.handler(result);
      }
    }

    // ==================== 链路追踪（不持久化） ====================

    function setCurrentTrace(trace: AgentTraceSnapshot | null) {
      currentTrace.value = trace;
    }

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
      isSceneMode,
      currentSceneBinding,
      // actions
      createSessionAndSwitch,
      deleteSession,
      renameSession,
      addMessage,
      updateLastMessage,
      setLastMessageTokens,
      getContextMessages,
      clearMessages,
      bindScene,
      unbindScene,
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
    persist: {
      paths: ['sessions', 'currentSessionId'],
    },
  },
);
