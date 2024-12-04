<template>
  <div class="snow">
    <div class="container">
      <el-button type="primary" @click="start">开始</el-button>
      <el-button type="primary" @click="hide">停止</el-button>
    </div>
  </div>
</template>

<script setup>
import {onMounted,ref,onUnmounted,nextTick } from "vue";
import SnowEffect from "@ces/utils/snow.js";
import {useCesiumStore} from "@/store/modules/cesium";
const cesiumStore = useCesiumStore();
let snow = null;
const hide = () => {
  snow.show(false)
}
const start = () => {
  snow.show(true)
}
//等待下一个DOM更新循环后执行
nextTick(()=>{
  //获取非响应式的viewer对象
  snow = new SnowEffect(cesiumStore.$state.cesiumViewer,{
    snowSize: 0.02, // 雪花大小
    snowSpeed: 60.0, // 雪速
  });
})
//组件实例被销毁时执行
onUnmounted(() => {
  snow.destroy()
})
onMounted(async ()=>{
  await nextTick();
})
</script>

<style lang="scss" scoped>
.snow{
  padding:20px;
  position: absolute;
  z-index: 100;
}
</style>