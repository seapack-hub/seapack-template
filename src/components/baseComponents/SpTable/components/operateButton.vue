<!--组件功能：是根据按钮配置和当前行数据，动态生成不同类型的操作按钮 -->
<!--并在按钮数量较多时自动将部分按钮收纳到下拉菜单中，保持界面整洁。-->
<template>
  <div class="operate-button-wrapper flex gap-x-10px flex-justify-start flex-items-center">
    <!--直接显示按钮组-->
    <template
      v-for="(btnItem,btnIndex) in showButtons"
      :key="btnIndex"
    >
      <!--复杂操作按钮:用于需要打开弹窗、抽屉或新页面的复杂操作（如编辑、查看详情）-->
      <SpButtonPermission
        v-if="btnItem.targetView || btnItem.metaKey"
        :button-permission="btnItem?.buttonPermission"
      >
        <!--vIFHandler:控制按钮是否显示（条件渲染）-->
        <!--disabledHandler:控制按钮是否禁用状态-->
        <SpAction
          v-if="btnItem?.vIFHandler ? btnItem.vIFHandler(scope) : true"
          :disabled="btnItem?.disabledHandler ? btnItem.disabledHandler(scope) : false"
          :row="scope.row"
          v-bind="btnItem"
        ></SpAction>
      </SpButtonPermission>
      <!--带确认的操作按钮:用于删除等破坏性操作，需要用户二次确认-->
      <!--通过 el-popconfirm 提供友好的确认提示，防止误操作-->
      <SpButtonPermission
        v-else-if="btnItem.popconFirm"
        :button-permission="btnItem?.buttonPermission"
      >
        <el-popconfirm
          v-if="btnItem?.vIFHandler ? btnItem.vIFHandler(scope):true"
          :icon="WarningFilled"
          v-bind="getProps(btnItem.popconFirm)"
          :disabled="btnItem?.disabledHandler? btnItem.disabledHandler(scope):false"
          @confirm="btnItem.click(scope)"
        >
          <template #reference>
            <el-link
              :disabled="btnItem?.disabledHandler ? btnItem.disabledHandler(scope) : false"
              v-bind="btnItem"
              :underline="false"
            >
              {{ btnItem.label }}
            </el-link>
          </template>
        </el-popconfirm>
      </SpButtonPermission>
      <!--普通链接按钮:简单的点击操作，如刷新、导出等-->
      <SpButtonPermission
        v-else
        :button-permission="btnItem?.buttonPermission"
      >
        <el-link
          v-if="btnItem?.vIFHandler ? btnItem.vIFHandler(scope) : true"
          :disabled="btnItem?.disabledHandler ? btnItem.disabledHandler(scope) : false"
          :underline="false"
          v-bind="btnItem"
          @click="btnItem.click(scope)"
        >
          {{ btnItem.label }}
        </el-link>
      </SpButtonPermission>
    </template>
    <!--下拉框按钮组-->
    <template v-if="dropDownButtons.length > 0">
      <el-dropdown class="flex justify-center items-center">
        <el-link
          :underline="false"
          type="primary"
        >
          更多
          <SPIcon
            size="14px"
            class="m-l-2px"
            name="arrow_down"
          ></SPIcon>
          <template #dropdown>
            <el-dropdown-menu>
              <template
                v-for="(btnItem, btnIndex) in dropDownButtons"
                :key="btnIndex"
              >
                <el-dropdown-item
                  v-if="btnItem?.vIFHandler ? btnItem.vIFHandler(scope) : true"
                  :disabled="btnItem?.disabledHandler ? btnItem.disabledHandler(scope) : false"
                  class="!p-0"
                >
                  <SpAction
                    v-if="btnItem.targetView || btnItem.metaKey"
                    :disabled="btnItem?.disabledHandler ? btnItem.disabledHandler(scope) : false"
                    :row="scope.row"
                    v-bind="btnItem"
                    class="w-100% !p-x-15px !p-y-7px"
                  ></SpAction>
                  <el-link
                    v-else
                    :disabled="btnItem?.disabledHandler ? btnItem.disabledHandler(scope) : false"
                    :underline="false"
                    v-bind="btnItem"
                    class="w-100% !p-x-15px !p-y-7px"
                    @click="dropdownClick(btnItem, scope)"
                  >
                    {{ btnItem.label }}
                  </el-link>
                </el-dropdown-item>
              </template>
            </el-dropdown-menu>
          </template>
        </el-link>
      </el-dropdown>
    </template>
  </div>
</template>

<script setup lang="ts">
import { WarningFilled } from '@element-plus/icons-vue';
import { computed, PropType } from 'vue';
import { useRoute } from 'vue-router';
import useButtonPermission from '@/hooks/useButtonPermission'

const props = defineProps({
  //接收按钮配置数组，用于定义操作列中所有可能的按钮
  buttons:{
    type:Array as PropType<any[]>,
    default:()=>[]
  },
  //提供当前行的数据上下文，通常包含 row 属性表示行数据
  scope:{
    type: Object as PropType<any>,
    default:()=>({})
  },
  //控制直接显示的按钮数量阈值，超出部分将被收纳到下拉菜单中。
  operateButtonCount:{
    type:Number,
    default:3
  }
});

const route:any = useRoute();

//从当前路由的元数据中筛选出类型为 'row' 的按钮配置列表
const buttonList = computed(()=>{
  return route?.meta?.buttonList?.filter((item:{type:string})=> item.type === 'row')??[];
});

const { buttonHasPermission } = useButtonPermission();

//获取所有展示的按钮
const allShowButtons = computed(()=>{
  const buttons = props.buttons;
  return buttons?.filter((item:any)=>{
    //权限验证优先：如果路由配置了按钮列表，则检查每个按钮的权限
    if(buttonList.value.length>0){
      return (item?.buttonPermission?buttonHasPermission(item.buttonPermission):true) 
      && (item?.vIFHandler ? item.vIFHandler(props.scope) : true)
    }else{
      //通过可选的 vIFHandler 方法实现基于行数据的动态显示逻辑。
      return item?.vIFHandler ? item.vIFHandler(props.scope) : true
    }
  })
});

//多个按钮，获取直接展示的按钮
const showButtons = computed(()=>{
  console.log('--全展示按钮--',allShowButtons.value)
  const buttons = allShowButtons.value;
  // 获取展示的前operateButtonCount按钮
  return buttons.length > props.operateButtonCount ? 
  (buttons?.filter((_item:any, index:number) => index < props.operateButtonCount - 1) ?? []):buttons
});
console.log('直接展示按钮',showButtons.value);
//多个按钮，获取下拉隐藏的按钮
const dropDownButtons = computed(()=>{
  const buttons = allShowButtons.value;
  // 获取隐藏的下拉按钮
  return buttons.length > props.operateButtonCount ? 
  (buttons?.filter((_item:any, index:number) => index >= props.operateButtonCount - 1) ?? []):[]
});

console.log('下拉展示按钮',dropDownButtons.value);

// getProps 方法确保配置参数格式统一
const getProps = (data:any)=>{
  return typeof data === 'object' ? data:{ title : data };
};

// 下拉点击
const dropdownClick = (data: any, scope: any) => {
  if (data.popconFirm) {
    //为破坏性操作提供确认对话框，增强交互安全性
    ElMessageBox.confirm(typeof data.popconFirm === 'string' ? data.popconFirm :{ type: data.label }, {
      type: 'warning'
    }).then(() => data.click(scope))
  } else {
    data.click(scope)
  }
}
</script>

<style lang="scss" scoped></style>