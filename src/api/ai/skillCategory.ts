/**
 * 技能分类 API
 *
 * 后端接口：
 *   GET    /api/ai/skill-categories       — 获取全部分类列表
 *   POST   /api/ai/skill-categories       — 新增分类
 *   PUT    /api/ai/skill-categories/{id}  — 编辑分类
 *   DELETE /api/ai/skill-categories/{id}  — 删除分类
 */
import { request } from '@/utils/axios';

const BASE_URL = '/api/ai/skill-categories';

/** 技能分类实体 */
export interface SkillCategory {
  id?: number;
  /** 分类名称 */
  name: string;
  /** 分类编码，唯一 */
  code: string;
  /** 图标 SVG 文件名 */
  icon?: string;
  /** 描述 */
  description?: string;
  /** 排序号 */
  sortOrder?: number;
  /** 状态：1启用 0禁用 */
  status?: number;
  /** 创建时间 */
  createdAt?: string;
  /** 更新时间 */
  updatedAt?: string;
}

export const SkillCategoryAPI = {
  /** 获取全部分类列表 */
  list() {
    return request<any, SkillCategory[]>({ url: BASE_URL, method: 'get' });
  },

  /** 新增分类 */
  insert(data: Partial<SkillCategory>) {
    return request<any, any>({ url: BASE_URL, method: 'post', data });
  },

  /** 编辑分类 */
  update(id: number, data: Partial<SkillCategory>) {
    return request<any, any>({ url: `${BASE_URL}/${id}`, method: 'put', data });
  },

  /** 删除分类 */
  delete(id: number) {
    return request<any, any>({ url: `${BASE_URL}/${id}`, method: 'delete' });
  },
};
