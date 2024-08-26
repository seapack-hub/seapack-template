<template>
  <LeftMode v-if="isLeft"/>
  <TopMode v-else-if="isTop"/>
  <LeftTopMode v-else-if="isLeftTop"/>
  <!--系统配置-->
  <right-panel>
    <Settings/>
  </right-panel>
</template>

<script setup lang="ts">
import RightPanel from "@/layout/rightPanel/index.vue"
import {Settings} from "@/layout/components/index.ts"
import LeftMode from "./LeftMode.vue"
import TopMode from "./TopMode.vue";
import LeftTopMode from "./LeftTopMode.vue";
import {useLayoutMode} from "@/hooks/useLayoutMode.ts";

const {isLeft,isTop,isLeftTop}  = useLayoutMode();
</script>

<style scoped lang="scss">
</style>