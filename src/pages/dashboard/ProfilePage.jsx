import { useEffect, useState } from 'react'
import { MapPin } from 'lucide-react'
import api from '../../api/client'
import DishImage from '../../components/DishImage'
import { btnDark, btnGhost, cardClass, inputClass } from '../../styles/ui'

const EMPTY_FORM = {
  description: '',
  phone: '',
  address: '',
  lat: '',
  lng: '',
  logoUrl: '',
}

export default function ProfilePage() {
  const [restaurant, setRestaurant] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [loading, setLoading] = useState(false)
  const [locating, setLocating] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  function load() {
    api
      .get('/dashboard/restaurant')
      .then(({ data }) => {
        setRestaurant(data)
        setForm({
          description: data.description ?? '',
          phone: data.phone ?? '',
          address: data.address ?? '',
          lat: data.lat ?? '',
          lng: data.lng ?? '',
          logoUrl: data.logoUrl ?? '',
        })
      })
      .catch(() => setRestaurant(null))
  }

  useEffect(load, [])

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }))
  }

  function useMyLocation() {
    if (!navigator.geolocation) {
      setError('La géolocalisation n\'est pas disponible sur cet appareil')
      return
    }
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setForm((f) => ({
          ...f,
          lat: position.coords.latitude.toFixed(6),
          lng: position.coords.longitude.toFixed(6),
        }))
        setLocating(false)
      },
      () => {
        setError('Impossible de récupérer votre position')
        setLocating(false)
      },
    )
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)
    try {
      const { data } = await api.put('/dashboard/restaurant', form)
      setRestaurant(data)
      setMessage('Profil mis à jour')
    } catch (err) {
      setError(err.response?.data?.error ?? 'Impossible de mettre à jour le profil')
    } finally {
      setLoading(false)
    }
  }

  if (!restaurant) {
    return <p className="text-ink-400">Chargement...</p>
  }

  return (
    <div>
      <div className={`${cardClass} mb-6 flex items-center gap-4`}>
        <DishImage
          src={form.logoUrl}
          alt={restaurant.name}
          className="h-16 w-16 shrink-0 rounded-2xl"
        />
        <div>
          <p className="font-bold text-ink-900">{restaurant.name}</p>
          <p className="text-sm text-ink-400">
            {restaurant.isActive ? 'Restaurant actif' : "En attente d'activation"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className={`${cardClass} flex flex-col gap-4`}>
        <div>
          <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-ink-400">
            Description
          </label>
          <textarea
            placeholder="Décrivez votre restaurant en quelques mots"
            value={form.description}
            onChange={update('description')}
            className={inputClass}
            rows={3}
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-ink-400">
            Téléphone
          </label>
          <input
            type="tel"
            placeholder="Numéro de téléphone"
            value={form.phone}
            onChange={update('phone')}
            className={inputClass}
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-ink-400">
            Adresse
          </label>
          <input
            placeholder="Adresse du restaurant"
            value={form.address}
            onChange={update('address')}
            className={inputClass}
          />
        </div>

        <div>
          <div className="mb-1 flex items-center justify-between">
            <label className="block text-xs font-bold uppercase tracking-wide text-ink-400">
              Localisation
            </label>
            <button
              type="button"
              onClick={useMyLocation}
              disabled={locating}
              className="flex items-center gap-1 text-xs font-semibold text-brand-600 hover:underline disabled:opacity-50"
            >
              <MapPin className="h-3.5 w-3.5" />
              {locating ? 'Localisation...' : 'Utiliser ma position actuelle'}
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              step="any"
              placeholder="Latitude"
              value={form.lat}
              onChange={update('lat')}
              className={inputClass}
            />
            <input
              type="number"
              step="any"
              placeholder="Longitude"
              value={form.lng}
              onChange={update('lng')}
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-ink-400">
            Logo (URL de l'image)
          </label>
          <input
            placeholder="https://..."
            value={form.logoUrl}
            onChange={update('logoUrl')}
            className={inputClass}
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
        {message && <p className="text-sm text-green-700">{message}</p>}

        <div className="flex items-center gap-3 pt-1">
          <button type="submit" disabled={loading} className={btnDark}>
            {loading ? 'Enregistrement...' : 'Enregistrer'}
          </button>
          <button type="button" onClick={load} className={btnGhost}>
            Annuler
          </button>
        </div>
      </form>
    </div>
  )
}
