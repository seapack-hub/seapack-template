export interface UserColumnHandlers {
  onEdit: (row: any) => void
  onDelete: (row: any) => void
  onResetPwd: (row: any) => void
  onAssignRole: (row: any) => void
}

export function createUserColumns(handlers: UserColumnHandlers) {
  return [
    { type: 'selection', width: '50px', align: 'center' },
    { label: '用户名', prop: 'userName', minWidth: '120px' },
    { label: '昵称', prop: 'nickName', minWidth: '120px', align: 'center' },
    { label: '性别', prop: 'gender', minWidth: '70px', align: 'center', slotName: 'gender' },
    { label: '部门', prop: 'deptName', minWidth: '120px', align: 'center' },
    { label: '手机号码', prop: 'mobile', minWidth: '130px', align: 'center' },
    { label: '状态', prop: 'status', minWidth: '80px', align: 'center', slotName: 'status' },
    { label: '创建时间', prop: 'createTime', minWidth: '170px', align: 'center' },
    {
      columnType: 'operate', label: '操作', width: '230px', fixed: 'right',
      buttons: [
        { type: 'primary', label: '分配角色', size: 'small', renderType: 'link', click: ({ row }: any) => handlers.onAssignRole(row) },
        { type: 'primary', label: '重置密码', size: 'small', renderType: 'link', click: ({ row }: any) => handlers.onResetPwd(row) },
        { type: 'primary', label: '编辑', size: 'small', renderType: 'link', click: ({ row }: any) => handlers.onEdit(row) },
        { type: 'danger', label: '删除', size: 'small', renderType: 'link', popconFirm: { title: '确认删除该用户吗？' }, click: ({ row }: any) => handlers.onDelete(row) },
      ],
    },
  ]
}
