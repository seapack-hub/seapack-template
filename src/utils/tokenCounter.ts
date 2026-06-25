/**
 * tokenCounter —— Token 估算与上下文窗口管理工具
 *
 * 由于前端无法精确计算 LLM 的 token 数（依赖具体模型的分词器），
 * 这里采用按字符估算的近似方法，确保在超出上下文窗口前触发裁剪。
 *
 * 使用场景：
 *   - AI 对话发送前估算 token 总量，防止超出模型上下文限制
 *   - 自动裁剪最旧对话，保留 system prompt 和最近的对话
 */

import { type ChatMessage } from '@/api/ai/index';

/**
 * 粗略估算文本的 token 数量
 *
 * 估算规则：
 *   - 英文：1 token ≈ 4 字符
 *   - 中文：1 token ≈ 1.5 字符（中文在多数模型中约 1 token/1.5~2 字符）
 *   - 混合文本取平均值 1 token ≈ 3 字符
 *
 * @param text 要估算的文本
 * @returns 预估的 token 数
 */
export function countTokens(text: string): number {
  if (!text) return 0;
  // 中文字符（含中文标点）按 1 token / 1.5 字符估算
  const chineseChars = (text.match(/[\u4e00-\u9fff\u3000-\u303f\uff00-\uffef]/g) || []).length;
  // 非中文字符（英文、数字、空格、标点等）按 1 token / 4 字符估算
  const otherChars = text.length - chineseChars;
  return Math.ceil(chineseChars / 1.5 + otherChars / 4);
}

/**
 * 估算一组消息的总 token 数
 *
 * @param messages 消息数组
 * @returns 总 token 数（含每条消息的角色标记开销）
 */
export function countMessagesTokens(messages: ChatMessage[]): number {
  let total = 0;
  for (const msg of messages) {
    // 每条消息额外计 4 token 作为 role 标记和格式开销
    total += countTokens(msg.content) + 4;
  }
  return total;
}

/**
 * 裁剪消息列表以适应最大 token 限制
 *
 * 策略：
 *   1. 保留 system 消息（始终在头部）
 *   2. 从最早的非 system 消息开始移除
 *   3. 直到总 token 数不超过 maxTokens
 *   4. 最少保留一对 user+assistant 消息（避免空上下文）
 *
 * @param messages  原始消息数组（不会被修改，返回新数组）
 * @param maxTokens 最大允许 token 数
 * @returns 裁剪后的消息数组
 */
export function trimContext(messages: ChatMessage[], maxTokens: number): ChatMessage[] {
  if (messages.length === 0) return [];

  // 分离 system 消息和普通消息
  const systemMessages = messages.filter((m) => m.role === 'system');
  const normalMessages = messages.filter((m) => m.role !== 'system');

  // 从最早的消息开始尝试移除，直到 token 数符合要求
  let trimmed = [...normalMessages];
  while (countMessagesTokens([...systemMessages, ...trimmed]) > maxTokens && trimmed.length > 2) {
    // 移除最早的非 system 消息（索引 0）
    trimmed.shift();
  }

  return [...systemMessages, ...trimmed];
}
