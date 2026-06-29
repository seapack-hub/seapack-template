/**
 * 博客分类 API 层
 * 分类数据复用系统 dict 表（dictType = blog_category）
 */
import { getDictByType } from '@/api/system/baseInfo/dict.ts'

/** 博客分类（来自系统字典表） */
export interface BlogCategory {
  dictCode: string        // 分类 key（如 vue/java/gis/other）
  dictName: string        // 分类名称（如 Vue3/Java/GIS/其他）
  orderNum: number
}

export const CategoryAPI = {
  /** 获取博客分类列表 */
  getList() {
    return getDictByType('blog_category') as Promise<BlogCategory[]>
  },
}
