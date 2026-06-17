<!--这是一个权限控制包装器组件，实现了声明式的按钮级权限控制-->
<template>
  <!--如果用户有权限，就渲染插槽内容；否则，什么都不渲染-->
  <slot
    v-if="hasPermission"
    v-bind="$attrs"
  ></slot>
</template>

<script setup lang="ts">
import { PropType } from 'vue';
import useButtonPermission from '@/hooks/useButtonPermission';

const props = defineProps({
  buttonPermission: {
    // 支持字符串（'user:add'）和对象（{ permission, type, name }）两种格式
    type: [Object, String] as PropType<{ permission: string; type: string; name: string } | string>,
    default: null,
  },
});

const { buttonHasPermission } = useButtonPermission();

const hasPermission = computed(() => {
  if (!props.buttonPermission) return true;
  return buttonHasPermission(props.buttonPermission);
});

</script>

<style lang="scss" scoped></style>