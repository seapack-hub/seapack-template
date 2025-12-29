<template>
  <el-table 
    v-if="refreshTable"
    v-bind="{...$attrs,border:true}"
    ref="SpTableRef"
    v-loading="loading"
    element-loading-text="Loading..."
    :header-row-style="rowStyle"
    :header-cell-style="{ ...headerCellStyle }"
    :row-style="rowStyle"
    :cell-style="{ ...cellStyle }"
    stripe
  >
    <slot>
      <!--序号列-->
      <el-table-column
        v-if="showIndex"
        v-bind="{ label: '序号', width: '60px', type: 'index', align: 'center' }"
      ></el-table-column>
      <template
        v-for="(item,index) in columns"
        :key="index"
      >
        <!--操作列，固定在右侧-->
        <template v-if="item.columnType === 'operate'">
          <el-table-column 
            v-if="showOperateButton"
            v-bind="{ align: 'left', width: '200px', minWidth: '200px', fixed: 'right', ...item }"
            :key="index"
          >
            <template #default="scope">
              <OperateButton
                :buttons="item.buttons"
                :scope
                v-bind="$attrs"
              ></OperateButton>
            </template>
          </el-table-column>
        </template>
        <!--保留具名插槽，可以自定义列-->
        <slot
          v-else-if="item.slotName"
          :name="item.slotName"
        ></slot>
        <!--处理一些特殊列-->
        <template v-else-if="item.type">
          <!--勾选框列-->
          <el-table-column 
            v-if="item.type === 'selection'" 
            v-bind="{...{width:'50px',align:'center',fixed:'left'},...item}"
          ></el-table-column>
          <!--展开行列-->
          <el-table-column
            v-else-if="item.type === 'expand'"
            v-bind="{...{fixed:'left'},...item}"
          >
            <template #default="props">
              <slot
                name="expand"
                :props
              ></slot>
            </template>
          </el-table-column>
        </template>
        <!--表头提示列-->
        <el-table-column
          v-else-if="item.tips"
          v-bind="showEmpty?{
            //空值显示为 -- 
            formatter: (_row: any, _column: any, cellValue: any) => {
              return cellValue ?? '--'
            },
            //内容溢出时显示提示
            showOverflowTooltip: true,
            ...item
          }:{
            showOverflowTooltip: true,
            ...item
          }"
        >
          <!--自定义列表头模板-->
          <template #header>
            <div class="size-full flex items-center">
              {{ item.label }}
              <el-tooltip
                placement="top"
                :content="item.tips"
              >
                <SPIcon 
                  name="tips"
                  size="15px"
                ></SPIcon>
              </el-tooltip>
            </div>
          </template>
        </el-table-column>
        <!--普通列-->
        <el-table-column
          v-else
          v-bind="showEmpty? {
            formatter: (_row: any, _column: any, cellValue: any) => {
              return cellValue ?? '--'
            },
            showOverflowTooltip: true,
            ...item
          }: { 
            showOverflowTooltip: true, 
            ...item
          }"
        />
      </template>
    </slot>
    <template #empty>
      <slot name="empty">
        <SpEmpty></SpEmpty>
      </slot>
    </template>
  </el-table>
</template>

<script setup lang="ts">
import { ElTable } from 'element-plus'
import {CSSProperties, PropType} from 'vue';
import { columnsType } from './type';
//刷新列表
const refreshTable = ref(true);
// 获取 el-table 实体
const SpTableRef = ref<InstanceType<typeof ElTable>>()
//传入参数
const props = defineProps({
  //加载
  loading:{
    type:Boolean,
    default:false
  },
  rowStyle:{
    type:Object as PropType<CSSProperties>,
    default: () => {
      return {
        height: '48px'
      }
    }
  },
  headerCellStyle: {
    type: Object as PropType<CSSProperties>,
    default: () => {
      return {
        'font-size': '14px',
        'font-weight': 500,
        background: '#f3f5fa',
        color: '#99A3AF'
      }
    }
  },
  cellStyle: {
    type: Object as PropType<any>,
    default: () => {
      return {
        'font-size': '14px',
        'font-weight': 400,
        color: '#303133'
      }
    }
  },
  //是否展示序号列
  showIndex: {
    type: Boolean,
    default: false
  },
  //表头列数据
  columns:{
    type: Array as PropType<columnsType>,
    default: () => []
  },
  //为空是否展示
  showEmpty:{
    type:Boolean,
    default:true
  }
});
//是否展示操作按钮
const showOperateButton = ref(true);

//在props.columns 变化时，将refreshTable从true变为false，马上改变refreshTable的值为true，从而重新渲染列表
watch(
  ()=>props.columns,
  ()=>{
    refreshTable.value = false;
    setTimeout(() => {
      refreshTable.value = true;
    }, 0);
  },
  {deep:true}
);

//暴露el-table组件
defineExpose({SpTableRef});
</script>

<style lang="scss" scoped></style>