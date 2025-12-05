<template>
  <!-- 链接形态 -->
  <el-link
    v-if="renderType === 'link'"
    v-bind="$attrs"
    :underline="true"
    @click="handleAction"
  >
    {{ label }}
  </el-link>
  <!-- 按钮形态 -->
  <el-button
    v-else-if="renderType === 'button'"
    v-bind="$attrs"
    @click="handleAction"
  >
    {{ label }}
  </el-button>
  <!-- 插槽自定义形态 -->
  <slot
    v-else
    name="label"
    v-bind="$attrs"
    @click="handleAction"
  ></slot>
</template>

<script setup lang="ts">
import { PropType } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const router = useRouter();
const route = useRoute();

const props = defineProps({
  // 显示动作名
  label:{
    type:String,
    default:""
  },
  // 动作类型 可选值 add | edit | view , 新增为add、编辑为edit、详情为view
  actionType:{
    type:String,
    default:"add",
    validator:(value:string)=>{
      return ['add','edit','view','create','detail'].includes(value);
    }
  },
  // 按钮渲染方式，可选值Button | Link | slot, 一般情况下为button，表格行操作为Link, 支持插槽自定义
  renderType:{
    type:String,
    default:'button',
    validator:(value:string)=>{
      return ['button','link','slot'].includes(value);
    }
  },
  action: {
    type: [String, Promise, Function],
    default: null
  },
  //打开方式 默认dialog，可选值 dialog | drawer | newPage | routePage | blank    drawer 抽屉，dialog 弹窗，newPage 新页面路由不变化，routePage 路由跳转，blank 新窗口打开
  openViewType: {
    type: String as PropType<'dialog' | 'newPage' | 'routePage' | 'blank'>,
    default: 'dialog',
    validator: (value: string) => {
      return ['dialog', 'newPage', 'routePage', 'blank'].includes(value)
    }
  },
  //打开方式参数配置项
  openViewOptions: {
    type: Object,
    default: () => {}
  },
  //指定打开的组件
  targetView: {
    type: null,
    default: null
  },
  activeRouteName: {
    type: String,
    default: ''
  },
  metaKey: {
    type: String,
    default: ''
  },
  // Action请求时额外传递 env 参数
  env: {
    type: null,
    default: null
  },
  row: {
    type: Object,
    default: () => {}
  },
  after: {
    type: Function,
    default: null
  },
  before: {
    type: Function,
    default: null
  },
  isNewAction: {
    type: Boolean,
    default: false
  }
});

// 按钮、连接点击逻辑
const handleAction = ()=>{
  const action = props.action;
  if(action instanceof Promise){
    action;
  }else if(action instanceof Function){
    action();
  }else{
    if(action === 'openView') openView();
  }
};

//跳转界面
const openView = async ()=>{
  try{
    const { metaKey, actionType, openViewType, openViewOptions, row } = props;
    if (!['dialog', 'newPage', 'routePage', 'blank'].includes(openViewType)) return;

    //处理环境数据
    const getEnvData = ()=>{
      if(typeof props.env === 'function') return props.env(row);
      if(props.env === 'row') return row;
      return props.env;
    }

    const envData = getEnvData();

    // 公共路由参数构造
    const getRouteQuery = () => ({
      env: safeJsonStringify(envData), // 应实现安全序列化方法
      openViewOptions: safeJsonStringify(openViewOptions),
      actionType,
      activeRouteName: props.activeRouteName || String(route.name),
      openViewType
    });

    if(['dialog','newPage'].includes(openViewType)){
      if(!metaKey) return;
      //todo
    }else {
      const routeConfig = {
        path: `/detailPage/${metaKey}`,
        query: getRouteQuery()
      }

      // 标准路由跳转
      if (openViewType === 'routePage') {
        await router.push(routeConfig)
      } else if (openViewType === 'blank') {
        // 新窗口打开
        const resolved = router.resolve(routeConfig)
        window.open(resolved.href, '_blank')
      }
    }

  }catch{

  }
}
// 安全序列化函数示例
function safeJsonStringify(obj: Record<string, any>) {
  try {
    return JSON.stringify(obj, (_key, value) => (typeof value === 'function' ? undefined : value))
  } catch {
    return '{}'
  }
}
</script>

<style lang="scss" scoped></style>