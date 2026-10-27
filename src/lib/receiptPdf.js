import { jsPDF } from 'jspdf'
import { getLang, getLocale, tIn } from '../i18n'
import { statusLabel } from './orderStatus'

// Format ticket de caisse (80 mm de large), hauteur calculée selon le contenu.
const WIDTH = 226
const MARGIN = 16
const RIGHT = WIDTH - MARGIN
const CENTER = WIDTH / 2

const BRAND = [247, 163, 15]
const BRAND_LIGHT = [255, 240, 194]
const INK = [20, 17, 13]
const MUTED = [138, 131, 119]
const GREEN = [21, 128, 61]

const PAYMENT_LABELS = { cash: 'Espèces', card: 'Carte', mobile_money: 'Mobile money' }

// Les polices intégrées de jsPDF n'ont pas de glyphes arabes : le reçu passe alors en français.
function receiptLang() {
  return getLang() === 'ar' ? 'fr' : getLang()
}

function money(value) {
  return `${Number(value).toFixed(2)} MRU`
}

function orderTypeLabel(order, lang) {
  if (order.source === 'pos') return tIn(lang, 'Vente au comptoir')
  return tIn(lang, order.orderType === 'delivery' ? 'Livraison' : 'À emporter')
}

function dashedLine(doc, y) {
  doc.setDrawColor(...MUTED)
  doc.setLineWidth(0.6)
  doc.setLineDashPattern([2, 2], 0)
  doc.line(MARGIN, y, RIGHT, y)
  doc.setLineDashPattern([], 0)
}

// Dessine le reçu et renvoie la hauteur utilisée : appelé une première fois
// pour mesurer, puis sur le document final à la bonne hauteur.
function drawReceipt(doc, order) {
  const lang = receiptLang()
  const tr = (text, vars) => tIn(lang, text, vars)
  const created = new Date(order.createdAt)
  let y = 0

  // Bandeau de marque
  doc.setFillColor(...BRAND)
  doc.rect(0, 0, WIDTH, 50, 'F')
  doc.setTextColor(...INK)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.text('MauriFood', CENTER, 28, { align: 'center' })
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.text(tr(order.source === 'pos' ? 'TICKET DE CAISSE' : 'REÇU DE COMMANDE'), CENTER, 41, {
    align: 'center',
  })
  y = 72

  // Restaurant
  const restaurantName = order.restaurant?.name
  if (restaurantName) {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(13)
    const lines = doc.splitTextToSize(restaurantName, RIGHT - MARGIN)
    doc.text(lines, CENTER, y, { align: 'center' })
    y += lines.length * 15
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(...MUTED)
    for (const info of [order.restaurant.address, order.restaurant.phone].filter(Boolean)) {
      doc.text(info, CENTER, y, { align: 'center' })
      y += 11
    }
    y += 4
  }

  // Code de la commande
  doc.setFillColor(...INK)
  doc.roundedRect(MARGIN, y, RIGHT - MARGIN, 34, 6, 6, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFont('courier', 'bold')
  doc.setFontSize(17)
  doc.text(order.code, CENTER, y + 22, { align: 'center' })
  y += 50

  // Informations
  const infos = [
    [tr('Date'), created.toLocaleDateString(getLocale(lang))],
    [tr('Heure'), created.toLocaleTimeString(getLocale(lang), { hour: '2-digit', minute: '2-digit' })],
    [tr('Client'), order.guestName],
    ...(order.guestPhone ? [[tr('Téléphone'), order.guestPhone]] : []),
    [tr('Type'), orderTypeLabel(order, lang)],
    ...(order.source === 'pos'
      ? [[tr('Paiement'), PAYMENT_LABELS[order.paymentMethod] ? tr(PAYMENT_LABELS[order.paymentMethod]) : order.paymentMethod]]
      : [[tr('Statut'), statusLabel(order.status, order.orderType, lang)]]),
  ]
  doc.setFontSize(9)
  for (const [label, value] of infos) {
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...MUTED)
    doc.text(label, MARGIN, y)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...INK)
    doc.text(String(value ?? '-'), RIGHT, y, { align: 'right' })
    y += 14
  }
  if (order.guestAddress) {
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...MUTED)
    doc.text(tr('Adresse'), MARGIN, y)
    y += 11
    doc.setTextColor(...INK)
    const lines = doc.splitTextToSize(order.guestAddress, RIGHT - MARGIN)
    doc.text(lines, MARGIN, y)
    y += lines.length * 11 + 3
  }

  y += 2
  dashedLine(doc, y)
  y += 16

  // Articles
  for (const item of order.items ?? []) {
    const name = item.dish?.name ?? tr('Plat #{id}', { id: item.dishId })
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9.5)
    doc.setTextColor(...INK)
    const nameLines = doc.splitTextToSize(`${item.quantity} × ${name}`, RIGHT - MARGIN - 70)
    doc.text(nameLines, MARGIN, y)
    doc.text(money(Number(item.unitPrice) * item.quantity), RIGHT, y, { align: 'right' })
    y += nameLines.length * 12
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(...MUTED)
    doc.text(tr("{price} l'unité", { price: money(item.unitPrice) }), MARGIN, y)
    y += 15
  }

  dashedLine(doc, y - 4)
  y += 12

  // Totaux
  doc.setFontSize(9)
  const subtotals = [[tr('Sous-total'), money(order.subtotal)]]
  if (Number(order.deliveryFee) > 0) subtotals.push([tr('Livraison'), money(order.deliveryFee)])
  for (const [label, value] of subtotals) {
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...MUTED)
    doc.text(label, MARGIN, y)
    doc.setTextColor(...INK)
    doc.text(value, RIGHT, y, { align: 'right' })
    y += 14
  }

  y += 2
  doc.setFillColor(...BRAND_LIGHT)
  doc.roundedRect(MARGIN, y, RIGHT - MARGIN, 30, 6, 6, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(...INK)
  doc.text(tr('TOTAL'), MARGIN + 10, y + 19)
  doc.setFontSize(13)
  doc.text(money(order.total), RIGHT - 10, y + 19.5, { align: 'right' })
  y += 44

  if (order.paymentStatus === 'paid') {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.setTextColor(...GREEN)
    doc.text(tr('PAYÉ'), CENTER, y, { align: 'center' })
    y += 18
  }

  // Pied de ticket
  dashedLine(doc, y)
  y += 18
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(...INK)
  doc.text(tr('Merci de votre visite !'), CENTER, y, { align: 'center' })
  y += 13
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.setTextColor(...MUTED)
  doc.text(tr('Commandez en ligne sur MauriFood'), CENTER, y, { align: 'center' })
  y += 22

  return y
}

export function downloadReceiptPdf(order) {
  const height = drawReceipt(new jsPDF({ unit: 'pt', format: [WIDTH, 2000] }), order)
  const doc = new jsPDF({ unit: 'pt', format: [WIDTH, height] })
  drawReceipt(doc, order)
  doc.save(`recu-${order.code}.pdf`)
}
