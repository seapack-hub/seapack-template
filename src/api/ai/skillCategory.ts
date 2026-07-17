/**
 * 技能分类 API
 *
 * 后端接口：
 *   GET  /api/ai/skill-categories/page/list  — 分页查询分类列表
 *   GET  /api/ai/skill-categories/detail/{id} — 查询分类详情
 *   POST /api/ai/skill-categories/insert      — 新增分类
 *   POST /api/ai/skill-categories/update       — 编辑分类
 *   POST /api/ai/skill-categories/delete/{id}  — 删除分类
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

const BASE_URL = '/api/ai/skill-categories';

export const SkillCategoryAPI = {

  /** 分页查询分类列表 */
  page(query: SkillCategoryQuery) {
    return request<any, PageResult<SkillCategory[]>>({
      url: `${BASE_URL}/page/list`,
      method: 'get',
      params: query,
    });
  },

  /** 查询分类详情 */
  detail(id: number) {
    return request<any, SkillCategory>({
      url: `${BASE_URL}/detail/${id}`,
      method: 'get',
    });
  },

  /** 新增分类 */
  insert(data: Partial<SkillCategory>) {
    return request<any, any>({
      url: `${BASE_URL}/insert`,
      method: 'post',
      data,
    });
  },

  /** 编辑分类 */
  update(id: number, data: Partial<SkillCategory>) {
    return request<any, any>({
      url: `${BASE_URL}/update`,
      method: 'post',
      data: { ...data, id },
    });
  },

  /** 删除分类 */
  delete(id: number) {
    return request<any, any>({
      url: `${BASE_URL}/delete/${id}`,
      method: 'post',
    });
  },
};
