/**
 * 知识库管理 - 类型定义
 */

/** 知识库实体 */
export interface KnowledgeBase {
  id?: number
  /** 知识库名称 */
  name: string
  /** 知识库编码 */
  code: string
  /** 描述 */
  description?: string
  /** 图标 */
  icon?: string
  /** 向量化模型编码 */
  embeddingModel?: string
  /** 分片大小 */
  chunkSize?: number
  /** 分片重叠字符数 */
  chunkOverlap?: number
  /** 分片分隔符 */
  separator?: string
  /** 文档总数 */
  documentCount?: number
  /** 分片总数 */
  chunkCount?: number
  /** 总 Token 消耗 */
  totalTokens?: number
  /** 状态：1启用 0禁用 */
  status?: number
  /** 排序号 */
  sortOrder?: number
  createdBy?: number
  createdAt?: string
  updatedAt?: string
}

/** 知识库文档实体 */
export interface KnowledgeDocument {
  id?: number
  knowledgeId?: number
  /** 原始文件名 */
  fileName: string
  /** 存储路径 */
  filePath?: string
  /** 文件大小（字节） */
  fileSize?: number
  /** 文件类型 */
  fileType?: string
  /** MIME 类型 */
  contentType?: string
  /** 解析状态：0待解析 1解析中 2成功 3失败 */
  parseStatus?: number
  /** 向量化状态：0待处理 1处理中 2成功 3失败 */
  vectorStatus?: number
  /** 生成分片数 */
  chunkCount?: number
  /** 文档总 Token 数 */
  tokenCount?: number
  /** 错误信息 */
  errorMessage?: string
  createdBy?: number
  createdAt?: string
  updatedAt?: string
}

/** 知识库分片实体 */
export interface KnowledgeChunk {
  id?: number
  knowledgeId?: number
  documentId?: number
  /** 向量数据库 Record ID */
  vectorId?: string
  /** 分片序号 */
  chunkIndex?: number
  /** 分片内容 */
  content: string
  /** 分片 Token 数 */
  tokenCount?: number
  /** 来源页码 */
  sourcePage?: number
  /** 来源章节 */
  sourceSection?: string
  createdAt?: string
}

/** 分页查询参数 */
export interface KnowledgeBaseQuery {
  pageNum: number
  pageSize: number
  status?: number
  keyword?: string
}

/** 检索请求 */
export interface RetrievalRequest {
  /** 检索查询文本 */
  query: string
  /** 返回片段数 */
  topK?: number
}

/** 检索结果 */
export interface RetrievalResult {
  /** 分片内容 */
  content: string
  /** 相似度分数 */
  score: number
  /** 来源文档名 */
  documentName?: string
  /** 分片ID */
  chunkId?: number
}
