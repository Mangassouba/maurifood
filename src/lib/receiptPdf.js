import { jsPDF } from 'jspdf'
import { STATUS_LABELS } from './orderStatus'

const MARGIN_X = 40
const RIGHT_EDGE = 555

export function downloadReceiptPdf(order) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  let y = 55

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(20)
  doc.text('MauriFood', MARGIN_X, y)
  y += 20

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  doc.text('Reçu de commande', MARGIN_X, y)
  y += 35

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.text(`Code : ${order.code}`, MARGIN_X, y)
  y += 28

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  const infoLines = [
    `Restaurant : ${order.restaurant?.name ?? '-'}`,
    `Client : ${order.guestName}`,
    `Téléphone : ${order.guestPhone}`,
    `Type : ${order.orderType === 'delivery' ? 'Livraison' : 'À emporter'}`,
    ...(order.guestAddress ? [`Adresse : ${order.guestAddress}`] : []),
    `Statut : ${STATUS_LABELS[order.status] ?? order.status}`,
    `Date : ${new Date(order.createdAt).toLocaleString('fr-FR')}`,
  ]
  for (const line of infoLines) {
    doc.text(line, MARGIN_X, y)
    y += 18
  }

  y += 12
  doc.setFont('helvetica', 'bold')
  doc.text('Plats', MARGIN_X, y)
  doc.text('Montant', RIGHT_EDGE, y, { align: 'right' })
  y += 8
  doc.setLineWidth(0.5)
  doc.line(MARGIN_X, y, RIGHT_EDGE, y)
  y += 18

  doc.setFont('helvetica', 'normal')
  for (const item of order.items ?? []) {
    const label = `${item.quantity} x ${item.dish?.name ?? `Plat #${item.dishId}`}`
    const lineTotal = `${(Number(item.unitPrice) * item.quantity).toFixed(2)} MRU`
    doc.text(label, MARGIN_X, y)
    doc.text(lineTotal, RIGHT_EDGE, y, { align: 'right' })
    y += 18
  }

  y += 6
  doc.line(MARGIN_X, y, RIGHT_EDGE, y)
  y += 20

  const totals = [
    ['Sous-total', `${order.subtotal} MRU`],
    ['Livraison', `${order.deliveryFee} MRU`],
  ]
  for (const [label, value] of totals) {
    doc.text(label, MARGIN_X, y)
    doc.text(value, RIGHT_EDGE, y, { align: 'right' })
    y += 18
  }

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.text('Total', MARGIN_X, y)
  doc.text(`${order.total} MRU`, RIGHT_EDGE, y, { align: 'right' })

  doc.save(`commande-${order.code}.pdf`)
}
