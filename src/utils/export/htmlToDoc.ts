export interface DocOptions {
  title?: string
  fontFamily?: string
  fontSize?: string
}

function buildDocHtml(html: string, options: DocOptions = {}): string {
  const title = options.title || '文档'
  const fontFamily = options.fontFamily || "'Times New Roman', serif"
  const fontSize = options.fontSize || '12pt'

  return `<!DOCTYPE html>
          <html xmlns:o='urn:schemas-microsoft-com:office:office'
                xmlns:w='urn:schemas-microsoft-com:office:word'
                xmlns='http://www.w3.org/TR/REC-html40'>
          <head>
          <meta charset="UTF-8">
          <title>${title}</title>
          <style>
            body { font-family: ${fontFamily}; font-size: ${fontSize}; line-height: 1.6; padding: 40px; }
            table { border-collapse: collapse; width: 100%; }
            td, th { border: 1px solid #999; padding: 6px; }
            img { max-width: 100%; }
          </style>
          </head>
          <body>
          ${html}
          </body>
          </html>`
}

export function exportHtmlToDoc(html: string, filename: string, options: DocOptions = {}): void {
  const fullHtml = buildDocHtml(html, options)
  const blob = new Blob([fullHtml], { type: 'application/msword' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
