<!-- wangEditor富文本编辑器示例 -->
<script setup lang="ts">
import Editor from "@/components/WangEditor/index.vue";

const value = ref("开始编辑");
</script>

<template>
  <div class="app-container">
    <editor
      v-model="value"
      class="editor-style"
    />
  </div>
</template>
<style lang="scss">
.editor-style{
  z-index: 99999; 
  height: calc(100vh - 240px);
  border:1px solid rgb(255, 254, 254);
  border-radius: 5px;
}
</style>
