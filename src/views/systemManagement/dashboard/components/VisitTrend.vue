<!--  线 + 柱混合图 -->
<template>
  <el-card>
    <template #header>
      <div class="trend-header flex-x-between">
        <div class="header-title flex-y-center">
          访问趋势
          <el-tooltip
            effect="dark"
            content="点击试试下载"
            placement="bottom"
          >
            <el-icon
              class="cursor-pointer hover:color-#4080FF ml-1"
              name="el-icon-download"
              @click="handleDownloadChart"
            >
              <Download />
            </el-icon>
          </el-tooltip>
        </div>

        <el-radio-group
          v-model="recentDaysRange"
          size="small"
          @change="handleDateRangeChange"
        >
          <el-radio-button
            label="近7天"
            :value="7"
          />
          <el-radio-button
            label="近30天"
            :value="30"
          />
        </el-radio-group>
      </div>
    </template>

    <div
      :id="id"
      :class="className"
      :style="{ height, width }"
    />
  </el-card>
</template>

<script setup lang="ts">
import * as echarts from 'echarts';
//import LogAPI, { VisitTrendVO } from '@/api/system/log';
//import { dayjs } from 'element-plus';
interface VisitTrendVO {
  /** 日期列表 */
  dates: string[];
  /** 浏览量(PV) */
  pvList: number[];
  /** 访客数(UV) */
  uvList: number[];
  /** IP数 */
  ipList: number[];
}
// 日期范围
const recentDaysRange = ref(7);
// 图表对象
const chart: Ref<echarts.ECharts | null> = ref(null);

const props = defineProps({
  id: {
    type: String,
    default: 'VisitTrend'
  },
  className: {
    type: String,
    default: ''
  },
  width: {
    type: String,
    default: '200px',
    required: true
  },
  height: {
    type: String,
    default: '200px',
    required: true
  }
});

/** 设置图表  */
const setChartOptions = (data: VisitTrendVO) => {
  if (!chart.value) {
    return;
  }

  const options = {
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['浏览量(PV)', 'IP'],
      bottom: 0
    },
    grid: {
      left: '1%',
      right: '5%',
      bottom: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: data.dates
    },
    yAxis: {
      type: 'value',
      splitLine: {
        show: true,
        lineStyle: {
          type: 'dashed'
        }
      }
    },
    series: [
      {
        name: '浏览量(PV)',
        type: 'line',
        data: data.pvList,
        areaStyle: {
          color: 'rgba(64, 158, 255, 0.1)'
        },
        smooth: true,
        itemStyle: {
          color: '#4080FF'
        },
        lineStyle: {
          color: '#4080FF'
        }
      },
      {
        name: 'IP',
        type: 'line',
        data: data.ipList,
        areaStyle: {
          color: 'rgba(103, 194, 58, 0.1)'
        },
        smooth: true,
        itemStyle: {
          color: '#67C23A'
        },
        lineStyle: {
          color: '#67C23A'
        }
      }
    ]
  };

  chart.value.setOption(options);
};

// 加载数据
const loadData = () => {
  // const endDate = new Date();
  // const startDate = dayjs()
  //   .subtract(recentDaysRange.value - 1, 'day')
  //   .toDate();

  // const visitTrendQuery = {
  //   startDate: dayjs(startDate).format('YYYY-MM-DD'),
  //   endDate: dayjs(endDate).format('YYYY-MM-DD')
  // };

  // LogAPI.getVisitTrend(visitTrendQuery).then((data) => {
  //   setChartOptions(data);
  // });
  if (recentDaysRange.value === 7) {
    const data = {
      dates: ['2025-06-12', '2025-06-13', '2025-06-14', '2025-06-15', '2025-06-16', '2025-06-17', '2025-06-18'],
      pvList: [4705, 3822, 1808, 1547, 4681, 5101, 3258],
      ipList: [483, 421, 200, 158, 442, 488, 358],
      uvList: []
    };
    setChartOptions(data);
  } else {
    const data = {
      dates: [
        '2025-05-20',
        '2025-05-21',
        '2025-05-22',
        '2025-05-23',
        '2025-05-24',
        '2025-05-25',
        '2025-05-26',
        '2025-05-27',
        '2025-05-28',
        '2025-05-29',
        '2025-05-30',
        '2025-05-31',
        '2025-06-01',
        '2025-06-02',
        '2025-06-03',
        '2025-06-04',
        '2025-06-05',
        '2025-06-06',
        '2025-06-07',
        '2025-06-08',
        '2025-06-09',
        '2025-06-10',
        '2025-06-11',
        '2025-06-12',
        '2025-06-13',
        '2025-06-14',
        '2025-06-15',
        '2025-06-16',
        '2025-06-17',
        '2025-06-18'
      ],
      pvList: [
        4988, 5695, 6865, 5043, 2104, 2344, 5504, 5528, 6276, 8106, 4049, 1974, 1439, 1435, 4422, 4698, 5131, 5629,
        1791, 1496, 4460, 4529, 4276, 4705, 3822, 1808, 1547, 4681, 5101, 3258
      ],
      ipList: [
        474, 490, 489, 412, 239, 161, 476, 449, 489, 449, 429, 154, 147, 163, 451, 504, 504, 465, 186, 152, 441, 436,
        448, 483, 421, 200, 158, 442, 488, 358
      ],
      uvList: []
    };
    setChartOptions(data);
  }
};

// 日期范围变化
const handleDateRangeChange = () => {
  loadData();
};

// 下载图表
const handleDownloadChart = () => {
  if (!chart.value) {
    return;
  }

  // 获取画布图表地址信息
  const img = new Image();
  img.src = chart.value.getDataURL({
    type: 'png',
    pixelRatio: 1,
    backgroundColor: '#fff'
  });
  // 当图片加载完成后，生成 URL 并下载
  img.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(img, 0, 0, img.width, img.height);
      const link = document.createElement('a');
      link.download = '访问趋势.png';
      link.href = canvas.toDataURL('image/png', 0.9);
      document.body.appendChild(link);
      link.click();
      link.remove();
    }
  };
};

// 窗口大小变化时，重置图表大小
const handleResize = () => {
  setTimeout(() => {
    if (chart.value) {
      chart.value.resize();
    }
  }, 100);
};

// 初始化图表
onMounted(() => {
  chart.value = markRaw(echarts.init(document.getElementById(props.id) as HTMLDivElement));
  loadData();

  window.addEventListener('resize', handleResize);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize);
});

onActivated(() => {
  handleResize();
});
</script>
<style lang="scss" scoped>
.trend-header{
  display: flex;
  justify-content: space-between;
  .header-title{
    display: flex;
    align-items: center;
    gap:5px;
  }
}
</style>
