import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowLeft, ArrowRight, CalendarDays, Check, Clock3, Layers, RotateCcw,
  Sparkles, Star, Wand2, X,
} from 'lucide-react'
import {
  PLANNER_END, PLANNER_START, formatDate, formatTime, minutesLabel, toTimeInput, todayIso,
} from '../lib/dates'

const STEPS = [
  { key: 'intent', label: 'Intent' },
  { key: 'timing', label: 'Timing' },
  { key: 'energy', label: 'Energy' },
  { key: 'review', label: 'Review' },
]

const STEP_COPY = [
  {
    title: 'What deserves your focus?',
    hint: 'Name the session clearly enough that future you knows exactly where to start.',
  },
  {
    title: 'When will you sit down?',
    hint: 'Pick a realistic slot. A card without a time is only a wish.',
  },
  {
    title: 'How big is the block?',
    hint: 'Small blocks get finished. Choose the energy you can honestly give.',
  },
  {
    title: 'Flip it and commit.',
    hint: 'One last look before this card joins your deck.',
  },
]

const SUBJECTS = ['English', 'Bangla', 'General Knowledge']

const DURATIONS = [
  { value: 25, label: '25 minutes' },
  { value: 30, label: '30 minutes' },
  { value: 45, label: '45 minutes' },
  { value: 60, label: '1 hour' },
  { value: 90, label: '1.5 hours' },
  { value: 120, label: '2 hours' },
]

const PRIORITIES = [
  { value: 'LOW', label: 'Low', hint: 'Light review', aria: 'Low priority' },
  { value: 'MEDIUM', label: 'Medium', hint: 'Steady push', aria: 'Medium priority' },
  { value: 'HIGH', label: 'High', hint: 'Deep work', aria: 'High priority' },
]

const emptyForm = task => ({
  title: task?.title || '',
  subject: task?.subject || '',
  date: task?.date || todayIso(),
  startTime: toTimeInput(task?.startTime) || '18:00',
  durationMinutes: task?.durationMinutes ?? 45,
  priority: task?.priority || 'MEDIUM',
  notes: task?.notes || '',
})

export default function FlashCardDeck({ task, onClose, onSave }) {
  const editing = Boolean(task?.id)
  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState('forward')
  const [flipped, setFlipped] = useState(false)
  const [form, setForm] = useState(() => emptyForm(task))
  const cardRef = useRef(null)

  const lastStep = STEPS.length - 1

  const stepValid = useMemo(() => ([
    form.title.trim().length > 0 && form.subject.trim().length > 0,
    Boolean(form.date && form.startTime),
    Boolean(form.durationMinutes && form.priority),
    true,
  ]), [form])

  useEffect(() => {
    const onKeyDown = event => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [onClose])

  useEffect(() => {
    cardRef.current?.querySelector('[data-autofocus]')?.focus()
  }, [step])

  const update = (name, value) => setForm(current => ({ ...current, [name]: value }))

  const go = delta => {
    setDirection(delta > 0 ? 'forward' : 'back')
    setFlipped(false)
    setStep(current => Math.min(lastStep, Math.max(0, current + delta)))
  }

  const submit = event => {
    event.preventDefault()
    if (!stepValid[step]) return
    if (step < lastStep) {
      go(1)
      return
    }
    onSave({
      title: form.title.trim(),
      subject: form.subject.trim(),
      date: form.date,
      startTime: form.startTime,
      durationMinutes: Number(form.durationMinutes),
      priority: form.priority,
      notes: form.notes.trim() ? form.notes.trim() : null,
    })
  }

  const copy = STEP_COPY[step]

  return (
    <div className="deck-screen" role="dialog" aria-modal="true" aria-labelledby="deck-title">
      <div className="deck-ambient" aria-hidden="true" />

      <div className="deck-shell">
        <div className="deck-topbar">
          <div className="deck-brand">
            <Layers aria-hidden="true" />
            <span>{editing ? 'Edit focus card' : 'New focus card'}</span>
          </div>
          <button type="button" className="deck-close" onClick={onClose} aria-label="Close deck">
            <X />
          </button>
        </div>

        <ol className="deck-steps" aria-label="Card steps">
          {STEPS.map((item, index) => (
            <li
              key={item.key}
              className={`${index === step ? 'active' : ''} ${index < step ? 'done' : ''}`}
              aria-current={index === step ? 'step' : undefined}
            >
              <span>{index < step ? <Check size={13} /> : index + 1}</span>
              <b>{item.label}</b>
            </li>
          ))}
        </ol>

        <div className="deck-stage">
          <div className="deck-ghost ghost-2" aria-hidden="true" />
          <div className="deck-ghost ghost-1" aria-hidden="true" />

          <form className="deck-form" onSubmit={submit} ref={cardRef}>
            <section key={step} className={`deck-card ${direction}`}>
              <header className="deck-card-head">
                <p className="eyebrow">
                  <Wand2 size={13} /> Step {step + 1} of {STEPS.length}
                </p>
                <h2 id="deck-title">{copy.title}</h2>
                <p className="deck-hint">{copy.hint}</p>
                <div className="deck-progress" aria-hidden="true">
                  <span style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
                </div>
              </header>

              <div className="deck-card-body">
                {step === 0 && (
                  <div className="deck-fields">
                    <label className="deck-field" htmlFor="card-title">
                      <span>What will you focus on?</span>
                      <input
                        id="card-title"
                        data-autofocus
                        name="title"
                        value={form.title}
                        maxLength={100}
                        placeholder="e.g. Solve 10 quadratic equations"
                        onChange={event => update('title', event.target.value)}
                      />
                    </label>
                    <p className="field-meter" aria-hidden="true">{form.title.length}/100</p>

                    <label className="deck-field" htmlFor="card-subject">
                      <span>Subject</span>
                      <select
                        id="card-subject"
                        name="subject"
                        value={SUBJECTS.includes(form.subject) ? form.subject : ''}
                        onChange={event => update('subject', event.target.value)}
                      >
                        <option value="" disabled>Choose a subject</option>
                        {SUBJECTS.map(subject => <option key={subject} value={subject}>{subject}</option>)}
                      </select>
                    </label>
                    <div className="subject-chips" role="group" aria-label="Subject shortcuts">
                      {SUBJECTS.map(subject => (
                        <button
                          type="button"
                          key={subject}
                          aria-pressed={form.subject === subject}
                          className={form.subject === subject ? 'active' : ''}
                          onClick={() => update('subject', subject)}
                        >
                          {subject}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {step === 1 && (
                  <div className="deck-fields two-up">
                    <label className="deck-field" htmlFor="card-date">
                      <span>Study date</span>
                      <input
                        id="card-date"
                        data-autofocus
                        type="date"
                        name="date"
                        min={PLANNER_START}
                        max={PLANNER_END}
                        value={form.date}
                        onChange={event => update('date', event.target.value)}
                      />
                    </label>
                    <label className="deck-field" htmlFor="card-time">
                      <span>Start time</span>
                      <input
                        id="card-time"
                        type="time"
                        name="startTime"
                        value={form.startTime}
                        onChange={event => update('startTime', event.target.value)}
                      />
                    </label>
                    <p className="deck-aside">
                      <CalendarDays size={15} />
                      {form.date ? formatDate(form.date) : 'Choose a day'} · {formatTime(form.startTime || '00:00')}
                    </p>
                  </div>
                )}

                {step === 2 && (
                  <div className="deck-fields">
                    <fieldset className="choice-block">
                      <legend>Focus block</legend>
                      <div className="duration-grid">
                        {DURATIONS.map(duration => (
                          <label
                            key={duration.value}
                            className={`duration-pill ${form.durationMinutes === duration.value ? 'selected' : ''}`}
                          >
                            <input
                              type="radio"
                              name="durationMinutes"
                              value={duration.value}
                              checked={form.durationMinutes === duration.value}
                              onChange={() => update('durationMinutes', duration.value)}
                            />
                            <span>{duration.label}</span>
                          </label>
                        ))}
                      </div>
                    </fieldset>

                    <fieldset className="choice-block">
                      <legend>Priority</legend>
                      <div className="priority-grid">
                        {PRIORITIES.map(priority => (
                          <label
                            key={priority.value}
                            className={`priority-card ${priority.value.toLowerCase()} ${form.priority === priority.value ? 'selected' : ''}`}
                          >
                            <input
                              type="radio"
                              name="priority"
                              value={priority.value}
                              aria-label={priority.aria}
                              checked={form.priority === priority.value}
                              onChange={() => update('priority', priority.value)}
                            />
                            <Star aria-hidden="true" />
                            <strong>{priority.label}</strong>
                            <small>{priority.hint}</small>
                          </label>
                        ))}
                      </div>
                    </fieldset>
                  </div>
                )}

                {step === 3 && (
                  <div className="deck-fields">
                    <div className={`flip-card ${flipped ? 'is-flipped' : ''}`}>
                      <div className="flip-inner">
                        <div className="flip-face front">
                          <p className="eyebrow"><Sparkles size={13} /> Preview</p>
                          <span className="subject-chip">{form.subject || 'Subject'}</span>
                          <h3>{form.title || 'Your focus card'}</h3>
                          <ul className="preview-meta">
                            <li><CalendarDays /> {form.date ? formatDate(form.date) : 'Pick a date'}</li>
                            <li><Clock3 /> {formatTime(form.startTime || '00:00')} · {minutesLabel(form.durationMinutes)}</li>
                            <li><Star /> {form.priority.toLowerCase()} priority</li>
                          </ul>
                        </div>
                        <div className="flip-face back">
                          <Sparkles aria-hidden="true" />
                          <strong>Locked in.</strong>
                          <p>One focused block, one small win. Flip back whenever you want to check the details.</p>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="flip-toggle"
                      aria-pressed={flipped}
                      onClick={() => setFlipped(value => !value)}
                    >
                      <RotateCcw /> {flipped ? 'Show details' : 'Flip the card'}
                    </button>

                    <label className="deck-field" htmlFor="card-notes">
                      <span>A little note <small aria-hidden="true">optional</small></span>
                      <textarea
                        id="card-notes"
                        data-autofocus
                        name="notes"
                        rows={3}
                        maxLength={400}
                        value={form.notes}
                        placeholder="Chapter, page numbers, or a gentle reminder…"
                        onChange={event => update('notes', event.target.value)}
                      />
                    </label>
                  </div>
                )}
              </div>

              <footer className="deck-footer">
                {step === 0 ? (
                  <button type="button" className="ghost-button" onClick={onClose}>Cancel</button>
                ) : (
                  <button type="button" className="ghost-button" onClick={() => go(-1)}>
                    <ArrowLeft /> Back
                  </button>
                )}
                <div className="deck-footer-right">
                  {!stepValid[step] && step < lastStep && (
                    <p className="deck-blocker">Add a title and subject to continue</p>
                  )}
                  <button type="submit" className="primary-button" disabled={!stepValid[step]}>
                    {step === lastStep ? (
                      editing ? <><Sparkles /> Save changes</> : <><Sparkles /> Add to my deck</>
                    ) : (
                      <>Continue <ArrowRight /></>
                    )}
                  </button>
                </div>
              </footer>
            </section>
          </form>
        </div>
      </div>
    </div>
  )
}
