<template>
  <div class="h-100% w-100%">
    <PageHeader
      v-model="editable"
      :title="!editable ? '详情' : id ? '编辑' : '新增'"
      :backText="'返回'"
      :customCancel="true"
      @edit="editable = true"
      @save="handleSave"
      @cancel="handleCancel"
    ></PageHeader>
    <el-card class="w-100% h-[calc(100vh - 56px)]" body-class="h-100% overflow-hidden">
      <el-scrollbar>
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
const editable = ref(true);
const id = ref("");

//绑定数据
const formData = ref({});

//表单信息
const formColumns:any = computed(()=>{
  return [
    {label:"基金代码",prop:"fundCode",name: 'ElInput',tips:"基金代码唯一，不可重复",rules: { required: true },props: { maxlength: 10 }},
    {label:"基金简称",prop:"fundName",name: 'ElInput',rules: { required: true },props: { maxlength: 20 }},
    {label:"基金全称",prop:"fundFullName",name: 'ElInput',rules: { required: true },props: { maxlength: 20 }},
    {label:"基金类型",prop:"fundType",name: 'ElInput',rules: { required: true }},
    {label:"基金管理公司",prop:"managementCompany",name: 'ElInput',rules: { required: true }},
    {label:"基金托管人",prop:"custodian",name: 'ElInput',rules: { required: true }},
    {label:"成立日期",prop:"inceptDate",name: 'ElInput',rules: { required: true }},
    {label:"成立规模",prop:"issueShare",name: 'ElInput',rules: { required: true }},
    {label:"管理费率",prop:"mfee",name: 'ElInput',rules: { required: true }},
    {label:"托管费率",prop:"cfee",name: 'ElInput',rules: { required: true }},
    {label:"销售服务费率",prop:"sfee",name: 'ElInput',rules: { required: true }},
    {label:"基金状态",prop:"status",name: 'ElInput',rules: { required: true }},
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

}
</script>

<style lang="scss" scoped></style>