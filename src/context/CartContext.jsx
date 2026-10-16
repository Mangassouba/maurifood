import { createContext, useContext, useEffect, useState } from 'react'
import ConfirmModal from '../components/ConfirmModal'

const CartContext = createContext(null)
const STORAGE_KEY = 'maurifood_cart'
const EMPTY_CART = { restaurantId: null, restaurantName: null, items: [] }

function loadCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : EMPTY_CART
  } catch {
    return EMPTY_CART
  }
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState(loadCart)
  // Plat en attente quand le panier contient déjà les plats d'un autre restaurant
  const [pendingAdd, setPendingAdd] = useState(null)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart))
    } catch {
      // stockage indisponible (navigation privée...), on ignore
    }
  }, [cart])

  function toCartItem(dish, quantity) {
    return { dishId: dish.id, name: dish.name, price: Number(dish.price), quantity }
  }

  // `onAdded` est appelé une fois le plat réellement ajouté (après confirmation
  // éventuelle), par exemple pour rediriger vers le panier.
  function addItem(dish, { quantity = 1, onAdded } = {}) {
    if (cart.restaurantId && cart.restaurantId !== dish.restaurantId) {
      setPendingAdd({ dish, quantity, onAdded })
      return
    }

    setCart((prev) => {
      const existing = prev.items.find((i) => i.dishId === dish.id)
      const items = existing
        ? prev.items.map((i) =>
            i.dishId === dish.id ? { ...i, quantity: i.quantity + quantity } : i,
          )
        : [...prev.items, toCartItem(dish, quantity)]

      return { restaurantId: dish.restaurantId, restaurantName: dish.restaurantName, items }
    })
    onAdded?.()
  }

  function confirmReplaceCart() {
    const { dish, quantity, onAdded } = pendingAdd
    setCart({
      restaurantId: dish.restaurantId,
      restaurantName: dish.restaurantName,
      items: [toCartItem(dish, quantity)],
    })
    onAdded?.()
  }

  function updateQuantity(dishId, quantity) {
    setCart((prev) => {
      const items =
        quantity <= 0
          ? prev.items.filter((i) => i.dishId !== dishId)
          : prev.items.map((i) => (i.dishId === dishId ? { ...i, quantity } : i))
      return items.length === 0 ? EMPTY_CART : { ...prev, items }
    })
  }

  function clearCart() {
    setCart(EMPTY_CART)
  }

  const subtotal = cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const itemCount = cart.items.reduce((sum, i) => sum + i.quantity, 0)

  return (
    <CartContext.Provider value={{ cart, addItem, updateQuantity, clearCart, subtotal, itemCount }}>
      {children}
      <ConfirmModal
        open={Boolean(pendingAdd)}
        title="Changer de restaurant ?"
        message={`Votre panier contient des plats de ${cart.restaurantName ?? 'un autre restaurant'}. Pour ajouter « ${pendingAdd?.dish.name ?? ''} », il faut vider le panier.`}
        confirmLabel="Vider et ajouter"
        tone="primary"
        onConfirm={confirmReplaceCart}
        onClose={() => setPendingAdd(null)}
      />
    </CartContext.Provider>
  )
}

export function useCart() {
  return useContext(CartContext)
}
