export const PLANNER_YEAR = 2026
export const PLANNER_MONTHS = [10, 11]

const pad = value => String(value).padStart(2, '0')

export const isoDate = date => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`

export const fromIso = value => new Date(`${value}T12:00:00`)

export const todayIso = (now = new Date()) => isoDate(now)

export const monthRange = month => ({
  start: `${PLANNER_YEAR}-${pad(month + 1)}-01`,
  end: isoDate(new Date(PLANNER_YEAR, month + 1, 0)),
})

export const weekRange = value => {
  const selected = fromIso(value)
  const mondayOffset = (selected.getDay() + 6) % 7
  const first = new Date(selected)
  first.setDate(selected.getDate() - mondayOffset)
  const last = new Date(first)
  last.setDate(first.getDate() + 6)
  return { start: isoDate(first), end: isoDate(last) }
}

export const summaryRange = (value, mode) =>
  mode === 'month' ? monthRange(fromIso(value).getMonth()) : weekRange(value)

export const PLANNER_START = `${PLANNER_YEAR}-${pad(PLANNER_MONTHS[0] + 1)}-01`
export const PLANNER_END = `${PLANNER_YEAR}-${pad(PLANNER_MONTHS[1] + 1)}-31`

export const plannerNow = (now = new Date()) => {
  const insidePlanner =
    now.getFullYear() === PLANNER_YEAR && PLANNER_MONTHS.includes(now.getMonth())
  return insidePlanner
    ? { month: now.getMonth(), date: todayIso(now) }
    : { month: PLANNER_MONTHS[0], date: PLANNER_START }
}

export const formatDate = value =>
  fromIso(value).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

export const formatShortDate = value =>
  fromIso(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

export const formatMonth = month =>
  new Date(PLANNER_YEAR, month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

export const formatTime = value =>
  new Date(`${PLANNER_YEAR}-01-01T${value}`).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })

export const minutesLabel = minutes => {
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60)
    const rest = minutes % 60
    return rest ? `${hours}h ${rest}m` : `${hours}h`
  }
  return `${minutes}m`
}

export const toTimeInput = value => (value ? String(value).slice(0, 5) : '')
