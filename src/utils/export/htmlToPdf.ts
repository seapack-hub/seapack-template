import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

function createRenderElement(html: string): HTMLDivElement {
  const el = document.createElement('div')
  el.innerHTML = html
  el.style.padding = '40px'
  el.style.background = '#fff'
  el.style.fontSize = '12pt'
  el.style.lineHeight = '1.6'
  el.style.color = '#333'
  el.style.fontFamily = 'serif'
  el.style.width = '800px'
  el.style.position = 'fixed'
  el.style.left = '0'
  el.style.top = '0'
  el.style.zIndex = '-1000'
  el.style.pointerEvents = 'none'
  document.body.appendChild(el)
  return el
}

export async function exportHtmlToPdf(
  html: string,
  filename: string,
): Promise<void> {
  const el = createRenderElement(html)

  await new Promise((resolve) => requestAnimationFrame(resolve))

  try {
    const canvas = await html2canvas(el, {
      scale: 2,
      useCORS: true,
      logging: false,
    })

    const imgData = canvas.toDataURL('image/jpeg', 0.95)
    const pdf = new jsPDF('p', 'mm', 'a4')
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width

    let heightLeft = pdfHeight
    let position = 0
    const pageHeight = pdf.internal.pageSize.getHeight()

    pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, pdfHeight)
    heightLeft -= pageHeight

    while (heightLeft > 0) {
      position = heightLeft - pdfHeight
      pdf.addPage()
      pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, pdfHeight)
      heightLeft -= pageHeight
    }

    pdf.save(filename)
  } finally {
    document.body.removeChild(el)
  }
}
