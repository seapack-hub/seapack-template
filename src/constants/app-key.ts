/** 侧边栏打开状态常量 */
export const SIDEBAR_OPENED = "opened";

/** 侧边栏关闭状态常量 */
export const SIDEBAR_CLOSED = "closed";

/**
 * 布局模式枚举值
 */
export enum LayoutModeEnum{
    Left = "left",
    Top = "top",
    LeftTop = "leftTop"
}

/**
 * 系统类型枚举值
 */
export enum SystemTypeEnum{
    // 管理系统
    ManageSystem = "manageSystem",
    // 博客系统
    BlogSystem = "blogSystem",
    // 二维地图系统
    TwoDimensionalMapSystem = "twoDimensionalMapSystem",
    // 三维地图系统
    ThreeDimensionalMapSystem = "threeDimensionalMapSystem"
}