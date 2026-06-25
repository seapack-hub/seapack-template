/**
 * chat.ts —— AI 对话会话管理 Store
 *
 * 管理多轮对话的全生命周期，支持：
 *   - 多会话：创建、切换、重命名、删除
 *   - 持久化：通过 pinia-plugin-persistedstate 自动保存到 localStorage
 *   - 上下文窗口控制：发送前自动裁剪超出 token 限制的旧消息
 *   - 系统提示词：每个会话独立管理 system prompt
 *   - Token 计数：实时估算当前上下文的 token 总量
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { ChatMessage } from '@/api/ai/index';
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
  /** 创建时间戳 */
  createdAt: number;
  /** 最后活跃时间戳 */
  updatedAt: number;
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
     * 初始化：如果没有会话则创建默认会话
     */
    function ensureSession() {
      if (sessions.value.length === 0) {
        createSessionAndSwitch();
      } else if (!currentSessionId.value || !currentSession.value) {
        // 如果 currentSessionId 无效，切换到第一个
        currentSessionId.value = sessions.value[0].id;
      }
    }

    return {
      // state
      sessions,
      currentSessionId,
      loading,
      // getters
      currentSession,
      messages,
      systemPrompt,
      namespace,
      tokenCount,
      hasMultipleSessions,
      // actions
      createSessionAndSwitch,
      deleteSession,
      renameSession,
      addMessage,
      updateLastMessage,
      getContextMessages,
      clearMessages,
      ensureSession,
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
