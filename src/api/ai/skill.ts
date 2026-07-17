/**
 * 技能管理 API
 *
 * 仅保留技能基础 CRUD 和参数管理接口。
 * 绑定、执行、调试、日志等接口已迁移至 Scene/Agent 体系。
 */
import { request } from '@/utils/axios';
import { serializeOptions, deserializeOptions } from '@/utils/skillParam';
import type { Skill, SkillQuery, SkillParam } from './types/skill';

export type { Skill, SkillQuery, SkillParam }

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
};
