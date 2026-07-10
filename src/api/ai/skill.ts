/**
 * 技能管理 API
 *
 * 包含原 skillExecution.ts 中的执行日志接口（已合并）
 */
import { request } from '@/utils/axios';
import { serializeOptions, deserializeOptions, serializeConfig, deserializeConfig } from '@/utils/skillParam';
import type { AiExecuteResult } from './types/common';
import type {
  Skill,
  SkillQuery,
  SkillParam,
  SkillBinding,
  SkillExecuteRequest,
  SkillBindingInfo,
  AiExecutionResult,
  SkillDebugLog,
  SkillDebugRequest,
  SkillDebugResponse,
  SkillExecutionLog,
  ExecutionLogQuery,
} from './types/skill';

export type {
  Skill,
  SkillQuery,
  SkillParam,
  SkillBinding,
  SkillExecuteRequest,
  SkillBindingInfo,
  AiExecutionResult,
  SkillDebugLog,
  SkillDebugRequest,
  SkillDebugResponse,
  SkillExecutionLog,
  ExecutionLogQuery,
}

const BASE_URL = '/api';

export const SkillAPI = {
  /** 全量技能列表 */
  list(params?: { status?: number }) {
    return request<any, Skill[]>({
      url: `${BASE_URL}/ai/skills/all`,
      method: 'get',
      params,
    })
  },

  /** 分页查询技能列表 */
  page(query: SkillQuery) {
    return request<any, PageResult<Skill[]>>({ 
      url: `${BASE_URL}/ai/skills`, 
      method: 'get', 
      params: query 
    });
  },

  /** 查询技能详情 */
  getById(id: number) {
    return request<any, Skill>({ 
      url: `${BASE_URL}/ai/skills/${id}`,
      method: 'get' 
    });
  },

  /** 新增技能 */
  insert(data: Partial<Skill>) {
    return request<any, any>({ 
      url: `${BASE_URL}/ai/skills`, 
      method: 'post', 
      data 
    });
  },

  /** 编辑技能 */
  update(id: number, data: Partial<Skill>) {
    return request<any, any>({ 
      url: `${BASE_URL}/ai/skills/${id}`, 
      method: 'put', 
      data 
    });
  },

  /** 删除技能 */
  delete(id: number) {
    return request<any, any>({ 
      url: `${BASE_URL}/ai/skills/${id}`, 
      method: 'delete' 
    });
  },

  /** 执行技能（AI 接口较慢，超时设为 5 分钟） */
  execute(id: number, req: SkillExecuteRequest) {
    return request<any, AiExecuteResult>({
      url: `${BASE_URL}/ai/skills/${id}/execute`,
      method: 'post',
      data: req,
      timeout: 300000,
    });
  },

  // ===== 参数管理 =====

  /** 获取技能参数列表（自动反序列化 options JSON → 数组） */
  async getParams(skillId: number) {
    const res = await request<any, SkillParam[]>({ 
      url: `${BASE_URL}/ai/skills/${skillId}/params`, 
      method: 'get' 
    });
    return (res || []).map(p => ({
      ...p,
      options: deserializeOptions(p.options as unknown as string | null) as any,
    }))
  },

  /** 新增参数（自动序列化 options 数组 → JSON） */
  async addParam(skillId: number, data: Partial<SkillParam>) {
    return request<any, any>({ 
      url: `${BASE_URL}/ai/skills/${skillId}/params`, 
      method: 'post', 
      data: { ...data, options: serializeOptions(data.options as any) },
    });
  },

  /** 编辑参数（自动序列化 options 数组 → JSON） */
  async updateParam(skillId: number, paramId: number, data: Partial<SkillParam>) {
    return request<any, any>({ 
      url: `${BASE_URL}/ai/skills/${skillId}/params/${paramId}`, 
      method: 'put', 
      data: { ...data, options: serializeOptions(data.options as any) },
    });
  },

  /** 删除参数 */
  deleteParam(skillId: number, paramId: number) {
    return request<any, any>({ 
      url: `${BASE_URL}/ai/skills/${skillId}/params/${paramId}`, 
      method: 'delete' 
    });
  },

  // ===== 模块绑定 =====

  /** 获取技能模块绑定列表（自动反序列化 config JSON → 对象） */
  async getBindings(skillId: number) {
    const res = await request<any, SkillBinding[]>({ 
      url: `${BASE_URL}/ai/skills/${skillId}/bindings`, 
      method: 'get' 
    });
    return (res || []).map(b => ({
      ...b,
      config: deserializeConfig(b.config as unknown as string | null) as any,
    }))
  },

  /** 新增模块绑定（自动序列化 config 对象 → JSON） */
  async addBinding(skillId: number, data: Partial<SkillBinding>) {
    return request<any, any>({ 
      url: `${BASE_URL}/ai/skills/${skillId}/bindings`, 
      method: 'post', 
      data: { ...data, config: serializeConfig(data.config as any) },
    });
  },

  /** 编辑模块绑定（自动序列化 config 对象 → JSON） */
  async updateBinding(skillId: number, bindingId: number, data: Partial<SkillBinding>) {
    return request<any, any>({ 
      url: `${BASE_URL}/ai/skills/${skillId}/bindings/${bindingId}`, 
      method: 'put', 
      data: { ...data, config: serializeConfig(data.config as any) },
    });
  },

  /** 删除模块绑定 */
  deleteBinding(skillId: number, bindingId: number) {
    return request<any, any>({ 
      url: `${BASE_URL}/ai/skills/${skillId}/bindings/${bindingId}`, 
      method: 'delete' 
    });
  },

  // ===== 批量查询（供前端 Store 全量缓存） =====

  /** 查询所有模块绑定（含技能和参数详情），初始化时全量加载 */
  getAllBindings() {
    return request<any, SkillBindingInfo[]>({
      url: `${BASE_URL}/ai/skills/bindings`,
      method: 'get',
    });
  },

  // ===== 调试 =====

  /** 调试执行（含完整请求/响应记录） */
  debug(id: number, req: SkillDebugRequest) {
    return request<any, SkillDebugResponse>({
      url: `${BASE_URL}/ai/skills/${id}/debug`,
      method: 'post',
      data: req,
      timeout: 300000,
    });
  },

  /** 调试日志分页查询 */
  getDebugLogs(params: { pageNum: number; pageSize: number; skillId?: number; status?: string }) {
    return request<any, PageResult<SkillDebugLog[]>>({
      url: `${BASE_URL}/ai/skills/debug-logs/page`,
      method: 'get',
      params,
    });
  },

  /** 调试日志详情 */
  getDebugLogDetail(id: number) {
    return request<any, SkillDebugLog>({
      url: `${BASE_URL}/ai/skills/detail-debug-logs/${id}`,
      method: 'get',
    });
  },

  /** 删除调试日志 */
  deleteDebugLog(id: number) {
    return request<any, any>({
      url: `${BASE_URL}/ai/skills/delete-debug-logs/${id}`,
      method: 'delete',
    });
  },

  // ===== 执行日志（原 skillExecution.ts） =====

  /** 分页查询执行日志 */
  getExecutionLogs(query: ExecutionLogQuery) {
    return request<any, PageResult<SkillExecutionLog[]>>({ 
      url: `${BASE_URL}/ai/skills/logs`, 
      method: 'get', 
      params: query 
    });
  },

  /** 查询执行日志详情 */
  getExecutionLogById(id: number) {
    return request<any, SkillExecutionLog>({ 
      url: `${BASE_URL}/ai/skills/logs/${id}`, 
      method: 'get' 
    });
  },
};

/**
 * @deprecated 使用 SkillAPI.getExecutionLogs() 代替
 */
export const SkillExecutionAPI = {
  page: SkillAPI.getExecutionLogs,
  getById: SkillAPI.getExecutionLogById,
};
