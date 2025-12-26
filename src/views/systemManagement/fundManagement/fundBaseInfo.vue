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
            v-model="queryParams.keywords"
            placeholder="基金名称/编号"
            clearable
            style="width: 200px"
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            icon="search"
            @click="handleQuery"
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
    <el-card class="el-card-main flex-1" shadow="never"> 
      <SpTable height="100%" :columns="tableColumns" :data="tableData" :showIndex="true"></SpTable>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import FundBaseInfoAPI,{FundPageQuery} from '@/api/system/fund.ts';
const queryParams = ref<FundPageQuery>({
  pageNum: 1,
  pageSize: 15,
  keywords:""
});

//表格头信息
const tableColumns = ref([
  { label: '基金代码',prop: 'fundCode',minWidth: '100px'},
  { label: '基金简称', prop: 'fundName', minWidth: '160px'},
  { label: '基金全称', prop: 'fundFullName', minWidth: '240px'},
  { label: '基金类型',prop: 'fundTypeName',minWidth: '120px'},
  { label: '基金管理公司', prop: 'managementCompany', minWidth: '130px'},
  { label: '基金托管人', prop: 'custodian', minWidth: '130px' },
  { label: '成立日期', prop: 'inceptDate', minWidth: '200px'},
  { label: '成立规模', prop: 'issueShare', minWidth: '150px'},
  { label: '管理费率', prop: 'mfee', minWidth: '100px'},
  { label: '托管费率', prop: 'cfee', minWidth: '100px'},
  { label: '销售服务费率', prop: 'sfee', minWidth: '120px'},
  { label: '基金状态', prop: 'status', minWidth: '100px'}
]);

//表格信息
const tableData = ref([]);
const loading = ref(false);

//查询
const handleQuery = async ()=>{
  loading.value = true;
  const {list,total} = await FundBaseInfoAPI.getFundBaseInfoList(queryParams.value);
  tableData.value = list;
}

//重置
const handleResetQuery = ()=>{
  handleQuery();
}

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
</style>