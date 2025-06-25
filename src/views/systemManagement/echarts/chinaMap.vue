<template>
  <div class="china-map">
    <div id="china-map-ref"></div>
  </div>
</template>
 
<script setup lang="ts">
import * as echarts from 'echarts';
import {chinaMapOption} from "./components/contens.ts";
import chinaJson from "./mapInfo/chinaMap/data-china.json";
let ringEcharts:any=ref(null);

echarts.registerMap('china', chinaJson);
const initEcharts = () => {
  let echartsEl = document.getElementById('china-map-ref');
  ringEcharts.value = echarts.init(echartsEl);
  ringEcharts.value.setOption(chinaMapOption);
};

onMounted(() => {
  initEcharts();
});
</script>
 
<style lang="scss" scoped>
.china-map{
  height: 100%;
  width: 100%;
  #china-map-ref{
    width: 100%;
    height: 100%;
  }
}
</style>