<template>
  <!-- 科技感四角边框容器，类似 DataV 的 borderBox 效果 -->
  <div
    class="decoration-border"
    :style="{
      '--border-color': borderColor,
      '--bg-color': bgColor,
    }"
  >
    <div class="decoration-border-content">
      <slot />
    </div>
    <!-- 四个角装饰 -->
    <div class="decoration-border-corner tl" />
    <div class="decoration-border-corner tr" />
    <div class="decoration-border-corner bl" />
    <div class="decoration-border-corner br" />
    <!-- 上下边中点发光短线 -->
    <div class="decoration-border-line top" />
    <div class="decoration-border-line bottom" />
  </div>
</template>

<script setup lang="ts">
interface Props {
  borderColor?: string  // 边框与装饰颜色
  bgColor?: string      // 容器背景
}

withDefaults(defineProps<Props>(), {
  borderColor: 'rgba(0,212,255,0.3)',
  bgColor: 'rgba(0,212,255,0.03)',
})
</script>

<style lang="scss" scoped>
.decoration-border {
  position: relative;
  width: 100%;
  height: 100%;
  background: var(--bg-color);
  border: 1px solid var(--border-color);
}

.decoration-border-content {
  position: relative;
  z-index: 1;
  width: 100%;
  height: 100%;
  padding: 16px;
}

// 四角装饰片：每个角由 2px 宽的 L 形短线构成
.decoration-border-corner {
  position: absolute;
  width: 18px;
  height: 18px;
  z-index: 2;

  &::before {
    content: '';
    position: absolute;
    width: 100%;
    height: 2px;
    background: var(--border-color);
  }

  &::after {
    content: '';
    position: absolute;
    width: 2px;
    height: 100%;
    background: var(--border-color);
  }

  &.tl { top: -1px; left: -1px;
    &::before { top: 0; left: 0; }
    &::after { top: 0; left: 0; }
  }
  &.tr { top: -1px; right: -1px;
    &::before { top: 0; right: 0; }
    &::after { top: 0; right: 0; }
  }
  &.bl { bottom: -1px; left: -1px;
    &::before { bottom: 0; left: 0; }
    &::after { bottom: 0; left: 0; }
  }
  &.br { bottom: -1px; right: -1px;
    &::before { bottom: 0; right: 0; }
    &::after { bottom: 0; right: 0; }
  }
}

// 上下边框中间的渐变发光短线
.decoration-border-line {
  position: absolute;
  left: 50%;
  width: 30%;
  height: 1px;
  transform: translateX(-50%);
  background: linear-gradient(90deg, transparent, var(--border-color), transparent);

  &.top { top: -1px; }
  &.bottom { bottom: -1px; }
}
</style>
