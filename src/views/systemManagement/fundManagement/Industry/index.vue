<template>
   <div class="app-container w-100% h-100% flex flex-col">
    <!--查询条件-->
    <div class="search-bar h-[50px]">
      <el-form ref="queryFormRef" :model="queryParams" :inline="true">
        <el-form-item
          label="关键字"
          prop="keywords"
        >
          <el-input
            v-model="queryParams.keyword"
            placeholder="行业代码/编号"
            clearable
            style="width: 200px"
            @keyup.enter="debouncedQuery"
          />
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            icon="search"
            @click="debouncedQuery"
          >
            搜索
          </el-button>
          <el-button
            icon="refresh"
            @click="handleResetQuery"
          >
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </div>
    <el-card class="el-card-main flex-1 flex-col gap-10px" shadow="never">
      <el-table 
       class="flex-1" 
       v-loading="loading"
       :data="tableData"
       border
       lazy
       row-key="industryId"
       :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
      >
       <template
          v-for="item in tableColumns" :key="item.prop"
        > 
          <el-table-column 
            v-if="item.prop ==='industryState'"
            v-bind="{ align: 'left',fixed: 'right', ...item }"
          >
            <template #default="scope">
              <el-tag :type="scope.row.industryState == 1 ? 'success' : 'info'">
                {{ scope.row.industryState == 1 ? '启用' : '停用' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column v-else
              v-bind="{ align: 'left',fixed: 'right', ...item }"
          ></el-table-column>
       </template>
      </el-table>
    </el-card>
   </div>
</template>

<script setup lang="ts">
import industryApi, { DimIndustryTree } from "@/api/system/industry";
import { debounce } from 'lodash-es';
const queryParams = ref({
  keyword:""
});

//表格头信息
const tableColumns = ref([
  { label: '行业唯一标识',prop: 'industryId',minWidth: '120px'},
  { label: '国家标准行业代码', prop: 'industryCode', minWidth: '160px'},
  { label: '行业标准名称', prop: 'industryName', minWidth: '200px'},
  { label: '父级行业代码',prop: 'parentCode',minWidth: '120px'},
  { label: '是否启用', prop: 'industryState', minWidth: '80px'},
  { label: '描述', prop: 'description', minWidth: '130px'},
  { label: '更新时间', prop: 'updateTime', minWidth: '160px'}
]);

//表格信息
const tableData = ref<DimIndustryTree[]>([]);
const loading = ref(false);
//查询
const handleQuery = async ()=>{
  try {
    loading.value = true;
    const res = await industryApi.getDimIndustryByKeyword(queryParams.value);
    tableData.value = Array.isArray(res) ? res : [];
  } catch (error) {
    console.error("查询行业失败:", error);
    tableData.value = [];
  } finally {
    loading.value = false;
  }
}
const debouncedQuery = debounce(handleQuery, 500);

// const triggerSearch = () => {
//   debouncedQuery();
// };
//重置
const handleResetQuery = ()=>{
  debouncedQuery.cancel(); // 关键：取消待执行的防抖任务
  queryParams.value.keyword = "";
  handleQuery();
}

onUnmounted(() => {
  debouncedQuery.cancel();
});

onMounted(() => {
  handleQuery();
});
</script>

<style lang="scss" scoped>
.app-container {
  .el-card-main {
    //height: calc(100% - 80px);
    .table-search {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }
}

.el-card-main ::v-deep(.el-card__body){
  height: calc(100% - 40px);
  display: flex;
  flex-direction: column;
  gap: 10px;
}
</style>