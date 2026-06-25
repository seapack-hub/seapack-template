/**
 * image.ts —— 图片生成模块类型定义
 *
 * 定义文生图功能的请求参数和响应数据类型，
 * 供 API 层和视图层统一使用。
 */

/**
 * 图片生成请求参数
 */
export interface ImageGenRequest {
  /** 文本提示词，描述要生成的图片内容 */
  prompt: string;
  /** 生成数量（默认 1，建议 1~4） */
  n?: number;
  /** 图片尺寸 */
  size?: '1024x1024' | '1792x1024' | '1024x1792';
  /** 风格 */
  style?: 'vivid' | 'natural';
}

/**
 * 单张图片记录（用于展示历史）
 */
export interface ImageRecord {
  /** 图片唯一标识 */
  id: string;
  /** 图片 URL */
  url: string;
  /** 生成时使用的提示词 */
  prompt: string;
  /** 图片尺寸 */
  size: string;
  /** 生成时间戳 */
  createdAt: number;
}
