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

  // 响应式状态：存储所有的对话日志数组
  const logs = ref<StreamLog[]>([]);
  //响应式状态：标记当前是否正在生成内容（用于控制按钮 Loading 状态）
  const isGenerating = ref(false)
  //响应式状态：标记对话是否已经启动（用于控制结果展示区域的显示与隐藏）
  const hasStarted = ref(false)
  //响应式状态：当前进度条的激活步骤索引（对应前端的 Steps 组件）
  const currentStepIndex = ref(0)

  // EventSource 实例变量（非响应式），用于后续的手动关闭和状态判断
  let eventSource: EventSource | null = null
  let isManualClose = false; // 【新增】标记是否是手动关闭

  // 内部辅助函数：向日志数组中添加新消息，并触发页面自动滚动到底部
  const addLog = (type: StreamLog['type'], content: string) => {
    logs.value.push({ type, content })
    // 使用 nextTick 确保在 DOM 更新完成后再执行滚动操作
    nextTick(() => {
      if (scrollContainerRef?.value) {
        scrollContainerRef.value.scrollTop = scrollContainerRef.value.scrollHeight
      }
    })
  }

  // 开始流式请求
  const startStream = (task: string) => {
    // 防止重复点击建立多个连接
    if(eventSource) return

    //重置状态
    logs.value = []
    isGenerating.value = true
    hasStarted.value = true
    currentStepIndex.value = 0
    isManualClose = false; // 【新增】每次开始新任务时重置标记

    // 对任务文本进行 URL 编码，防止特殊字符导致请求异常，并拼接完整的请求 URL
    const encodedTask = encodeURIComponent(task)
    // 创建一个新的 EventSource 实例，建立与后端的 SSE 长连接
    eventSource = new EventSource(`${url}?task=${encodedTask}`)

    // 监听 SSE 的标准消息事件（后端通过 emitter.send("data: ...") 发送的数据）
    eventSource.onmessage = (event) => {
      try {
        // 后端发送的是 JSON 字符串，这里将其解析为 JS 对象
        const data = JSON.parse(event.data)
        // 处理解析后的数据
        handleStreamData(data)
      } catch (e) {
        console.error('解析流数据失败:', e)
      }
    }

    // 监听 SSE 的连接错误事件
    eventSource.onerror = () => {
      // 1. 如果是手动关闭的，直接忽略错误，不提示用户
      if (isManualClose) {
        return;
      }
      // 只有当连接彻底关闭时才视为结束或报错
      if (eventSource?.readyState === EventSource.CLOSED) {
        isGenerating.value = false
        closeStream()
        addLog('error', '连接断开或发生网络错误')
      }
    }
  }

  // 处理后端发来的流式数据
  const handleStreamData = (data: any) => {
     // 如果后端返回的是开始状态，更新进度条并添加系统提示
    if (data.status === 'start') {
      currentStepIndex.value = 1
      addLog('system', `${data.message}`)
    }
    // 根据后端返回的具体消息内容，动态更新进度条（例如检测到"搜索"关键词）
    if (data.type === 'search') {
      currentStepIndex.value = 2
      addLog('system', `${data.message}`)
    }

    if(data.type === 'documents'){
      currentStepIndex.value = 3
      addLog('system', `${data.message}`)
    }
    // 如果后端返回的是完成状态，将进度条拉满，关闭生成状态并断开连接
    if (data.status === 'complete') {
      currentStepIndex.value = 4
      isGenerating.value = false
      addLog('system', `${data.message}`)
      closeStream()
    }

    // 如果后端返回的是错误状态，将进度条拉满，关闭生成状态并断开连接
    if(data.status === 'error'){
      // currentStepIndex.value = 4
      isGenerating.value = false
      addLog('error', `❌ ${data.message}`)
      closeStream()
    }
    // 如果后端返回的是正文内容类型，将其作为普通文本添加到日志中（实现打字机效果）
    if (data.type === 'content') {
      addLog('content', `${data.message}`)
    }
  }

  // 手动关闭连接
  const closeStream = () => {
    if (eventSource) {
      isManualClose = true; // 【新增】标记为手动关闭
      eventSource.close()
      eventSource = null
    }
  }

  // 组件卸载时自动断开连接，防止内存泄漏
  onUnmounted(() => {
    closeStream()
  })

  return {
    logs,
    isGenerating,
    hasStarted,
    currentStepIndex,
    startStream,
    closeStream
  }
}
