export interface MenuColumnHandlers {
  onEdit: (row: any) => void
  onDelete: (row: any) => void
  onAddChild: (row: any) => void
}

/** 权限/菜单表格列（树形表格，无分页） */
export function createMenuColumns(handlers: MenuColumnHandlers) {
  return [
    { label: '权限名称', prop: 'name', minWidth: '160px' },
    { label: '权限标识', prop: 'permKey', minWidth: '160px' },
    {
      label: '资源类型', prop: 'type', minWidth: '100px', align: 'center', slotName: 'type',
    },
    { label: '路由路径', prop: 'path', minWidth: '200px' },
    // { label: '组件路径', prop: 'component', minWidth: '180px' },
    // { label: '排序', prop: 'sortOrder', minWidth: '60px', align: 'center' },
    {
      label: '状态', prop: 'status', minWidth: '80px', align: 'center', slotName: 'status',
    },
    {
      columnType: 'operate', label: '操作', width: '180px', fixed: 'right',
      buttons: [
        { 
          type: 'primary', 
          label: '新增子项', 
          size: 'small', 
          renderType: 'link', 
          vIFHandler: ({ row }: any) => row.type !== 3, 
          click: ({ row }: any) => handlers.onAddChild(row) 
        },
        { 
          type: 'primary', 
          label: '编辑', 
          size: 'small', 
          renderType: 'link', 
          click: ({ row }: any) => handlers.onEdit(row) 
        },
        { 
          type: 'danger', 
          label: '删除', 
          size: 'small', 
          renderType: 'link', 
          popconFirm: { title: '确认删除该权限（及子项）吗？' }, 
          click: ({ row }: any) => handlers.onDelete(row) 
        },
      ],
    },
  ]
}
