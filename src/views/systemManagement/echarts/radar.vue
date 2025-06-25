<template>
  <div class="radar">
    <div id="radar-ref"></div>
  </div>
</template>
 
<script setup lang="ts">
import * as echarts from 'echarts';
import {radarOption} from "./components/contens.ts";
let ringEcharts:any=ref(null);
const initEcharts = () => {
  let echartsEl = document.getElementById('radar-ref');
  ringEcharts.value = echarts.init(echartsEl);
  ringEcharts.value.setOption(radarOption);
};

onMounted(() => {
  initEcharts();
});
</script>
 
<style lang="scss" scoped>
.radar{
  height: 100%;
  width: 100%;
  #radar-ref{
    width: 100%;
    height: 100%;
  }
}
</style>