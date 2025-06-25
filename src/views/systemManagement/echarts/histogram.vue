<template>
  <div class="histogram">
    <div id="histogram-ref"></div>
  </div>
</template>

<script setup lang="ts">
import * as echarts from 'echarts';
import { histogramOption } from './components/contens.ts';

// 绘制左侧面
const CubeLeft = echarts.graphic.extendShape({
  shape: {
    x: 0,
    y: 0
  },
  buildPath: function (ctx, shape) {
    // 会canvas的应该都能看得懂，shape是从custom传入的
    const xAxisPoint = shape.xAxisPoint;
    const c0 = [shape.x, shape.y];
    const c1 = [shape.x - 13, shape.y - 13];
    const c2 = [xAxisPoint[0] - 13, xAxisPoint[1] - 13];
    const c3 = [xAxisPoint[0], xAxisPoint[1]];
    ctx.moveTo(c0[0], c0[1]).lineTo(c1[0], c1[1]).lineTo(c2[0], c2[1]).lineTo(c3[0], c3[1]).closePath();
  }
});
// 绘制右侧面
const CubeRight = echarts.graphic.extendShape({
  shape: {
    x: 0,
    y: 0
  },
  buildPath: function (ctx, shape) {
    const xAxisPoint = shape.xAxisPoint;
    const c1 = [shape.x, shape.y];
    const c2 = [xAxisPoint[0], xAxisPoint[1]];
    const c3 = [xAxisPoint[0] + 18, xAxisPoint[1] - 9];
    const c4 = [shape.x + 18, shape.y - 9];
    ctx.moveTo(c1[0], c1[1]).lineTo(c2[0], c2[1]).lineTo(c3[0], c3[1]).lineTo(c4[0], c4[1]).closePath();
  }
});
// 绘制顶面
const CubeTop = echarts.graphic.extendShape({
  shape: {
    x: 0,
    y: 0
  },
  buildPath: function (ctx, shape) {
    const c1 = [shape.x, shape.y];
    const c2 = [shape.x + 18, shape.y - 9];
    const c3 = [shape.x + 5, shape.y - 22];
    const c4 = [shape.x - 13, shape.y - 13];
    ctx.moveTo(c1[0], c1[1]).lineTo(c2[0], c2[1]).lineTo(c3[0], c3[1]).lineTo(c4[0], c4[1]).closePath();
  }
});
// 注册三个面图形
echarts.graphic.registerShape('CubeLeft', CubeLeft);
echarts.graphic.registerShape('CubeRight', CubeRight);
echarts.graphic.registerShape('CubeTop', CubeTop);
let ringEcharts: any = ref(null);
histogramOption.series[1].renderItem = (params, api:any) => {
    const location = api.coord([api.value(0), api.value(1)])
    var color = api.value(1) > 800 ? 'red' : new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
            offset: 0,
            color: 'rgba(37,170,254,1)'
        },
        {
            offset: 0.8,
            color: 'rgba(37,170,254,0.1)'
        }
    ])
    return {
        type: 'group',
        children: [{
            type: 'CubeLeft',
            shape: {
                api,
                xValue: api.value(0),
                yValue: api.value(1),
                x: location[0],
                y: location[1],
                xAxisPoint: api.coord([api.value(0), 0])
            },
            style: {
                fill: color
            }
        }, {
            type: 'CubeRight',
            shape: {
                api,
                xValue: api.value(0),
                yValue: api.value(1),
                x: location[0],
                y: location[1],
                xAxisPoint: api.coord([api.value(0), 0])
            },
            style: {
                fill: color
            }
        }, {
            type: 'CubeTop',
            shape: {
                api,
                xValue: api.value(0),
                yValue: api.value(1),
                x: location[0],
                y: location[1],
                xAxisPoint: api.coord([api.value(0), 0])
            },
            style: {
                fill: color
            }
        }]
    }
};
const initEcharts = () => {
  let echartsEl = document.getElementById('histogram-ref');
  ringEcharts.value = echarts.init(echartsEl);
  ringEcharts.value.setOption(histogramOption);
};

onMounted(() => {
  initEcharts();
});
</script>

<style lang="scss" scoped>
.histogram {
  height: 100%;
  width: 100%;
  #histogram-ref {
    width: 100%;
    height: 100%;
  }
}
</style>
