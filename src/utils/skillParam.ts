/**
 * 技能参数 / 模块绑定 工具函数
 *
 * - options →  select 类型参数的选项列表，后端存 JSON 字符串
 * - config  →  模块绑定的展示配置，后端存 JSON 字符串
 */

/**
 * 将前端数组格式 options 序列化为后端 JSON String
 * @example
 *   serializeOptions([{label:'技术教程',value:'教程'}])
 *   // → '[{"label":"技术教程","value":"教程"}]'
 */
export function serializeOptions(options?: { label: string; value: string }[]): string | undefined {
  if (!options || !options.length) return undefined
  return JSON.stringify(options.map(o => ({ label: o.label, value: o.value })))
}

/**
 * 将后端 JSON String 格式 options 反序列化为前端数组格式
 * 优先 JSON.parse，降级兼容旧版 label=value 格式
 * @example
 *   deserializeOptions('[{"label":"技术教程","value":"教程"}]')
 *   // → [{label:'技术教程', value:'教程'}]
 */
export function deserializeOptions(optionsStr?: string | null): { label: string; value: string }[] | undefined {
  if (!optionsStr) return undefined
  try {
    const parsed = JSON.parse(optionsStr)
    if (Array.isArray(parsed)) return parsed
  } catch {
    if (optionsStr.includes('=')) {
      return optionsStr.split('\n').filter(Boolean).map(line => {
        const [label = '', value = ''] = line.split('=')
        return { label: label.trim(), value: value.trim() }
      })
    }
  }
  return undefined
}

/**
 * 将前端对象格式 config 序列化为后端 JSON String
 * @example serializeConfig({ buttonText: 'AI写作' }) → '{"buttonText":"AI写作"}'
 */
export function serializeConfig(config?: Record<string, any>): string | undefined {
  if (!config || !Object.keys(config).length) return undefined
  return JSON.stringify(config)
}

/**
 * 将后端 JSON String 格式 config 反序列化为前端对象格式
 * @example deserializeConfig('{"buttonText":"AI写作"}') → { buttonText: 'AI写作' }
 */
export function deserializeConfig(configStr?: string | null): Record<string, any> | undefined {
  if (!configStr) return undefined
  try {
    return JSON.parse(configStr)
  } catch {
    return undefined
  }
}
