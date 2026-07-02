/**
 * Iconfont 图标初始化
 *
 * 从 iconfont.js 中提取 SVG sprite 字符串，直接注入 DOM。
 * 不使用 iconfont.js 的 IIFE（存在 Vite 模块转换和异步注入时序问题），
 * 改为正则提取 SVG 内容后同步插入，确保 <use> 引用的 symbol 立即可用。
 *
 * 消费方只需在 main.ts 中 import 此文件即可：
 *   import './assets/iconfont/setup'
 */
import iconfontRaw from './iconfont.js?raw'

/** 从 iconfont.js 源码中提取 SVG sprite 并注入 DOM */
;(() => {
  // iconfont.js 格式：window._iconfont_svg_string_XXXXX='<svg>...</svg>',(function(n){...})(window);
  // 提取两个单引号之间的 SVG 字符串
  const match = iconfontRaw.match(/window\._iconfont_svg_string_\d+='(<svg>[\s\S]*?<\/svg>)'/)
  if (!match) {
    console.warn('[iconfont] 未能从 iconfont.js 中提取 SVG sprite')
    return
  }

  const div = document.createElement('div')
  div.innerHTML = match[1]
  const svg = div.querySelector('svg')
  if (!svg) {
    console.warn('[iconfont] 解析 SVG sprite 失败')
    return
  }

  svg.setAttribute('aria-hidden', 'true')
  svg.style.position = 'absolute'
  svg.style.width = '0'
  svg.style.height = '0'
  svg.style.overflow = 'hidden'

  // 清除 symbol 中所有路径的内联 fill，使 <use> 能通过 CSS 控制颜色
  svg.querySelectorAll('path, polygon, rect, circle, ellipse').forEach(el => {
    const fill = el.getAttribute('fill')
    if (fill && fill !== 'none' && !fill.startsWith('url(')) {
      el.removeAttribute('fill')
    }
  })

  // 插入到 body 最前面，确保 vite-plugin-svg-icons 的 sprite 在前
  document.body.prepend(svg)
  console.log('[iconfont] SVG sprite 注入成功', svg.querySelectorAll('symbol').length, '个图标')
})()
