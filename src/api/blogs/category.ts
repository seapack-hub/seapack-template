/**
 * 博客分类 API 层
 */
import { getDictByType } from '@/api/system/baseInfo/dict.ts'
import type { BlogCategory } from './types/category'

export type { BlogCategory }

export const CategoryAPI = {
  /** 获取博客分类列表 */
  getList() {
    return getDictByType('blog_category') as Promise<BlogCategory[]>
  },
}
