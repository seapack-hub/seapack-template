<template>
  <div class="h-100% w-100% flex flex-col">
    <PageHeader
      v-model="editable"
      :title="!editable ? '详情' : detailId ? '编辑' : '新增'"
      :backText="'返回'"
      :customCancel="true"
      @edit="editable = true"
      @save="handleSave"
      @cancel="handleCancel"
    ></PageHeader>
    <el-card class="w-100% h-0 flex-1 border" body-class="h-100% flex flex-col p-t-20px">
      <div class="m-b-10px">基本信息</div>
      <SpDetailForm 
        ref="detailFormRef" 
        v-model="formData" 
        :formColumns 
        :editable 
        labelWidth="120" 
        :column="2"
        :scroll-to-error="false"
      ></SpDetailForm>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { useTemplateRef } from "vue";
import { getDictByType } from "@/api/system/dict.ts";
import FundBaseInfoAPI,{ FundBaseInfo } from "@/api/system/fund.ts";
import { useRouter,useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';

const router = useRouter();
const route = useRoute();
const { id } = route.query;
const editable = ref(!Boolean(id));
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

//表单信息
const formColumns:any = computed(()=>{
  return [
    {
      label:"基金代码",
      prop:"fundCode",
      name: 'ElInput',
      tips:"基金代码唯一，不可重复",
      rules: { required: true },
      props: { 
        maxlength: 10,
        disabled:true
      }
    },
    {label:"基金简称",prop:"fundName",name: 'ElInput',rules: { required: true },props: { maxlength: 20 }},
    {label:"基金全称",prop:"fundFullName",name: 'ElInput',rules: { required: true },props: { maxlength: 40 }},
    {
      label:"基金类型",
      prop:"fundType",
      name: 'SpSelect',
      rules: { required: true },
      props: {
        labelKey:"dictName",
        valueKey:"dictCode",
        multiple: false, //是否多选
        options: [], //默认初始值
        getDataMethod:getDictByType, //调用数据方法
        methodParams:"fund_type", //调用数据参数
        immediate:true   // 立即调用
      }
    },
    {label:"基金管理公司",prop:"managementCompany",name: 'ElInput',rules: { required: true }},
    {label:"基金托管人",prop:"custodian",name: 'ElInput',rules: { required: true }},
    {
      label:"成立日期",
      prop:"inceptDate",
      name: 'ElDatePicker',
      rules: { required: true },
      props: {
        type: 'date',
        valueFormat: 'YYYY-MM-DD',
        onChange: (data: any) => {
          console.log(data)
        }
      }
    },
    {
      label:"成立规模",
      prop:"issueShare",
      name: 'ElInputNumber',
      props: { 
        min: 0, 
        max: 999999999999, 
        precision: 2 
      }
    },
    {
      label:"管理费率",
      prop:"mfee",
      name: 'ElInputNumber',
      rules: { required: true },
      props: { min: 0, max: 1, precision: 4 },
    },
    {
      label:"托管费率",
      prop:"cfee",
      name: 'ElInputNumber',
      rules: { required: true },
      props: { min: 0, max: 1, precision: 4 }
    },
    {
      label:"销售服务费率",
      prop:"sfee",
      name: 'ElInputNumber',
      props: { min: 0, max: 1, precision: 4 }
    },
    {
      label:"基金状态",
      prop:"status",
      name: 'SpSelect',
      props: {
        options: [
          {label:"正常",value:"正常"},
          {label:"暂停",value:"暂停"},
          {label:"封闭",value:"封闭"},
          {label:"终止",value:"终止"},
        ]
      }
    },
  ]
});

const detailFormRef = useTemplateRef('detailFormRef');
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
  router.push({path:"/fundBaseInfo"});
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