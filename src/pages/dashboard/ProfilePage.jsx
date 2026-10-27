import { useEffect, useState } from 'react'
import { ImageUp, MapPin } from 'lucide-react'
import api from '../../api/client'
import DishImage from '../../components/DishImage'
import { uploadImage } from '../../lib/imageUpload'
import { btnDark, btnGhost, cardClass, inputClass } from '../../styles/ui'
import { t } from '../../i18n'

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
  const [uploading, setUploading] = useState(false)
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
      setError(t("La géolocalisation n'est pas disponible sur cet appareil"))
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
        setError(t('Impossible de récupérer votre position'))
        setLocating(false)
      },
    )
  }

  async function handleLogoFile(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setUploading(true)
    setError('')
    setMessage('')
    try {
      // Un logo s'affiche petit : 512 px suffisent
      const logoUrl = await uploadImage(file, { maxSize: 512 })
      setForm((f) => ({ ...f, logoUrl }))
      setMessage(t('Logo envoyé. Cliquez sur Enregistrer pour le conserver.'))
    } catch (err) {
      setError(err.response?.data?.error ?? err.message ?? t("Échec de l'envoi du logo"))
    } finally {
      setUploading(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)
    try {
      const { data } = await api.put('/dashboard/restaurant', form)
      setRestaurant(data)
      setMessage(t('Profil mis à jour'))
    } catch (err) {
      setError(err.response?.data?.error ?? t('Impossible de mettre à jour le profil'))
    } finally {
      setLoading(false)
    }
  }

  if (!restaurant) {
    return <p className="text-ink-400">{t('Chargement...')}</p>
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
            {restaurant.isActive ? t('Restaurant actif') : t("En attente d'activation")}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className={`${cardClass} flex flex-col gap-4`}>
        <div>
          <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-ink-400">
            {t('Description')}
          </label>
          <textarea
            placeholder={t('Décrivez votre restaurant en quelques mots')}
            value={form.description}
            onChange={update('description')}
            className={inputClass}
            rows={3}
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-ink-400">
            {t('Téléphone')}
          </label>
          <input
            type="tel"
            placeholder={t('Numéro de téléphone')}
            value={form.phone}
            onChange={update('phone')}
            className={inputClass}
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-ink-400">
            {t('Adresse')}
          </label>
          <input
            placeholder={t('Adresse du restaurant')}
            value={form.address}
            onChange={update('address')}
            className={inputClass}
          />
        </div>

        <div>
          <div className="mb-1 flex items-center justify-between">
            <label className="block text-xs font-bold uppercase tracking-wide text-ink-400">
              {t('Localisation')}
            </label>
            <button
              type="button"
              onClick={useMyLocation}
              disabled={locating}
              className="flex items-center gap-1 text-xs font-semibold text-brand-600 hover:underline disabled:opacity-50"
            >
              <MapPin className="h-3.5 w-3.5" />
              {locating ? t('Localisation...') : t('Utiliser ma position actuelle')}
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              step="any"
              placeholder={t('Latitude')}
              value={form.lat}
              onChange={update('lat')}
              className={inputClass}
            />
            <input
              type="number"
              step="any"
              placeholder={t('Longitude')}
              value={form.lng}
              onChange={update('lng')}
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-ink-400">
            {t('Logo')}
          </label>
          <div className="mb-2 flex items-center gap-3">
            <DishImage
              key={form.logoUrl}
              src={form.logoUrl.trim()}
              alt={t('Aperçu du logo')}
              className="h-14 w-14 shrink-0 rounded-2xl [&>svg]:h-5 [&>svg]:w-5"
            />
            <label
              className={`${btnGhost} inline-flex shrink-0 cursor-pointer items-center gap-1.5 ${
                uploading ? 'pointer-events-none opacity-50' : ''
              }`}
            >
              <ImageUp className="h-4 w-4" />
              {uploading ? t('Envoi...') : t('Choisir un logo')}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleLogoFile}
                className="hidden"
              />
            </label>
            <span className="text-xs text-ink-400">{t('ou collez une URL ci-dessous')}</span>
          </div>
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
          <button type="submit" disabled={loading || uploading} className={btnDark}>
            {loading ? t('Enregistrement...') : t('Enregistrer')}
          </button>
          <button type="button" onClick={load} className={btnGhost}>
            {t('Annuler')}
          </button>
        </div>
      </form>
    </div>
  )
}
