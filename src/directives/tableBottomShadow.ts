/**
 * v-table-shadow —— el-table 底部阴影指令
 *
 * 为 el-table 添加滚动底部阴影渐变效果，提示用户表格下方还有更多内容可滚动查看。
 * 当滚动到底部时阴影自动消失。
 *
 * 使用：
 *   <el-table v-table-shadow :data="list" height="400px"> ... </el-table>
 *   <el-table v-table-shadow="{ height: 60, color: 'rgba(0,0,0,0.12)' }" ... >
 *
 * 注意：
 *   - el-table 必须设置 height 属性才会出现滚动条
 *   - 自动适应数据变化、窗口缩放、折叠面板等场景
 */

import type { DirectiveBinding, ObjectDirective } from 'vue'

/**
 * 阴影配置选项
 */
interface ShadowOptions {
  /** 阴影高度（px），默认 20 */
  height?: number
  /** 阴影颜色，支持任意 CSS 颜色值，默认 rgba(0, 0, 0, 0.08) */
  color?: string
  /** 距离底部多少像素时隐藏阴影，默认 5 */
  threshold?: number
  /** 阴影 z-index 层级，默认 10 */
  zIndex?: number
}

/** 必填版本的配置（内部使用，避免重复 ?? 运算） */
type RequiredShadowOptions = Required<ShadowOptions>

/** 扩展 HTMLElement，附加清理函数和配置缓存 */
interface HTMLElementWithCleanup extends HTMLElement {
  /** 清理函数：移除事件监听、观察器、阴影 DOM 元素 */
  _cleanupShadow?: () => void
  /** 缓存当前配置，updated 时对比是否需要重建 */
  _tableShadowOptions?: RequiredShadowOptions
}

/**
 * 解析指令绑定值，缺失字段用默认值填充
 *
 * @param binding 指令绑定对象（binding.value 即为用户传入的配置）
 * @returns 补全所有字段的完整配置对象
 */
function resolveOptions(binding: DirectiveBinding<ShadowOptions>): RequiredShadowOptions {
  const value = binding.value ?? {}
  return {
    height: value.height ?? 20,
    color: value.color ?? 'rgba(0, 0, 0, 0.08)',
    threshold: value.threshold ?? 5,
    zIndex: value.zIndex ?? 10,
  }
}

/**
 * 浅比较两个配置对象是否相同
 * 仅比较 height/color/threshold/zIndex 四个字段
 * 用于避免 updated 时不必要的重建
 */
function isSameOptions(prev?: RequiredShadowOptions, next?: RequiredShadowOptions): boolean {
  if (!prev || !next) return false
  return (
    prev.height === next.height &&
    prev.color === next.color &&
    prev.threshold === next.threshold &&
    prev.zIndex === next.zIndex
  )
}

/**
 * 创建阴影 DOM 元素
 *
 * 使用从上到下的渐变背景，底部有颜色向上渐变至透明。
 * pointerEvents: none 确保不阻挡表格行的鼠标交互。
 *
 * @param options 阴影配置
 * @returns 阴影 div 元素
 */
function createShadowElement(options: RequiredShadowOptions): HTMLDivElement {
  const shadow = document.createElement('div')
  shadow.className = 'el-table-bottom-shadow'

  // 使用 Object.assign 批量设置样式
  Object.assign(shadow.style, {
    position: 'absolute',
    left: '0',
    right: '0',
    bottom: '0',
    height: `${options.height}px`,
    // 从下到上的渐变：底部有颜色，向上逐渐透明
    background: `linear-gradient(to top, ${options.color} 0%, transparent 100%)`,
    // 不阻挡鼠标事件，否则会影响表格行的点击/hover
    pointerEvents: 'none',
    zIndex: String(options.zIndex),
    // 初始隐藏（opacity 为 0）
    opacity: '0',
    // 显示/隐藏时平滑过渡
    transition: 'opacity 0.3s ease',
  } satisfies Partial<CSSStyleDeclaration>)
  // satisfies 用于类型检查但不改变类型推断，确保所有属性都是合法 CSS 属性名

  return shadow
}

/**
 * 初始化阴影功能
 *
 * 查找 el-table 内部的滚动容器 .el-scrollbar__wrap，
 * 创建阴影元素，绑定 scroll / ResizeObserver / MutationObserver。
 *
 * @param el      指令绑定的元素（el-table 根元素）
 * @param binding 指令绑定对象（含用户配置）
 */
function initShadow(el: HTMLElementWithCleanup, binding: DirectiveBinding<ShadowOptions>): void {
  const options = resolveOptions(binding)

  // 缓存当前配置，供 updated 钩子对比是否需要重建
  el._tableShadowOptions = options

  // 如果已初始化过，先清理旧资源再重建
  el._cleanupShadow?.()
  el._cleanupShadow = undefined

  /**
   * requestAnimationFrame 确保 el-table 内部 DOM 已渲染完成
   * el-table 使用虚拟滚动，内部结构是异步生成的，
   * mounted 时 .el-scrollbar__wrap 可能还不存在
   */
  requestAnimationFrame(() => {
    // 获取 el-table 内部的滚动容器（Element Plus 固定类名）
    const scrollWrapper = el.querySelector<HTMLElement>('.el-scrollbar__wrap')

    if (!scrollWrapper) {
      console.warn('[v-table-shadow] 未找到 .el-scrollbar__wrap，请确认是 el-table 且设置了 height')
      return
    }

    // 创建阴影元素
    const shadow = createShadowElement(options)

    // 确保指令所在元素不是 static 定位，否则子元素的 absolute 定位会脱离预期
    const computedStyle = window.getComputedStyle(el)
    if (computedStyle.position === 'static') {
      el.style.position = 'relative'
    }

    // 将阴影元素添加到表格容器中
    el.appendChild(shadow)

    // ==================== 监听与性能优化 ====================

    // 节流标记：防止 requestAnimationFrame 重复调度
    let ticking = false

    /**
     * 检查阴影是否应该显示
     *
     * 原理：计算内容总高度 - 可视区域高度 - 已滚动距离，
     *       如果剩余可滚动距离大于阈值则显示阴影。
     */
    const checkShadowVisibility = (): void => {
      const { scrollTop, scrollHeight, clientHeight } = scrollWrapper

      // 距离底部的像素数 = 内容总高度 - 可视区高度 - 已滚动距离
      const distanceToBottom = scrollHeight - scrollTop - clientHeight

      // 超过阈值 → 显示阴影（下方还有内容）；否则隐藏（已到底部）
      shadow.style.opacity = distanceToBottom > options.threshold ? '1' : '0'
    }

    /**
     * requestAnimationFrame 节流版本
     * 保证每帧最多执行一次 checkShadowVisibility，
     * 避免滚动时高频触发导致性能问题
     */
    const throttledCheck = (): void => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        checkShadowVisibility()
        ticking = false
      })
    }

    // 1. 滚动事件：passive: true 告诉浏览器不调用 preventDefault()
    //    浏览器可以立即滚动而不用等待 JS 执行，显著提升滚动性能
    scrollWrapper.addEventListener('scroll', throttledCheck, { passive: true })

    // 2. ResizeObserver：监听容器尺寸变化
    //    适用场景：窗口缩放、父容器尺寸变化、折叠面板展开等
    const resizeObserver = new ResizeObserver(throttledCheck)
    resizeObserver.observe(scrollWrapper)

    // 3. MutationObserver：监听内容变化
    //    适用场景：数据加载完成、行数变化、展开行等
    //    注意：使用 throttledCheck 避免大量 DOM 变化时频繁触发
    const mutationObserver = new MutationObserver(throttledCheck)
    mutationObserver.observe(scrollWrapper, {
      childList: true, // 监听子元素增删
      subtree: true,   // 监听所有后代元素
      // 不监听 attributes 和 characterData，减少不必要触发
    })

    // 立即执行一次初始检查
    checkShadowVisibility()

    /**
     * 清理函数：移除所有监听器、观察器和阴影元素
     * 在 unmounted 或 updated 重建时调用，防止内存泄漏
     */
    el._cleanupShadow = () => {
      scrollWrapper.removeEventListener('scroll', throttledCheck)
      resizeObserver.disconnect()
      mutationObserver.disconnect()
      shadow.remove()
    }
  })
}

/**
 * 指令定义
 */
const vTableShadow: ObjectDirective<HTMLElementWithCleanup, ShadowOptions> = {
  /**
   * mounted：元素挂载到 DOM 后初始化阴影
   */
  mounted(el, binding) {
    initShadow(el, binding)
  },

  /**
   * updated：绑定值变化时检查配置是否改变
   * 仅当配置真正变化时才重建，避免无效渲染
   */
  updated(el, binding) {
    const nextOptions = resolveOptions(binding)

    // 配置没变则跳过
    if (isSameOptions(el._tableShadowOptions, nextOptions)) {
      return
    }

    // 配置变了，重新初始化（内部会先清理旧资源）
    initShadow(el, binding)
  },

  /**
   * unmounted：元素卸载时清理所有资源，防止内存泄漏
   */
  unmounted(el) {
    el._cleanupShadow?.()
  },
}

export default vTableShadow
