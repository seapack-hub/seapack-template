<template>
  <div class="split-container flex h-100% w-100% border-1px border-color-#ddd" ref="containerRef">
    <!--左侧：实时预览模板-->
    <div class="left-panel h-100% w-50% overflow-auto" ref="leftPanelRef">
      <slot name="leftPanel"></slot>
    </div>

    <!--可拖拽的分隔线-->
    <div class="splitter w-4 bg-gray-200 cursor-col-resize hover:bg-blue-200" ref="splitterRef" @mousedown="startDrag"></div>

    <!--右侧：代码编辑器面板-->
    <div class="right-panel h-100% flex-1 overflow-auto" ref="rightPannel">
      <slot name="rightPanel"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
const containerRef = ref<HTMLElement>();
const leftPanelRef = ref<HTMLElement>();
const splitterRef = ref<HTMLElement>();
const rightPannel = ref<HTMLElement>();

const isDragging = ref(false);
const startX = ref(0);
const startWidth = ref(0);

const startDrag = (e:MouseEvent)=>{
  isDragging.value = true;
  startX.value = e.clientX;
  // 记录拖拽开始时左面板的初始宽度
  startWidth.value = leftPanelRef.value?.offsetWidth || 0;
  document.addEventListener('mousemove', duringDrag)
  document.addEventListener('mouseup', stopDrag)
  e.preventDefault()
};

const duringDrag = (e: MouseEvent) => {
  if (!isDragging.value) return

  const containerWidth = containerRef.value?.offsetWidth || 0
  // 计算鼠标移动的距离，并转换为左面板的新宽度
  const dx = e.clientX - startX.value
  let newLeftWidth = startWidth.value + dx

  // (可选)设置最小宽度限制，避免面板完全消失
  const minWidth = 100
  newLeftWidth = Math.max(minWidth, Math.min(newLeftWidth, containerWidth - minWidth))

  // 将新宽度应用到左面板，右面板使用flex:1自动填充剩余空间
  if (leftPanelRef.value) {
    leftPanelRef.value.style.width = `${newLeftWidth}px`
  }
}

const stopDrag = () => {
  isDragging.value = false
  document.removeEventListener('mousemove', duringDrag)
  document.removeEventListener('mouseup', stopDrag)
}

</script>

<style lang="scss" scoped></style>