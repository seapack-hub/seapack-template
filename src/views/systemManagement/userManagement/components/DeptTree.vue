<!-- 部门树 -->
<template>
  <el-card
    shadow="never"
    class="card-body"
  >
    <el-input
      v-model="deptName"
      placeholder="部门名称"
      clearable
    >
      <template #prefix>
        <el-icon><Search /></el-icon>
      </template>
    </el-input>

    <el-tree
      ref="deptTreeRef"
      class="left-tree"
      :data="deptList"
      :props="{ children: 'children', label: 'deptName', disabled: '' }"
      :expand-on-click-node="false"
      :filter-node-method="handleFilter"
      default-expand-all
      :highlight-current="true"
      @node-click="handleNodeClick"
    />
  </el-card>
</template>

<script setup lang="ts">
import DeptAPI ,{DeptVO} from "@/api/system/dept";
const props = defineProps({
  modelValue: {
    type: [Number],
    default: undefined,
  },
});

const deptList = ref<DeptVO[]>(); // 部门列表
const deptTreeRef = ref(ElTree); // 部门树
const deptName = ref(); // 部门名称

const emits = defineEmits(["node-click"]);

const deptId = useVModel(props, "modelValue", emits);

watchEffect(
  () => {
    deptTreeRef.value.filter(deptName.value);
  },
  {
    flush: "post", // watchEffect会在DOM挂载或者更新之前就会触发，此属性控制在DOM元素更新后运行
  }
);

/**
 * 部门筛选
 */
function handleFilter(value: string, data: any) {
  if (!value) {
    return true;
  }
  return data.deptName.indexOf(value) !== -1;
}

/** 部门树节点 Click */
function handleNodeClick(data: { [key: string]: any }) {
  deptId.value = data.deptId;
  emits("node-click");
}

onBeforeMount(() => {
  DeptAPI.getDeptTree().then((data) => {
    deptList.value = data;
  });
});
</script>
<style lang="scss" scoped>
.card-body{
  height: 100%;
  .left-tree{
    margin-top: 12px;
  }
}
</style>
