import { getDictByType } from '@/api/system/dict'
import type { Ref } from 'vue'

interface DictItem {
  dictCode: string
  dictName: string
}

/** 模块级缓存：dictType → DictItem[]，避免重复请求后端 */
const cache = new Map<string, DictItem[]>()

/** 按 dictType 加载字典，命中缓存则直接返回 */
async function loadDict(dictType: string): Promise<DictItem[]> {
  if (cache.has(dictType)) return cache.get(dictType)!
  const res = await getDictByType(dictType).catch(() => [])
  const list = Array.isArray(res) ? res : []
  cache.set(dictType, list)
  return list
}

/**
 * 分红页字典 composable
 * - typeOpts / statusOpts：分红类型 & 实施状态的下拉选项
 * - load()：并行加载两个字典，多个组件共享同一份缓存
 * - dictName(opts, code)：根据 code 查中文名，查不到回退显示 code
 */
export function useDividendDict() {
  const typeOpts = ref<DictItem[]>([])
  const statusOpts = ref<DictItem[]>([])

  async function load() {
    const [types, statuses] = await Promise.all([
      loadDict('stock_dividend_type'),
      loadDict('stock_dividend_status'),
    ])
    typeOpts.value = types
    statusOpts.value = statuses
  }

  function dictName(opts: Ref<DictItem[]>, code: string): string {
    return opts.value.find(o => o.dictCode === code)?.dictName || code
  }

  return { typeOpts, statusOpts, load, dictName }
}
