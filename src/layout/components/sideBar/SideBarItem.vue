<template>
  <!--无子路由-->
  <template v-if="!item.children">
    <Link :to="item.path">
      <el-menu-item :index="item.path">
        <template #title>
          <SPIcon :name="item.meta.icon" size="20px"></SPIcon>
          <span class="menu-text">{{item?.meta.description ||'未知'}}</span></template>
      </el-menu-item>
    </Link>
  </template>
  <template v-else>
    <el-sub-menu :index="item.path">
      <template #title>
        <SPIcon :name="item.meta.icon" size="20px"></SPIcon>
        <span class="menu-text">{{item?.meta.description ||'未知'}}</span>
      </template>
      <side-bar-item v-for="item in item.children" :item="item" :base-path="basePath"></side-bar-item>
    </el-sub-menu>
  </template>

</template>

<script setup lang="ts">
import {ref} from "vue";
import Link from "./Link.vue";

const props = defineProps({
  item:{
    type:Object,
    required:true,
  },
  basePath:{
    type:String,
    required:true
  }
});

console.log('---item--',props.item);
</script>

<style scoped lang="scss">
.menu-text{
  margin-left:10px;
}
</style>