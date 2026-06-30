export async function renderDocx(
  container: HTMLElement,
  data: ArrayBuffer,
): Promise<() => void> {
  const { renderAsync } = await import('docx-preview')

  const blob = new Blob([data], {
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  })

  await renderAsync(blob, container, container, {
    className: 'docx-preview',
    inWrapper: true,
    ignoreWidth: false,
    ignoreHeight: false,
    ignoreFonts: false,
    breakPages: true,
  })

  return () => {
    container.innerHTML = ''
  }
}
