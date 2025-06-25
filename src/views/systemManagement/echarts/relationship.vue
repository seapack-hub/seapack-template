<template>
  <div class="relationship">
    <div id="relationship-ref"></div>
  </div>
</template>
 
<script setup lang="ts">
import * as echarts from 'echarts';
import {option} from "./components/relationship.ts";
let ringEcharts:any=ref(null);
const initEcharts = () => {
  let echartsEl = document.getElementById('relationship-ref');
  ringEcharts.value = echarts.init(echartsEl);
  ringEcharts.value.setOption(option);
};

onMounted(() => {
  initEcharts();
});
</script>
 
<style lang="scss" scoped>
.relationship{
  height: 100%;
  width: 100%;
  #relationship-ref{
    width: 100%;
    height: 100%;
  }
}
</style>