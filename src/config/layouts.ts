import {LayoutModeEnum} from "@/constants/app-key.ts";

export interface LayoutSetting{
    /**是否显示setting Pane*/
    showSettings:boolean,
    /** 布局模式*/
    layoutMode:LayoutModeEnum,
    /** 是否显示标签栏*/
    showTagsView:boolean,
    /** 是否显示logo*/
    showLogo:boolean,
    /** 是否缓存标签栏 */
    cacheTagsView: boolean,
    /** 是否开启系统水印*/
    showWatermark: boolean,
}

/** 默认配置 **/
const defaultSetting:LayoutSetting = {
    showSettings:true,
    layoutMode:LayoutModeEnum.Left,
    showTagsView:true,
    showLogo:true,
    cacheTagsView:false,
    showWatermark:false
}

/** 项目配置 **/
export const layoutSettings:LayoutSetting = {...defaultSetting}