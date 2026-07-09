import { useDictionaryStore } from '@/store/modules/dictionary'

interface DictItem {
  dictCode: string
  dictName: string
}

/**
 * 分红页字典 composable
 *
 * 使用 Store 统一缓存，不再维护本地 Map。
 * - typeOpts / statusOpts：分红类型 & 实施状态的下拉选项
 * - load()：并行加载两个字典
 * - dictName(opts, code)：根据 code 查中文名
 */
export function useDividendDict() {
  const dictStore = useDictionaryStore()

  const typeOpts = ref<DictItem[]>([])
  const statusOpts = ref<DictItem[]>([])

  async function load() {
    const [types, statuses] = await Promise.all([
      dictStore.getDictionaryList('stock_dividend_type'),
      dictStore.getDictionaryList('stock_dividend_status'),
    ])
    typeOpts.value = types
    statusOpts.value = statuses
  }

  function dictName(opts: DictItem[], code: string): string {
    return opts.find(o => o.dictCode === code)?.dictName || code
  }

  return { typeOpts, statusOpts, load, dictName }
}
