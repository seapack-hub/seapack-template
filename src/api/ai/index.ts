const USER_BASE_URL = "/api";
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export async function streamChat(
  messages: ChatMessage[],
  onChunk: (text: string) => void,
  onDone: () => void,
  onError: (e: Error) => void,
  namespace?: string, //命名空间参数
) {
  try {
    const response = await fetch(`${USER_BASE_URL}/chat/aiModel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: messages,
        namespace: namespace, //命名空间参数
        stream: true
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'API 请求失败');
    }

    if (!response.body) {
      throw new Error('响应体为空，无法读取流');
    }
    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = ''; // 用于处理粘包或半包问题
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        onDone();
        break;
      }
      // 将新读取的数据追加到缓冲区
      buffer += decoder.decode(value, { stream: true });      
      // 按行分割
      const lines = buffer.split('\n');      
      // 保留最后一行（可能是不完整的），留待下次循环处理
      buffer = lines.pop() || '';
      for (const line of lines) {
        const trimmedLine = line.trim();        
        // 1. 确保以 data: 开头
        if (trimmedLine.startsWith('data:')) {
          // 2. 去掉 data: 前缀
          const jsonString = trimmedLine.replace(/^data:\s*/, '');
          // 3. 处理结束标记
          if (jsonString === '[DONE]') {
            onDone();
            return;
          }
          try {
            const parsed = JSON.parse(jsonString);
            // --- 核心修复：提取路径 ---
            // 截图显示 object 为 chat.completion.chunk，这是标准流式格式
            // 内容通常在 delta.content 中
            const content = parsed.choices?.[0]?.delta?.content;
            
            if (content) {
              onChunk(content);
            }
          } catch (e) {
            // 忽略非 JSON 的心跳包或解析错误
            console.warn('解析失败:', e, jsonString);
          }
        }
      }
    }
  } catch (err) {
    onError(err as Error);
  }
}