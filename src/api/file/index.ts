import { request } from "@/utils/axios";
import type { FileInfo } from "./types/file";

export type { FileInfo }

const FileAPI = {
  /** 文件上传地址 */
  uploadUrl: import.meta.env.VITE_APP_BASE_API + "/api/v1/files",

  /** 上传文件 */
  upload(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    return request<any, FileInfo>({
      url: "/api/v1/files",
      method: "post",
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  /** 删除文件 */
  deleteByPath(filePath?: string) {
    return request({
      url: "/api/v1/files",
      method: "delete",
      params: { filePath: filePath },
    });
  },

  /** 下载文件 */
  downloadFile(url: string, fileName?: string) {
    return request({
      url: url,
      method: "get",
      responseType: "blob",
    }).then((res: any) => {
      const blob = new Blob([res.data]);
      const a = document.createElement("a");
      const url = window.URL.createObjectURL(blob);
      a.href = url;
      a.download = fileName || "下载文件";
      a.click();
      window.URL.revokeObjectURL(url);
    });
  },
};

export default FileAPI;
