/**
 * 工作流管理 — 常量定义
 * 注：原硬编码选项已迁移至字典管理（sys_dict）
 * - common_status: 通用状态（启用/禁用）
 * - schedule_type: 调度类型（Cron/固定间隔/单次）
 */

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
  categoryId: undefined as number | undefined,
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
