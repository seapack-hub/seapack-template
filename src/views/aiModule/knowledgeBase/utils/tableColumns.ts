/**
 * 知识库管理 — 表格列配置
 */

/** 知识库列表列 */
export const KB_LIST_COLUMNS = [
  { prop: 'name', label: '知识库名称', minWidth: 160 },
  { prop: 'code', label: '编码', minWidth: 120 },
  { prop: 'embeddingModel', label: '向量模型', minWidth: 160 },
  { prop: 'documentCount', label: '文档数', minWidth: 80, align: 'center' as const },
  { prop: 'chunkCount', label: '分片数', minWidth: 80, align: 'center' as const },
  { prop: 'totalTokens', label: 'Token 总量', minWidth: 100, align: 'center' as const },
  { prop: 'createdAt', label: '创建时间', minWidth: 160 },
  { slotName: 'status' },
]

/** 文档列表列（不含操作列，操作列在组件中组装） */
export const DOCUMENT_LIST_COLUMNS = [
  { prop: 'fileName', label: '文件名', minWidth: 200 },
  { prop: 'fileType', label: '类型', minWidth: 80, align: 'center' as const },
  { prop: 'fileSize', label: '大小', minWidth: 100, align: 'center' as const },
  { prop: 'chunkCount', label: '分片数', minWidth: 80, align: 'center' as const },
  { prop: 'tokenCount', label: 'Token 数', minWidth: 90, align: 'center' as const },
  { slotName: 'parseStatus' },
  { slotName: 'vectorStatus' },
  { prop: 'createdAt', label: '上传时间', minWidth: 160 },
  { slotName: 'operate' },
]

/** 分片列表列 */
export const CHUNK_LIST_COLUMNS = [
  { slotName: 'content' },
  { prop: 'createdAt', label: '创建时间', minWidth: 160 },
]
