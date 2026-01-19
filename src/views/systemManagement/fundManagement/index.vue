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
    <el-card class="el-card-main flex-1 flex-col gap-10px" shadow="never">
      <div class="table-search h-[50px] flex items-center justify-between">
        <div>
          <el-button type="success" icon="plus" @click="toAdd">新增</el-button>
          <el-button type="danger" icon="delete">删除</el-button>
        </div>
        <div>
          <el-button icon="upload">导入</el-button>
          <el-button icon="download">导出</el-button>
        </div>
      </div>
      <!--flex flex-col flex-1-->
      <div class="flex-1 flex flex-col justify-between overflow-hidden">
         <SpTable class="flex-1" :loading="loading" :columns="tableColumns" :data="tableData" :showIndex="true"></SpTable>
         <div class="h-[50px]">
          <Pagination
            v-if="total > 0"
            v-model:total="total"
            v-model:page="queryParams.pageNum"
            v-model:limit="queryParams.pageSize"
            @pagination="handleQuery"
          />
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import FundBaseInfoAPI,{FundPageQuery} from '@/api/system/fund.ts';
import { useRouter } from 'vue-router'

const router = useRouter();

const queryParams = ref<FundPageQuery>({
  pageNum: 1,
  pageSize: 10,
  keywords:""
});
const total = ref(0);
//表格头信息
const tableColumns = ref([
  { label: '基金代码',prop: 'fundCode',minWidth: '100px'},
  { label: '基金简称', prop: 'fundName', minWidth: '160px'},
  { label: '基金全称', prop: 'fundFullName', minWidth: '240px'},
  { label: '基金类型',prop: 'fundTypeName',minWidth: '120px'},
  { label: '基金管理公司', prop: 'managementCompany', minWidth: '130px'},
  { label: '基金托管人', prop: 'custodian', minWidth: '130px' },
  { label: '成立日期', prop: 'inceptDate', minWidth: '200px'},
  { 
    label: '成立规模', 
    prop: 'issueShare', 
    minWidth: '150px',
    formatter: (row: any) => {
      return `${row.issueShare}`.replace(/\B(?=(\d{3})+(?!\d))/g, ', ');
    }
  },
  {
    label:"成立时长",
    prop:"distanceTime",
    minWidth: '150px',
  },
  { label: '管理费率', prop: 'mfee', minWidth: '100px'},
  { label: '托管费率', prop: 'cfee', minWidth: '100px'},
  { label: '销售服务费率', prop: 'sfee', minWidth: '120px'},
  { label: '基金状态', prop: 'status', minWidth: '100px'},
  {
    columnType: 'operate',
    label: '操作',
    width: '160px',
    fixed: 'right',
    buttons: [
       {
        type: 'primary',
        label: '删除',
        renderType: 'link',
        click: ({ row }: any) => {
          handleDelete(row)
        }
      },
      { 
        type:'primary',
        label:"修改",
        renderType: 'link',
        click: ({ row }: any) => {
          router.push({
            path:"/fundBaseInfo/detail",
            query:{
              id:row.fundCode,
            }
          })
        }
      },
      {
        type: 'primary',
        label: '详情',
        renderType: 'link',
        underline: false,
        actionType: 'view',
        action: 'openView',
        metaKey: 'userDetail',
        openViewType: 'newPage',
      },
    ]
  }
]);

//表格信息
const tableData = ref([]);
const loading = ref(false);

//查询
const handleQuery = async ()=>{
  loading.value = true;
  const res = await FundBaseInfoAPI.getFundBaseInfoList(queryParams.value);
  tableData.value = res.list;
  total.value = res.total;
  loading.value = false;
}

//重置
const handleResetQuery = ()=>{
  handleQuery();
}

//新增
const toAdd = ()=>{
  router.push({
    path:"/fundBaseInfo/detail",
    query:{
      id:"",
    }
  })
}

//删除
const handleDelete = async (row:any)=>{
  ElMessageBox.confirm('确定删除吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    await FundBaseInfoAPI.deleteFundBaseInfo(row.fundCode);
    handleQuery();
  }).catch(() => {
    ElMessage({
      type: 'info',
      message: '已取消删除',
    });
  });
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

.el-card-main ::v-deep(.el-card__body){
  height: calc(100% - 40px);
  display: flex;
  flex-direction: column;
  gap: 10px;
}
</style>