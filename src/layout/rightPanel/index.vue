<template>
  <div
    ref="dragEl"
    class="handle-button"
    :style="{ transform: `translate(${position.x}px, ${position.y}px)` }"
    @mousedown="startDrag"
    @click="show = true"
  >
    <el-icon :size="24">
      <Setting />
    </el-icon>
  </div>
  <el-drawer
    v-model="show"
    size="300px"
    :with-header="false"
  >
    <slot />
  </el-drawer>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Setting } from '@element-plus/icons-vue';

let show = ref(false);

const dragEl = ref<HTMLElement>();
const position = ref({ x: 0, y: 0 });
let startPos = { x: 0, y: 0 }, mouseStart = { x: 0, y: 0 };

const startDrag = (e: MouseEvent) => {
  if (!dragEl.value) return;
  mouseStart = { x: e.clientX, y: e.clientY };
  startPos = { ...position.value };
  document.addEventListener("mousemove", onDrag);
  document.addEventListener("mouseup", stopDrag);
};

const onDrag = (e: MouseEvent) => {
  const dx = e.clientX - mouseStart.x;
  const dy = e.clientY - mouseStart.y;
  position.value = { x: startPos.x + dx, y: startPos.y + dy };
};

const stopDrag = () => {
  document.removeEventListener("mousemove", onDrag);
  document.removeEventListener("mouseup", stopDrag);
};

onBeforeUnmount(stopDrag);

</script>

<style scoped lang="scss">
.handle-button {
  width: 48px;
  height: 48px;
  background-color: var(--right-panel-button-bg-color);
  position: fixed;
  top: 350px;
  right: 20px;
  border-radius: 6px 0 0 6px;
  z-index: 10;
  //cursor: pointer;
  //pointer-events: auto;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
