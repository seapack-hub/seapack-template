<template>
  <LeftMode/>
  <!--系统配置-->
  <right-panel>
    <Settings/>
  </right-panel>
</template>

<script setup lang="ts">
import RightPanel from "@/layout/rightPanel/index.vue"
import {Settings} from "@/layout/components/index.ts"
import LeftMode from "./LeftMode.vue"
</script>

<style scoped lang="scss">
</style>