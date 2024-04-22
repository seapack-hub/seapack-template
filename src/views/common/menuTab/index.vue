<template>
  <div class="mean-tab-wrapper">
    <el-button type="primary" v-for="item in meanList" @click="handToPage(item)">{{$t(item.name)}}</el-button>
  </div>
</template>

<script setup lang="ts">
import {ref,onMounted} from "vue"
import {useRouter} from "vue-router"
import routerInfo from "@/json/router.json";
//初始化菜单
const meanList = ref<{meta?:{title?:string},name:string}[]>([]);
const router = useRouter();
/**
 * 获取菜单信息
 */
const getMeanList = ()=>{
  meanList.value = routerInfo.filter((item:{show:boolean}) => item?.show === true);
}
/**
 * 路由跳转
 * @param item
 */
const handToPage = (item:object)=>{
  console.log('item',item);
  router.push(item);
}
onMounted(()=>{
  getMeanList();
})
</script>

<style scoped lang="scss">
.mean-tab-wrapper{
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>