<template>
  <div class="h-100% w-100% flex flex-col">
    <PageHeader
      v-model="editable"
      :title="!editable ? '详情' : detailId ? '编辑' : '新增'"
      :back-text="'返回'"
      :custom-cancel="true"
      @edit="editable = true"
      @save="handleSave"
      @cancel="handleCancel"
    ></PageHeader>
    <el-card class="w-100% h-0 flex-1 border" body-class="h-100% flex flex-col p-t-20px">
      <div class="m-b-10px">基本信息</div>
      <SpDetailForm 
        ref="detailFormRef" 
        v-model="formData" 
        :form-columns 
        :editable 
        label-width="120" 
        :column="2"
        :scroll-to-error="false"
      ></SpDetailForm>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { useTemplateRef } from "vue";
import { getDictByType } from "@/api/system/baseInfo/dict.ts";
import { FundBaseInfoAPI, FundBaseInfo } from "@/api/stockFund/fund/fund.ts";
import { useRouter,useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';

const router = useRouter();
const route = useRoute();
const { id } = route.query;
const editable = ref(!Boolean(id));
//是否新增页或编辑页
const isAddOrEdit = ref(!Boolean(id));
const detailId = ref(id);

//绑定数据
const formData = ref<FundBaseInfo>({
  fundCode:"",
  fundName:"",
  fundFullName:"",
  fundType:"",
  managementCompany:"",
  custodian:"",
  inceptDate:"",
  issueShare:0,
  mfee:0,
  cfee:0,
  sfee:0,
  status:"",
});

const detailFormRef = useTemplateRef<any>('detailFormRef');
/**
* 保存
*/
const handleSave = async ()=>{
  //验证数据
  await detailFormRef.value?.validate();
  const params = {
    ...formData.value
  };
  if(detailId.value){
    //更新
    await FundBaseInfoAPI.updateFundBaseInfo(params);
    ElMessage.success("更新数据成功！");
  }else{
    //新增
    await FundBaseInfoAPI.insertFundBaseInfo(params);
    ElMessage.success("新增数据成功！");
  }
  //跳转主页
  handleCancel();
}

/**
 * 取消
 */
const handleCancel = ()=>{
  //跳转
  router.push({ name: 'fundBaseInfo' });
}

/**
 *  查询详情
 */
const getFundDetail = async ()=>{
  const info = await FundBaseInfoAPI.getFundBaseInfoDetail(id as string);
  formData.value = info; 
}


onMounted(() => {
  if(id){
    getFundDetail();
  }
});
</script>

<style lang="scss" scoped></style>