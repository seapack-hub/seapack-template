// 类型定义（可选但推荐）
export interface NodeIconConfig {
  id: string
  label: string
  icon: string // 构建后的 URL
  width?: number
  height?: number
}

export const NODE_ICONS: Record<string, NodeIconConfig> = {
  client: { id: 'client', label: 'client', icon: new URL('./node-icons/client.png', import.meta.url).href, width: 80, height: 80 },
  cloud: { id: 'cloud', label: 'cloud', icon: new URL('./node-icons/cloud.png', import.meta.url).href, width: 80, height: 80 },
  api: { id: 'api', label: 'api', icon: new URL('./node-icons/api.png', import.meta.url).href, width: 80, height: 80 },
  http: { id: 'http', label: 'http', icon: new URL('./node-icons/http.png', import.meta.url).href, width: 80, height: 80 },
  sql: { id: 'sql', label: 'sql', icon: new URL('./node-icons/sql.png', import.meta.url).href, width: 80, height: 80 }
}