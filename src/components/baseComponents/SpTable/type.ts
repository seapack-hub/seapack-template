import { ElTableColumn } from 'element-plus';

import { typeLink } from '@/vite-env';

// 定义 ElTableColumn 的 props，并且添加 columnType 类型
type typeCol = InstanceType<typeof ElTableColumn>['$props']&{
  //定义列类型
  columnType?:'operate'|string|undefined,
  //插槽名称
  slotName?:string,
  dictType?:string,
  //补充说明
  tips?:string
}

export type columnsType = Array<typeCol & {buttons?:Array<typeLink>}>