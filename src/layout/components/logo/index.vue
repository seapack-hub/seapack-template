<template>
  <div class="layout-logo-container" :class="{ collapse: props.collapse }">
    <transition name="layout-logo-fade">
      <div class="logo-title layout-logo-text" v-if="!props.collapse">SeaPack</div>
      <div class="logo-title layout-logo" v-else>SP</div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { useLayoutMode } from '@/hooks/useLayoutMode.ts';
import { computed } from 'vue';

interface Props {
  collapse?: boolean;
}
const { isLeft, isLeftTop } = useLayoutMode();

const props = withDefaults(defineProps<Props>(), {
  collapse: true
});

const fontColor = computed(() => {
  return isLeft.value ? 'var(--sidebar-menu-text-color)' : '#000000';
});

const logoHeight = computed(() => {
  return isLeftTop.value ? '80px' : '60px';
});
</script>

<style scoped lang="scss">
.layout-logo-container {
  .logo-title {
    color: v-bind(fontColor);
    width: 100%;
    text-align: left;
    height: v-bind(logoHeight);
    font-size: 28px;
    line-height: v-bind(logoHeight);
    box-sizing: border-box;
    padding: 0 20px;
  }
}
.collapse {
  .layout-logo {
    display: inline-block;
  }
  .layout-logo-text {
    display: none;
  }
}
</style>
