import { type Ref, onBeforeUnmount, ref} from "vue";
import { debounce } from "lodash-es";

type Observer = {
    watermarkElMutationObserver?: MutationObserver
    parentElMutationObserver?: MutationObserver
    parentElResizeObserver?: ResizeObserver
}

type DefaultConfig = typeof defaultConfig;

/** 默认配置 */
const defaultConfig = {
    /** 防御（默认开启，能防御水印被删除或隐藏，但可能会有性能损耗） */
    defense: true,
    /** 文本颜色 */
    color: "#c0c4cc",
    /** 文本透明度 */
    opacity: 0.5,
    /** 文本字体大小 */
    size: 16,
    /** 文本字体 */
    family: "serif",
    /** 文本倾斜角度 */
    angle: -20,
    /** 一处水印所占宽度（数值越大水印密度越低） */
    width: 300,
    /** 一处水印所占高度（数值越大水印密度越低） */
    height: 200
}

/** body 元素 */
const bodyEl = ref<HTMLElement>(document.body)

/** 创建水印 **/
export function useWatermark(parentEl:Ref<HTMLElement|null> = bodyEl){

    //备份文本
    let backupText:string;
    //最终配置
    let mergeConfig:DefaultConfig;
    //水印元素
    let watermarkEl:HTMLElement|null;
    // 观察器
    const observer: Observer = {
        watermarkElMutationObserver: undefined,
        parentElMutationObserver: undefined,
        parentElResizeObserver: undefined
    }

    /**
     * 设置水印
     * Partial:将一个对象类型中的所有属性变为可选属性
     * **/
    const setWatermark = (text:string, config:Partial<DefaultConfig> = {})=>{
        if(!parentEl.value){
            console.warn("请在 DOM 挂载完成后再调用 setWatermark 方法设置水印");
            return;
        }
        //备份文本
        backupText = text;
        //合并配置
        mergeConfig = {...defaultConfig,...config};
        //创建或更新水印元素
        watermarkEl? updateWatermarkEl():createWatermarkEl();

    }

    const createWatermarkEl = ()=>{

    }

    const updateWatermarkEl = ()=>{

    }

    const addElListener = ()=>{}
}