export interface FeatureItem {
  name: string
  title: string
  desc: string
  icon: string
  route: string
  color: string
  stat?: string
}

export const features: FeatureItem[] = [
  {
    name: 'genericComponent',
    title: '组件封装',
    desc: '电子签名 · 表格封装 · 富文本编辑器',
    icon: 'generic-com',
    route: '/devTools/genericComponent',
    color: '#3B82F6',
    stat: '3项',
  },
  {
    name: 'graphical',
    title: '图形化管理',
    desc: '基于 AntV X6 的流程图设计工具',
    icon: 'graphical',
    route: '/devTools/graphical',
    color: '#8B5CF6',
    stat: '1项',
  },
  {
    name: 'echarts',
    title: 'ECharts 图表',
    desc: '中国地图 · 迁徙图 · 柱状图 · 关系图 · 雷达图',
    icon: 'pie-chart',
    route: '/devTools/echarts',
    color: '#06B6D4',
    stat: '5项',
  },
  {
    name: 'devDoc',
    title: '开发文档',
    desc: '电子签名实现 · 水印方案 · SVG图标封装 · 原型链 · 模板引擎',
    icon: 'document',
    route: '/devTools/doc',
    color: '#10B981',
    stat: '5篇',
  },
]
