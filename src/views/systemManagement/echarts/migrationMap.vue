<template>
  <div class="migration-map">
    <div id="migration-map-ref"></div>
  </div>
</template>
<script setup lang="ts">
import * as echarts from 'echarts';
import {option} from "./components/migrationMap.ts";
import chinaJson from "./mapInfo/chinaMap/data-china.json";
let ringEcharts:any=ref(null);

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