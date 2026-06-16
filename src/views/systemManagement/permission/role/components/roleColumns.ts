export interface RoleColumnHandlers {
  onEdit: (row: any) => void
  onDelete: (row: any) => void
  onAssignPerm: (row: any) => void
}

export function createRoleColumns(handlers: RoleColumnHandlers) {
  return [
    { label: '角色名称', prop: 'roleName', minWidth: '130px' },
    { label: '角色编码', prop: 'roleCode', minWidth: '120px' },
    { label: '描述', prop: 'description', minWidth: '200px', showOverflowTooltip: true },
    {
      label: '状态', prop: 'status', minWidth: '80px', align: 'center', slotName: 'status',
    },
    { label: '创建时间', prop: 'createTime', minWidth: '170px', align: 'center' },
    {
      columnType: 'operate', label: '操作', width: '220px', fixed: 'right',
      buttons: [
        { type: 'primary', label: '分配权限', size: 'small', renderType: 'link', click: ({ row }: any) => handlers.onAssignPerm(row) },
        { type: 'primary', label: '编辑', size: 'small', renderType: 'link', click: ({ row }: any) => handlers.onEdit(row) },
        { type: 'danger', label: '删除', size: 'small', renderType: 'link', popconFirm: { title: '确认删除该角色吗？' }, click: ({ row }: any) => handlers.onDelete(row) },
      ],
    },
  ]
}
