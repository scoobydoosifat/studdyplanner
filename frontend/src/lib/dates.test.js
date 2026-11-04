import { describe, expect, it } from 'vitest'
import {
  formatDate, formatMonth, formatTime, fromIso, isoDate, minutesLabel,
  monthRange, plannerNow, summaryRange, toTimeInput, todayIso, weekRange,
} from './dates'

describe('date helpers', () => {
  it('formats a date as a zero-padded ISO string', () => {
    expect(isoDate(new Date(2026, 10, 5))).toBe('2026-11-05')
    expect(isoDate(new Date(2026, 0, 9))).toBe('2026-01-09')
  })

  it('parses ISO strings at midday to avoid timezone drift', () => {
    expect(fromIso('2026-11-05').getDate()).toBe(5)
    expect(fromIso('2026-11-05').getHours()).toBe(12)
  })

  it('reads today from an injected clock', () => {
    expect(todayIso(new Date(2026, 0, 9))).toBe('2026-01-09')
  })

  it('builds the full month ranges for the planner', () => {
    expect(monthRange(10)).toEqual({ start: '2026-11-01', end: '2026-11-30' })
    expect(monthRange(11)).toEqual({ start: '2026-12-01', end: '2026-12-31' })
  })

  it('snaps a date to its Monday–Sunday week', () => {
    expect(weekRange('2026-11-05')).toEqual({ start: '2026-11-02', end: '2026-11-08' })
    expect(weekRange('2026-11-08')).toEqual({ start: '2026-11-02', end: '2026-11-08' })
    expect(weekRange('2026-11-09')).toEqual({ start: '2026-11-09', end: '2026-11-15' })
  })

  it('picks week or month ranges for the summary', () => {
    expect(summaryRange('2026-12-15', 'month')).toEqual({ start: '2026-12-01', end: '2026-12-31' })
    expect(summaryRange('2026-12-15', 'week')).toEqual({ start: '2026-12-14', end: '2026-12-20' })
  })

  it('opens on today only when today is inside the planner window', () => {
    expect(plannerNow(new Date(2026, 10, 4))).toEqual({ month: 10, date: '2026-11-04' })
    expect(plannerNow(new Date(2026, 11, 20))).toEqual({ month: 11, date: '2026-12-20' })
    expect(plannerNow(new Date(2026, 4, 1))).toEqual({ month: 10, date: '2026-11-01' })
    expect(plannerNow(new Date(2027, 1, 1))).toEqual({ month: 10, date: '2026-11-01' })
  })

  it('formats readable dates', () => {
    expect(formatDate('2026-11-05')).toBe('Thursday, November 5')
    expect(formatMonth(11)).toBe('December 2026')
    expect(formatMonth(10)).toBe('November 2026')
  })

  it('formats times from 24h to 12h', () => {
    expect(formatTime('18:00')).toBe('6:00 PM')
    expect(formatTime('08:30')).toBe('8:30 AM')
    expect(formatTime('18:00:00')).toBe('6:00 PM')
  })

  it('labels durations in minutes and hours', () => {
    expect(minutesLabel(25)).toBe('25m')
    expect(minutesLabel(60)).toBe('1h')
    expect(minutesLabel(90)).toBe('1h 30m')
    expect(minutesLabel(125)).toBe('2h 5m')
    expect(minutesLabel(0)).toBe('0m')
  })

  it('normalises backend times for time inputs', () => {
    expect(toTimeInput('18:00:00')).toBe('18:00')
    expect(toTimeInput('07:45')).toBe('07:45')
    expect(toTimeInput(null)).toBe('')
    expect(toTimeInput(undefined)).toBe('')
  })
})
