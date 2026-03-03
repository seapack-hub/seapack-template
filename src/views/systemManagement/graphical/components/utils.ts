import { Graph,Stencil } from '@antv/x6';
//导入图标
import { NODE_ICONS} from '@/assets/images/antv-x6'

//公共边框，文本样式
const commonAttrs = {
  body: {
    stroke: '#8f8f8f',
    strokeWidth: 1,
    fill: '#fff',
  },
  text: {
    fontSize: 12,
    fill: '#262626'
  }
}

const portAttrs = {
  circle: {
    r: 5,
    //是否为连接桩
    magnet: true,
    stroke: '#8f8f8f',
    strokeWidth: 1,
    fill: '#fff',
    style:{
      //初始时隐藏连接桩
      visibility: 'hidden'
    }
  },
}
//定义公共连接桩设置
const commonPorts = {
  groups:{
    top:{
      //位置
      position: 'top',
      //连接桩属性
      attrs: portAttrs,
    },
    bottom:{
      //位置
      position: 'bottom',
      //连接桩属性
      attrs: portAttrs,
    },
    left:{
      //位置
      position: 'left',
      //连接桩属性
      attrs: portAttrs,
    },
    right:{
      //位置
      position: 'right',
      //连接桩属性
      attrs: portAttrs,
    },
  },
  items: [
    {
      group: 'top'
    },
    {
      group: 'right'
    },
    {
      group: 'bottom'
    },
    {
      group: 'left'
    }
  ]
}

//注册基础图形节点
export const registerBaseNode = ()=>{
  //注册流程基础节点
  //1.自定义矩形
  Graph.registerNode('custom-rect', {
    inherit: 'rect',
    width: 80,
    height: 36,
    attrs: commonAttrs,
    ports:{...commonPorts}
  },true);
  
  //2.自定义多边形
  Graph.registerNode('custom-polygon', {
    inherit: 'polygon',
    width: 80,
    height: 38,
    attrs: commonAttrs,
    ports:{...commonPorts}
  },true);

  //3.自定义圆
  Graph.registerNode('custom-circle', {
    inherit: 'circle',
    width: 48,
    height: 48,
    attrs: commonAttrs,
    ports:{...commonPorts}
  },true);

  //5.自定义文本框
  Graph.registerNode('custom-text', {
    inherit: 'text-block',
    width: 60,
    height: 36,
    attrs: {
      body: {
        rx: 4,
        ry: 4,
        fill: '#fff',
        stroke: '#fff'
      },
      text: commonAttrs.text,
    },
    ports:{...commonPorts}
  },true);

  //6.自定义路径
  Graph.registerNode('custom-path', {
    inherit: 'path',
    width: 60,
    height: 36,
    attrs: commonAttrs,
    ports:{...commonPorts}
  },true);

  //7.自定义菱形
  Graph.registerNode('custom-image', {
    inherit: 'rect',
    width: 54,
    height: 54,
    markup: [
      {
        tagName: 'rect',
        selector: 'body'
      },
      {
        tagName: 'image'
      },
      {
        tagName: 'text',
        selector: 'label'
      }
    ],
    attrs: {
      body: commonAttrs.body,
      image: {
        width: 26,
        height: 26,
        refX: 13,
        refY: 16
      },
      label: {
        refX: 3,
        refY: 2,
        textAnchor: 'left',
        textVerticalAnchor: 'top',
        fontSize: 12,
        fill: '#fff'
      }
    },
    ports:{...commonPorts}
  },true);

  //注册图片节点
  Graph.registerNode('custom-image', {
    inherit: 'rect',
    width: 80,
    height: 80,
    markup: [
      { tagName: 'rect',selector: 'body'},
      { tagName: 'image',selector: 'image'},
      { tagName: 'text',selector: 'label'}
    ],
    attrs: {
      body: {
        refWidth: '100%',
        refHeight: '100%',
        stroke: '#8f8f8f',
        fill: '#fff',
        strokeWidth: 1,
        rx: 4,
        ry: 4
      },
      image: {
        'ref-x': 0,
        'ref-y': 0,
        'ref-width': '100%',
        'ref-height': '100%',
        href: '', // 动态覆盖
        preserveAspectRatio: 'xMidYMid meet' // 保持比例居中
      },
      label: {
        refX: 0.5,
        refY: '105%', // 标签在节点下方
        textAnchor: 'middle',
        textVerticalAnchor: 'top',
        fontSize: 12,
        fill: '#333'
      }
    },
    ports:{...commonPorts}
  },true);
}

//加载侧边栏元素
export const loadStencil = (graph:Graph,stencil:Stencil)=>{

  const r1 = graph.createNode({
    shape: 'custom-rect',
    label: '开始',
    attrs: {
      body: {
        rx: 18,
        ry: 26
      },
    },
    ports: { items: [] },
  });
  const r2 = graph.createNode({
    shape: 'custom-rect',
    label: '过程',
    ports: { items: [] }
  })
  const r3 = graph.createNode({
    shape: 'custom-rect',
    attrs: {
      body: {
        rx: 6,
        ry: 6
      }
    },
    label: '可选过程',
    ports: { items: [] }
  })
  const r4 = graph.createNode({
    shape: 'custom-polygon',
    attrs: {
      body: {
        refPoints: '0,10 10,0 20,10 10,20'
      }
    },
    label: '决策',
    ports: { items: [] }
  })
  const r5 = graph.createNode({
    shape: 'custom-polygon',
    attrs: {
      body: {
        refPoints: '10,0 40,0 30,20 0,20'
      }
    },
    label: '数据',
    ports: { items: [] }
  })
  const r6 = graph.createNode({
    shape: 'custom-circle',
    label: '连接',
    ports: { items: [] }
  })
  const r7 = graph.createNode({   
    shape: 'custom-path',
    label: '文档',
    attrs: {
      body: {
        refD: 'M 0 0 0 4 C 10 8 15 2 25 5 L 25 0 Z'
      }
    },
    ports: { items: [] }
  })
  const r8 = graph.createNode({
    shape: 'custom-path',
    label: '手动输入',
    attrs: {
      body: {
        refD: 'M 0 7 0 15 15 15 15 5 Z'
      }
    },
    ports: { items: [] }
  })
  stencil.load([r1, r2, r3, r4, r5, r6, r7, r8], 'basic-node');

  //添加图片节点
  const imageNodes = Object.keys(NODE_ICONS).map(key => {
    return graph.createNode({
      shape: 'custom-image',
      label: key,
      attrs: {
        image: {
          href: NODE_ICONS[key].icon
        }
      },
      ports: { items: [] }
    })
  });
  stencil.load(imageNodes, 'image-node');
}

 // ✅ 【关键】添加精准连接桩显隐控制（仅作用于当前悬停节点）
export const toggleNodePorts = (cellView: any,graph:Graph, show: boolean) => {
  if (!cellView?.container) return;
  graph.getNodes().forEach(node => {
    const view = graph.findViewByCell(node);
    if (!view?.container) return
    const ports = view.container.querySelectorAll<HTMLElement>('.x6-port-body')
    ports.forEach((port: HTMLElement) => {
      port.style.visibility = show ? 'visible' : 'hidden'
    // 可选：添加过渡效果（更优雅）
    port.style.transition = 'visibility 0.15s ease'
    })
  })
}
