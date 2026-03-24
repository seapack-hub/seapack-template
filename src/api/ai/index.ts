const API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY;
const BASE_URL = import.meta.env.VITE_DEEPSEEK_BASE_URL;


// 定义消息类型
export interface ChatMessage {
  role:'user'|'assistant'|'system',
  content:string
}

//流式对话函数
export async function streamChat(
  messages:ChatMessage[],
  //接收文本片段的回调
  onChunk:(text:string)=>void,
  //完成回调
  onDone:() => void,
  //错误回调
  onError:(e: Error) => void
){

  try{
    const response = await fetch(`${BASE_URL}/v1/chat/completions`,{
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat', // 或者 'deepseek-coder'
        messages: messages,
        stream: true // 开启流式输出
      })
    });
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error?.message || 'API 请求失败')
    }
    if (!response.body) {
      throw new Error('响应体为空，无法读取流')
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');

    while(true){
      const { done,value} = await reader.read();

      //如果流结束
      if(done){
        onDone();
        break;
      }

      //解析数码快
      const chunk = decoder.decode(value,{stream:true});
      const lines = chunk.split('\n');

      //解析SSE格式数据
      for(const line of lines){
        if(line.startsWith('data: ')){
          // 去掉 'data: ' 前缀
          const data = line.slice(6);

          if(data.trim() === '[DONE]'){
            onDone();
            return;
          }

          try{
            const parsed = JSON.parse(data);
            const content = parsed.choices[0]?.delta?.content||'';
            if(content){
              // 将生成的文本片段传递给 UI
              onChunk(content)
            }
          }catch(e){
            console.error('JSON 解析错误', e)
          }
        }
      }
    }
  }catch(err){
    onError(err as Error)
  }
}