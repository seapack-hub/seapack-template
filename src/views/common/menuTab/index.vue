<template>
  <div class="mean-tab-wrapper">
    <!-- <el-button type="primary" v-for="item in menuList" @click="handToPage(item)">{{$t(item.name)}}</el-button> -->
     <Blogs/>
  </div>
</template>

<script setup lang="ts">
import {ref,onMounted} from "vue"
import {type RouteRecordRaw, useRouter} from "vue-router"
import routerInfo from "@/json/router.json";
import Blogs from "@/views/blogs/index.vue"
//初始化菜单
const menuList = ref<RouteRecordRaw[]>([]);
const router = useRouter();
/**
 * 获取菜单信息
 */
const getMeanList = ()=>{
  menuList.value = routerInfo.filter((item:{show:boolean}) => item?.show === true);
}
/**
 * 路由跳转
 * @param item
 */
const handToPage = (item:RouteRecordRaw)=>{
  router.push({path:item?.path});
}
onMounted(()=>{
  getMeanList();
})
</script>

<style scoped lang="scss">
.mean-tab-wrapper{
  width: 100%;
  height: 100%;
  //display: flex;
  //justify-content: center;
  //align-items: center;
}
</style>