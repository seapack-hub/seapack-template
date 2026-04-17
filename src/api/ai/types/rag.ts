/**
 * 聊天请求
 */
export interface ChatRequest {
  // 命名空间
  namespace: string;
  // 问题
  question: string;
}

/**
 * 索引请求
 */
export interface IngestRequest {
  // 命名空间
  namespace: string;
  // 文件
  file: File;
}

/**
 * 响应
 */
export interface ApiResponse<T> {
  // 状态码
  code: number;
  // 状态消息
  msg: string;
  // 数据
  data: T;
}