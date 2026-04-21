// directives/tableBottomShadow.ts
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

/** 必填版本的配置（内部使用） */
type RequiredShadowOptions = Required<ShadowOptions>

/** 扩展 HTMLElement，添加清理函数和配置缓存 */
interface HTMLElementWithCleanup extends HTMLElement {
  /** 清理函数：移除事件监听、观察器、DOM 元素 */
  _cleanupShadow?: () => void
  /** 缓存当前配置，用于 updated 时对比是否需要重建 */
  _tableShadowOptions?: RequiredShadowOptions
}

/**
 * 解析指令绑定值，填充默认值
 * @param binding - 指令绑定对象
 * @returns 完整的配置对象
 */
function resolveOptions(binding: DirectiveBinding<ShadowOptions>): RequiredShadowOptions {
  const value = binding.value ?? {}
  return {
    height: value.height ?? 20,
    color: value.color ?? 'rgba(0, 0, 0, 0.08)',
    threshold: value.threshold ?? 5,
    zIndex: value.zIndex ?? 10
  }
}

/**
 * 浅比较两个配置对象是否相同
 * @description 避免 updated 时不必要的重建
 */
function isSameOptions(prev?: RequiredShadowOptions, next?: RequiredShadowOptions): boolean {
  if (!prev || !next) return false
  return prev.height === next.height && prev.color === next.color && prev.threshold === next.threshold && prev.zIndex === next.zIndex
}

/**
 * 创建阴影 DOM 元素
 * @param options - 阴影配置
 * @returns 阴影 div 元素
 */
function createShadowElement(options: RequiredShadowOptions): HTMLDivElement {
  const shadow = document.createElement('div')
  shadow.className = 'el-table-bottom-shadow'

  Object.assign(shadow.style, {
    position: 'absolute',
    left: '0',
    right: '0',
    bottom: '0',
    height: `${options.height}px`,
    // 从下到上的渐变：底部有颜色，向上逐渐透明
    background: `linear-gradient(to top, ${options.color} 0%, transparent 100%)`,
    // 关键：不阻挡鼠标事件，否则会影响表格行的点击/hover
    pointerEvents: 'none',
    zIndex: String(options.zIndex),
    // 初始隐藏
    opacity: '0',
    // 平滑过渡效果
    transition: 'opacity 0.3s ease'
  } satisfies Partial<CSSStyleDeclaration>)

  return shadow
}

/**
 * 初始化阴影功能
 * @description 查找滚动容器、创建阴影、绑定事件监听
 * @param el - 指令绑定的元素（el-table 根元素）
 * @param binding - 指令绑定对象
 */
function initShadow(el: HTMLElementWithCleanup, binding: DirectiveBinding<ShadowOptions>): void {
  const options = resolveOptions(binding)

  // 缓存配置，供 updated 钩子对比
  el._tableShadowOptions = options

  // 如果之前已初始化，先清理（支持 updated 时重建）
  el._cleanupShadow?.()
  el._cleanupShadow = undefined

  // 使用 requestAnimationFrame 确保 el-table 内部 DOM 已渲染完成
  // el-table 使用虚拟滚动，内部结构是异步生成的
  requestAnimationFrame(() => {
    // el-table 的滚动容器类名（Element Plus 内部结构）
    const scrollWrapper = el.querySelector<HTMLElement>('.el-scrollbar__wrap')

    if (!scrollWrapper) {
      console.warn('[v-table-shadow] 未找到 .el-scrollbar__wrap，请确认是 el-table 且设置了 height')
      return
    }

    // 创建阴影元素
    const shadow = createShadowElement(options)

    // 确保指令所在元素是相对/绝对定位，否则阴影定位会出问题
    const computedStyle = window.getComputedStyle(el)
    if (computedStyle.position === 'static') {
      el.style.position = 'relative'
    }

    el.appendChild(shadow)

    // ==================== 性能优化 ====================

    // 1. 使用节流，避免滚动时高频触发
    let ticking = false

    /**
     * 检查是否需要显示阴影
     * @description 根据滚动位置判断是否接近底部
     */
    const checkShadowVisibility = (): void => {
      const { scrollTop, scrollHeight, clientHeight } = scrollWrapper

      // 计算距离底部的像素数
      // scrollHeight: 内容总高度
      // clientHeight: 可视区域高度
      // scrollTop: 已滚动的距离
      const distanceToBottom = scrollHeight - scrollTop - clientHeight

      // 距离底部超过阈值时显示阴影，否则隐藏
      shadow.style.opacity = distanceToBottom > options.threshold ? '1' : '0'
    }

    /**
     * 节流版本的检查函数
     * @description 使用 requestAnimationFrame 实现节流，保证每帧最多执行一次
     */
    const throttledCheck = (): void => {
      if (ticking) return

      ticking = true
      requestAnimationFrame(() => {
        checkShadowVisibility()
        ticking = false
      })
    }

    // 2. 滚动事件使用 passive: true 提升滚动性能
    //    passive 表示不会调用 preventDefault()，浏览器可以立即滚动而不用等待 JS 执行
    scrollWrapper.addEventListener('scroll', throttledCheck, { passive: true })

    // 3. ResizeObserver 监听容器尺寸变化
    //    场景：窗口缩放、父容器尺寸变化、折叠面板展开等
    const resizeObserver = new ResizeObserver(throttledCheck)
    resizeObserver.observe(scrollWrapper)

    // 4. MutationObserver 监听内容变化
    //    场景：数据加载完成、行数变化、展开行等
    //    注意：使用 throttledCheck 避免大量 DOM 变化时频繁触发
    const mutationObserver = new MutationObserver(throttledCheck)
    mutationObserver.observe(scrollWrapper, {
      childList: true, // 监听子元素增删
      subtree: true // 监听所有后代元素
      // 不监听 attributes 和 characterData，减少不必要的触发
    })

    // 初始检查一次
    checkShadowVisibility()

    // ==================== 清理函数 ====================
    // 在 unmounted 或 updated 重建时调用，防止内存泄漏
    el._cleanupShadow = () => {
      scrollWrapper.removeEventListener('scroll', throttledCheck)
      resizeObserver.disconnect()
      mutationObserver.disconnect()
      shadow.remove()
    }
  })
}

/**
 * v-table-shadow 指令
 *
 * @description 为 el-table 添加底部阴影效果，提示用户可以继续向下滚动
 *
 * @example
 * ```vue
 * <!-- 基础用法 -->
 * <el-table v-table-shadow :data="list" height="400px">
 *   <el-table-column prop="name" label="姓名" />
 * </el-table>
 *
 * <!-- 自定义配置 -->
 * <el-table
 *   v-table-shadow="{ height: 60, color: 'rgba(0, 100, 255, 0.1)' }"
 *   :data="list"
 *   height="400px"
 * >
 *   <el-table-column prop="name" label="姓名" />
 * </el-table>
 * ```
 *
 * @remarks
 * - 必须为 el-table 设置 height 属性，否则不会出现滚动条
 * - 滚动到底部时阴影会自动消失
 * - 支持动态数据变化、窗口缩放等场景
 */
const vTableShadow: ObjectDirective<HTMLElementWithCleanup, ShadowOptions> = {
  /**
   * mounted 钩子
   * @description 元素挂载到 DOM 后初始化阴影
   */
  mounted(el, binding) {
    initShadow(el, binding)
  },

  /**
   * updated 钩子
   * @description 当指令的绑定值变化时，检查是否需要重建阴影
   */
  updated(el, binding) {
    const nextOptions = resolveOptions(binding)

    // 配置没变化则跳过，避免不必要的重建
    if (isSameOptions(el._tableShadowOptions, nextOptions)) {
      return
    }

    // 配置变化了，重新初始化
    initShadow(el, binding)
  },

  /**
   * unmounted 钩子
   * @description 元素卸载时清理资源，防止内存泄漏
   */
  unmounted(el) {
    el._cleanupShadow?.()
  }
}

export default vTableShadow
