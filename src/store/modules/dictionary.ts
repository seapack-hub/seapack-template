import { defineStore } from 'pinia';

import { getDictByType } from '@/api/system/dict.ts'
/**
 * 定义并导出字典管理Store
 */
export const useDictionaryStore = defineStore('dictionary',()=>{

  const dictionary = ref(new Map<string, any[]>);
  
  /**
   * 根据指定类型、键值以及标签键（默认为'label'）获取字典项对应的标签值
   * @param type 字典类型字符串
   * @param key 需要查找的字典项键值
   * @param labelKey 指定获取字典项内的哪个属性作为标签，默认为'label'
   * @returns 返回找到的字典项标签值，未找到则返回空字符串
   */
  const getDictionary = async (type: string, key: string, labelKey: any = 'label') =>{
    const item = await getDictionaryItem(type, key)
    return item?.[labelKey] ?? ''
  };

  /**
   * 根据类型和键值获取字典项详细信息对象
   * @param type 字典类型字符串
   * @param key 需要查找的字典项键值
   * @returns 返回找到的字典项对象，未找到则返回undefined
   */
  const  getDictionaryItem = async (type: string, key: string, all: boolean = false)=> {
    const list = await getDictionaryList(type)
    if (!all) {
      if (key && typeof key === 'string' && key?.includes(',')) {
        const keys = key.split(',')
        return list?.filter((item: any) => keys.includes(item.value)) ?? []
      }
      return list?.filter((item: any) => item.value == key) ?? []
    } else {
      return list ?? []
    }
  };

  /**
   * 根据类型获取字典列表数据
   * @param type 字典类型字符串
   * @returns 返回一个Promise，解析为对应类型的字典项数组，优先从本地缓存中读取，如果不存在则调用API获取并缓存
   */
  const getDictionaryList = async (type: string): Promise<any[]> =>{
    if (dictionary.value.has(type)) {
      return dictionary.value?.get(type) ?? []
    } else {
      const res = await getDictByType(type)
        .then((res: any) => res)
        .catch(() => [])
      const list =
        res?.map((item: any) => {
          return {
            ...item,
            label: item.label,
            value: item.value
          }
        }) ?? []
      setDictionary(type, list)
      return list
    }
  };
  const setDictionary = (type: string, list: any[]) =>{
    dictionary.value.set(type, list);
  };
  return {
    dictionary,
    getDictionary,
    getDictionaryItem,
    getDictionaryList,
    setDictionary
  }
})