import { useDictionaryStore } from '@/store/modules/dictionary'

/**
 * 字典格式化器 - 用于表格列格式化
 * @param dictType 字典类型
 * @returns 格式化函数 (value: string) => string
 *
 * 使用方式：
 *   const columns = [
 *     { prop: 'status', label: '状态', formatter: dictFormatter('common_status') }
 *   ]
 */
export function dictFormatter(dictType: string) {
  const dictStore = useDictionaryStore()
  return async (row: any, column: any, cellValue: string) => {
    if (!cellValue) return ''
    return await dictStore.getDictionary(dictType, cellValue)
  }
}

/**
 * 字典标签类型映射 - 用于 el-tag 的 type 属性
 * @param tagMap dictCode → tagType 映射
 * @returns 格式化函数 (value: string) => 'success' | 'warning' | 'danger' | 'info'
 *
 * 使用方式：
 *   const statusTagType = dictTagType({ '1': 'success', '0': 'danger' })
 *   // 模板中：<el-tag :type="statusTagType(row.status)">
 */
export function dictTagType(tagMap: Record<string, string>) {
  return (value: string | number): 'success' | 'warning' | 'danger' | 'info' => {
    return (tagMap[String(value)] || 'info') as 'success' | 'warning' | 'danger' | 'info'
  }
}

/**
 * 字典名称查询（一次性） - 用于模板中直接显示中文名
 * @param dictType 字典类型
 * @param value 字典编码
 * @returns 中文名称
 *
 * 使用方式（需在 setup 中使用）：
 *   const dictStore = useDictionaryStore()
 *   const statusName = computed(() => dictStore.getDictionary('common_status', form.status))
 */
