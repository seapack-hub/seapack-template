export async function renderPdf(
  container: HTMLElement,
  data: ArrayBuffer,
): Promise<() => void> {
  const pdfjs = await import('pdfjs-dist')
  pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`

  const pdf = await pdfjs.getDocument({ data }).promise
  const totalPages = pdf.numPages
  let currentPage = 1
  let scale = 1.5
  let destroyed = false

  const wrapper = document.createElement('div')
  wrapper.className = 'pdf-viewport'
  container.appendChild(wrapper)

  const nav = document.createElement('div')
  nav.className = 'pdf-nav'
  nav.innerHTML = `
    <div class="pdf-nav-inner">
      <button class="pdf-nav-btn" id="pdfPrev" disabled>&#8249;</button>
      <span class="pdf-page-info" id="pdfPageInfo">1 / ${totalPages}</span>
      <button class="pdf-nav-btn" id="pdfNext">&#8250;</button>
      <span class="pdf-sep"></span>
      <input id="pdfScale" type="range" min="50" max="300" value="${Math.round(scale * 100)}" class="pdf-scale-range">
      <span class="pdf-scale-label" id="pdfScaleLabel">${Math.round(scale * 100)}%</span>
    </div>
  `
  container.insertBefore(nav, wrapper)

  const prevBtn = nav.querySelector('#pdfPrev') as HTMLButtonElement
  const nextBtn = nav.querySelector('#pdfNext') as HTMLButtonElement
  const pageInfo = nav.querySelector('#pdfPageInfo') as HTMLSpanElement
  const scaleInput = nav.querySelector('#pdfScale') as HTMLInputElement
  const scaleLabel = nav.querySelector('#pdfScaleLabel') as HTMLSpanElement

  async function renderPage(pageNum: number) {
    if (destroyed) return null
    const page = await pdf.getPage(pageNum)
    const viewport = page.getViewport({ scale })
    const canvas = document.createElement('canvas')
    canvas.className = 'pdf-page-canvas'
    canvas.width = viewport.width
    canvas.height = viewport.height
    await page.render({ canvasContext: canvas.getContext('2d')!, viewport }).promise
    page.cleanup()
    return canvas
  }

  async function jumpTo(pageNum: number) {
    if (destroyed) return
    currentPage = Math.max(1, Math.min(pageNum, totalPages))
    prevBtn.disabled = currentPage <= 1
    nextBtn.disabled = currentPage >= totalPages
    pageInfo.textContent = `${currentPage} / ${totalPages}`

    wrapper.innerHTML = ''
    const canvas = await renderPage(currentPage)
    if (canvas) wrapper.appendChild(canvas)
  }

  prevBtn.addEventListener('click', () => jumpTo(currentPage - 1))
  nextBtn.addEventListener('click', () => jumpTo(currentPage + 1))
  scaleInput.addEventListener('input', () => {
    scale = Number(scaleInput.value) / 100
    scaleLabel.textContent = `${Math.round(scale * 100)}%`
    jumpTo(currentPage)
  })

  await jumpTo(1)

  return () => {
    destroyed = true
    wrapper.innerHTML = ''
    nav.remove()
    pdf.destroy()
  }
}
