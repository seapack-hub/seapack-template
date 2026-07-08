/**
 * 知识库管理 API
 */
import { request } from '@/utils/axios'
import type {
  KnowledgeBase,
  KnowledgeDocument,
  KnowledgeChunk,
  KnowledgeBaseQuery,
  RetrievalRequest,
  RetrievalResult,
} from './types/knowledgeBase'

export type {
  KnowledgeBase,
  KnowledgeDocument,
  KnowledgeChunk,
  KnowledgeBaseQuery,
  RetrievalRequest,
  RetrievalResult,
}

const BASE_URL = '/api/ai/knowledge-bases'

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
