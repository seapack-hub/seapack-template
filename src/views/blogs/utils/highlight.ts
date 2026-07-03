/** 为正文中所有 pre code 元素激活 highlight.js 高亮 */
export async function highlightCode(container: HTMLElement | null) {
  if (!container) return
  const hljs = await import('highlight.js').then(m => m.default)
  await import('highlight.js/styles/github.css')
  container.querySelectorAll('pre code').forEach((el) => {
    hljs.highlightElement(el as HTMLElement)
  })
}

/** 在每个代码块右上角注入复制按钮 */
export function injectCopyButtons(container: HTMLElement | null) {
  if (!container) return
  container.querySelectorAll('pre').forEach((pre) => {
    if (pre.querySelector('.copy-btn')) return
    const code = pre.querySelector('code')
    if (!code) return

    const btn = document.createElement('button')
    btn.className = 'copy-btn'
    btn.innerHTML = `<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`
    btn.title = '复制代码'

    btn.addEventListener('click', async (e) => {
      e.stopPropagation()
      const text = code.textContent || ''
      try {
        await navigator.clipboard.writeText(text)
        const { ElMessage } = await import('element-plus')
        ElMessage.success('已复制到剪贴板')
      } catch {
        const { ElMessage } = await import('element-plus')
        ElMessage.error('复制失败')
      }
    })

    pre.appendChild(btn)
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
