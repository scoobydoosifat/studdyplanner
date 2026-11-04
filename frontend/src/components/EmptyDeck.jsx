import { Plus, Sparkles } from 'lucide-react'

export default function EmptyDeck({ onAdd }) {
  return (
    <div className="empty-deck">
      <div className="empty-fan" aria-hidden="true">
        <i />
        <i />
        <i><Sparkles /></i>
      </div>
      <h3>This card is blank</h3>
      <p>Draw your first focus card for this day — small, specific, doable.</p>
      <button type="button" className="ghost-button" onClick={onAdd}>
        <Plus /> Draw a card
      </button>
    </div>
  )
}
