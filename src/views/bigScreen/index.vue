<template>
  <!-- DataV 智慧运营大屏总入口 -->
  <div class="big-screen-root">
    <div class="back-home-btn" title="返回主页" @click="goHome">
      <el-icon size="20"><HomeFilled /></el-icon>
    </div>
    <!-- 自适应缩放容器：固定 1920x1080 设计稿，自动适配任意分辨率 -->
    <ScreenFrame :theme="currentTheme" :design-width="1920" :design-height="1080">
      <!-- ========== 顶栏：标题 + 时钟 + 主题切换 ========== -->
      <header class="screen-header" :style="{ background: currentTheme.headerBg }">
        <div class="screen-header-decoration left" />
        <h1 class="screen-header-title">{{ title }}</h1>
        <div class="screen-header-right">
          <span class="screen-header-time">{{ currentTime }}</span>
          <!-- 3 个主题色圆点切换 -->
          <div class="screen-header-themes">
            <span
              v-for="(t, key) in themes"
              :key="key"
              class="screen-header-theme-dot"
              :class="{ active: themeKey === key }"
              :style="{ background: t.primaryColor }"
              :title="t.name"
              @click="switchTheme(key)"
            />
          </div>
        </div>
        <div class="screen-header-decoration right" />
      </header>

      <!-- ========== 主体：三栏布局 ========== -->
      <main class="screen-main">
        <!-- 左栏：KPI 指标卡 + 营收趋势折线图 -->
        <section class="screen-panel screen-panel-left">
          <DecorationBorder class="screen-panel-section screen-kpi-section">
            <div class="screen-kpi-grid">
              <KpiCard
                v-for="(kpi, i) in kpiList"
                :key="i"
                v-bind="kpi"
                :primary-color="currentTheme.primaryColor"
                :text-color="currentTheme.textColor"
                :text-secondary="currentTheme.textSecondary"
              />
            </div>
          </DecorationBorder>

          <DecorationBorder class="screen-panel-section screen-chart-section">
            <div class="screen-section-title">营收趋势</div>
            <BaseCharts :options="lineOptions" width="100%" height="100%" />
          </DecorationBorder>
        </section>

        <!-- 中栏：中国地图（热力着色） -->
        <section class="screen-panel screen-panel-center">
          <DecorationBorder class="screen-map-wrapper">
            <ScreenMap
              :data="provinceData"
              :primary-color="currentTheme.primaryColor"
              :accent-color="currentTheme.accentColor"
            />
          </DecorationBorder>
        </section>

        <!-- 右栏：部门分布饼图 + 最新订单滚动表格 -->
        <section class="screen-panel screen-panel-right">
          <DecorationBorder class="screen-panel-section screen-chart-section">
            <div class="screen-section-title">部门分布</div>
            <BaseCharts :options="pieOptions" width="100%" height="100%" />
          </DecorationBorder>

          <DecorationBorder class="screen-panel-section screen-table-section">
            <div class="screen-section-title">最新订单</div>
            <ScrollTable
              :data="tableData"
              :columns="tableColumns"
              :primary-color="currentTheme.primaryColor"
              :text-color="currentTheme.textColor"
              :text-secondary="currentTheme.textSecondary"
              :border-color="currentTheme.borderColor"
            >
              <!-- 状态列自定义渲染 -->
              <template #cell-status="{ row }">
                <span :class="'status-tag status-' + row.status">
                  {{ statusMap[row.status as string] }}
                </span>
              </template>
            </ScrollTable>
          </DecorationBorder>
        </section>
      </main>
    </ScreenFrame>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { HomeFilled } from '@element-plus/icons-vue'
import type { EChartsOption } from 'echarts'
import ScreenFrame from './layout/ScreenFrame.vue'
import DecorationBorder from './components/DecorationBorder.vue'
import KpiCard from './components/KpiCard.vue'
import ScrollTable from './components/ScrollTable.vue'
import ScreenMap from './components/ScreenMap.vue'
import { themes, defaultTheme, type ScreenTheme } from './config/styles'
import { mockData, type TableRow } from './config/mock'
import { useAutoRefresh } from './composables/useAutoRefresh'

// ========== 主题切换 ==========
const themeKey = ref<string>('darkBlue')
const currentTheme = computed<ScreenTheme>(() => themes[themeKey.value] || defaultTheme)

const switchTheme = (key: string) => {
  themeKey.value = key
}

// ========== 标题与时钟 ==========
const title = ref('智慧运营大数据中心')
const currentTime = ref('')
let timeTimer: ReturnType<typeof setInterval> | null = null

const updateTime = () => {
  const d = new Date()
  currentTime.value = d.toLocaleString('zh-CN', { hour12: false })
}

onMounted(() => {
  updateTime()
  timeTimer = setInterval(updateTime, 1000)
})

onUnmounted(() => {
  if (timeTimer) clearInterval(timeTimer)
})

// ========== 数据 ==========
const kpiList = ref(mockData.kpiList)
const provinceData = ref(mockData.provinceData)
const tableData = ref<TableRow[]>(mockData.tableData)

// 表格状态映射：英文 → 中文
const statusMap: Record<string, string> = {
  success: '已完成',
  pending: '处理中',
  failed: '已失败',
}

const tableColumns = [
  { key: 'id', label: 'ID', width: '50px' },
  { key: 'name', label: '用户名', width: '80px' },
  { key: 'department', label: '部门', width: '70px' },
  { key: 'amount', label: '金额', width: '80px' },
  { key: 'status', label: '状态', width: '65px' },
  { key: 'time', label: '时间', width: '130px' },
]

// ========== ECharts 配置 ==========
// 折线图：营收趋势（带渐变面积）
const lineOptions = computed<EChartsOption>(() => ({
  tooltip: {
    trigger: 'axis',
    backgroundColor: 'rgba(10,14,23,0.85)',
    borderColor: currentTheme.value.primaryColor,
    textStyle: { color: '#fff', fontSize: 12 },
  },
  legend: {
    data: mockData.lineSeries.map((s) => s.name),
    textStyle: { color: 'rgba(255,255,255,0.65)', fontSize: 11 },
    bottom: 0,
  },
  grid: { top: 20, right: 20, bottom: 40, left: 40 },
  xAxis: {
    type: 'category',
    data: mockData.lineCategories,
    axisLine: { lineStyle: { color: currentTheme.value.borderColor } },
    axisLabel: { color: currentTheme.value.textSecondary, fontSize: 10 },
    splitLine: { show: false },
  },
  yAxis: {
    type: 'value',
    splitLine: { lineStyle: { color: currentTheme.value.borderColor, type: 'dashed' } },
    axisLabel: { color: currentTheme.value.textSecondary, fontSize: 10 },
  },
  series: mockData.lineSeries.map((s) => ({
    name: s.name,
    type: 'line',
    smooth: true,
    symbol: 'circle',
    symbolSize: 4,
    data: s.data,
    lineStyle: { width: 2 },
    // 面积渐变填充
    areaStyle: {
      color: {
        type: 'linear',
        x: 0, y: 0, x2: 0, y2: 1,
        colorStops: [
          { offset: 0, color: currentTheme.value.primaryColor + '60' },
          { offset: 1, color: currentTheme.value.primaryColor + '05' },
        ],
      },
    },
  })),
}))

// 饼图：部门分布（环形）
const pieOptions = computed<EChartsOption>(() => ({
  tooltip: {
    trigger: 'item',
    backgroundColor: 'rgba(10,14,23,0.85)',
    borderColor: currentTheme.value.primaryColor,
    textStyle: { color: '#fff', fontSize: 12 },
    formatter: '{b}: {c}%',
  },
  series: [
    {
      type: 'pie',
      radius: ['35%', '60%'],  // 环形
      center: ['50%', '45%'],
      avoidLabelOverlap: true,
      itemStyle: {
        borderRadius: 4,
        borderColor: currentTheme.value.bgColor,
        borderWidth: 2,
      },
      label: {
        show: true,
        color: currentTheme.value.textColor,
        fontSize: 11,
        formatter: '{b}\n{d}%',
      },
      labelLine: {
        lineStyle: { color: currentTheme.value.borderColor },
      },
      // 5 个扇区使用不同颜色
      data: mockData.pieData.map((item, i) => ({
        ...item,
        itemStyle: {
          color: [currentTheme.value.primaryColor, currentTheme.value.accentColor, '#ff9800', '#e040fb', '#00e676'][i],
        },
      })),
    },
  ],
}))

// ========== 模拟轮询：每 10 秒微调数据 ==========
useAutoRefresh(() => {
  const now = Date.now()
  kpiList.value = kpiList.value.map((k) => ({
    ...k,
    value: k.value + Math.round((Math.random() - 0.5) * k.value * 0.05),
  }))
  provinceData.value = provinceData.value.map((p) => ({
    ...p,
    value: Math.max(0, p.value + Math.round((Math.random() - 0.5) * p.value * 0.1)),
  }))
  tableData.value = [
    ...mockData.tableData.slice(0, 3).map((row) => ({
      ...row,
      id: Math.floor(Math.random() * 10000),
      time: new Date(now - Math.random() * 86400000).toLocaleString('zh-CN', { hour12: false }),
    })),
    ...tableData.value.slice(0, -3),
  ]
}, 10000)

const router = useRouter()
function goHome() {
  const homeUrl = `${window.location.origin}/menuTab`
  if (window.opener) {
    window.close()
  } else {
    window.location.href = homeUrl
  }
}
</script>

<style lang="scss">
@use './css/screen.scss';

.big-screen-root {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}

.back-home-btn {
  position: fixed;
  top: 16px;
  left: 16px;
  z-index: 9999;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.4);
  color: #fff;
  cursor: pointer;
  transition: background 0.2s;
  &:hover { background: rgba(0, 0, 0, 0.7); }
}

// ===== 顶栏 =====
.screen-header {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 80px;
  z-index: 10;

  &-decoration {
    position: absolute;
    top: 0;
    width: 200px;
    height: 100%;
    opacity: 0.15;

    &.left {
      left: 0;
      background: linear-gradient(90deg, var(--primary) 0%, transparent 100%);
      clip-path: polygon(0 0, 100% 0, 80% 100%, 0 100%);
    }

    &.right {
      right: 0;
      background: linear-gradient(270deg, var(--primary) 0%, transparent 100%);
      clip-path: polygon(20% 0, 100% 0, 100% 100%, 0 100%);
    }
  }

  &-title {
    font-size: 28px;
    font-weight: 700;
    color: var(--text);
    letter-spacing: 6px;
    text-shadow: 0 0 20px var(--primary), 0 0 40px color-mix(in srgb, var(--primary) 50%, transparent);
  }

  &-right {
    position: absolute;
    right: 30px;
    display: flex;
    align-items: center;
    gap: 16px;
  }

  &-time {
    font-size: 16px;
    color: var(--text-sec);
    font-variant-numeric: tabular-nums;
    letter-spacing: 1px;
  }

  &-themes { display: flex; gap: 8px; }

  // 主题色圆点切换按钮
  &-theme-dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    cursor: pointer;
    opacity: 0.4;
    transition: all 0.3s;
    border: 2px solid transparent;

    &:hover { opacity: 0.8; transform: scale(1.2); }

    &.active {
      opacity: 1;
      transform: scale(1.2);
      border-color: rgba(255, 255, 255, 0.6);
      box-shadow: 0 0 8px var(--primary);
    }
  }
}

// ===== 主体三栏布局 =====
.screen-main {
  display: flex;
  height: calc(100% - 80px);
  padding: 16px 20px 20px;
  gap: 16px;
}

.screen-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;

  &-left { width: 25%; }
  &-center { flex: 1; min-width: 0; }
  &-right { width: 25%; }
}

.screen-panel-section {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.screen-kpi-section {
  flex: 0 0 auto;
  height: auto;
}

// 2x2 KPI 网格
.screen-kpi-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

// 区块标题
.screen-section-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--primary);
  margin-bottom: 12px;
  padding-left: 12px;
  border-left: 3px solid var(--primary);
  line-height: 1;
}

.screen-chart-section {
  :deep(.decoration-border-content) {
    display: flex;
    flex-direction: column;
  }
}

.screen-map-wrapper {
  flex: 1;
  min-height: 0;
}

.screen-table-section {
  flex: 1;
  min-height: 0;
  :deep(.decoration-border-content) {
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
}

// 表格状态标签
.status-tag {
  display: inline-block;
  padding: 1px 8px;
  border-radius: 3px;
  font-size: 11px;
  line-height: 20px;

  &.status-success { color: #00e676; background: rgba(0, 230, 118, 0.1); }
  &.status-pending { color: #ffb300; background: rgba(255, 179, 0, 0.1); }
  &.status-failed { color: #ff5252; background: rgba(255, 82, 82, 0.1); }
}
</style>
