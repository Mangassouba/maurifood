// Liens vers Google Maps et WhatsApp : aucune clé API n'est nécessaire.

export function mapUrl(lat, lng) {
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
}

// Sans point de départ, Google Maps démarre de la position actuelle de l'utilisateur
export function directionsUrl(lat, lng) {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
}

// wa.me attend un numéro international sans « + » ; les numéros mauritaniens ont 8 chiffres
export function whatsappUrl(phone, message) {
  const digits = phone.replace(/\D/g, '').replace(/^00/, '')
  const number = digits.length === 8 ? `222${digits}` : digits
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`
}
