/** 为正文中所有 pre code 元素激活 highlight.js 高亮 */
export async function highlightCode(container: HTMLElement | null) {
  if (!container) return
  const hljs = await import('highlight.js').then(m => m.default)
  await import('highlight.js/styles/github.css')
  container.querySelectorAll('pre code').forEach((el) => {
    hljs.highlightElement(el as HTMLElement)
  })
}

/**
 * 为正文中所有 h1/h2/h3 标题元素注入 id（供 ArticleToc 锚点定位）
 * 使用 base64 编码确保 id 唯一且无特殊字符
 */
export function injectHeadingIds(container: HTMLElement | null) {
  if (!container) return
  const headings = container.querySelectorAll('h1, h2, h3')
  headings.forEach((el) => {
    const text = el.textContent?.trim() || ''
    if (text && !el.id) {
      el.id = `toc-${btoa(encodeURIComponent(text)).slice(0, 32)}`
    }
  })
}
