/**
 * useWatermark —— 水印创建与管理
 *
 * 在指定容器上叠加半透明文本水印，支持：
 *   - 自定义文本、颜色、透明度、字体、倾斜角度、密度
 *   - 防御模式：防止用户通过控制台删除或隐藏水印（会定期检测并自动恢复）
 *   - 容器 resize 自适应：容器大小变化时水印自动跟随
 *   - MutationObserver 监听 DOM 变化，检测到水印被篡改时自动重建
 */

import { type Ref, onBeforeUnmount, ref } from 'vue';
import { debounce } from 'lodash-es';

/**
 * Observer 对象类型
 * 存放三种观察器实例，用于监听水印和容器的变化
 */
type Observer = {
  watermarkElMutationObserver?: MutationObserver; // 监听水印元素自身属性变化
  parentElMutationObserver?: MutationObserver;   // 监听容器元素属性变化
  parentElResizeObserver?: ResizeObserver;       // 监听容器尺寸变化
};

/** 合并后的最终配置类型（基于 defaultConfig 自动推导） */
type DefaultConfig = typeof defaultConfig;

/** 默认配置 */
const defaultConfig = {
  defense: true,     // 防御模式（默认开启）：检测水印被删除/隐藏时自动恢复，可能有性能损耗
  color: '#c0c4cc',  // 水印文本颜色
  opacity: 0.5,      // 水印文本透明度（0~1）
  size: 16,          // 水印文本字体大小（px）
  family: 'serif',   // 水印文本字体
  angle: -20,        // 水印文本倾斜角度（度），负值向左倾斜
  width: 300,        // 单个水印块的宽度（数值越大水印密度越低，间距越大）
  height: 200,       // 单个水印块的高度（数值越大水印密度越低，间距越大）
};

/** 默认挂载到 body 元素 */
const bodyEl = ref<HTMLElement>(document.body);

/**
 * useWatermark 组合式函数
 *
 * @param parentEl 水印挂载的容器元素 Ref（默认 document.body）
 * @returns { setWatermark, clearWatermark }
 *   - setWatermark(text, config): 创建或更新水印
 *   - clearWatermark():           清除水印并移除所有监听器
 */
export function useWatermark(parentEl: Ref<HTMLElement | null> = bodyEl) {
  // 备份水印文本，供更新/重建时使用
  let backupText: string;
  // 合并后的最终配置（默认配置 + 用户传入配置）
  let mergeConfig: DefaultConfig;
  // 水印 DOM 元素引用
  let watermarkEl: HTMLElement | null;
  // 三种观察器实例
  const observer: Observer = {
    watermarkElMutationObserver: undefined,
    parentElMutationObserver: undefined,
    parentElResizeObserver: undefined,
  };

  // ==================== 公开方法 ====================

  /**
   * 设置（创建或更新）水印
   *
   * @param text   水印显示的文本内容
   * @param config 可选的自定义配置，与 defaultConfig 合并（Partial 使所有字段可选）
   */
  const setWatermark = (text: string, config: Partial<DefaultConfig> = {}) => {
    // 容器未挂载时给出警告并提前返回
    if (!parentEl.value) {
      console.warn('请在 DOM 挂载完成后再调用 setWatermark 方法设置水印');
      return;
    }
    // 保存文本副本，后续重建水印时需要
    backupText = text;
    // 合并配置：用户传入的配置覆盖默认配置的同名字段
    mergeConfig = { ...defaultConfig, ...config };
    // 水印元素已存在 → 更新；不存在 → 创建
    watermarkEl ? updateWatermarkEl() : createWatermarkEl();
    // 监听水印元素和容器的变化（DOM 变动 + 尺寸变化）
    addElListener(parentEl.value);
  };

  /**
   * 清除水印：移除 DOM 元素 + 移除所有监听器
   */
  const clearWatermark = () => {
    if (!parentEl.value || !watermarkEl) return;
    // 先移除所有监听器
    removeListener();
    try {
      // 从容器中移除水印 DOM 元素
      parentEl.value.removeChild(watermarkEl);
    } catch {
      // 在无防御模式下，用户可能已在控制台手动删除了该元素
      console.warn('水印元素已不存在，请重新创建');
    } finally {
      // 清空引用，允许 GC 回收
      watermarkEl = null;
    }
  };

  // ==================== 内部方法 ====================

  /**
   * 创建水印 DOM 元素
   *
   * 根据容器是否是 body 决定定位方式：
   *   - body → fixed（相对于视口固定）
   *   - 其他容器 → absolute（相对于容器绝对定位）
   */
  const createWatermarkEl = () => {
    // 判断容器是否为 body 元素
    const isBody =
      parentEl.value!.tagName.toLowerCase() === bodyEl.value.tagName.toLowerCase();
    // body 用 fixed 定位，其他容器用 absolute 定位
    const watermarkElPosition = isBody ? 'fixed' : 'absolute';
    // 非 body 容器需要设为 relative 定位，使水印的 absolute 生效
    const parentElPosition = isBody ? '' : 'relative';

    // 创建水印 div 元素
    watermarkEl = document.createElement('div');
    // 让水印不拦截鼠标事件，用户仍可与水印下方的元素交互
    watermarkEl.style.pointerEvents = 'none';
    watermarkEl.style.top = '0';
    watermarkEl.style.left = '0';
    watermarkEl.style.position = watermarkElPosition;
    watermarkEl.style.zIndex = '99999'; // 置于顶层

    // 获取容器的当前宽高，用于填充整个容器
    const { clientWidth, clientHeight } = parentEl.value!;
    updateWatermarkEl({ width: clientWidth, height: clientHeight });

    // 为容器设置 relative 定位（若非 body）
    parentEl.value!.style.position = parentElPosition;
    // 将水印元素添加到容器中
    parentEl.value!.appendChild(watermarkEl);
  };

  /**
   * 更新水印元素的背景（重新生成 base64）及宽高
   *
   * @param options 可选的宽高覆盖值，用于容器 resize 时的自适应
   */
  const updateWatermarkEl = (options: Partial<{ width: number; height: number }> = {}) => {
    if (!watermarkEl) return;
    // 用 base64 图片作为背景，平铺（repeat）满整个容器
    backupText && (watermarkEl.style.background = `url(${createBase64()}) left top repeat`);
    // 更新宽高（resize 时传入新的容器尺寸）
    options.width && (watermarkEl.style.width = `${options.width}px`);
    options.height && (watermarkEl.style.height = `${options.height}px`);
  };

  /**
   * 生成水印 base64 背景图片
   *
   * 在 canvas 上绘制水印文本，然后导出为 dataURL，
   * 作为水印元素的 background-image。
   */
  const createBase64 = () => {
    const { color, opacity, size, family, angle, width, height } = mergeConfig;
    // 创建离屏 canvas
    const canvasEl = document.createElement('canvas');
    canvasEl.width = width;
    canvasEl.height = height;
    const ctx = canvasEl.getContext('2d');
    if (ctx) {
      ctx.fillStyle = color;           // 文字颜色
      ctx.globalAlpha = opacity;       // 文字透明度
      ctx.font = `${size}px ${family}`; // 文字字体和大小
      ctx.rotate((Math.PI / 180) * angle); // 旋转角度（弧度）
      ctx.fillText(backupText, 0, height / 2); // 在画布中央偏左绘制文字
    }
    // 导出为 dataURL（PNG 格式 base64 字符串）
    return canvasEl.toDataURL();
  };

  /**
   * 防抖刷新水印（防御模式下检测到篡改后调用）
   * 先清除再重建，间隔 100ms 防抖避免频繁操作
   */
  const updateWatermark = debounce(() => {
    clearWatermark();
    createWatermarkEl();
    addElListener(parentEl.value!);
  }, 100);

  // ==================== 监听器管理 ====================

  /**
   * 添加各种监听器
   *
   * @param targetNode 要监听的容器元素
   */
  const addElListener = (targetNode: HTMLElement) => {
    if (mergeConfig.defense) {
      // 开启防御：添加 MutationObserver 监听 DOM 变化
      if (!observer.parentElMutationObserver && !observer.watermarkElMutationObserver) {
        addMutationListener(targetNode);
      }
    } else {
      // 未开启防御：移除已有的 mutation 监听（如果有）
      removeListener('mutation');
    }
    // 添加 resize 监听（容器尺寸变化时更新水印尺寸）
    if (!observer.parentElResizeObserver) {
      addResizeListener(targetNode);
    }
  };

  /**
   * 移除指定类型的监听器
   *
   * @param kind 监听器类型：'mutation' | 'resize' | 'all'（默认 all）
   */
  const removeListener = (kind: 'mutation' | 'resize' | 'all' = 'all') => {
    if (kind === 'mutation' || kind === 'all') {
      // 断开 MutationObserver 并清空引用
      observer.parentElMutationObserver?.disconnect();
      observer.parentElMutationObserver = undefined;
      observer.watermarkElMutationObserver?.disconnect();
      observer.watermarkElMutationObserver = undefined;
    }
    if (kind === 'resize' || kind === 'all') {
      // 断开 ResizeObserver 并清空引用
      observer.parentElResizeObserver?.disconnect();
      observer.parentElResizeObserver = undefined;
    }
  };

  // ==================== 具体监听器 ====================

  /**
   * 添加 MutationObserver 监听 DOM 变化
   *
   * 防御策略：
   *   - attributes：监听水印元素的属性变化（如 display、visibility 被修改），自动重建
   *   - childList：监听水印元素被从容器中移除，自动重新添加回容器
   *
   * @param targetNode 容器元素
   */
  const addMutationListener = (targetNode: HTMLElement) => {
    // MutationObserver 回调：DOM 发生变化时触发
    const mutationCallback = debounce((mutationList: MutationRecord[]) => {
      mutationList.forEach(
        debounce((mutation: MutationRecord) => {
          switch (mutation.type) {
            case 'attributes':
              // 水印元素的属性被修改（如 display:none、opacity:0），重建水印
              mutation.target === watermarkEl && updateWatermark();
              break;
            case 'childList':
              // 水印元素被子节点被移除（被控制台删除），重新添加
              mutation.removedNodes.forEach((item) => {
                item === watermarkEl && targetNode.appendChild(watermarkEl);
              });
              break;
          }
        }, 100)
      );
    }, 100);

    // 创建两个 MutationObserver 实例：
    // 一个监听水印元素自身，一个监听容器
    observer.watermarkElMutationObserver = new MutationObserver(mutationCallback);
    observer.parentElMutationObserver = new MutationObserver(mutationCallback);

    // 监听水印元素自身的属性变化
    observer.watermarkElMutationObserver.observe(watermarkEl!, {
      attributes: true,   // 监听属性变化
      childList: false,   // 水印元素无子节点，无需监听
      subtree: false,
    });

    // 监听容器的子节点变化（水印被移除时触发）
    observer.parentElMutationObserver.observe(targetNode, {
      attributes: true,  // 监听容器属性变化
      childList: false,
      subtree: false,
    });
  };

  /**
   * 添加 ResizeObserver 监听容器尺寸变化
   *
   * 当容器大小改变时，更新水印元素的宽高以继续铺满容器。
   * 100ms 防抖避免频繁 resize 时反复更新。
   *
   * @param targetNode 容器元素
   */
  const addResizeListener = (targetNode: HTMLElement) => {
    const resizeCallback = debounce(() => {
      const { clientWidth, clientHeight } = targetNode;
      updateWatermarkEl({ width: clientWidth, height: clientHeight });
    }, 100);

    observer.parentElResizeObserver = new ResizeObserver(resizeCallback);
    observer.parentElResizeObserver.observe(targetNode);
  };

  /**
   * 组件卸载前自动清除水印并移除所有监听，防止内存泄漏
   */
  onBeforeUnmount(() => {
    clearWatermark();
  });

  return { setWatermark, clearWatermark };
}
