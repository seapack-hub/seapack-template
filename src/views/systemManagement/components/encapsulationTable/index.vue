<template>
  <SpTable style="height:100%" class="h-100%" :columns="tableColumns" :data="tableData"></SpTable>
</template>

<script setup lang="ts">
//表格头信息
const tableColumns = ref([
  { label: '序号', fixed: 'left', prop: 'index', width: 60, props: { type: 'index', width: '40px', align: 'center' }},
  { label: '用户ID',prop: 'userId'},
  { label: '姓名', prop: 'name', minWidth: '140px'},
  { label: '性别', prop: 'gender', minWidth: '100px'},
  { label: '年龄',prop: 'age',minWidth: '100px'},
  { label: '手机号码', prop: 'phone', minWidth: '130px'},
  { label: '邮箱地址', prop: 'email', minWidth: '130px' },
  { label: '注册时间', prop: 'createTime', minWidth: '180px'},
  { label: '地域', prop: 'address', minWidth: '100px'},
  {
    columnType: 'operate',
    label: '操作',
    width: '120px',
    fixed: 'right',
    buttons: [
      {
        type: 'primary',
        label: '详情',
        renderType: 'link',
        underline: false,
        actionType: 'view',
        action: 'openView',
        metaKey: 'userDetail',
        openViewType: 'newPage',
        buttonPermission: {
          name: '详情',
          type: 'row',
          permission: 'detail'
        }
      },
      {
        type: 'primary',
        label: '删除',
        popconFirm:"数据测试",
        buttonPermission: {
          name: '删除',
          type: 'row',
          permission: 'delete'
        },
      },
      { type:'primary',label:"修改"},
      { type:'primary',label:"关联" },
      { type:'primary',label:"变动" },
    ]
  }
]);

//表格信息
const tableData = ref([
  {userId:"1001",name:"张伟",gender:"男",age:"28",phone:"13800138001",email:"zw@example.com",createTime:"2023-01-15",address:"北京"},
  {userId:"1002",name:"李静",gender:"女",age:"35",phone:"13700137001",email:"lj@example.com",createTime:"2023-02-10",address:"武汉"},
  {userId:"1003",name:"王磊",gender:"男",age:"43",phone:"13600136001",email:"zl@example.com",createTime:"2023-03-05",address:"杭州"},
  {userId:"1004",name:"刘芳",gender:"女",age:"21",phone:"13500135001",email:"lf@example.com",createTime:"2023-04-18",address:"南京"},
])

</script>

<style lang="scss" scoped></style>