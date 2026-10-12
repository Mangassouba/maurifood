import api from '../api/client'

const DEFAULT_MAX_SIZE = 1000
const QUALITY = 0.82

// Redimensionne l'image dans le navigateur avant l'envoi : une photo de
// téléphone (plusieurs Mo) devient un JPEG d'environ 100 à 200 Ko.
async function resizeImage(file, maxSize) {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)

  const ctx = canvas.getContext('2d')
  // Fond blanc pour les PNG transparents, le JPEG ne gérant pas la transparence
  ctx.fillStyle = '#fff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Conversion impossible'))),
      'image/jpeg',
      QUALITY,
    )
  })
}

export async function uploadImage(file, { maxSize = DEFAULT_MAX_SIZE } = {}) {
  if (!file.type.startsWith('image/')) {
    throw new Error('Le fichier doit être une image')
  }
  const blob = await resizeImage(file, maxSize)
  const { data } = await api.post('/dashboard/images', blob, {
    headers: { 'Content-Type': 'image/jpeg' },
  })
  return new URL(api.getUri({ url: data.path }), window.location.origin).href
}
