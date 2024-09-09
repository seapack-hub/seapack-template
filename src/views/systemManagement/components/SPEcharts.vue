<template>
  <div class="echarts-table">
    <div id="ring"></div>

    <div class="item-list">
      <div class="item" v-for="(item,index) in list" :key="index">
        <div class="item-left">
          <div class="item-border" :style="`background:${item.color}`"></div>
          <div class="item-text">{{item.label}}</div>
        </div>
        <div class="item-right">
          <div>{{item.number}}个</div>
          <div>{{item.rate}}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import * as echarts from "echarts"
import {ringEchartsOptions,labelList} from "./content.ts"
import {onMounted,ref} from "vue";

const list = ref(labelList)

let ringEcharts;
function setOption(){
  ringEcharts.setOption(ringEchartsOptions)
}
const initEcharts = ()=>{
  let echartsEl = document.getElementById("ring")
  ringEcharts = echarts.init(echartsEl)
  ringEcharts.setOption(ringEchartsOptions)
}

onMounted(()=>{
  initEcharts();
})

</script>

<style scoped lang="scss">
.echarts-table{
  //background: rgb(112, 169, 232);
  height:100%;
  display:flex;
  flex-direction: column;
  align-items: center;
   #ring{
     width:400px;
     height:400px;
   }
  .item-list{
    .item{
      width:300px;
      display:flex;
      background: #eae9e9;
      padding:5px 10px;
      margin-top:10px;
      .item-left{
        width:100%;
        display:flex;
        .item-border{
          width:20px;
          height:20px;
          background:blue
        }
        .item-text{
          margin-left:10px
        }
      }
      .item-right{
        width:100%;
        display:flex;
        justify-content: space-between;
      }
    }
  }
}
</style>