// 统一封装 ECharts 按需注册，避免业务代码直接全量引入 `echarts`
import * as echarts from 'echarts/core'
import {
  // 项目当前用到的图表类型
  BarChart,
  CandlestickChart,
  CustomChart,
  EffectScatterChart,
  GraphChart,
  LineChart,
  LinesChart,
  MapChart,
  RadarChart,
  ScatterChart,
} from 'echarts/charts'
import {
  // 项目当前用到的基础组件
  GeoComponent,
  GridComponent,
  LegendComponent,
  TitleComponent,
  TooltipComponent,
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

// 只注册实际使用到的模块，缩小构建产物体积
echarts.use([
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
  GeoComponent,
  BarChart,
  LineChart,
  CandlestickChart,
  MapChart,
  ScatterChart,
  EffectScatterChart,
  LinesChart,
  GraphChart,
  RadarChart,
  CustomChart,
  CanvasRenderer,
])

let echartsGLLoaded = false

// 3D 图表较少使用，切到对应页面时再异步加载 echarts-gl
export async function ensureEchartsGL() {
  if (echartsGLLoaded) return
  // @ts-expect-error echarts-gl has no type declarations
  await import('echarts-gl')
  echartsGLLoaded = true
}

// 对外暴露统一的 echarts 实例，供业务组件复用
export { echarts }
