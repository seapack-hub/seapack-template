<template>
  <a v-if="isExternal(to)" target="_blank" rel="noopener">
    <slot></slot>
  </a>
  <div v-else @click="push">
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import { isExternal } from '@/utils';

//引入路由
import { useRouter } from 'vue-router';

//引入 props
const props = defineProps({
  to: {
    type: String,
    required: true
  }
});

const router = useRouter();
//添加数据
function push() {
  router.push(props.to).catch((err) => {
    console.log(err);
  });
}
</script>

<style scoped lang="scss"></style>
