import { type Ref, onBeforeUnmount, ref } from 'vue';
import { debounce } from 'lodash-es';

type Observer = {
  watermarkElMutationObserver?: MutationObserver;
  parentElMutationObserver?: MutationObserver;
  parentElResizeObserver?: ResizeObserver;
};

type DefaultConfig = typeof defaultConfig;

/** 默认配置 */
const defaultConfig = {
  /** 防御（默认开启，能防御水印被删除或隐藏，但可能会有性能损耗） */
  defense: true,
  /** 文本颜色 */
  color: '#c0c4cc',
  /** 文本透明度 */
  opacity: 0.5,
  /** 文本字体大小 */
  size: 16,
  /** 文本字体 */
  family: 'serif',
  /** 文本倾斜角度 */
  angle: -20,
  /** 一处水印所占宽度（数值越大水印密度越低） */
  width: 300,
  /** 一处水印所占高度（数值越大水印密度越低） */
  height: 200
};

/** body 元素 */
const bodyEl = ref<HTMLElement>(document.body);

/** 创建水印 **/
export function useWatermark(parentEl: Ref<HTMLElement | null> = bodyEl) {
  //备份文本
  let backupText: string;
  //最终配置
  let mergeConfig: DefaultConfig;
  //水印元素
  let watermarkEl: HTMLElement | null;
  // 观察器
  const observer: Observer = {
    watermarkElMutationObserver: undefined,
    parentElMutationObserver: undefined,
    parentElResizeObserver: undefined
  };

  /**
   * 设置水印
   * Partial:将一个对象类型中的所有属性变为可选属性
   * **/
  const setWatermark = (text: string, config: Partial<DefaultConfig> = {}) => {
    if (!parentEl.value) {
      console.warn('请在 DOM 挂载完成后再调用 setWatermark 方法设置水印');
      return;
    }
    //备份文本
    backupText = text;
    //合并配置
    mergeConfig = { ...defaultConfig, ...config };
    //创建或更新水印元素
    watermarkEl ? updateWatermarkEl() : createWatermarkEl();
    //监听水印元素和容器元素的变化
    addElListener(parentEl.value);
  };

  /**
   * 创建水印元素
   */
  const createWatermarkEl = () => {
    // !是ts 中的语法，保证前面对象中有后面这个属性，跳过语法检查
    const isBody = parentEl.value!.tagName.toLowerCase() === bodyEl.value.tagName.toLowerCase();
    // 设置元素的定位，如果是body元素则采取固定定位，否则采取绝对定位
    const watermarkElPosition = isBody ? 'fixed' : 'absolute';
    // 设置父元素的定位
    const parentElPosition = isBody ? '' : 'relative';
    //创建水印元素
    watermarkEl = document.createElement('div');
    //水印元素不会成为鼠标事件的target
    watermarkEl.style.pointerEvents = 'none';
    watermarkEl.style.top = '0';
    watermarkEl.style.left = '0';
    watermarkEl.style.position = watermarkElPosition;
    watermarkEl.style.zIndex = '99999';
    const { clientWidth, clientHeight } = parentEl.value!;
    updateWatermarkEl({ width: clientWidth, height: clientHeight });
    //设置水印容器为相对定位
    parentEl.value!.style.position = parentElPosition;
    //将水印元素添加到水印容器中
    parentEl.value!.appendChild(watermarkEl);
  };

  /**
   * 更新水印元素
   * @param options
   */
  const updateWatermarkEl = (options: Partial<{ width: number; height: number }> = {}) => {
    if (!watermarkEl) return;
    backupText && (watermarkEl.style.background = `url(${createBase64()}) left top repeat`);
    // 更新宽度高度
    options.width && (watermarkEl.style.width = `${options.width}px`);
    options.height && (watermarkEl.style.height = `${options.height}px`);
  };

  /**
   * 创建base64图片
   */
  const createBase64 = () => {
    // 解构配置
    const { color, opacity, size, family, angle, width, height } = mergeConfig;
    // 创建一个画布
    const canvasEl = document.createElement('canvas');
    //设置宽高
    canvasEl.width = width;
    canvasEl.height = height;
    //创建 context 对象
    // getContext("2d") 对象是内建的 HTML5 对象，拥有多种绘制路径、矩形、圆形、字符以及添加图像的方法
    const ctx = canvasEl.getContext('2d');
    if (ctx) {
      // 设置颜色
      ctx.fillStyle = color;
      ctx.globalAlpha = opacity;
      ctx.font = `${size}px ${family}`;
      ctx.rotate((Math.PI / 180) * angle);
      ctx.fillText(backupText, 0, height / 2);
    }
    return canvasEl.toDataURL();
  };

  /**
   * 清除水印
   */
  const clearWatermark = () => {
    if (!parentEl.value || !watermarkEl) return;
    //移除监听器
    removeListener();
    try {
      //移除水印元素
      parentEl.value.removeChild(watermarkEl);
    } catch {
      //比如在无防御情况下，用户打开控制台删除了这个元素
      console.warn('水印元素已不存在，请重新创建');
    } finally {
      watermarkEl = null;
    }
  };

  /**
   * 刷新水印，(防御时调用)
   * debounce : 防抖，节流方法
   */
  const updateWatermark = debounce(() => {
    clearWatermark();
    createWatermarkEl();
    addElListener(parentEl.value!);
  }, 100);

  /**
   * 监听水印元素和容器的变化
   */
  const addElListener = (targetNode: HTMLElement) => {
    //判断是否开启防御
    if (mergeConfig.defense) {
      //防止重复监听
      if (!observer.parentElMutationObserver && !observer.watermarkElMutationObserver) {
        addMutationListener(targetNode);
      }
    } else {
      //无防御时不需要 mutation 监听
      removeListener('mutation');
    }
    //防止重复监听
    if (!observer.parentElResizeObserver) {
      addResizeListener(targetNode);
    }
  };

  /**
   * 移除水印元素对容器元素的监听，传参可指定要移除哪个监听，不传默认移除全部
   * @param kind
   */
  const removeListener = (kind: 'mutation' | 'resize' | 'all' = 'all') => {
    //移除 mutation 监听
    if (kind === 'mutation' || kind === 'all') {
      observer.parentElMutationObserver?.disconnect();
      observer.parentElMutationObserver = undefined;
      observer.watermarkElMutationObserver?.disconnect();
      observer.watermarkElMutationObserver = undefined;
    }
    //移除 resize 监听
    if (kind === 'resize' || kind === 'all') {
      observer.parentElResizeObserver?.disconnect();
      observer.parentElResizeObserver = undefined;
    }
  };

  /**
   * 监听 DOM 变化
   * @param targetNode
   */
  const addMutationListener = (targetNode: HTMLElement) => {
    //当观察到变动时执行的回调
    const mutationCallback = debounce((mutationList: MutationRecord[]) => {
      //水印的防御 (防止用户手动删除水印或通过css隐藏水印)
      mutationList.forEach(
        debounce((mutation: MutationRecord) => {
          switch (mutation.type) {
            //监听 属性是否被更改
            case 'attributes':
              mutation.target === watermarkEl && updateWatermark();
              break;
            //监听 新增节点或删除节点
            case 'childList':
              mutation.removedNodes.forEach((item) => {
                item === watermarkEl && targetNode.appendChild(watermarkEl);
              });
              break;
          }
        }, 100)
      );
    }, 100);

    //创建观察器实例并传入回调
    observer.watermarkElMutationObserver = new MutationObserver(mutationCallback);
    observer.parentElMutationObserver = new MutationObserver(mutationCallback);

    //已上述配置开始观察目标节点
    observer.watermarkElMutationObserver.observe(watermarkEl!, {
      // 观察目标节点属性是否变动，默认为 true
      attributes: true,
      // 观察目标子节点是否有添加或者删除，默认为 false
      childList: false,
      // 是否拓展到观察所有后代节点，默认为 false
      subtree: false
    });

    observer.parentElMutationObserver.observe(targetNode, {
      attributes: true,
      childList: false,
      subtree: false
    });
  };

  /**
   * 监听 DOM 大小的变化
   */
  const addResizeListener = (targetNode: HTMLElement) => {
    // 当 DOM 元素大小变化时更新整个水印的大小
    const resizeCallback = debounce(() => {
      const { clientWidth, clientHeight } = targetNode;
      updateWatermarkEl({ width: clientWidth, height: clientHeight });
    }, 100);

    //创建一个观察器并传入回调
    observer.parentElResizeObserver = new ResizeObserver(resizeCallback);
    //开始观察目标节点
    observer.parentElResizeObserver.observe(targetNode);
  };

  /**
   * 在组件卸载前移除各种监听
   */
  onBeforeUnmount(() => {
    clearWatermark();
  });

  return { setWatermark, clearWatermark };
}
