import { useEffect, useState } from 'react'
import { Bike, Store, TriangleAlert } from 'lucide-react'
import api from '../../api/client'
import ConfirmModal from '../../components/ConfirmModal'
import Modal from '../../components/Modal'
import { badgeClass, btnDanger, btnDark, btnPrimary, cardClass, inputClass } from '../../styles/ui'

const EMPTY_ZONE_FORM = { zoneName: '', fee: '', estimatedTimeMinutes: '' }
const EMPTY_DRIVER_FORM = { name: '', phone: '', vehicle: '' }

export default function DeliveryPage() {
  const [offersDelivery, setOffersDelivery] = useState(null)
  const [savingToggle, setSavingToggle] = useState(false)

  const [zones, setZones] = useState([])
  const [showZoneForm, setShowZoneForm] = useState(false)
  const [zoneForm, setZoneForm] = useState(EMPTY_ZONE_FORM)

  const [drivers, setDrivers] = useState([])
  const [showDriverForm, setShowDriverForm] = useState(false)
  const [driverForm, setDriverForm] = useState(EMPTY_DRIVER_FORM)
  const [driverFormError, setDriverFormError] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [zoneToDelete, setZoneToDelete] = useState(null)
  const [driverToDelete, setDriverToDelete] = useState(null)

  function loadZones() {
    api
      .get('/dashboard/delivery-zones')
      .then(({ data }) => setZones(data))
      .catch(() => setZones([]))
  }

  function loadDrivers() {
    api
      .get('/dashboard/drivers')
      .then(({ data }) => setDrivers(data))
      .catch(() => setDrivers([]))
  }

  useEffect(() => {
    api
      .get('/dashboard/restaurant')
      .then(({ data }) => setOffersDelivery(data.offersDelivery))
      .catch(() => setOffersDelivery(false))
    loadZones()
    loadDrivers()
  }, [])

  async function toggleDelivery() {
    setSavingToggle(true)
    setError('')
    try {
      const { data } = await api.put('/dashboard/restaurant', { offersDelivery: !offersDelivery })
      setOffersDelivery(data.offersDelivery)
    } catch (err) {
      setError(err.response?.data?.error ?? 'Impossible de modifier le mode de livraison')
    } finally {
      setSavingToggle(false)
    }
  }

  async function handleZoneSubmit(e) {
    e.preventDefault()
    await api.post('/dashboard/delivery-zones', {
      zoneName: zoneForm.zoneName,
      fee: zoneForm.fee,
      estimatedTimeMinutes: zoneForm.estimatedTimeMinutes
        ? Number(zoneForm.estimatedTimeMinutes)
        : null,
    })
    setZoneForm(EMPTY_ZONE_FORM)
    setShowZoneForm(false)
    loadZones()
  }

  async function deleteZone() {
    await api.delete(`/dashboard/delivery-zones/${zoneToDelete.id}`)
    loadZones()
  }

  function openDriverForm() {
    setDriverForm(EMPTY_DRIVER_FORM)
    setDriverFormError('')
    setShowDriverForm(true)
  }

  function openZoneForm() {
    setZoneForm(EMPTY_ZONE_FORM)
    setShowZoneForm(true)
  }

  async function handleDriverSubmit(e) {
    e.preventDefault()
    setDriverFormError('')
    try {
      await api.post('/dashboard/drivers', driverForm)
      setDriverForm(EMPTY_DRIVER_FORM)
      setShowDriverForm(false)
      loadDrivers()
    } catch (err) {
      setDriverFormError(err.response?.data?.error ?? "Impossible d'ajouter le livreur")
    }
  }

  async function toggleDriverActive(driver) {
    await api.put(`/dashboard/drivers/${driver.id}`, { isActive: !driver.isActive })
    loadDrivers()
  }

  async function deleteDriver() {
    const driver = driverToDelete
    const { data } = await api.delete(`/dashboard/drivers/${driver.id}`)
    setNotice(
      data?.deactivated
        ? `${driver.name} a déjà effectué des livraisons : il a été désactivé au lieu d'être supprimé.`
        : '',
    )
    loadDrivers()
  }

  if (offersDelivery === null) {
    return <p className="text-ink-400">Chargement...</p>
  }

  const activeDrivers = drivers.filter((d) => d.isActive)

  return (
    <div className="flex flex-col gap-6">
      <div className={`${cardClass} flex items-center justify-between gap-4`}>
        <div className="flex items-center gap-4">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
              offersDelivery ? 'bg-green-50 text-green-700' : 'bg-ink-50 text-ink-500'
            }`}
          >
            {offersDelivery ? <Bike className="h-5 w-5" /> : <Store className="h-5 w-5" />}
          </div>
          <div>
            <p className="font-bold text-ink-900">Je propose la livraison</p>
            <p className="text-sm text-ink-500">
              {offersDelivery
                ? 'Vos clients peuvent choisir entre livraison et retrait sur place.'
                : 'Vos clients ne peuvent commander qu’à emporter.'}
            </p>
          </div>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={offersDelivery}
          aria-label="Je propose la livraison"
          onClick={toggleDelivery}
          disabled={savingToggle}
          className={`relative h-7 w-12 shrink-0 rounded-full transition disabled:opacity-50 ${
            offersDelivery ? 'bg-green-600' : 'bg-ink-200'
          }`}
        >
          <span
            className={`absolute top-1 left-1 h-5 w-5 rounded-full bg-white shadow transition-transform ${
              offersDelivery ? 'translate-x-5' : ''
            }`}
          />
        </button>
      </div>

      {error && <p className="text-sm font-semibold text-red-600">{error}</p>}
      {notice && (
        <p className="rounded-2xl border border-ink-100 bg-ink-50 p-4 text-sm text-ink-600">{notice}</p>
      )}

      {offersDelivery && (
        <>
          {activeDrivers.length === 0 && (
            <div className="flex items-start gap-3 rounded-2xl border border-brand-200 bg-brand-50 p-4 text-sm text-brand-700">
              <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
              <p>
                Aucun livreur actif. Ajoutez au moins un livreur : il faut en assigner un à chaque
                commande avant de l’envoyer en livraison.
              </p>
            </div>
          )}

          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-extrabold text-ink-900">Livreurs</h2>
              <button
                type="button"
                onClick={openDriverForm}
                className={btnPrimary}
              >
                Nouveau livreur
              </button>
            </div>


            <div className={`${cardClass} overflow-x-auto p-0`}>
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-ink-100 text-xs font-bold uppercase tracking-wide text-ink-400">
                    <th className="px-4 py-3">Nom</th>
                    <th className="px-4 py-3">Téléphone</th>
                    <th className="px-4 py-3">Véhicule</th>
                    <th className="px-4 py-3">Statut</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {drivers.map((driver) => (
                    <tr key={driver.id} className="border-b border-ink-50 last:border-0 hover:bg-ink-50/50">
                      <td className="px-4 py-3 font-semibold text-ink-900">{driver.name}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-ink-600">{driver.phone}</td>
                      <td className="px-4 py-3 text-ink-600">{driver.vehicle || '-'}</td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => toggleDriverActive(driver)}
                          className={badgeClass(driver.isActive ? 'green' : 'ink')}
                        >
                          {driver.isActive ? 'Actif' : 'Inactif'}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button type="button" onClick={() => setDriverToDelete(driver)} className={btnDanger}>
                          Supprimer
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {drivers.length === 0 && (
                <p className="px-4 py-6 text-ink-400">Aucun livreur pour le moment.</p>
              )}
            </div>
          </section>

          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-extrabold text-ink-900">Zones de livraison</h2>
              <button type="button" onClick={openZoneForm} className={btnPrimary}>
                Nouvelle zone
              </button>
            </div>


            <div className={`${cardClass} overflow-x-auto p-0`}>
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-ink-100 text-xs font-bold uppercase tracking-wide text-ink-400">
                    <th className="px-4 py-3">Zone</th>
                    <th className="px-4 py-3">Frais</th>
                    <th className="px-4 py-3">Délai</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {zones.map((zone) => (
                    <tr key={zone.id} className="border-b border-ink-50 last:border-0 hover:bg-ink-50/50">
                      <td className="px-4 py-3 font-semibold text-ink-900">{zone.zoneName}</td>
                      <td className="px-4 py-3 text-ink-600">{zone.fee} MRU</td>
                      <td className="px-4 py-3 text-ink-600">
                        {zone.estimatedTimeMinutes ? `${zone.estimatedTimeMinutes} min` : '-'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button type="button" onClick={() => setZoneToDelete(zone)} className={btnDanger}>
                          Supprimer
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {zones.length === 0 && (
                <p className="px-4 py-6 text-ink-400">Aucune zone pour le moment.</p>
              )}
            </div>
          </section>
        </>
      )}

      <Modal open={showDriverForm} onClose={() => setShowDriverForm(false)} title="Nouveau livreur">
        <form onSubmit={handleDriverSubmit} className="flex flex-col gap-3">
          <input
            placeholder="Nom complet"
            value={driverForm.name}
            onChange={(e) => setDriverForm((f) => ({ ...f, name: e.target.value }))}
            className={inputClass}
            required
          />
          <input
            type="tel"
            placeholder="Téléphone"
            value={driverForm.phone}
            onChange={(e) => setDriverForm((f) => ({ ...f, phone: e.target.value }))}
            className={inputClass}
            required
          />
          <input
            placeholder="Véhicule (ex : moto Yamaha, plaque 1234 AB 00) — optionnel"
            value={driverForm.vehicle}
            onChange={(e) => setDriverForm((f) => ({ ...f, vehicle: e.target.value }))}
            className={inputClass}
          />
          {driverFormError && (
            <p className="text-sm font-semibold text-red-600">{driverFormError}</p>
          )}
          <div className="flex items-center gap-3 pt-1">
            <button type="submit" className={btnDark}>
              Ajouter
            </button>
            <button
              type="button"
              onClick={() => setShowDriverForm(false)}
              className="text-sm text-ink-500"
            >
              Annuler
            </button>
          </div>
        </form>
      </Modal>

      <Modal open={showZoneForm} onClose={() => setShowZoneForm(false)} title="Nouvelle zone de livraison">
        <form onSubmit={handleZoneSubmit} className="flex flex-col gap-3">
          <input
            placeholder="Nom de la zone"
            value={zoneForm.zoneName}
            onChange={(e) => setZoneForm((f) => ({ ...f, zoneName: e.target.value }))}
            className={inputClass}
            required
          />
          <input
            type="number"
            step="0.01"
            placeholder="Frais de livraison (MRU)"
            value={zoneForm.fee}
            onChange={(e) => setZoneForm((f) => ({ ...f, fee: e.target.value }))}
            className={inputClass}
            required
          />
          <input
            type="number"
            placeholder="Délai estimé (minutes)"
            value={zoneForm.estimatedTimeMinutes}
            onChange={(e) =>
              setZoneForm((f) => ({ ...f, estimatedTimeMinutes: e.target.value }))
            }
            className={inputClass}
          />
          <div className="flex items-center gap-3 pt-1">
            <button type="submit" className={btnDark}>
              Créer
            </button>
            <button
              type="button"
              onClick={() => setShowZoneForm(false)}
              className="text-sm text-ink-500"
            >
              Annuler
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        open={Boolean(driverToDelete)}
        title="Supprimer ce livreur ?"
        message={
          driverToDelete &&
          `${driverToDelete.name} sera retiré de vos livreurs. S'il a déjà effectué des livraisons, il sera seulement désactivé pour garder l'historique.`
        }
        onConfirm={deleteDriver}
        onClose={() => setDriverToDelete(null)}
      />

      <ConfirmModal
        open={Boolean(zoneToDelete)}
        title="Supprimer cette zone ?"
        message={
          zoneToDelete &&
          `La zone « ${zoneToDelete.zoneName} » ne sera plus proposée à vos clients.`
        }
        onConfirm={deleteZone}
        onClose={() => setZoneToDelete(null)}
      />
    </div>
  )
}
