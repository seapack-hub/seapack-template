/**
 * 技能分类 API
 *
 * 后端接口：
 *   GET    /api/ai/skill-categories       — 分页/全量查询分类列表
 *   POST   /api/ai/skill-categories       — 新增分类
 *   PUT    /api/ai/skill-categories/{id}  — 编辑分类
 *   DELETE /api/ai/skill-categories/{id}  — 删除分类
 *
 * 注意：
 *   list() 为全量查询（用于分类树 + 表单下拉），返回 SkillCategory[]
 *   page() 为分页查询（用于未来扩展），返回 { list: SkillCategory[], total: number }
 *   后端若只提供分页接口，建议 pageSize 设为较大值（如 999）一次性拉取
 */
import { request } from '@/utils/axios';

const BASE_URL = '/api';

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

/** 技能分类分页查询参数 */
export interface SkillCategoryQuery {
  pageNum: number;
  pageSize: number;
  /** 关键词搜索（名称/编码） */
  keyword?: string;
  /** 状态筛选 */
  status?: number;
}

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
    // 兼容分页包裹格式：若响应含 list 字段则提取，否则视为直接返回的数组
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
