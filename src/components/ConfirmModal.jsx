import { useState } from 'react'
import Modal from './Modal'

// Fenêtre de confirmation (suppression, vidage du panier...).
// `onConfirm` peut être asynchrone : la fenêtre se ferme une fois l'action réussie,
// et affiche l'erreur de l'API sinon.
export default function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = 'Supprimer',
  cancelLabel = 'Annuler',
  tone = 'danger',
  onConfirm,
  onClose,
}) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  function close() {
    if (busy) return
    setError('')
    onClose()
  }

  async function handleConfirm() {
    setBusy(true)
    setError('')
    try {
      await onConfirm()
      setBusy(false)
      onClose()
    } catch (err) {
      setError(err.response?.data?.error ?? 'Une erreur est survenue, veuillez réessayer')
      setBusy(false)
    }
  }

  return (
    <Modal open={open} onClose={close} title={title}>
      <div className="flex flex-col gap-4">
        {message && <p className="text-sm text-ink-600">{message}</p>}
        {error && <p className="text-sm font-semibold text-red-600">{error}</p>}
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={close}
            disabled={busy}
            className="text-sm font-semibold text-ink-500 hover:text-ink-700 disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={busy}
            className={`rounded-full px-4 py-2 text-sm font-bold transition disabled:opacity-50 ${
              tone === 'danger'
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-brand-500 text-ink-900 hover:bg-brand-400'
            }`}
          >
            {busy ? 'Patientez...' : confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  )
}
