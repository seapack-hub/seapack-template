/**
 * 工作流管理 — 表格列配置
 */

/** 工作流定义列表列 */
export const WORKFLOW_LIST_COLUMNS = [
  { label: '名称', prop: 'name', minWidth: 150 },
  { label: '编码', prop: 'code', minWidth: 120 },
  { label: '版本', prop: 'version', width: 80, formatter: (row: any) => `v${row.version || 1}` },
  { label: '创建时间', prop: 'createdAt', width: 160 },
]

/** 实例列表列 */
export const INSTANCE_LIST_COLUMNS = [
  { label: '工作流', prop: 'workflowName', minWidth: 150 },
  { label: '版本', prop: 'workflowVersion', width: 80, formatter: (row: any) => `v${row.workflowVersion || 1}` },
  { label: '开始时间', prop: 'startedAt', width: 160 },
  { label: '状态', slotName: 'status', width: 90 },
  { label: '触发方式', slotName: 'triggerType', width: 90 },
  { label: '进度', slotName: 'progress', width: 150 },
  { label: '耗时', slotName: 'duration', width: 100 },
  { label: '操作', slotName: 'operate', width: 180, fixed: 'right' },
]

/** 人工任务列表列 */
export const HUMAN_TASK_COLUMNS = [
  { label: '标题', prop: 'title', minWidth: 200 },
  { label: '工作流', prop: 'workflowName', minWidth: 150 },
  { label: '截止时间', prop: 'dueAt', width: 160 },
  { label: '创建时间', prop: 'createdAt', width: 160 },
  { label: '任务类型', slotName: 'taskType', width: 100 },
  { label: '状态', slotName: 'status', width: 100 },
  { label: '操作', slotName: 'operate', width: 140, fixed: 'right' },
]

/** 调度列表列 */
export const SCHEDULE_COLUMNS = [
  { label: '调度名称', prop: 'name', minWidth: 150 },
  { label: '工作流', prop: 'workflowName', minWidth: 150 },
  {
    label: '表达式', prop: 'cronExpression', minWidth: 150,
    formatter: (row: any) => {
      if (row.scheduleType === 'cron') return row.cronExpression
      if (row.scheduleType === 'interval') return `${row.intervalSeconds}秒`
      return row.scheduledTime || '-'
    },
  },
  { label: '上次执行', prop: 'lastRunAt', width: 160 },
  { label: '下次执行', prop: 'nextRunAt', width: 160 },
  { label: '执行次数', prop: 'runCount', width: 90 },
  { label: '类型', slotName: 'scheduleType', width: 100 },
  { label: '状态', slotName: 'status', width: 80 },
  { label: '操作', slotName: 'operate', width: 180, fixed: 'right' },
]

/** 统计明细列 */
export const STATS_COLUMNS = [
  { label: '工作流', prop: 'workflowName', minWidth: 150 },
  { label: '统计日期', prop: 'statDate', width: 120 },
  { label: '总执行', prop: 'totalRuns', width: 80 },
  { label: '成功', prop: 'successCount', width: 80 },
  { label: '失败', prop: 'failedCount', width: 80 },
  {
    label: '成功率', width: 100,
    formatter: (row: any) => {
      if (!row.totalRuns) return '-'
      return `${((row.successCount || 0) / row.totalRuns * 100).toFixed(1)}%`
    },
  },
  { label: '平均耗时', width: 100, formatter: (row: any) => formatDuration(row.avgDurationMs) },
  { label: 'Token消耗', prop: 'totalTokens', width: 100 },
  { label: '人工任务', prop: 'humanTasksCount', width: 80 },
]

function formatDuration(ms?: number) {
  if (!ms) return '-'
  if (ms < 1000) return `${ms}ms`
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
  return `${(ms / 60000).toFixed(1)}min`
}
