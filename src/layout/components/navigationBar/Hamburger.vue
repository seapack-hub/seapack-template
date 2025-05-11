<template>
  <div @click="toggleClick">
    <el-icon :size="20" class="icon">
      <Fold v-if="isActive" />
      <Expand v-else />
    </el-icon>
  </div>
</template>

<script setup lang="ts">
import { Expand, Fold } from '@element-plus/icons-vue';

defineProps({
  isActive: {
    required: true,
    type: Boolean
  }
});

/** Vue 3.3+ defineEmits 语法 */
const emit = defineEmits<{
  toggleClick: [];
}>();

function toggleClick() {
  emit('toggleClick');
}
</script>

<style scoped lang="scss"></style>
