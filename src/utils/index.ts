/**
 * 判断是否为外链
 * @param {string} path 路由路径
 * @returns {Boolean}
 */
export const isExternal = (path: string) =>{
    return /^(https?:|http?:|mailto:|tel:)/.test(path)
}

/**
 * 使用 JS 获取全局CSS 变量
 * @param cssVariableName CSS全局变量名称
 */
export const getCssVariableValue = (cssVariableName:string)=>{
    let cssVariableValue = ""
    try {
        // 没有拿到值时，会返回空串
        cssVariableValue = getComputedStyle(document.documentElement).getPropertyValue(cssVariableName)
    } catch (error) {
        console.error(error)
    }
    return cssVariableValue
}