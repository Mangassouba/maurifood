const STORAGE_KEY = 'maurifood_orders'

export function loadOrderHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function addOrderToHistory(entry) {
  try {
    const history = loadOrderHistory()
    localStorage.setItem(STORAGE_KEY, JSON.stringify([entry, ...history].slice(0, 30)))
  } catch {
    // stockage indisponible, on ignore
  }
}
