export const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:9091').replace(/\/$/, '')

export async function api(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })

  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    throw new Error(body.message || 'Something went wrong. Please try again.')
  }

  return response.status === 204 ? null : response.json()
}
