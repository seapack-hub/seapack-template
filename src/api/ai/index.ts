import type { ChatMessage } from './types/index'

export type { ChatMessage }

const USER_BASE_URL = "/api";

export async function streamChat(
  messages: ChatMessage[],
  onChunk: (text: string) => void,
  onDone: () => void,
  onError: (e: Error) => void,
  namespace?: string,
) {
  try {
    const response = await fetch(`${USER_BASE_URL}/chat/aiModel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: messages,
        namespace: namespace,
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
    let buffer = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        onDone();
        break;
      }
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';
      for (const line of lines) {
        const trimmedLine = line.trim();
        if (trimmedLine.startsWith('data:')) {
          const jsonString = trimmedLine.replace(/^data:\s*/, '');
          if (jsonString === '[DONE]') {
            onDone();
            return;
          }
          try {
            const parsed = JSON.parse(jsonString);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              onChunk(content);
            }
          } catch (e) {
            // eslint-disable-next-line no-console
            console.warn('解析失败:', e, jsonString);
          }
        }
      }
    }
  } catch (err) {
    onError(err as Error);
  }
}
