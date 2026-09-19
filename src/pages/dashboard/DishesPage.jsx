import { useEffect, useState } from 'react'
import api from '../../api/client'
import { badgeClass, btnDark, btnDanger, btnGhost, btnPrimary, cardClass, inputClass } from '../../styles/ui'

const EMPTY_FORM = { name: '', description: '', price: '', categoryId: '', imageUrl: '' }

export default function DishesPage() {
  const [dishes, setDishes] = useState([])
  const [categories, setCategories] = useState([])
  const [newCategory, setNewCategory] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)

  function loadDishes() {
    api
      .get('/dashboard/dishes')
      .then(({ data }) => setDishes(data))
      .catch(() => setDishes([]))
  }

  function loadCategories() {
    api
      .get('/dashboard/categories')
      .then(({ data }) => setCategories(data))
      .catch(() => setCategories([]))
  }

  useEffect(() => {
    loadDishes()
    loadCategories()
  }, [])

  function openCreate() {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setShowForm(true)
  }

  function openEdit(dish) {
    setEditingId(dish.id)
    setForm({
      name: dish.name,
      description: dish.description ?? '',
      price: dish.price,
      categoryId: dish.categoryId ?? '',
      imageUrl: dish.imageUrl ?? '',
    })
    setShowForm(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const payload = {
      ...form,
      categoryId: form.categoryId ? Number(form.categoryId) : null,
    }
    if (editingId) {
      await api.put(`/dashboard/dishes/${editingId}`, payload)
    } else {
      await api.post('/dashboard/dishes', payload)
    }
    setShowForm(false)
    loadDishes()
  }

  async function handleDelete(id) {
    if (!window.confirm('Supprimer ce plat ?')) return
    await api.delete(`/dashboard/dishes/${id}`)
    loadDishes()
  }

  async function toggleAvailable(dish) {
    await api.put(`/dashboard/dishes/${dish.id}`, { isAvailable: !dish.isAvailable })
    loadDishes()
  }

  async function addCategory() {
    if (!newCategory.trim()) return
    await api.post('/dashboard/categories', { name: newCategory.trim() })
    setNewCategory('')
    loadCategories()
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-end">
        <button type="button" onClick={openCreate} className={btnPrimary}>
          Nouveau plat
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className={`${cardClass} mb-6 flex flex-col gap-3`}>
          <input
            placeholder="Nom du plat"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className={inputClass}
            required
          />
          <textarea
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            className={inputClass}
          />
          <input
            type="number"
            step="0.01"
            placeholder="Prix (MRU)"
            value={form.price}
            onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
            className={inputClass}
            required
          />
          <input
            placeholder="URL de l'image (optionnel)"
            value={form.imageUrl}
            onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
            className={inputClass}
          />

          <select
            value={form.categoryId}
            onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
            className={inputClass}
          >
            <option value="">Sans catégorie</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-2">
            <input
              placeholder="Nouvelle catégorie"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className={`${inputClass} flex-1`}
            />
            <button type="button" onClick={addCategory} className={btnGhost}>
              Ajouter
            </button>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <button type="submit" className={btnDark}>
              {editingId ? 'Enregistrer' : 'Créer'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="text-sm text-ink-500">
              Annuler
            </button>
          </div>
        </form>
      )}

      <div className={`${cardClass} overflow-x-auto p-0`}>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-ink-100 text-xs font-bold uppercase tracking-wide text-ink-400">
              <th className="px-4 py-3">Nom</th>
              <th className="px-4 py-3">Prix</th>
              <th className="px-4 py-3">Disponible</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {dishes.map((dish) => (
              <tr key={dish.id} className="border-b border-ink-50 last:border-0 hover:bg-ink-50/50">
                <td className="px-4 py-3 font-semibold text-ink-900">{dish.name}</td>
                <td className="px-4 py-3 text-ink-600">{dish.price} MRU</td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => toggleAvailable(dish)}
                    className={badgeClass(dish.isAvailable ? 'green' : 'ink')}
                  >
                    {dish.isAvailable ? 'Oui' : 'Non'}
                  </button>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => openEdit(dish)}
                    className="mr-3 text-sm font-semibold text-ink-600 hover:text-ink-900"
                  >
                    Modifier
                  </button>
                  <button type="button" onClick={() => handleDelete(dish.id)} className={btnDanger}>
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {dishes.length === 0 && <p className="px-4 py-6 text-ink-400">Aucun plat pour le moment.</p>}
      </div>
    </div>
  )
}
