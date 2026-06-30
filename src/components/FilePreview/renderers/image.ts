export async function renderImage(
  container: HTMLElement,
  data: ArrayBuffer,
  mimeType?: string,
): Promise<() => void> {
  const blob = new Blob([data], { type: mimeType || 'image/png' })
  const url = URL.createObjectURL(blob)

  const img = document.createElement('img')
  img.className = 'image-preview'
  img.src = url
  container.appendChild(img)

  return () => {
    URL.revokeObjectURL(url)
    container.innerHTML = ''
  }
}
