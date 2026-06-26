<template>
  <div class="migration-map">
    <div id="migration-map-ref"></div>
  </div>
</template>
<script setup lang="ts">
import { echarts } from '@/utils/echarts'
import {option} from "./components/migrationMap.ts";
import chinaJson from "./mapInfo/chinaMap/data-china.json";
const ringEcharts = ref<echarts.ECharts | null>(null);

// @ts-expect-error chinaJson 的类型与 registerMap 期望的类型不严格匹配
echarts.registerMap('china', chinaJson);

const initEcharts = () => {
  let echartsEl = document.getElementById('migration-map-ref');
  ringEcharts.value = echarts.init(echartsEl);
  ringEcharts.value.setOption(option);
};

onMounted(() => {
  initEcharts();
});
</script>
 
<style lang="scss" scoped>
.migration-map{
  height: 100%;
  width: 100%;
  #migration-map-ref{
    width: 100%;
    height: 100%;
  }
}
</style>
