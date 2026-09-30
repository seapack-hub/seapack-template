/**
 * 知识库管理 — 常量定义
 * 注：原硬编码选项已迁移至字典管理（sys_dict）
 * - common_status: 通用状态（启用/禁用）
 * - embedding_model: 向量模型
 * - chunk_separator: 文档分块方式
 * - kb_parse_status: 文档解析状态
 * - kb_vector_status: 文档向量化状态
 */

/** 文档解析状态 */
export const PARSE_STATUS_MAP: Record<number, { label: string; type: string }> = {
  0: { label: '待解析', type: 'info' },
  1: { label: '解析中', type: 'warning' },
  2: { label: '成功', type: 'success' },
  3: { label: '失败', type: 'danger' },
}

/** 文档向量化状态 */
export const VECTOR_STATUS_MAP: Record<number, { label: string; type: string }> = {
  0: { label: '待处理', type: 'info' },
  1: { label: '处理中', type: 'warning' },
  2: { label: '成功', type: 'success' },
  3: { label: '失败', type: 'danger' },
}


/** 默认知识库表单数据 */
export const DEFAULT_KB_FORM = {
  name: '',
  code: '',
  description: '',
  icon: '',
  embeddingModel: 'text-embedding-v3',
  chunkSize: 512,
  chunkOverlap: 50,
  separator: '\\n\\n',
  status: 1,
  sortOrder: 0,
}
