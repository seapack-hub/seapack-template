<template>
  <div class="graphical-body h-100% w-100% flex flex-col">
    <HeaderOperate class="header-operate h-[35px]" :graph="graph as Graph"/>
    <div class="graphical-main relative flex-1 w-100% flex align-center overflow-x-hidden">
      <div class="sidebar-stencil relative h-100% w-[260px]" ref="stencilRef"></div>
      <div class="flow-chart-container h-100% flex-1 overflow-auto" ref="containerRef"></div>
      <GraphConfig 
        class="graph-config" 
        :node="curNode as Node"
        :edge="curEdge as Edge"
        :isNode="isNode"
      />
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
  History,
  Export,
  Node,
  Edge
} from '@antv/x6';
import HeaderOperate from './components/headerOperate.vue';
import GraphConfig from './components/graphConfig.vue';
import { registerBaseNode,loadStencil,toggleNodePorts} from './components/utils';

const containerRef = ref<null | HTMLDivElement>(null);
//侧边栏UI界面
const stencilRef = ref<HTMLElement | null>(null);

const graph = ref<Graph | null>(null);
let stencil: Stencil | null = null;
let dnd: Dnd | null = null;
const curNode = ref<Node | null>(null);
const curEdge = ref<Edge | null>(null);
const isNode = ref<boolean>(false);
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
];
/**
 * 初始化图表
 */
const initGraph = ()=>{
  // 如果 graph 已经存在，先销毁它
  if (graph.value) {
    graph.value.dispose()
  }
  //界面是否渲染
  if(!containerRef.value || !stencilRef.value){
    return;
  }
  //注册基础图形
  registerBaseNode();
  // 1. 初始化画布
  let graphObj = new Graph({
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
  //添加事件监听
  addMonitorEvent(graphObj);
  //使用插件
  graphObj.use(
    new Snapline({
      enabled: true,
      sharp: true,
    }),
  ).use(new History({
    enabled: true,
  }),
  ).use(new Export())
  // 拖拽
  dnd = new Dnd({
    target: graphObj,
  })
  // 初始化侧边栏
  stencil = new Stencil({
    title: '流程图',
    target: graphObj,
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
  //挂载 Stencil 容器到 DOM
  stencilRef.value.appendChild(stencil.container);
  loadStencil(graphObj, stencil);

  graph.value = graphObj;
}

// 添加事件监听
const addMonitorEvent = (graphObj:Graph)=>{
  //存储当前选中节点
  let selectedNode: Node | null = null;

  // 清除选中状态
  const clearSelection = () => {
    if (selectedNode) {
      // 移除删除按钮
      selectedNode.removeTools()
      selectedNode = null
      // 同步配置面板状态
      curNode.value = null
      isNode.value = false
    }
  }

  //--节点相关监听事件-----------------------------------------------
  // 仅监听画布节点事件（Stencil 预览节点在独立 Graph，不受影响）
  graphObj.on('node:mouseenter', ({ view }) => {
    if (!view || !view.graph || view.graph !== graph.value) return; 
    toggleNodePorts(view,graphObj, true);
  })
  graphObj.on('node:mouseleave', ({ view }) => {
    if (!view || !view.graph || view.graph !== graph.value) return; 
    toggleNodePorts(view,graphObj, false);
  })
  //监听画布添加节点动作
  graphObj.on('node:added', ({ node }) => {
    curNode.value = node;
    isNode.value = true;
  })
  //监听节点点击动作
  graphObj.on('node:click', ({ node,e }) => {
    // 阻止事件冒泡到 blank:click
    e.stopPropagation();
    // 如果点击的是当前选中节点，取消选中
    if (selectedNode === node) {
      clearSelection();
      return;
    }
    // 清除上一个选中节点
    clearSelection();
    selectedNode = node;
    curNode.value = node;
    isNode.value = true;

    // 添加删除按钮（X6 原生工具）
    node.addTools([
      {
        name: 'button-remove',
        args: {
          // 定位：右上角（x=100% - 16px, y=8px）
          distance: 8,
          offset: { x: 110, y: 15 },
          // 点击删除
          onClick: () => {
            if (node) {
              node.remove()
              clearSelection()
            }
          }
        }
      },
      {
        name: 'boundary',
        args: {
          attrs: {
            fill: '#7c68fc',
            stroke: '#333',
            'stroke-width': 1,
            'fill-opacity': 0.2,
          },
        },
      }
    ])
  })
  //监听节点删除动作
  graphObj.on('node:removed', () => {
    curNode.value = null;
    isNode.value = false;
  })

  // ====== 新增：空白区域点击 ======
  graphObj.on('blank:click', () => {
    clearSelection()
  })

  //--连接边相关事件---------------------------------------------
  //监听画布添加连接线动作
  graphObj.on('edge:added', ({ edge }) => {
    curEdge.value = edge;
    isNode.value = false;
  })
  graphObj.on('edge:click', ({ edge }) => {
    curEdge.value = edge;
    isNode.value = false;
    // 点击边时清除节点选中
    clearSelection()
  })
  graphObj.on('edge:removed', () => {
    curEdge.value = null;
    isNode.value = false;
  })
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