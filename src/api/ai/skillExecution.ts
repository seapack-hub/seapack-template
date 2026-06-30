/**
 * 技能执行日志 API
 *
 * 后端接口：
 *   GET /api/ai/skills/logs      — 分页查询执行日志
 *   GET /api/ai/skills/logs/{id} — 查询日志详情
 */
import { request } from '@/utils/axios';

const BASE_URL = '/api/ai/skills/logs';

/** 技能执行日志实体 */
export interface SkillExecutionLog {
  id: number;
  /** 技能ID */
  skillId: number;
  /** 技能编码（冗余） */
  skillCode?: string;
  /** 来源模块 */
  moduleKey?: string;
  /** 输入参数 JSON */
  inputParams?: Record<string, any>;
  /** 输出结果 */
  outputResult?: string;
  /** 提示词 token 数 */
  tokensPrompt?: number;
  /** 补全 token 数 */
  tokensCompletion?: number;
  /** 耗时（毫秒） */
  durationMs?: number;
  /** 状态：success/fail/timeout */
  status: string;
  /** 错误信息 */
  errorMessage?: string;
  /** 执行人ID */
  createdBy?: number;
  /** 执行时间 */
  createdAt: string;
}

/** 执行日志分页查询参数 */
export interface ExecutionLogQuery {
  pageNum: number;
  pageSize: number;
  /** 技能ID筛选 */
  skillId?: number;
  /** 状态筛选 */
  status?: string;
  /** 关键词搜索 */
  keyword?: string;
}

export const SkillExecutionAPI = {
  /** 分页查询执行日志 */
  page(query: ExecutionLogQuery) {
    return request<any, PageResult<SkillExecutionLog[]>>({ url: BASE_URL, method: 'get', params: query });
  },

  /** 查询日志详情 */
  getById(id: number) {
    return request<any, SkillExecutionLog>({ url: `${BASE_URL}/${id}`, method: 'get' });
  },
};
