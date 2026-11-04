export const ACCENTS = ['violet', 'cyan', 'amber', 'lime', 'rose']

export const accentFor = subject => {
  const seed = [...String(subject || '')].reduce((sum, char) => sum + char.charCodeAt(0), 0)
  return ACCENTS[Math.abs(seed) % ACCENTS.length]
}
