/** sanitize-html 安全清洗配置（无运行时依赖，不导入 sanitize-html 本体） */
export const sanitizeOptions = {
  allowedTags: [
    'address', 'article', 'aside', 'b', 'blockquote', 'br', 'caption', 'cite',
    'code', 'col', 'colgroup', 'dd', 'del', 'details', 'dfn', 'div', 'dl', 'dt',
    'em', 'figcaption', 'figure', 'footer', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'header', 'hgroup', 'hr', 'i', 'img', 'ins', 'kbd', 'li', 'mark', 'ol', 'p',
    'pre', 'q', 'rp', 'rt', 'ruby', 's', 'samp', 'small', 'source', 'span',
    'strike', 'strong', 'sub', 'summary', 'sup', 'table', 'tbody', 'td', 'tfoot',
    'th', 'thead', 'time', 'tr', 'u', 'ul', 'var', 'video', 'wbr',
  ],
  allowedAttributes: {
    '*': ['class', 'id', 'style', 'title'],
    a: ['href', 'target', 'rel'],
    img: ['src', 'alt', 'title', 'width', 'height', 'loading'],
    td: ['colspan', 'rowspan'],
    th: ['colspan', 'rowspan'],
    div: ['class'],
  },
  allowedStyles: {
    '*': {
      'color': [/.*/],
      'background-color': [/.*/],
      'font-size': [/.*/],
      'font-family': [/.*/],
      'font-weight': [/.*/],
      'font-style': [/.*/],
      'text-align': [/.*/],
      'text-decoration': [/.*/],
      'line-height': [/.*/],
      'padding': [/.*/],
      'margin': [/.*/],
      'border': [/.*/],
      'border-radius': [/.*/],
      'border-left': [/.*/],
      'width': [/.*/],
      'height': [/.*/],
      'max-width': [/.*/],
      'display': [/.*/],
      'vertical-align': [/.*/],
      'white-space': [/.*/],
      'overflow': [/.*/],
    },
  },
  allowedSchemes: ['http', 'https', 'mailto'],
  exclusiveFilter: (frame: any) => frame.tag === 'script' || frame.tag === 'style',
}

/** 白名单标签（在 contentHtml 中可能被实体编码） */
const BLOCK_TAGS = [
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'p', 'pre', 'code', 'blockquote',
  'ul', 'ol', 'li',
  'table', 'thead', 'tbody', 'tr', 'th', 'td',
  'div', 'span', 'br', 'hr',
  'strong', 'b', 'em', 'i', 'u', 'del', 'ins', 'sub', 'sup',
  'a', 'img',
  'details', 'summary',
]

/**
 * 预处理 Markdown 语法：在 markdown-it 之前用正则处理非标准格式。
 *
 * 后端 contentHtml 中的标记格式不是标准 Markdown（:::info 为行内非独立行，
 * **bold** 嵌入在非独立行的 admonition 块内），markdown-it 无法识别。
 * 这里先将其转换为标准 HTML。
 */
export function preprocessMarkdown(str: string): string {
  let s = str

  // 1. **bold** → <strong>bold</strong>（非代码块内）
  s = s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')

  // 2. 行内 :::info CONTENT ::: → <div class="admonition admonition-info">CONTENT</div>
  s = s.replace(/:{4,6}info([\s\S]*?):::::?:{0,3}/g, (_match, content) => {
    const trimmed = content.trim()
    if (!trimmed) return content
    return `<div class="admonition admonition-info">\n\n${trimmed}\n\n</div>`
  })
  s = s.replace(/:{3}info([\s\S]*?):::/g, (_match, content) => {
    const trimmed = content.trim()
    if (!trimmed) return content
    return `<div class="admonition admonition-info">\n\n${trimmed}\n\n</div>`
  })

  return s
}

/**
 * 前置处理：还原被实体编码的 HTML 标签（仅限白名单标签）。
 *
 * 不能全局解码 HTML 实体，否则代码中的泛型（如 Result&lt;T&gt; → Result<T>）
 * 在 sanitize-html 中会被当作非法标签剥离。
 */
export function preprocessHtml(html: string): string {
  let result = html

  // 1. 处理实体编码的 <font> → <span（保留全部属性）
  result = result
    .replace(/&lt;font(\s[^>]*)?&gt;/gi, '<span$1>')
    .replace(/&lt;\/font&gt;/gi, '</span>')

  // 2. 处理实体编码的 <pre><code> 代码块
  result = result
    .replace(/&lt;pre&gt;/gi, '<pre>')
    .replace(/&lt;\/pre&gt;/gi, '</pre>')
    .replace(/&lt;code&gt;/gi, '<code>')
    .replace(/&lt;\/code&gt;/gi, '</code>')

  // 3. 还原其他白名单标签的实体编码
  for (const tag of BLOCK_TAGS) {
    const openPattern = new RegExp(`&lt;${tag}(\\s[^>]*)?/?&gt;`, 'gi')
    result = result.replace(openPattern, (_match, attrs) => {
      return attrs ? `<${tag}${attrs}>` : `<${tag}>`
    })
    const closePattern = new RegExp(`&lt;\\/${tag}&gt;`, 'gi')
    result = result.replace(closePattern, `</${tag}>`)
  }

  // 4. 兜底：原始 <font> 也转为 <span>
  result = result
    .replace(/<font(\s[^>]*)?>/gi, '<span$1>')
    .replace(/<\/font>/gi, '</span>')

  return result
}

let mdInstance: any = null

/** 创建 markdown-it 实例（含 admonition 容器插件），异步以支持动态导入 */
export async function createMarkdownIt(): Promise<any> {
  if (mdInstance) return mdInstance
  const [MarkdownIt, container] = await Promise.all([
    import('markdown-it').then(m => m.default),
    import('markdown-it-container').then(m => m.default),
  ])
  const md = new MarkdownIt({ html: true, linkify: true })

  const admonitionTypes = ['info', 'warning', 'tip', 'danger']
  admonitionTypes.forEach((type) => {
    md.use(container, type, {
      render: (tokens: any[], idx: number) => {
        const token = tokens[idx]
        if (token.nesting === 1) {
          return `<div class="admonition admonition-${type}">\n`
        }
        return '</div>\n'
      },
    })
  })

  mdInstance = md
  return md
}

/**
 * 异步渲染管线：预处理 → markdown-it → 标签还原 → sanitize
 * 动态导入 markdown-it / sanitize-html 等重型依赖，避免阻塞首屏加载
 */
export async function renderSafeHtml(contentHtml: string): Promise<string> {
  if (!contentHtml) return ''

  // 预处理 Markdown（纯字符串操作，无依赖）
  const markdownReady = preprocessMarkdown(contentHtml)

  // 并行加载重型依赖
  const [sanitizeHtml, md] = await Promise.all([
    import('sanitize-html').then(m => m.default),
    createMarkdownIt(),
  ])

  // markdown-it 渲染
  const rendered = md.render(markdownReady)

  // 还原实体编码的 HTML 标签（纯字符串操作，无依赖）
  const restoredHtml = preprocessHtml(rendered)

  // sanitize 安全清洗
  return sanitizeHtml(restoredHtml, sanitizeOptions)
}
