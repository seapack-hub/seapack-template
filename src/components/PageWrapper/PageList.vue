<template>
  <div class="page-list">
    <!--查询部分-->
    <div
        class="page-list__search"
        v-if="slots?.search || innerConfig.search.length>0"
    >
      <!--筛选条件-->
      <div :class="['search-container']">
        <!--具名插槽search:可以使用默认值，也可自定义传入-->
        <slot name="search">
          <template v-for="(item,index) in innerConfig.search" :key="item.name">
            <!--下拉选择框-->
            <el-select
                v-if="item.component === 'el-select'"
                size="large"
                v-bind="item.props"
                v-model="item.props.modelValue"
            >
              <el-option
                  v-for="step in item.options"
                  :key="step.value"
                  :label="step.label"
                  :value="step.value"
              ></el-option>
            </el-select>
            <!--级联下拉选择框-->
            <el-cascader
                v-else-if="item.component === 'el-cascader'"
                size="large"
                v-bind="item.props"
                v-model="item.props.modelValue"
                :props="item.cascaderProps"
                :options="item.options"
                collapse-tags-tooltip
            ></el-cascader>
            <!--render自定义组件-->
            <CustomSearchCom
                v-else-if="item.render"
                size="large"
                :vnode="item.render"
                :value="item.modelValue"
                v-bind="item.props"
                v-model="item.props.modelValue"
            ></CustomSearchCom>
            <!--el-input和其他-->
            <component
                v-else
                :is="item.component||'el-input'"
                size="large"
                :ref="setRef(index)"
                v-bind="item.props"
                v-model="item.props.modelValue"
            ></component>
          </template>
        </slot>
      </div>
      <!--查询操作-->
      <div class="search-feature">
        <el-link
            type="primary"
            :underline="false"
            v-if="showToggleButton"
            @click="onSearchExpand"
        >
          {{isExpanded?'收起筛选':'更多筛选'}}
          <el-icon class="">
            <arrow-down v-if="!isExpanded" />
            <arrow-up v-else />
          </el-icon>
        </el-link>
        <el-button type="primary" @click="onSearch()" :style="{ marginLeft: '12px' }">
          查询
        </el-button>
        <el-button
            :style="{ color: '#0083ff', borderColor: '#0083ff', backgroundColor: '#fff' }"
            @click="resetParams"
        >
          重置
        </el-button>
      </div>
    </div>
    <!--方法插槽-->
    <div
        class="page-list__function"
        v-if="slots?.function"
    >
      <slot name="function"></slot>
    </div>
    <!--页面主体-->
    <div class="page-list__container">
      <!--表格-->
      <el-table
          ref="multipleTableRef"
          stripe
          v-loading="loading"
          v-bind="innerConfig.tableProps"
          :data="data.list"
          @current-change="handleCurrentChange"
          @selection-change="handleSelectionChange"
          @sort-change="sortChange"
      >

      </el-table>
    </div>
  </div>
</template>

<script setup lang="tsx">
import { ArrowDown, ArrowUp } from '@element-plus/icons-vue';
import {mergeWith} from "lodash-es";
import {useLoading} from "@/hooks/useGlobal.ts";


const {loading,showLoading,cancelLoading} = useLoading();

//定义变量
const showToggleButton = ref(false);
//是否展开
const isExpanded = ref(false);


//组件传参
const props = defineProps({
    //组件传入配置
    config:{
        type:Object,
        default:()=>({})
    },
    fit: {
        type: Boolean,
        default: true
    }
});

//用于获取当前组件的内部实例。
const slots = getCurrentInstance()?.proxy?.$slots;
//设置默认配置
const defaultConfig = {
    search:[], // 查询条件
    index:0,  //表格列序号
    // 表格列勾选
    select:{
        show:false,
        onSelectionChange: () => {},
        onCurrentChange: () => {}
    },
    tableProps: {},
    columns: [], // 表格列数据
    // 表格数据
    table: {
        emptyText: '暂无数据',
        emptyErrorText: '接口数据异常'
    },
    // 分页信息
    page: {
        show: true, //是否展示分页
        pageNum: 1,
        pageSize: 20
    }
};

//合并默认配置和传入配置，以传入配置为主
const innerConfig = ref(
    mergeWith(defaultConfig,props.config,(_,srcValue)=>{
        return ref(srcValue);
    })
);

const refs = ref([]);

function setRef(index){
    return (el)=>{
        refs.value[index] = el;
    };
}

//定义组件
//定义查询组件
const CustomSearchCom = defineComponent({
    props:{
        vnode:{
            type:Function,
            default:()=>{}
        },
        value:{
            type:Object,
            default:()=>({})
        }
    },
    render(){
        const n = this.vnode(this.value);
        return h(n);
    }
});

/**
 * 展开与收缩
 */
function onSearchExpand() {
    isExpanded.value = !isExpanded.value;
    nextTick(calcTableContainer);
}

/**
 * 计算表单布局
 */
function calcTableContainer(){

}

//定义表格变量
const data = ref({
    list:[],
    total:0,
    error:false,
    errorMsg:"",
});

//查询
function onSearch(){

}

function handleCurrentChange(v){
  innerConfig.value.selection.onCurrentChange(v);
}

function handleSelectionChange(v){
  if (innerConfig.value.selection.show) {
    innerConfig.value.selection.onSelectionChange(v);
  }
}

function sortChange({ prop, order }){
// 默认 倒序  ： sort=startTime   sort=startTime_desc
  // 正序： sort=startTime_asc
  const sortMap = {
    ascending: 'asc',
    descending: 'desc'
  };
  const params = {};
  if (order) {
    params.order = `${prop}_${sortMap[order]}`;
  }
  fetchData(params, { page: 1 });
}

</script>

<style scoped lang="scss">

</style>