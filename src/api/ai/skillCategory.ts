/**
 * 技能分类 API
 *
 * 后端接口：
 *   GET    /api/ai/skill-categories       — 分页/全量查询分类列表
 *   POST   /api/ai/skill-categories       — 新增分类
 *   PUT    /api/ai/skill-categories/{id}  — 编辑分类
 *   DELETE /api/ai/skill-categories/{id}  — 删除分类
 */
import { request } from '@/utils/axios';
import type {
  SkillCategory,
  SkillCategoryQuery,
} from './types/skillCategory';

export type {
  SkillCategory,
  SkillCategoryQuery,
}

const BASE_URL = '/api';

export const SkillCategoryAPI = {
  /**
   * 获取全部分类列表（供分类树使用）
   *
   * 兼容两种后端响应格式：
   *   1. 直接返回数组 →  axios 拦截器剥离后得到 SkillCategory[]
   *   2. 返回 { list, total } → 本方法提取 list
   */
  async list() {
    const res = await request<any, SkillCategory[] | PageResult<SkillCategory[]>>({
      url: `${BASE_URL}/ai/skill-categories`,
      method: 'get',
    });
    if (res && typeof res === 'object' && 'list' in res) {
      return (res as PageResult<SkillCategory[]>).list;
    }
    return res as SkillCategory[];
  },

  /** 分页查询分类列表（未来扩展预留） */
  page(query: SkillCategoryQuery) {
    return request<any, PageResult<SkillCategory[]>>({
      url: `${BASE_URL}/ai/skill-categories`,
      method: 'get',
      params: query,
    });
  },

  /** 新增分类 */
  insert(data: Partial<SkillCategory>) {
    return request<any, any>({
      url: `${BASE_URL}/ai/skill-categories`,
      method: 'post',
      data,
    });
  },

  /** 编辑分类 */
  update(id: number, data: Partial<SkillCategory>) {
    return request<any, any>({
      url: `${BASE_URL}/ai/skill-categories/${id}`,
      method: 'put',
      data,
    });
  },

  /** 删除分类 */
  delete(id: number) {
    return request<any, any>({
      url: `${BASE_URL}/ai/skill-categories/${id}`,
      method: 'delete',
    });
  },
};
