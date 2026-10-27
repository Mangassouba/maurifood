import { getLocale, t } from '../i18n'
const PAYMENT_LABELS = { cash: 'Espèces', card: 'Carte', mobile_money: 'Mobile money' }

const BRAND = 'FFF7A30F'
const INK = 'FF14110D'
const CREAM = 'FFFFFAEB'
const BORDER = { style: 'thin', color: { argb: 'FFECE9E4' } }
const MONEY_FORMAT = '#,##0.00 "MRU"'

function downloadBlob(buffer, filename) {
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

// Exporte les ventes caisse affichées (période filtrée) dans un classeur Excel mis en forme.
export async function downloadSalesXlsx(sales, { restaurantName, periodLabel }) {
  // Chargé à la demande : la librairie est lourde et seule la caisse s'en sert.
  const { default: ExcelJS } = await import('exceljs')
  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'MauriFood'
  const sheet = workbook.addWorksheet(t('Ventes'), { views: [{ state: 'frozen', ySplit: 4 }] })

  sheet.columns = [
    { key: 'code', width: 14 },
    { key: 'date', width: 18 },
    { key: 'client', width: 22 },
    { key: 'items', width: 48 },
    { key: 'payment', width: 16 },
    { key: 'total', width: 16 },
  ]

  sheet.mergeCells('A1:F1')
  const title = sheet.getCell('A1')
  title.value = `${restaurantName || 'MauriFood'} — ${t('Ventes caisse')}`
  title.font = { bold: true, size: 16, color: { argb: INK } }
  sheet.getRow(1).height = 26

  sheet.mergeCells('A2:F2')
  const subtitle = sheet.getCell('A2')
  subtitle.value = t('Période : {period} · Exporté le {date}', {
    period: t(periodLabel),
    date: new Date().toLocaleString(getLocale()),
  })
  subtitle.font = { italic: true, color: { argb: 'FF8A8377' } }

  const header = sheet.getRow(4)
  header.values = ['Code', 'Date', 'Client', 'Articles', 'Paiement', 'Total'].map((label) => t(label))
  header.height = 22
  header.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: INK } }
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: BRAND } }
    cell.alignment = { vertical: 'middle' }
    cell.border = { bottom: BORDER }
  })
  header.getCell(6).alignment = { vertical: 'middle', horizontal: 'right' }

  sales.forEach((sale, index) => {
    const row = sheet.addRow({
      code: sale.code,
      date: new Date(sale.createdAt),
      client: sale.guestName,
      items: sale.items.map((i) => `${i.quantity} × ${i.dish?.name ?? t('Plat')}`).join(', '),
      payment: PAYMENT_LABELS[sale.paymentMethod] ? t(PAYMENT_LABELS[sale.paymentMethod]) : sale.paymentMethod,
      total: Number(sale.total),
    })
    row.getCell('date').numFmt = 'dd/mm/yyyy hh:mm'
    row.getCell('total').numFmt = MONEY_FORMAT
    row.getCell('items').alignment = { wrapText: true, vertical: 'top' }
    row.eachCell((cell) => {
      cell.border = { bottom: BORDER }
      if (index % 2 === 1) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: CREAM } }
      }
    })
    row.getCell('code').font = { bold: true, color: { argb: 'FF15803D' } }
  })

  // Récapitulatif : total général puis total par moyen de paiement
  sheet.addRow([])
  const grandTotal = sales.reduce((sum, s) => sum + Number(s.total), 0)
  const summaryRows = [
    [t('Nombre de ventes'), sales.length],
    [t("Chiffre d'affaires"), grandTotal],
    ...Object.entries(PAYMENT_LABELS).map(([method, label]) => [
      t(label),
      sales.filter((s) => s.paymentMethod === method).reduce((sum, s) => sum + Number(s.total), 0),
    ]),
  ]
  summaryRows.forEach(([label, value], i) => {
    const row = sheet.addRow({ payment: label, total: value })
    row.getCell('payment').font = { bold: true }
    if (i > 0) row.getCell('total').numFmt = MONEY_FORMAT
    if (i === 1) {
      ;['payment', 'total'].forEach((key) => {
        row.getCell(key).font = { bold: true, color: { argb: INK } }
        row.getCell(key).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF0C2' } }
      })
    }
  })

  const buffer = await workbook.xlsx.writeBuffer()
  const stamp = new Date().toISOString().slice(0, 10)
  downloadBlob(buffer, `ventes-caisse-${stamp}.xlsx`)
}
