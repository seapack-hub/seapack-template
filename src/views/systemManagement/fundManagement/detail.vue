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
    <el-card class="w-100% h-0 flex-1" body-class="h-100% overflow-hidden">
      <el-scrollbar height="100%">
        <SpDetailForm 
          ref="detailFormRef" 
          v-model="formData" 
          :formColumns 
          :editable 
          labelWidth="120" 
          :column="2"
        ></SpDetailForm>
      </el-scrollbar>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { getDictByType } from "@/api/system/dict.ts";
import { useRouter,useRoute } from 'vue-router'

const router = useRouter();
const route = useRoute();
const { id } = route.query;
const editable = ref(!Boolean(id));
const detailId = ref(id);

//绑定数据
const formData = ref({
  fundCode:"",
  fundName:"",
  fundFullName:"",
  fundType:"",
  managementCompany:"",
  custodian:"",
  inceptDate:"",
  issueShare:"",
  mfee:"",
  cfee:"",
  sfee:"",
  status:"",
});

//表单信息
const formColumns:any = computed(()=>{
  return [
    {label:"基金代码",prop:"fundCode",name: 'ElInput',tips:"基金代码唯一，不可重复",rules: { required: true },props: { maxlength: 10 }},
    {label:"基金简称",prop:"fundName",name: 'ElInput',rules: { required: true },props: { maxlength: 20 }},
    {label:"基金全称",prop:"fundFullName",name: 'ElInput',rules: { required: true },props: { maxlength: 20 }},
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
      props: { min: 0, max: 999999999999, precision: 2 }
    },
    {
      label:"管理费率",
      prop:"mfee",
      name: 'ElInputNumber',
      rules: { required: true },
      props: { min: 0, max: 1, precision: 4 }
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
/**
* 保存
*/
const handleSave = ()=>{

}

/**
 * 取消
 */
const handleCancel = ()=>{

  //跳转
  router.push({path:"/fundBaseInfo"});
}
</script>

<style lang="scss" scoped></style>