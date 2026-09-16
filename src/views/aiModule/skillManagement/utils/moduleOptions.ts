/**
 * 技能管理模块 — 模块选项（从 modules.ts MODULE_DEFS 派生）
 * 用于模块绑定弹窗的下拉选择
 */
import { MODULE_DEFS } from '@/config/modules';

/** 模块选项（用于模块绑定弹窗下拉选择） */
export const MODULE_OPTIONS = MODULE_DEFS.map(m => ({
  label: m.title,
  value: m.key,
}))

/** 技能类型选项（执行器类型，用于技能表单选择） */
export const SKILL_TYPE_OPTIONS = [
  { label: 'HTTP 接口', value: 'http' },
  { label: '大模型 (LLM)', value: 'llm' },
  { label: '脚本执行', value: 'script' },
  { label: '文件生成', value: 'file_gen' },
  { label: '知识检索 (RAG)', value: 'rag' },
  { label: '混合', value: 'hybrid' },
]

/** 输出类型选项（用于技能表单选择） */
export const OUTPUT_TYPE_OPTIONS = [
  { label: 'JSON 数据', value: 'json' },
  { label: '文件下载', value: 'file' },
  { label: '流式文本', value: 'stream_text' },
  { label: 'Markdown', value: 'markdown' },
]

/** 参数类型选项（用于参数表单编辑） */
export const PARAM_TYPE_OPTIONS = [
  { label: '字符串', value: 'string' },
  { label: '数字', value: 'number' },
  { label: '布尔', value: 'boolean' },
  { label: '选择', value: 'select' },
  { label: 'Json', value: 'json' },
  { label: '纯文本', value: 'text' },
]

/** 执行日志状态选项（用于日志筛选） */
export const LOG_STATUS_OPTIONS = [
  { label: '全部', value: '' },
  { label: '成功', value: 'success' },
  { label: '失败', value: 'fail' },
  { label: '超时', value: 'timeout' },
]

/** 技能状态选项（用于技能列表筛选） */
export const SKILL_STATUS_OPTIONS = [
  { label: '全部', value: '' },
  { label: '启用', value: 1 },
  { label: '禁用', value: 0 },
]
