/** 部门操作列回调 */
export interface DeptColumnHandlers {
  onEdit: (row: any) => void
  onDelete: (row: any) => void
}

/** 部门管理表格列定义（读平坦数据，含操作列） */
export function createDeptColumns(handlers: DeptColumnHandlers) {
  return [
    { label: '部门名称', prop: 'deptName', minWidth: '160px' },
    { label: '部门层级', prop: 'deptLevel', minWidth: '90px', align: 'center', slotName: 'deptLevel' },
    { label: '排序号', prop: 'seq', minWidth: '70px', align: 'center' },
    { label: '创建时间', prop: 'createTime', minWidth: '170px', align: 'center' },
    {
      columnType: 'operate', label: '操作', width: '150px', fixed: 'right',
      buttons: [
        { type: 'primary', label: '编辑', size: 'small', renderType: 'link', click: ({ row }: any) => handlers.onEdit(row) },
        { type: 'danger', label: '删除', size: 'small', renderType: 'link', popconFirm: { title: '确认删除该部门及其子部门吗？' }, click: ({ row }: any) => handlers.onDelete(row) },
      ],
    },
  ]
}
