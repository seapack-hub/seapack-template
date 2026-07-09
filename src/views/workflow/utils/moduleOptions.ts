/**
 * 工作流管理 — 常量定义
 */

/** 状态选项（启用/禁用） */
export const STATUS_OPTIONS = [
  { label: '启用', value: 1 },
  { label: '禁用', value: 0 },
]

/** 调度类型选项 */
export const SCHEDULE_TYPE_OPTIONS = [
  { label: 'Cron表达式', value: 'cron' },
  { label: '固定间隔', value: 'interval' },
  { label: '单次执行', value: 'once' },
]

/** 调度类型标签映射 */
export const SCHEDULE_TYPE_MAP: Record<string, string> = {
  cron: 'Cron',
  interval: '固定间隔',
  once: '单次',
}

/** 默认工作流表单数据 */
export const DEFAULT_WORKFLOW_FORM = {
  name: '',
  code: '',
  description: '',
  status: 1,
}

/** 默认调度表单数据 */
export const DEFAULT_SCHEDULE_FORM = {
  name: '',
  workflowId: undefined,
  scheduleType: 'cron',
  cronExpression: '',
  intervalSeconds: 300,
  scheduledTime: '',
  description: '',
}
