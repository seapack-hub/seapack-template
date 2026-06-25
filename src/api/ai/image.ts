/**
 * image.ts —— 图片生成 API 服务
 *
 * 封装文生图功能的所有后端接口调用，
 * 包括图片生成、任务状态查询等。
 */

import { request } from '@/utils/axios';
import type { ImageGenRequest } from './types/image';

const BASE_URL = '/api';

export const imageApi = {
  /**
   * 文生图 —— 根据提示词生成图片
   *
   * @param params 生成参数（提示词、数量、尺寸、风格）
   * @returns 生成的图片 URL 数组（可能包含一张或多张）
   */
  generateImage: (params: ImageGenRequest) => {
    return request<any, string[]>(`${BASE_URL}/ai/generate-image`, {
      method: 'POST',
      data: params,
    });
  },

  /**
   * 查询生成历史记录列表
   *
   * @returns 历史图片记录数组
   */
  getHistory: () => {
    return request<any, { id: string; url: string; prompt: string; size: string; createdAt: number }[]>(
      `${BASE_URL}/ai/image-history`,
      { method: 'GET' },
    );
  },
};
