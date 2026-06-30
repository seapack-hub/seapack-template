const MAX_PREVIEW_CHARS = 50000

export async function renderText(
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

  const truncated = text.length > MAX_PREVIEW_CHARS
  if (truncated) {
    text = text.slice(0, MAX_PREVIEW_CHARS) + '\n\n... (文件过大，仅展示前 50000 字符)'
  }

  const pre = document.createElement('pre')
  pre.className = 'text-preview'
  pre.textContent = text
  container.appendChild(pre)

  return () => {
    container.innerHTML = ''
  }
}
