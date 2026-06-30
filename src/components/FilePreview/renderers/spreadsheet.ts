export async function renderSpreadsheet(
  container: HTMLElement,
  data: ArrayBuffer,
): Promise<() => void> {
  const XLSX = await import('xlsx')

  const workbook = XLSX.read(data, { type: 'array' })
  const sheetNames = workbook.SheetNames
  const sheetTabs = document.createElement('div')
  sheetTabs.className = 'ss-tabs'
  const contentArea = document.createElement('div')
  contentArea.className = 'ss-content'

  container.appendChild(sheetTabs)
  container.appendChild(contentArea)

  function renderSheet(index: number) {
    const name = sheetNames[index]
    const sheet = workbook.Sheets[name]
    contentArea.innerHTML = XLSX.utils.sheet_to_html(sheet, { editable: false })

    sheetTabs.querySelectorAll('.ss-tab').forEach((t, i) => {
      t.classList.toggle('active', i === index)
    })

    // 修复 sheet_to_html 生成的表格样式
    const table = contentArea.querySelector('table')
    if (table) {
      table.style.width = 'auto'
      table.style.borderCollapse = 'collapse'
    }
  }

  sheetNames.forEach((name, i) => {
    const tab = document.createElement('button')
    tab.className = `ss-tab${i === 0 ? ' active' : ''}`
    tab.textContent = name
    tab.addEventListener('click', () => renderSheet(i))
    sheetTabs.appendChild(tab)
  })

  renderSheet(0)

  return () => {
    container.innerHTML = ''
  }
}
