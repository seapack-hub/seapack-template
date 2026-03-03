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
  if(!props.graph) return;
  //计算完整内容边界框（含节点+边+连接线延伸）
  const cells = props.graph.getCells();
  let contentBBox = null;
  if (cells.length > 0) {
    // 获取所有元素的精确包围盒（含边路径）
    contentBBox = props.graph.getCellsBBox(cells)
    // 若 bbox 无效，尝试备用方案
    if (!contentBBox || contentBBox.width <= 0 || contentBBox.height <= 0) {
      const nodes = props.graph.getNodes()
      const edges = props.graph.getEdges()
      if (nodes.length > 0 || edges.length > 0) {
        // 手动计算：取所有节点/边坐标的极值
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
        // 处理节点
        nodes.forEach(node => {
          const pos = node.position()
          const size = node.size()
          minX = Math.min(minX, pos.x)
          minY = Math.min(minY, pos.y)
          maxX = Math.max(maxX, pos.x + size.width)
          maxY = Math.max(maxY, pos.y + size.height)
        })
        // 处理边（考虑控制点）
        edges.forEach(edge => {
          const vertices = edge.getVertices() || []
          vertices.forEach(v => {
            minX = Math.min(minX, v.x)
            minY = Math.min(minY, v.y)
            maxX = Math.max(maxX, v.x)
            maxY = Math.max(maxY, v.y)
          })
        })
        if (minX !== Infinity) {
          contentBBox = {
            x: minX - 20, // 预留边距
            y: minY - 20,
            width: maxX - minX + 40,
            height: maxY - minY + 40
          }
        }
      }
    }
  };
  const SAFE_PADDING = 40 // 比常规20px更大，避免连接线被裁
  const exportBBox = contentBBox 
    ? {
        x: contentBBox.x - SAFE_PADDING,
        y: contentBBox.y - SAFE_PADDING,
        width: contentBBox.width + SAFE_PADDING * 2,
        height: contentBBox.height + SAFE_PADDING * 2
      }
    : {
        // 无内容时使用容器尺寸
        x: 0,
        y: 0,
        width: props.graph.container.clientWidth || 800,
        height: props.graph.container.clientHeight || 600
      };
    
  props.graph.toSVG((dataUri)=>{
    DataUri.downloadDataUri(DataUri.svgToDataUrl(dataUri), '流程图_' + Date.now() + '.svg')
  },
  {
    preserveDimensions:true,
    viewBox:exportBBox,
  });
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