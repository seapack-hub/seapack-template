/**
 * useChatStream —— 基于 SSE (EventSource) 的流式对话 Hook
 *
 * 与后端建立 Server-Sent Events 长连接，逐块接收流式数据，
 * 实现打字机效果的消息展示，适用于 AI 对话、RAG 问答等场景。
 *
 * 功能：
 *   - 建立 SSE 连接，自动解析后端推送的 JSON 数据
 *   - 管理对话步骤进度条（Steps 组件同步）
 *   - 自动滚动到最新消息
 *   - 手动 / 自动断开连接
 *   - 组件卸载时自动清理
 */

// 定义日志的类型
export interface StreamLog {
  // 消息类型：系统提示、正文内容、错误信息
  type: 'system' | 'content' | 'error'
  // 消息的具体文本内容
  content: string
}

// 定义 Hook 的入参类型
interface UseChatStreamOptions {
  // 后端流式接口的请求地址
  url: string
  // 可选参数：传入一个 Vue 的 ref 对象，用于接收需要自动滚动的 DOM 容器元素
  scrollContainerRef?: Ref<HTMLElement | null>
}

export function useChatStream(options: UseChatStreamOptions) {
  const { url, scrollContainerRef } = options;

  // ==================== 响应式状态 ====================

  // 存储所有的对话日志数组，每条日志包含类型和文本内容
  const logs = ref<StreamLog[]>([]);
  // 标记当前是否正在生成内容（用于控制按钮 Loading 状态）
  const isGenerating = ref(false);
  // 标记对话是否已经启动（用于控制结果展示区域的显示与隐藏）
  const hasStarted = ref(false);
  // 当前进度条的激活步骤索引（对应前端的 Steps 组件）
  const currentStepIndex = ref(0);

  // ==================== 非响应式变量 ====================

  // EventSource 实例变量，用于后续的手动关闭和状态判断
  let eventSource: EventSource | null = null;
  // 标记是否是手动关闭（用于 onerror 中区分主动关闭和异常断开）
  let isManualClose = false;

  // ==================== 内部方法 ====================

  /**
   * 向日志数组中添加新消息，并触发页面自动滚动到底部
   *
   * @param type    消息类型：'system' | 'content' | 'error'
   * @param content 消息文本内容
   */
  const addLog = (type: StreamLog['type'], content: string) => {
    logs.value.push({ type, content });
    // 使用 nextTick 确保在 DOM 更新完成后再执行滚动操作
    nextTick(() => {
      if (scrollContainerRef?.value) {
        // 将容器的 scrollTop 设为 scrollHeight，实现自动滚到底部
        scrollContainerRef.value.scrollTop = scrollContainerRef.value.scrollHeight;
      }
    });
  };

  // ==================== 核心流程 ====================

  /**
   * 开始流式请求
   *
   * @param task 用户输入的任务描述文本，将作为查询参数发送给后端
   */
  const startStream = (task: string) => {
    // 如果已有连接，防止重复点击建立多个连接
    if (eventSource) return;

    // 重置所有状态
    logs.value = [];
    isGenerating.value = true;
    hasStarted.value = true;
    currentStepIndex.value = 0;
    isManualClose = false;

    // 对任务文本进行 URL 编码，防止特殊字符导致请求异常
    const encodedTask = encodeURIComponent(task);
    // 创建一个新的 EventSource 实例，建立与后端的 SSE 长连接
    // 后端通过 /api/chat?task=xxx 接收请求，并用 emitter.send() 推送数据
    eventSource = new EventSource(`${url}?task=${encodedTask}`);

    /**
     * 监听 SSE 的标准消息事件
     * 后端通过 emitter.send("data: ...") 发送的数据会触发此事件
     */
    eventSource.onmessage = (event) => {
      try {
        // 后端发送的是 JSON 字符串，这里将其解析为 JS 对象
        const data = JSON.parse(event.data);
        handleStreamData(data);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('解析流数据失败:', e);
      }
    };

    /**
     * 监听 SSE 的连接错误事件
     *
     * 触发场景：
     *   - 网络异常导致连接断开
     *   - 后端主动关闭连接（但未发送 complete 消息）
     *   - 手动调用 eventSource.close()（此时 readyState 变为 CLOSED）
     */
    eventSource.onerror = () => {
      // 如果是手动关闭触发的，直接忽略，不提示用户错误
      if (isManualClose) return;
      // 只有当连接彻底关闭时才视为异常断开
      if (eventSource?.readyState === EventSource.CLOSED) {
        isGenerating.value = false;
        closeStream();
        addLog('error', '连接断开或发生网络错误');
      }
    };
  };

  /**
   * 处理后端发来的流式数据
   *
   * 后端数据格式约定（JSON）：
   *   { status: 'start',   message: '...' }    — 开始处理
   *   { type: 'search',    message: '...' }    — 搜索阶段
   *   { type: 'documents', message: '...' }    — 检索文档阶段
   *   { type: 'content',   message: '...' }    — 正文内容（打字机效果）
   *   { status: 'complete', message: '...' }   — 处理完成
   *   { status: 'error',   message: '...' }    — 处理出错
   *
   * @param data 解析后的数据对象
   */
  const handleStreamData = (data: any) => {
    // 开始状态：更新进度条到步骤 1，添加系统提示
    if (data.status === 'start') {
      currentStepIndex.value = 1;
      addLog('system', `${data.message}`);
    }
    // 搜索阶段：更新进度条到步骤 2，添加搜索提示
    if (data.type === 'search') {
      currentStepIndex.value = 2;
      addLog('system', `${data.message}`);
    }
    // 文档检索阶段：更新进度条到步骤 3
    if (data.type === 'documents') {
      currentStepIndex.value = 3;
      addLog('system', `${data.message}`);
    }
    // 完成状态：进度条拉满到步骤 4，关闭生成状态并断开连接
    if (data.status === 'complete') {
      currentStepIndex.value = 4;
      isGenerating.value = false;
      addLog('system', `${data.message}`);
      closeStream();
    }
    // 错误状态：关闭生成状态，添加错误提示，断开连接
    if (data.status === 'error') {
      isGenerating.value = false;
      addLog('error', `❌ ${data.message}`);
      closeStream();
    }
    // 正文内容：作为普通文本添加到日志（实现打字机逐块展示效果）
    if (data.type === 'content') {
      addLog('content', `${data.message}`);
    }
  };

  // ==================== 连接控制 ====================

  /**
   * 手动关闭 SSE 连接
   * 设置 isManualClose 标记，防止 onerror 误判为网络异常
   */
  const closeStream = () => {
    if (eventSource) {
      isManualClose = true;
      eventSource.close();
      eventSource = null;
    }
  };

  /**
   * 组件卸载时自动断开连接，防止内存泄漏
   * 即使组件已销毁，SSE 连接仍在后台运行会导致资源泄露
   */
  onUnmounted(() => {
    closeStream();
  });

  // ==================== 导出 ====================

  return {
    logs,              // 对话日志数组（响应式）
    isGenerating,      // 是否正在生成（控制 loading）
    hasStarted,        // 是否已启动（控制展示区域显隐）
    currentStepIndex,  // 当前进度步骤索引
    startStream,       // 开始新的流式对话
    closeStream,       // 手动关闭连接
  };
}
