import { request } from "@/utils/axios.ts";
import type { ExportHeader, ExportRequest } from "./types/export";

export type { ExportHeader, ExportRequest }

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
) => {
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

  try {
    const data = await request<any, Blob>({
      url: USER_BASE_URL + "/excel",
      method: "post",
      data: params,
      responseType: 'blob',
    });
    options?.loading?.(false);
    options?.onSuccess?.();
    const blob = new Blob([data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });

    let fileName = `${params.fileName}.xlsx`;
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
  } catch {
    options?.loading?.(false);
  }
}
