/**
 * index —— 通用工具函数集合
 *
 * 提供项目中多处使用的工具函数，包括：
 *   - isExternal：判断 URL 是否为外链
 *   - getCssVariableValue：读取 CSS 自定义属性（变量）值
 *   - deepClone：深拷贝（支持循环引用、Date、RegExp）
 */

/**
 * 判断给定的路径是否为外部链接
 *
 * 通过正则匹配协议头来识别，匹配以下协议开头视为外链：
 *   - https:
 *   - http:
 *   - mailto:
 *   - tel:
 *
 * @param path 路由路径或 URL
 * @returns true=是外链，false=不是外链
 */
export const isExternal = (path: string) => {
  return /^(https?:|http?:|mailto:|tel:)/.test(path);
};

/**
 * 使用 JS 读取全局 CSS 自定义属性（CSS 变量）的值
 *
 * 常用于在 JS 中获取主题色、间距等设计 Token，
 * 使 JS 与 CSS 共享同一套设计变量。
 *
 * @param cssVariableName CSS 变量名称，格式如 '--el-color-primary'
 * @returns CSS 变量的计算值，未定义时返回空字符串
 */
export const getCssVariableValue = (cssVariableName: string) => {
  let cssVariableValue = '';
  try {
    // 从 :root（document.documentElement）上读取 CSS 变量的计算值
    cssVariableValue = getComputedStyle(document.documentElement).getPropertyValue(cssVariableName);
  } catch (error) {
    console.error(error);
  }
  return cssVariableValue;
};

/**
 * 深度克隆一个对象
 *
 * 支持处理：
 *   - 基本类型（直接返回）
 *   - 循环引用（通过 WeakMap 记录已访问的对象，防止栈溢出）
 *   - Date 对象（创建新的 Date 实例）
 *   - RegExp 对象（创建新的 RegExp 实例）
 *   - 普通对象和数组（递归遍历所有自有属性）
 *
 * @param obj  要克隆的源对象
 * @param hash 用于记录已访问对象的 WeakMap（内部递归传参，外部无需传入）
 * @returns 深度克隆后的新对象
 */
export const deepClone = <T>(obj: T, hash = new WeakMap()): T => {
  // 基本类型（null / undefined / number / string / boolean / symbol）直接返回
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  // 处理循环引用：如果已访问过该对象，直接返回之前的克隆结果
  if (hash.has(obj)) {
    return hash.get(obj);
  }

  // 处理 Date 对象：创建新的 Date 实例（传入原时间戳）
  if (obj instanceof Date) {
    return new Date(obj) as T;
  }

  // 处理 RegExp 对象：创建新的 RegExp 实例（传入原正则的字符串形式和标志位）
  if (obj instanceof RegExp) {
    return new RegExp(obj) as T;
  }

  // 处理数组和普通对象：先创建空容器，然后递归克隆每个属性
  const clone = Array.isArray(obj) ? [] : {};
  // 将当前对象记录到 hash 中，后续遇到循环引用时直接返回 clone
  hash.set(obj, clone);

  // 遍历对象的所有可枚举自有属性（包括 Symbol 属性可用 getOwnPropertySymbols 补充）
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      (clone as any)[key] = deepClone(obj[key], hash);
    }
  }

  return clone as T;
};
