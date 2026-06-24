/**
 * app-key —— 应用级常量与枚举定义
 *
 * 集中管理项目中使用的字符串常量和枚举值，
 * 避免在代码中直接出现魔法字符串（magic string），
 * 便于统一维护和类型提示。
 */

/** 侧边栏展开状态键（用于 localStorage 及组件通信） */
export const SIDEBAR_OPENED = 'opened';

/** 侧边栏折叠状态键 */
export const SIDEBAR_CLOSED = 'closed';

/**
 * 布局模式枚举
 *
 * 决定后台管理系统的整体页面布局结构。
 * 通过 useLayoutMode() 组合式函数读取和切换。
 *
 * 取值说明：
 *   - Left：    左侧菜单 + 右侧内容区（经典后台布局）
 *   - Top：     顶部菜单 + 内容区（简洁布局）
 *   - LeftTop： 左侧菜单 + 顶部菜单（混合布局，双导航）
 */
export enum LayoutModeEnum {
  Left = 'left',
  Top = 'top',
  LeftTop = 'leftTop',
}

/**
 * 系统类型枚举
 *
 * 决定当前应用运行在哪种系统模式下，
 * 不同的系统类型会切换不同的 UI 风格和功能模块。
 * 通过 useSystemTypeMode() 组合式函数读取和切换。
 *
 * 取值说明：
 *   - ManageSystem：            后台管理系统（默认，含用户/角色/权限等管理功能）
 *   - BlogSystem：              个人博客系统（文章展示/分类/标签）
 *   - TwoDimensionalMapSystem：  二维地图系统（基于 OpenLayers，用于 GIS 数据展示）
 *   - ThreeDimensionalMapSystem：三维地图系统（基于 Cesium，用于 3D 地球/场景展示）
 */
export enum SystemTypeEnum {
  ManageSystem = 'manageSystem',
  BlogSystem = 'blogSystem',
  TwoDimensionalMapSystem = 'twoDimensionalMapSystem',
  ThreeDimensionalMapSystem = 'threeDimensionalMapSystem',
}