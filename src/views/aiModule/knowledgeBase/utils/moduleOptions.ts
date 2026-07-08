/**
 * 知识库管理 — 常量定义
 */

/** 状态选项 */
export const KB_STATUS_OPTIONS = [
  { label: '启用', value: 1 },
  { label: '禁用', value: 0 },
]

/** 向量模型选项 */
export const EMBEDDING_MODEL_OPTIONS = [
  { label: '通义千问 text-embedding-v3', value: 'text-embedding-v3' },
  { label: 'OpenAI text-embedding-3-small', value: 'text-embedding-3-small' },
  { label: 'OpenAI text-embedding-3-large', value: 'text-embedding-3-large' },
]

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

/** 分片分隔符选项 */
export const SEPARATOR_OPTIONS = [
  { label: '双换行 (\\n\\n)', value: '\\n\\n' },
  { label: '单换行 (\\n)', value: '\\n' },
  { label: '段落分隔 (\\n\\n\\n)', value: '\\n\\n\\n' },
  { label: '自定义', value: 'custom' },
]

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
