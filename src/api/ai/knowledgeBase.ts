/**
 * 知识库管理 API
 */
import { request } from '@/utils/axios'

const BASE_URL = '/api/ai/knowledge-bases'

// ===== 实体类型 =====

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

// ===== API 方法 =====

export const KnowledgeBaseAPI = {
  /** 分页查询知识库列表 */
  page(query: KnowledgeBaseQuery) {
    return request<any, PageResult<KnowledgeBase[]>>({
      url: BASE_URL,
      method: 'get',
      params: query,
    })
  },

  /** 全量知识库列表（供 Agent/Scene 关联选择） */
  list() {
    return request<any, KnowledgeBase[]>({
      url: `${BASE_URL}/all`,
      method: 'get',
    })
  },

  /** 查询知识库详情 */
  getById(id: number) {
    return request<any, KnowledgeBase>({
      url: `${BASE_URL}/detail/${id}`,
      method: 'get',
    })
  },

  /** 新增知识库 */
  insert(data: Partial<KnowledgeBase>) {
    return request<any, any>({
      url: `${BASE_URL}/insert`,
      method: 'post',
      data,
    })
  },

  /** 编辑知识库 */
  update(id: number, data: Partial<KnowledgeBase>) {
    return request<any, any>({
      url: `${BASE_URL}/update`,
      method: 'post',
      data: { ...data, id },
    })
  },

  /** 删除知识库 */
  delete(id: number) {
    return request<any, any>({
      url: `${BASE_URL}/delete/${id}`,
      method: 'delete',
    })
  },

  /** 复制知识库 */
  copy(id: number) {
    return request<any, any>({
      url: `${BASE_URL}/copy/${id}`,
      method: 'post',
    })
  },

  /** 启停切换 */
  updateStatus(id: number, status: number) {
    return request<any, any>({
      url: `${BASE_URL}/updateStatus/${id}`,
      method: 'put',
      data: { status },
    })
  },

  /** 清空知识库（删除所有文档和分片） */
  clear(id: number) {
    return request<any, any>({
      url: `${BASE_URL}/${id}/clear`,
      method: 'post',
    })
  },

  // ===== 文档管理 =====

  /** 获取知识库下的文档列表 */
  getDocuments(knowledgeId: number, params?: { pageNum?: number; pageSize?: number }) {
    return request<any, PageResult<KnowledgeDocument[]>>({
      url: `${BASE_URL}/${knowledgeId}/documents`,
      method: 'get',
      params,
    })
  },

  /** 上传文档 */
  uploadDocument(knowledgeId: number, file: File) {
    const formData = new FormData()
    formData.append('file', file)
    return request<any, any>({
      url: `${BASE_URL}/${knowledgeId}/documents/upload`,
      method: 'post',
      data: formData,
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 300000,
    })
  },

  /** 删除文档 */
  deleteDocument(knowledgeId: number, docId: number) {
    return request<any, any>({
      url: `${BASE_URL}/${knowledgeId}/documents/${docId}`,
      method: 'delete',
    })
  },

  /** 重新处理文档（重新解析+向量化） */
  reprocessDocument(knowledgeId: number, docId: number) {
    return request<any, any>({
      url: `${BASE_URL}/${knowledgeId}/documents/${docId}/reprocess`,
      method: 'post',
    })
  },

  // ===== 分片管理 =====

  /** 查看知识库的分片列表 */
  getChunks(knowledgeId: number, params?: { pageNum?: number; pageSize?: number }) {
    return request<any, PageResult<KnowledgeChunk[]>>({
      url: `${BASE_URL}/${knowledgeId}/chunks`,
      method: 'get',
      params,
    })
  },

  // ===== 语义检索 =====

  /** 测试检索 */
  retrieve(knowledgeId: number, data: RetrievalRequest) {
    return request<any, RetrievalResult[]>({
      url: `${BASE_URL}/${knowledgeId}/retrieve`,
      method: 'post',
      data,
      timeout: 30000,
    })
  },
}
