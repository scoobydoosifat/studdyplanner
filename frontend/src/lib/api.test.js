import { afterEach, describe, expect, it, vi } from 'vitest'
import { API_URL, api } from './api'

const mockFetch = implementation => {
  const fetchMock = vi.fn(implementation)
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('api client', () => {
  it('sends JSON headers and returns the parsed body', async () => {
    const fetchMock = mockFetch(() => Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve([{ id: 'task-1' }]),
    }))

    await expect(api('/api/tasks?start=2026-11-01&end=2026-11-30')).resolves.toEqual([{ id: 'task-1' }])
    expect(fetchMock).toHaveBeenCalledWith(
      `${API_URL}/api/tasks?start=2026-11-01&end=2026-11-30`,
      expect.objectContaining({ headers: expect.objectContaining({ 'Content-Type': 'application/json' }) }),
    )
  })

  it('passes through method and body options', async () => {
    const fetchMock = mockFetch(() => Promise.resolve({
      ok: true,
      status: 201,
      json: () => Promise.resolve({ id: 'new' }),
    }))

    await api('/api/tasks', { method: 'POST', body: '{"title":"x"}' })

    expect(fetchMock).toHaveBeenCalledWith(`${API_URL}/api/tasks`, expect.objectContaining({
      method: 'POST',
      body: '{"title":"x"}',
    }))
  })

  it('returns null for an empty 204 response', async () => {
    mockFetch(() => Promise.resolve({ ok: true, status: 204, json: () => Promise.resolve(null) }))

    await expect(api('/api/tasks/task-1', { method: 'DELETE' })).resolves.toBeNull()
  })

  it('throws the server message when the request fails', async () => {
    mockFetch(() => Promise.resolve({
      ok: false,
      status: 400,
      json: () => Promise.resolve({ message: 'Please check the task details' }),
    }))

    await expect(api('/api/tasks', { method: 'POST' })).rejects.toThrow('Please check the task details')
  })

  it('falls back to a friendly message when the error body is unreadable', async () => {
    mockFetch(() => Promise.resolve({
      ok: false,
      status: 502,
      json: () => Promise.reject(new Error('no json')),
    }))

    await expect(api('/api/tasks')).rejects.toThrow('Something went wrong. Please try again.')
  })

  it('keeps the configured base URL free of a trailing slash', () => {
    expect(API_URL.endsWith('/')).toBe(false)
  })
})
