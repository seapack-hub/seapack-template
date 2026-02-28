<template>
  <div class="graphical-body h-100% w-100% flex flex-col">
    <HeaderOperate class="header-operate h-[35px]" />
    <div class="graphical-main relative flex-1 w-100% flex align-center">
      <div class="sidebar-stencil relative h-100% w-[260px]" ref="stencilRef"></div>
      <div class="flow-chart-container h-100% flex-1 overflow-auto" ref="containerRef"></div>
      <GraphConfig class="graph-config" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { 
  Graph,
  Stencil,
  Snapline,
  Dnd,
  Shape,
  History
} from '@antv/x6';
import HeaderOperate from './components/headerOperate.vue';
import GraphConfig from './components/graphConfig.vue';
import { registerBaseNode,loadStencil,toggleNodePorts} from './components/utils';

const containerRef = ref<null | HTMLDivElement>(null);
//侧边栏UI界面
const stencilRef = ref<HTMLElement | null>(null);

let graph: Graph | null = null;
let stencil: Stencil | null = null;
let dnd: Dnd | null = null;

const groups = [
  {
    title: '基础节点',
    name: 'basic-node',
    graphHeight: 250,
  },
  {
    title: '图片节点',
    name: 'image-node',
    graphHeight: 380,
    layoutOptions: {
      rowHeight: 110
    }
  }
]
/**
 * 初始化图表
 */
const initGraph = ()=>{
  if(!containerRef.value || !stencilRef.value){
    return;
  }
  //注册基础图形
  registerBaseNode();
  // 1. 初始化画布
  graph = new Graph({
    container: containerRef.value,
    grid: true, //启用网格
    // 通过设置 autoResize: true 来开启自适应容器大小，
    // 以容器大小作为画布大小，当画布容器大小改变时，画布大小也会自动重新计算
    autoResize: true,
    // 连接线配置
    connecting: {
      router: 'manhattan',
      connector: {
        name: 'rounded',
        args: {
          radius: 8,
        },
      },
      anchor: 'center',
      connectionPoint: 'anchor',
      allowBlank: false,
      snap: {
        radius: 20,
      },
      createEdge() {
        return new Shape.Edge({
          attrs: {
            line: {
              stroke: '#A2B1C3',
              strokeWidth: 2,
              targetMarker: {
                name: 'block',
                width: 12,
                height: 8,
              },
            },
          },
          zIndex: 0,
        })
      },
      validateConnection({ targetMagnet }) {
        return !!targetMagnet
      },
    },
  });

  // 仅监听画布节点事件（Stencil 预览节点在独立 Graph，不受影响）
  graph.on('node:mouseenter', ({ view }) => {
    if (!view || !view.graph || view.graph !== graph) return; 
    toggleNodePorts(view,graph, true);
  })
  graph.on('node:mouseleave', ({ view }) => {
    if (!view || !view.graph || view.graph !== graph) return; 
    toggleNodePorts(view,graph, false);
  })

  //使用插件
  graph.use(
    new Snapline({
      enabled: true,
      sharp: true,
    }),
  ).use(new History({
    enabled: true,
  }))
  // 拖拽
  dnd = new Dnd({
    target: graph,
  })

  // 2. 初始化侧边栏
  stencil = new Stencil({
    title: '流程图',
    target: graph,
    collapsable: true,
    search(cell, keyword) {
      // 自定义搜索逻辑，返回 true 表示匹配成功
      return (cell as any)?.label?.indexOf(keyword) !== -1
    },
    placeholder: '通过名称查询',
    notFoundText: '暂未匹配到结果',
    stencilGraphWidth:300,
    stencilGraphHeight: 0,
    groups: groups,
    layoutOptions: {
      columns: 2,
      columnWidth: 125,
      rowHeight: 60
    }
  });
  // 3. 挂载 Stencil 容器到 DOM
  stencilRef.value.appendChild(stencil.container);
  loadStencil(graph, stencil);
}

onMounted(()=>{
  initGraph();
})
</script>

<style lang="scss" scoped>
.flow-chart-container,.sidebar-stencil{
  border: 1px solid #e8e8e8; /* 设置边框宽度、样式和颜色 */
  box-sizing: border-box; /* 确保边框不会增加容器的尺寸 */
}

.sidebar-stencil :deep(.x6-widget-stencil){
  background-color: #ffffff !important;
}

.sidebar-stencil :deep(.x6-widget-stencil-title){
  background-color: #f3f3f3 !important;
  border-bottom: 1px solid #eaeaea;
}

.sidebar-stencil :deep(.x6-widget-stencil-group-title){
  background-color: #f3f3f3 !important;
  border-bottom: 1px solid #eaeaea;
}
</style>