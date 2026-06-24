// 大屏全量 Mock 数据，零后端依赖即可展示所有图表/表格

// KPI 指标卡数据
export interface KpiItem {
  label: string        // 指标名称
  value: number        // 数值
  unit: string         // 单位（人/万元/笔）
  icon: string         // 图标标识（预留）
  trend: 'up' | 'down' // 涨跌方向
  trendValue: string   // 涨跌百分比
}

// 省份地图数据
export interface ProvinceData {
  name: string
  value: number
}

// 滚动表格行数据
export interface TableRow {
  id: number
  name: string
  department: string
  amount: number
  status: 'success' | 'pending' | 'failed'
  time: string
}

// 折线图系列
export interface LineSeries {
  name: string
  data: number[]
}

// 饼图数据项
export interface PieItem {
  name: string
  value: number
}

// 柱状图系列（预留）
export interface BarSeries {
  name: string
  data: number[]
}

// 全量 Mock 数据结构
export interface MockData {
  kpiList: KpiItem[]
  provinceData: ProvinceData[]
  tableData: TableRow[]
  lineCategories: string[]
  lineSeries: LineSeries[]
  pieData: PieItem[]
  barCategories: string[]
  barSeries: BarSeries[]
}

export const mockData: MockData = {
  // 顶部 4 个 KPI 指标卡
  kpiList: [
    { label: '总用户数', value: 128456, unit: '人', icon: 'users', trend: 'up', trendValue: '+12.5%' },
    { label: '活跃用户', value: 52341, unit: '人', icon: 'activity', trend: 'up', trendValue: '+8.3%' },
    { label: '总营收', value: 3862.5, unit: '万元', icon: 'revenue', trend: 'up', trendValue: '+23.1%' },
    { label: '订单数', value: 8923, unit: '笔', icon: 'orders', trend: 'down', trendValue: '-3.2%' },
  ],
  // 34 个省级行政区地图数据
  provinceData: [
    { name: '广东', value: 98320 }, { name: '江苏', value: 85210 },
    { name: '浙江', value: 72340 }, { name: '山东', value: 65430 },
    { name: '河南', value: 58920 }, { name: '四川', value: 52180 },
    { name: '湖北', value: 48320 }, { name: '湖南', value: 42190 },
    { name: '福建', value: 39210 }, { name: '安徽', value: 36280 },
    { name: '北京', value: 34120 }, { name: '上海', value: 33210 },
    { name: '河北', value: 29830 }, { name: '陕西', value: 27120 },
    { name: '辽宁', value: 25210 }, { name: '江西', value: 23180 },
    { name: '重庆', value: 21890 }, { name: '云南', value: 20120 },
    { name: '贵州', value: 18210 }, { name: '山西', value: 16980 },
    { name: '吉林', value: 15210 }, { name: '黑龙江', value: 14830 },
    { name: '甘肃', value: 13210 }, { name: '内蒙古', value: 12180 },
    { name: '新疆', value: 11210 }, { name: '海南', value: 9830 },
    { name: '宁夏', value: 8210 }, { name: '青海', value: 7210 },
    { name: '西藏', value: 5820 }, { name: '天津', value: 15210 },
    { name: '广西', value: 21980 }, { name: '香港', value: 5210 },
    { name: '澳门', value: 2810 }, { name: '台湾', value: 13210 },
  ],
  // 30 条滚动表格数据
  tableData: Array.from({ length: 30 }, (_, i) => ({
    id: i + 1,
    name: `用户${String(i + 1).padStart(4, '0')}`,
    department: ['技术部', '市场部', '运营部', '财务部', '人事部'][i % 5],
    amount: parseFloat((Math.random() * 10000 + 500).toFixed(2)),
    status: (['success', 'pending', 'failed'] as const)[i % 3],
    time: `2026-06-${String((i % 30) + 1).padStart(2, '0')} ${String(8 + (i % 10)).padStart(2, '0')}:${String(i % 60).padStart(2, '0')}:00`,
  })),
  // 折线图——月度趋势
  lineCategories: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
  lineSeries: [
    { name: '2025年', data: [820, 932, 901, 934, 1290, 1330, 1320, 1320, 1400, 1450, 1500, 1620] },
    { name: '2026年', data: [1120, 1132, 1201, 1234, 1390, 1430, 1420, 1480, 1520, 1580, 1650, 1720] },
  ],
  // 饼图——部门分布
  pieData: [
    { name: '技术研发', value: 35 }, { name: '市场营销', value: 25 },
    { name: '运营支持', value: 20 }, { name: '财务管理', value: 12 },
    { name: '人事行政', value: 8 },
  ],
  // 柱状图——城市对比（预留）
  barCategories: ['北京', '上海', '广州', '深圳', '杭州', '成都', '武汉', '南京'],
  barSeries: [
    { name: '本季度', data: [420, 380, 350, 410, 280, 230, 210, 190] },
    { name: '上季度', data: [380, 350, 320, 370, 250, 200, 180, 160] },
  ],
}
