<template>
  <svg aria-hidden="true" class="svg-icon" :style="{height:size,width:size}">
    <use :xlink:href="symbolId" :fill="color"></use>
  </svg>
</template>

<script setup lang="ts">
import {computed} from 'vue'
const props = defineProps({
  //图标大小
  size:{
    type:[Number,String],
    default: '16px'
  },
  //图标颜色
  color:{
    type:String,
    default:"#606266"
  },
  //图标前缀，默认icon
  prefix:{
    type:String,
    default:'icon'
  },
  //图标名称
  name:{
    type:String,
    default:""
  }
});
const symbolId = computed(()=>`#${props.prefix}-${props.name}`);
</script>

<style scoped lang="scss">

</style>