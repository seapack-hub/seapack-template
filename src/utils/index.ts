/**
 * 判断是否为外链
 * @param {string} path 路由路径
 * @returns {Boolean}
 */
export const isExternal = (path: string) => {
  return /^(https?:|http?:|mailto:|tel:)/.test(path);
};

/**
 * 使用 JS 获取全局CSS 变量
 * @param cssVariableName CSS全局变量名称
 */
export const getCssVariableValue = (cssVariableName: string) => {
  let cssVariableValue = '';
  try {
    // 没有拿到值时，会返回空串
    cssVariableValue = getComputedStyle(document.documentElement).getPropertyValue(cssVariableName);
  } catch (error) {
    console.error(error);
  }
  return cssVariableValue;
};

/**
 * 深度复制
 * @param obj 
 * @param hash 
 * @returns 
 */
export const deepClone = <T>(obj: T, hash = new WeakMap()): T => {
  // 基本类型直接返回
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  // 处理循环引用
  if (hash.has(obj)) {
    return hash.get(obj);
  }
  
  // 处理 Date 对象
  if (obj instanceof Date) {
    return new Date(obj) as T;
  }
  
  // 处理正则表达式
  if (obj instanceof RegExp) {
    return new RegExp(obj) as T;
  }
  
  // 处理数组和对象
  const clone = Array.isArray(obj) ? [] : {};
  hash.set(obj, clone);
  
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      (clone as any)[key] = deepClone(obj[key], hash);
    }
  }
  
  return clone as T;
};
