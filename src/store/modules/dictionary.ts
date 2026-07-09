import { defineStore } from 'pinia';
import { getDictByType } from '@/api/system/baseInfo/dict.ts'

/**
 * 字典 Store
 *
 * 统一管理所有字典数据的获取与缓存。
 * 同一 dictType 只会调用一次 API，后续命中内存缓存直接返回。
 *
 * 使用方式：
 *   const dictStore = useDictionaryStore()
 *   const options = await dictStore.getDictOptions('exchange_type')  // el-select 用
 *   const list = await dictStore.getDictionaryList('exchange_type')  // 完整列表
 *   const label = await dictStore.getDictionary('exchange_type', 'SH')  // 查单个名称
 */
export const useDictionaryStore = defineStore('dictionary', () => {

  /** 缓存池：dictType → 字典项数组 */
  const cache = ref(new Map<string, any[]>())

  /**
   * 获取字典列表（核心方法，带缓存）
   *
   * 首次调用请求 API 并缓存，后续直接从缓存读取。
   * 返回的每项已映射为 { ...原字段, label: dictName, value: dictCode }
   */
  async function getDictionaryList(type: string): Promise<any[]> {
    if (cache.value.has(type)) {
      return cache.value.get(type) ?? []
    }
    const res = await getDictByType(type).catch(() => [])
    const list = (Array.isArray(res) ? res : []).map((item: any) => ({
      ...item,
      label: item.dictName,
      value: item.dictCode,
    }))
    cache.value.set(type, list)
    return list
  }

  /**
   * 获取 el-select / el-option 格式的选项列表
   *
   * 返回 [{ label: '沪市', value: 'SH', dictCode: 'SH', dictName: '沪市', ... }]
   */
  async function getDictOptions(type: string): Promise<any[]> {
    return getDictionaryList(type)
  }

  /**
   * 根据 dictCode 查单个字典项的名称
   *
   * @param type 字典类型
   * @param key 字典编码（dictCode）
   * @param labelKey 返回哪个字段作为名称，默认 'label'（即 dictName）
   */
  async function getDictionary(type: string, key: string, labelKey: string = 'label'): Promise<string> {
    const list = await getDictionaryList(type)
    if (key && key.includes(',')) {
      const keys = key.split(',')
      const matched = list.filter((item: any) => keys.includes(item.value))
      return matched.map((item: any) => item[labelKey] ?? '').join('，')
    }
    const item = list.find((item: any) => item.value == key)
    return item?.[labelKey] ?? ''
  }

  /**
   * 根据 dictCode 查单个字典项完整对象
   */
  async function getDictionaryItem(type: string, key: string, all: boolean = false): Promise<any | any[]> {
    const list = await getDictionaryList(type)
    if (all) return list
    if (key && key.includes(',')) {
      const keys = key.split(',')
      return list.filter((item: any) => keys.includes(item.value))
    }
    return list.filter((item: any) => item.value == key)
  }

  /**
   * 批量预加载字典（应用启动时调用，静默加载）
   *
   * @param types 字典类型数组
   */
  async function preload(types: string[]): Promise<void> {
    await Promise.allSettled(types.map(type => getDictionaryList(type)))
  }

  /**
   * 清空指定字典缓存
   */
  function removeDictionary(type: string): void {
    cache.value.delete(type)
  }

  /**
   * 清空所有字典缓存
   */
  function clearDictionary(): void {
    cache.value.clear()
  }

  return {
    cache,
    getDictionaryList,
    getDictOptions,
    getDictionary,
    getDictionaryItem,
    preload,
    removeDictionary,
    clearDictionary,
  }
})
