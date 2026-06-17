/**
 * cache-key —— localStorage / sessionStorage 缓存键常量
 *
 * 集中管理所有本地存储的键名，统一添加应用前缀（SYSTEM_NAME），
 * 避免不同应用之间的 localStorage 键名冲突。
 *
 * 使用方式：
 *   import CacheKey from '@/constants/cache-key'
 *   localStorage.setItem(CacheKey.TOKEN, 'xxx')
 *   localStorage.getItem(CacheKey.TOKEN)
 */

// 应用名称前缀，用于隔离不同系统的 localStorage 数据
// 修改此值会导致之前存储的缓存数据失效（所有旧键名不再匹配）
const SYSTEM_NAME = 'SeaPack';

/**
 * CacheKey 静态类
 *
 * 所有字段均为 static readonly，通过类名直接访问。
 * 使用模板字符串自动添加 `${SYSTEM_NAME}-` 前缀。
 */
class CacheKey {
  /** 登录令牌（token）的存储键 */
  static readonly TOKEN = `${SYSTEM_NAME}-token-key`;

  /** 已访问标签页列表（tags-view）的存储键 */
  static readonly VISITED_VIEWS = `${SYSTEM_NAME}-visited-views-key`;

  /** 已缓存组件名称列表（keep-alive）的存储键 */
  static readonly CACHED_VIEWS = `${SYSTEM_NAME}-cached-views-key`;
}

export default CacheKey;
