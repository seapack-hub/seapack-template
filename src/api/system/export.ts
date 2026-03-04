import { request } from "@/utils/axios";
const USER_BASE_URL = "/api/export";
/**
 * 导出Excel
 */
export const exportExcel = async (
  params: ExportRequest,
  options?: { 
    onError?: (msg: string) => void; 
    onSuccess?: () => void;
    loading?: (status: boolean) => void;
  }
)=>{
  // 前端二次校验（提升用户体验，避免无效请求）
  if (!params.fileName || !/^[a-zA-Z0-9\u4e00-\u9fa5_-]{1,100}$/.test(params.fileName)) {
    const msg = '文件名仅支持1-100位中英文、数字、下划线或短横线';
    options?.onError?.(msg);
    ElMessage.error(msg);
    return;
  }

  if (!params.headers?.length || !params.dataList?.length) {
    const msg = '表头或数据不能为空';
    options?.onError?.(msg);
    ElMessage.error(msg);
    return;
  }

  options?.loading?.(true);

  try{
    const data = await request<any,Blob>({
      url: USER_BASE_URL + "/excel",
      method: "post",
      data: params,
      responseType: 'blob',
    });
    options?.loading?.(false);
    options?.onSuccess?.();
    // 成功：触发浏览器下载
    const blob = new Blob([data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });

    let fileName = `${params.fileName}.xlsx`;
    // 创建下载链接
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    options?.onSuccess?.();
    ElMessage.success('导出成功');
  }catch(err){
    options?.loading?.(false);
  }

}

export interface ExportHeader {
  label: string;      // 表头显示名（必填）
  field: string;      // 数据字段key（必填，需与dataList中key一致）
  width?: number;     // 列宽（字符数，1-50）
  format?: string;    // 格式：'date:yyyy-MM-dd' | 'number:#,##0.00'
  bold?: boolean;
  align?: 'left' | 'center' | 'right';
}

export interface ExportRequest {
  fileName: string;   // 文件名（1-100字符，仅中英文/数字/下划线/短横线）
  sheetName?: string; // 工作表名（默认Sheet1）
  headers: ExportHeader[];
  dataList: Record<string, any>[]; // 每项的key需与headers.field匹配
  autoWidth?: boolean; // 是否自动列宽（默认true）
  creator?: string;    // 操作人（用于备注）
}