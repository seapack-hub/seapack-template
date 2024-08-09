<template>
  <el-container>
    <el-header>

    </el-header>
    <el-container>
      <el-aside>

      </el-aside>
      <el-main>

      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import Logo from "@/layout/components/logo/index.vue"
import NavRight from "@/layout/components/navigationBar/NavRight.vue";
import {useAppStore} from "@/store/modules/app.ts";
import {usePermissionStore} from "@/store/modules/permission.ts";
import {computed} from "vue";
const appStore = useAppStore();

const isCollapse = computed(()=>!appStore.opened);
//获取基础路径
const basePath = computed(()=>permissionStore.basePath)
</script>

<style scoped lang="scss">

</style>