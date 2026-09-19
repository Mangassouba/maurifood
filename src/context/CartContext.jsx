import { createContext, useContext, useEffect, useState } from 'react'

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

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart))
    } catch {
      // stockage indisponible (navigation privée...), on ignore
    }
  }, [cart])

  function addItem(dish) {
    setCart((prev) => {
      if (prev.restaurantId && prev.restaurantId !== dish.restaurantId) {
        const confirmed = window.confirm(
          "Votre panier contient des plats d'un autre restaurant. Le vider et ajouter ce plat ?",
        )
        if (!confirmed) return prev
        return {
          restaurantId: dish.restaurantId,
          restaurantName: dish.restaurantName,
          items: [{ dishId: dish.id, name: dish.name, price: Number(dish.price), quantity: 1 }],
        }
      }

      const existing = prev.items.find((i) => i.dishId === dish.id)
      const items = existing
        ? prev.items.map((i) => (i.dishId === dish.id ? { ...i, quantity: i.quantity + 1 } : i))
        : [...prev.items, { dishId: dish.id, name: dish.name, price: Number(dish.price), quantity: 1 }]

      return { restaurantId: dish.restaurantId, restaurantName: dish.restaurantName, items }
    })
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
    </CartContext.Provider>
  )
}

export function useCart() {
  return useContext(CartContext)
}
