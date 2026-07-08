/**
 * 知识库管理 — 表格列配置
 */

/** 知识库列表列 */
export const KB_LIST_COLUMNS = [
  { prop: 'name', label: '知识库名称', minWidth: 160 },
  { prop: 'code', label: '编码', minWidth: 120 },
  { prop: 'embeddingModel', label: '向量模型', width: 160 },
  { prop: 'documentCount', label: '文档数', width: 80, align: 'center' as const },
  { prop: 'chunkCount', label: '分片数', width: 80, align: 'center' as const },
  { prop: 'totalTokens', label: 'Token 总量', width: 100, align: 'center' as const },
  { prop: 'createdAt', label: '创建时间', width: 160 },
]

/** 文档列表列 */
export const DOCUMENT_LIST_COLUMNS = [
  { prop: 'fileName', label: '文件名', minWidth: 200 },
  { prop: 'fileType', label: '类型', width: 80, align: 'center' as const },
  { prop: 'fileSize', label: '大小', width: 100, align: 'center' as const },
  { prop: 'chunkCount', label: '分片数', width: 80, align: 'center' as const },
  { prop: 'tokenCount', label: 'Token 数', width: 90, align: 'center' as const },
  { prop: 'parseStatus', label: '解析状态', width: 100, align: 'center' as const },
  { prop: 'vectorStatus', label: '向量化状态', width: 110, align: 'center' as const },
  { prop: 'createdAt', label: '上传时间', width: 160 },
]

/** 分片列表列 */
export const CHUNK_LIST_COLUMNS = [
  { prop: 'chunkIndex', label: '序号', width: 70, align: 'center' as const },
  { prop: 'content', label: '内容', minWidth: 400, showOverflowTooltip: true },
  { prop: 'tokenCount', label: 'Token 数', width: 90, align: 'center' as const },
  { prop: 'sourcePage', label: '页码', width: 70, align: 'center' as const },
  { prop: 'sourceSection', label: '章节', minWidth: 120 },
  { prop: 'createdAt', label: '创建时间', width: 160 },
]
