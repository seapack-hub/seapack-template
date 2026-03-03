<template>
  <div class="header-operate">
    <el-tooltip class="item" content="放大" effect="dark" placement="top">
      <el-icon :size="20" color="#8f8f8f" style="cursor: pointer" @click="zoomIn"><ZoomIn /></el-icon>
    </el-tooltip>
    <el-tooltip class="item" content="缩小" effect="dark" placement="top">
      <el-icon :size="20" color="#8f8f8f" style="cursor: pointer" @click="zoomOut"><ZoomOut /></el-icon>
    </el-tooltip>
    <el-tooltip class="item" content="撤销" effect="dark" placement="top">
      <el-icon 
        :size="20" 
        style="cursor: pointer" 
        :color="canUndo ? '#409EFF' : '#8f8f8f'"
        :class="{ 'is-disabled': !canUndo }"
        @click="undo"
      ><RefreshLeft /></el-icon>
    </el-tooltip>
    <el-tooltip class="item" content="重做" effect="dark" placement="top">
      <el-icon 
        :size="20" 
        :color="canRedo ? '#409EFF' : '#8f8f8f'" 
        :class="{ 'is-disabled': !canRedo }"
        style="cursor: pointer" 
        @click="redo"
      ><RefreshRight /></el-icon>
    </el-tooltip>
    <el-tooltip class="item" content="下载" effect="dark" placement="top">
      <el-icon :size="20" color="#8f8f8f" style="cursor: pointer" @click="exportPhone"><Download /></el-icon>
    </el-tooltip>
  </div>
</template>

<script setup lang="ts">
import { PropType } from 'vue'
import { 
  ZoomIn, 
  ZoomOut,
  RefreshLeft,
  RefreshRight,
  Download
} from '@element-plus/icons-vue';

import { Graph ,DataUri} from '@antv/x6';

const props = defineProps({
  graph: {
    type: Object as PropType<Graph>,
    default: null,
  },
});

const canRedo = ref(false);
const canUndo = ref(false);

// 放大
const zoomIn = ()=>{
  if(props.graph){
    props.graph.zoom(0.2);
  }
}
// 缩小
const zoomOut = ()=>{
  if(props.graph){
    props.graph.zoom(-0.2);
  }
}
// 撤销
const undo = ()=>{
  if(props.graph){
    props.graph.undo();
  }
}
// 重做
const redo = ()=>{
  if(props.graph){
    props.graph.redo();
  }
}
// 监听历史记录变化
const addHistoryChange = ()=>{
  if(!props.graph) return;
  props.graph.on('history:change', () => {
    canUndo.value = props.graph.canUndo();
    canRedo.value = props.graph.canRedo();
  })
}

// 导出图片
const exportPhone = ()=>{
  if(props.graph){
    props.graph.toSVG((dataUri)=>{
      DataUri.downloadDataUri(DataUri.svgToDataUrl(dataUri), 'chart.svg')
    });
  }
}

onMounted(()=>{
  nextTick(()=>{
    if(props.graph){
      addHistoryChange();
    }
  });
})
</script>

<style lang="scss" scoped>
.header-operate {
  display: flex;
  justify-content: left;
  align-items: center;
  background-color: #fff;
  border-radius: 10px 10px 0 0;
  gap: 10px;
  padding-left: 5px;
  margin:0;
  height: 35px;
  width: 100%;
  .is-disabled {
    cursor: not-allowed !important;
    opacity: 0.5;
    transform: none !important;
    &:hover {
      transform: none;
    }
  }
}
</style>