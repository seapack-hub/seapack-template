import { ref, computed } from 'vue'

export interface Article {
  id: number
  title: string
  desc: string
  tag: string
  tagType: '' | 'success' | 'warning' | 'danger' | 'info'
  category: string
  date: string
  views: string
  icon: string
  coverBg: string
  link: string
}

export interface Project {
  name: string
  desc: string
  icon: string
  color: string
  bgColor: string
  url: string
}

export const tabs = [
  { key: 'all', label: '全部' },
  { key: 'vue', label: 'Vue3' },
  { key: 'java', label: 'Java' },
  { key: 'gis', label: 'GIS' },
  { key: 'other', label: '其他' },
]

export const articles = ref<Article[]>([
  {
    id: 1,
    title: 'Vue3 + Element Plus 实现企业级权限管理系统',
    desc: '从零搭建基于 RBAC 模型的后台管理系统，包含用户、角色、菜单权限的完整 CRUD 与动态路由加载。',
    tag: 'Vue3',
    tagType: '',
    category: 'vue',
    date: '2025-06-10',
    views: '1.2k',
    icon: '🔐',
    coverBg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    link: 'https://juejin.cn/post/7510000000000000001',
  },
  {
    id: 2,
    title: 'OpenLayers + Vue3 实现热力图与矢量图层',
    desc: '基于 OpenLayers 9 实现地图热力图、矢量标注、图层切换等 GIS 功能，附完整代码。',
    tag: 'GIS',
    tagType: 'success',
    category: 'gis',
    date: '2025-05-28',
    views: '856',
    icon: '🗺️',
    coverBg: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
    link: 'https://juejin.cn/post/7500000000000000001',
  },
  {
    id: 3,
    title: 'Cesium 3D 地图入门：从加载地球到粒子特效',
    desc: 'Cesium 快速上手指南，涵盖相机控制、3D 模型加载、GeoJSON 数据展示与雨雪粒子特效。',
    tag: 'GIS',
    tagType: 'success',
    category: 'gis',
    date: '2025-05-15',
    views: '1.5k',
    icon: '🌍',
    coverBg: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    link: 'https://juejin.cn/post/7490000000000000001',
  },
  {
    id: 4,
    title: 'SpringBoot + MyBatis-Plus 实现通用 CRUD 接口',
    desc: '封装一套通用的增删改查接口，减少重复代码，提升后端开发效率。',
    tag: 'Java',
    tagType: 'warning',
    category: 'java',
    date: '2025-04-20',
    views: '2.1k',
    icon: '☕',
    coverBg: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
    link: 'https://juejin.cn/post/7480000000000000001',
  },
  {
    id: 5,
    title: 'Vue3 电子签名组件：Canvas 实现手写签名',
    desc: '使用 Canvas API 实现支持压感、颜色选择、撤销重做的电子签名组件。',
    tag: 'Vue3',
    tagType: '',
    category: 'vue',
    date: '2025-04-08',
    views: '932',
    icon: '✍️',
    coverBg: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
    link: 'https://juejin.cn/post/7470000000000000001',
  },
  {
    id: 6,
    title: 'ECharts 实现中国地图与迁徙图可视化',
    desc: '基于 ECharts 5 实现中国地图下钻、迁徙动画、热力分布等数据可视化大屏常用图表。',
    tag: '其他',
    tagType: 'info',
    category: 'other',
    date: '2025-03-25',
    views: '1.8k',
    icon: '📊',
    coverBg: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
    link: 'https://juejin.cn/post/7460000000000000001',
  },
])

export const projects: Project[] = [
  {
    name: 'Sea Pack Template',
    desc: '企业级后台管理模板 · Vue3 + TypeScript + Vite',
    icon: 'home',
    color: '#409eff',
    bgColor: 'rgba(64,158,255,0.1)',
    url: 'https://gitee.com/zenghaifenga/seapack-template',
  },
  {
    name: 'Vue3 GIS Toolkit',
    desc: 'OpenLayers + Cesium 地图组件库',
    icon: 'gis',
    color: '#67c23a',
    bgColor: 'rgba(103,194,58,0.1)',
    url: 'https://gitee.com/zenghaifenga/seapack-template',
  },
  {
    name: 'Stock Monitor',
    desc: '股票实时监控与告警系统 · SpringBoot',
    icon: 'trend-charts',
    color: '#e6a23c',
    bgColor: 'rgba(230,162,60,0.1)',
    url: 'https://github.com/seapack-hub/SeaPackBackEnd',
  },

]

export function useFilteredArticles(activeTab: import('vue').Ref<string>) {
  return computed(() => {
    if (activeTab.value === 'all') return articles.value
    return articles.value.filter(a => a.category === activeTab.value)
  })
}

export function openLink(url: string) {
  window.open(url, '_blank')
}
