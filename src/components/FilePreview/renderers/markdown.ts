import MarkdownIt from 'markdown-it'

const md = new MarkdownIt({ html: true })

export async function renderMarkdown(
  container: HTMLElement,
  data: ArrayBuffer | string,
): Promise<() => void> {
  let text: string
  if (typeof data === 'string') {
    text = data
  } else {
    const decoder = new TextDecoder('utf-8')
    text = decoder.decode(data)
  }

  container.innerHTML = md.render(text)

  return () => {
    container.innerHTML = ''
  }
}
