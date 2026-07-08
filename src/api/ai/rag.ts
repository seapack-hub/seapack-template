import {request} from "@/utils/axios";
import { 
  ApiResponse, 
  IngestRequest, 
  ChatRequest 
} from '@/api/ai/types/rag.ts';

export type { 
  ApiResponse, 
  IngestRequest, 
  ChatRequest 
};

const USER_BASE_URL = "/api";

export const ragApi = {
  // 索引文件
  ingestFile:(data:FormData)=>{
    return request<ApiResponse<void>>(`${USER_BASE_URL}/rag/ingest-file`,{
      method:'post',
      data,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },

  //获取命名空间列表
  getNamespaces:()=>{
    return request(`${USER_BASE_URL}/rag/namespaces`,{
      method:'GET'
    }) as Promise<string[]>
  },

  //清空命名空间
  clearNamespace:(namespace:string)=>{
    return request<ApiResponse<void>>(`${USER_BASE_URL}/rag/clear-namespace/${namespace}`,{
      method:'POST'
    })
  }
}
