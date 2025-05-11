<template>
  <LeftMode v-if="isLeft" />
  <TopMode v-else-if="isTop" />
  <LeftTopMode v-else-if="isLeftTop" />
  <!--系统配置-->
  <right-panel>
    <Settings />
  </right-panel>
</template>

<script setup lang="ts">
import { watchEffect } from 'vue';
import { storeToRefs } from 'pinia';
import RightPanel from '@/layout/rightPanel/index.vue';
import { Settings } from '@/layout/components/index.ts';
import { useSettingsStore } from '@/store/modules/settings.ts';
import LeftMode from './LeftMode.vue';
import TopMode from './TopMode.vue';
import LeftTopMode from './LeftTopMode.vue';
import { useLayoutMode } from '@/hooks/useLayoutMode.ts';
import { useWatermark } from '@/hooks/useWatermark.ts';

const { isLeft, isTop, isLeftTop } = useLayoutMode();
const { setWatermark, clearWatermark } = useWatermark();
const settingStore = useSettingsStore();
const { showWatermark } = storeToRefs(settingStore);

/**
 * 开启或关闭系统水印
 */
watchEffect(() => {
  showWatermark.value ? setWatermark(import.meta.env.VITE_APP_TITLE) : clearWatermark();
});
</script>

<style scoped lang="scss"></style>
