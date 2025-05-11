<template>
  <div class="page-list">
    <!--查询部分-->
    <div class="page-list__search" v-if="slots?.search || innerConfig.search.length > 0">
      <!--筛选条件-->
      <div :class="['search-container']">
        <!--具名插槽search:可以使用默认值，也可自定义传入-->
        <slot name="search">
          <template v-for="item in innerConfig.search" :key="item.name">
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
            <CustomCom
              v-else-if="item.render"
              size="large"
              :vnode="item.render"
              :value="item.modelValue"
              v-bind="item.props"
              v-model="item.props.modelValue"
            ></CustomCom>
            <!--el-input和其他-->
            <component
              v-else
              :is="item.component || 'el-input'"
              size="large"
              v-bind="item.props"
              v-model="item.props.modelValue"
            ></component>
          </template>
        </slot>
      </div>
      <!--查询操作-->
      <div class="search-feature">
        <el-link type="primary" :underline="false" v-if="showToggleButton" @click="onSearchExpand">
          {{ isExpanded ? '收起筛选' : '更多筛选' }}
          <el-icon class="">
            <arrow-down v-if="!isExpanded" />
            <arrow-up v-else />
          </el-icon>
        </el-link>
        <el-button type="primary" @click="onSearch()" :style="{ marginLeft: '12px' }"> 查询 </el-button>
        <el-button
          :style="{
            color: '#0083ff',
            borderColor: '#0083ff',
            backgroundColor: '#fff'
          }"
          @click="resetParams"
        >
          重置
        </el-button>
      </div>
    </div>
    <!--方法插槽-->
    <div class="page-list__function" v-if="slots?.function">
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
      >
        <!--勾选框-->
        <el-table-columns v-if="innerConfig.select?.show" type="selection" width="55" fixed="left"></el-table-columns>
        <!--序号-->
        <el-table-columns
          fixed="left"
          type="index"
          :index="innerConfig.index"
          label="序号"
          width="80"
        ></el-table-columns>
        <!--正常列-->
        <template v-for="item in innerConfig.columns" :key="item.prop">
          <!--render函数自定义节点-->
          <el-table-columns v-if="item.render" v-bind="item">
            <template #default="scope">
              <custom-com :vnode="item.render" :scope="scope" />
            </template>
          </el-table-columns>
          <el-table-columns v-else-if="item.map" v-bind="item" show-overflow-tooltip>
            <template #default="scope">
              <span>{{ item.map[scope.row[item.prop]] }}</span>
            </template>
          </el-table-columns>
          <!--自定义展示格式-->
          <el-table-columns v-else-if="item.formatter" v-bind="item" show-overflow-tooltip>
            <template #default="scope">
              <span>{{ item.formatter(scope.row[item.prop], item.props, item) || '-' }}</span>
            </template>
          </el-table-columns>
          <!--普通列-->
          <el-table-columns v-else v-bind="item" show-overflow-tooltip>
            <template #default="scope">
              <span>
                {{ scope.row[item.prop] || scope.row[item.prop] == 0 ? scope.row[item.prop] + '' || '--' : '--' }}
              </span>
            </template>
          </el-table-columns>
        </template>
        <!--操作列-->
        <template v-if="innerConfig.operate?.useOperate">
          <el-table-columns label="操作" fixed="right" :min-width="innerConfig.operate.minWidth">
            <template #default="scope">
              <template v-for="item in innerConfig.operate.operates()" :key="item">
                <el-button
                  v-if="Object.keys(operateMap).includes(item.toString())"
                  type="primary"
                  link
                  @click="onOperate(operateMap[item as keyof typeof operateMap], scope)"
                ></el-button>
                <!--render函数自定义节点-->
                <custom-com v-else-if="typeof item === 'object' && item.render" :vnode="item.render" :scope="scope" />
              </template>
            </template>
          </el-table-columns>
        </template>
        <template #empty>
          <span :class="{ 'color-danger': data.error }">
            {{ data.error ? data.errorMsg || innerConfig.table?.emptyErrorText : innerConfig.table?.emptyText }}
          </span>
        </template>
      </el-table>
      <!--分页-->
      <div class="page-wrapper">
        <el-pagination
          v-model:page-size="innerConfig.page?.pageSize"
          v-model:current-page="innerConfig.page?.pageNum"
          :page-sizes="[10, 20, 30, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="Number(data.total)"
          @size-change="onSizeChange"
          @current-change="onPageChange"
        ></el-pagination>
      </div>
    </div>
  </div>
</template>

<script setup lang="tsx">
import { ArrowDown, ArrowUp } from '@element-plus/icons-vue';
import { mergeWith } from 'lodash-es';
import { useLoading, useOperateTypeEnum } from '@/hooks/useGlobal.ts';
import { ConfigType, SearchParamType, OperateButtonType } from './types.ts';
import { withDefaults } from 'vue';
import { type AxiosResponse } from 'axios';
const { loading, showLoading, cancelLoading } = useLoading();
const { updateType, deleteType, detailType, importType, exportType } = useOperateTypeEnum();
//定义Props接口
interface DefaultProps {
  config: ConfigType;
  fit: boolean;
}
//定义表格项接口
interface ListItemType {
  [key: string]: any;
}
//withDefaults给 props设置默认值
const props = withDefaults(defineProps<DefaultProps>(), { fit: false });

//定义变量
const showToggleButton = ref(false);
//是否展开
const isExpanded = ref(false);
//用于获取当前组件的内部实例。
const slots = getCurrentInstance()?.proxy?.$slots;
//设置默认配置
const defaultConfig: ConfigType = {
  search: [], // 查询条件
  index: 0, //表格列序号
  // 表格列勾选
  select: {
    show: false,
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
  },
  //操作列
  operate: {
    useOperate: false,
    minWidth: 120,
    operates: () => [1, 2], // 1:详情, 2:删除
    onClick: () => {}
  }
};
//设置默认查询参数
const queryParams = defineModel('queryParams');
//定义表格变量
const data = ref({
  list: [],
  total: 0,
  error: false,
  errorMsg: ''
});

const operateMap = {
  1: { label: '详情', type: detailType },
  2: { label: '删除', type: deleteType, auth: 'delete' },
  3: { label: '编辑', type: updateType, auth: 'update' },
  4: { label: '导入', type: importType, auth: 'import' },
  5: { label: '导出', type: exportType, auth: 'export' }
};

//合并默认配置和传入配置，以传入配置为主
const innerConfig = ref(
  mergeWith(defaultConfig, props.config, (_, srcValue) => {
    return ref(srcValue);
  })
);

//render函数自定义组件
const CustomCom = defineComponent({
  props: {
    vnode: {
      type: Function,
      default: () => {}
    },
    scope: {
      type: Object,
      default: () => ({})
    }
  },
  render() {
    const n = this.vnode(this.scope);
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
function calcTableContainer() {}

//查询
function onSearch() {
  //执行查询
  const params: Record<string, any> = {};
  innerConfig.value.search.forEach((item: SearchParamType) => {
    //收集筛选条件
    if (item.formatParams) {
      params[item.name] = item.formatParams(item.props.modelValue);
    } else {
      params[item.name] = item.props.modelValue;
    }
  });
  //赋值
  queryParams.value = params;
  //将页数定位到第一页
  onPageChange(1);
}
//重置参数
function resetParams() {}

//
function handleCurrentChange(v: ListItemType | undefined) {
  innerConfig.value.select?.onCurrentChange(v);
}

function handleSelectionChange(v: ListItemType | undefined) {
  if (innerConfig.value.select?.show) {
    innerConfig.value.select.onSelectionChange(v);
  }
}

//查询表格
async function fetchData(params: Object, otherParams: Object = {}) {
  if (props.config.onFetch) {
    //开始加载
    showLoading();
    const p = { ...params, ...otherParams };
    props.config
      .onFetch(p)
      .then((res: AxiosResponse) => {
        data.value.list = res.data.list;
        data.value.total = res.data.total;
        data.value.error = false;
      })
      .catch((e: any) => {
        const errMsg = e.data ? e.data.msg : '接口异常';
        data.value = { list: [], total: 0, error: true, errorMsg: errMsg };
      })
      .finally(() => {
        //关闭加载
        cancelLoading();
      });
  }
}

function onSizeChange(v: number) {
  const params = {
    ...(queryParams.value as Object),
    pageNum: innerConfig.value.page?.pageNum,
    pageSize: v
  };
  fetchData(params);
}

function onPageChange(v: number) {
  const params = {
    ...(queryParams.value as Object),
    pageNum: v,
    pageSize: innerConfig.value.page?.pageSize
  };
  fetchData(params);
}

//操作按钮点击事件
function onOperate(operateInfo: OperateButtonType, scope: ScopeType) {
  innerConfig.value.operate?.onClick(operateInfo, scope);
}
</script>

<style scoped lang="scss"></style>
