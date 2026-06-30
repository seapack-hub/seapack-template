export async function renderHtml(
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

  const blob = new Blob([text], { type: 'text/html;charset=utf-8' })
  const url = URL.createObjectURL(blob)

  const iframe = document.createElement('iframe')
  iframe.className = 'html-preview'
  iframe.sandbox.add('allow-same-origin')
  iframe.src = url
  container.appendChild(iframe)

  return () => {
    URL.revokeObjectURL(url)
    container.innerHTML = ''
  }
}
