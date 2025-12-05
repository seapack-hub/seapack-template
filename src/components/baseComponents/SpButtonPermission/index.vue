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

// 定义组件接收的属性
const props = defineProps({
  buttonPermission:{
    type:Object as PropType<{ permission: string;type: string;name:string}>,
    default:()=>({})
  }
});

// 引入权限判断方法
const { buttonHasPermission } = useButtonPermission();

// 计算属性：核心权限判断逻辑
const hasPermission = computed(()=>{
  // 如果传入了有效的 buttonPermission 对象（特别是包含 permission 字段），
  // 则调用 buttonHasPermission 方法进行权限验证
  // 如果没有配置任何权限要求（buttonPermission 无效或为空），则默认返回 true，渲染内容
  return props?.buttonPermission?.permission?buttonHasPermission(props.buttonPermission):true;
});

</script>

<style lang="scss" scoped></style>