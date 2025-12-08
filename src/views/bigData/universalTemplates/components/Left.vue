<template>
  <div class="left">
    <div class="boxall item item-1">
      <BaseCharts
        :options="circleOption"
        width="100%"
        :height="`calc(100% - 10px)`"
      ></BaseCharts> 
      <div class="boxfoot"></div>
    </div>
    <div class="boxall item">
      <BaseCharts
        :options="lineOption"
        width="100%"
        :height="`calc(100% - 10px)`"
      ></BaseCharts>
      <div class="boxfoot"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getCircleOptions } from "../utils/get3DbarOptions.ts";
import { getStoresOptions } from "../utils/optionsSet.ts";
import type { EChartsOption } from 'echarts';
//3D环状图配置
const circleOption = ref<EChartsOption>({});
circleOption.value = getCircleOptions();

const lineOption = ref<EChartsOption>({});
lineOption.value = getStoresOptions();

</script>

<style lang="scss" scoped>
.left{
  width:100%;
  height:100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  .item{
    width:100%;
    height:calc(50% - 10px);
  }
  .item-1{
    background: url(../images/cicle_bg.png) no-repeat center center; 
    background-size: 100% 100%; 
  }
}
</style>