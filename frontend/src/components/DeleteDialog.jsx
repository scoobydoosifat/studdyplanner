import { Trash2, X } from 'lucide-react'

export default function DeleteDialog({ task, onClose, onConfirm }) {
  return (
    <div className="modal-backdrop">
      <section
        className="delete-dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-title"
        aria-describedby="delete-copy"
      >
        <button type="button" className="dialog-close" aria-label="Close" onClick={onClose}>
          <X />
        </button>
        <span className="delete-icon" aria-hidden="true"><Trash2 /></span>
        <p className="eyebrow">Remove from deck</p>
        <h2 id="delete-title">Remove this card?</h2>
        <p id="delete-copy">
          “{task.title}” leaves your deck for good. This cannot be undone.
        </p>
        <div className="modal-footer">
          <button type="button" className="ghost-button" onClick={onClose}>Keep it</button>
          <button type="button" className="delete-button" onClick={onConfirm}>
            <Trash2 /> Yes, remove
          </button>
        </div>
      </section>
    </div>
  )
}
