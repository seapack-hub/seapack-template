import { type AxiosResponse } from 'axios';
//常用查询组件(el-input,el-select...)参数
interface SearchPropsType {
  modelValue?: string; //组件绑定值
  placeholder?: string;
  clearable?: boolean; //清空
  disabled?: boolean; //不可点击
  multiple?: boolean; //多选
  filterable?: boolean; //过滤
  showWordLimit?: boolean; //是否显示统计字数, 只在 type 为 'text' 或 'textarea' 的时候生效
  collapseTags?: boolean;
  collapseTagsTooltip?: boolean;
  [key: string]: any; // 索引签名:允许接收任意额外的属性
}

//查询列表参数对象类型
export interface SearchParamType {
  name: string; //查询条件关键字或绑定的ID
  component: string; //element-plus组件名称，如el-input,el-select等
  props: SearchPropsType; //组件默认参数配置
  cascaderProps?: object;
  render?: Function;
  formatParams?: Function; //自定义输出
  modelValue?: Record<string, any> | undefined; //自定义组件绑定值
  options?: Array<{ label: string; value: string; id?: string }>; //字典值,el-select使用
}

//表格错误信息接口
interface TableErrorInfoType {
  emptyText: string;
  emptyErrorText: string;
}

//表格分页参数接口
interface PageInfoType {
  show: boolean;
  pageNum: number;
  pageSize: number;
}

//表格列信息接口
interface columnsType {
  label: string;
  prop: string;
  minWidth: number;
  [key: string]: any;
}

//表格select选择项参数
interface TableSelectType {
  show: boolean;
  onSelectionChange: Function;
  onCurrentChange: Function;
}

//接口函数类型
interface PromiseFunction {
  (params: any): Promise<AxiosResponse<PageListType<object, any>[], any>>;
}

//定义返回值数组元素为数字或含有render函数的对象 的函数类型
type NumberArrayFunction = () => Array<number | { render: Function }>;

//操作列类型
interface OperateType {
  useOperate: boolean; //是否使用操作列
  minWidth: number; //操作列最小宽度
  operates: NumberArrayFunction;
  onClick: Function; //点击函数
}

//操作按钮值类型
export interface OperateButtonType {
  label: string; //按钮名称
  type: number; //按钮类型
  auth?: string; //权限
}
//page-list 默认参数配置类型
export interface ConfigType {
  search: Array<SearchParamType>; //查询参数列表
  index?: number; //表格列序号
  select?: TableSelectType; //表格列勾选
  tableProps?: Object; //表格默认参数
  columns?: Array<columnsType>; //表格列数据
  table?: TableErrorInfoType; //表格为空时错误信息
  page?: PageInfoType; //分页参数
  onFetch?: PromiseFunction; //接口函数
  operate?: OperateType;
}
