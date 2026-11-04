import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ArrowRight, BookOpen, CalendarDays, ChevronLeft, ChevronRight, Clock3,
  Feather, Flame, Heart, Lightbulb, Moon, Plus, Sparkles, Sun, Target, X,
} from 'lucide-react'
import { api } from './lib/api'
import { accentFor } from './lib/palette'
import {
  PLANNER_MONTHS, PLANNER_YEAR, formatDate, formatMonth, minutesLabel,
  monthRange, plannerNow, summaryRange, todayIso,
} from './lib/dates'
import Logo from './components/Logo'
import Loader from './components/Loader'
import StatCard from './components/StatCard'
import Calendar from './components/Calendar'
import ProgressChart from './components/ProgressChart'
import TaskCard from './components/TaskCard'
import EmptyDeck from './components/EmptyDeck'
import FlashCardDeck from './components/FlashCardDeck'
import DeleteDialog from './components/DeleteDialog'

const NAV_ITEMS = [
  { id: 'home', label: 'Home' }, { id: 'planner', label: 'Planner' },
  { id: 'progress', label: 'Progress' }, { id: 'inspiration', label: 'Inspiration' },
]

const QUOTES = [
  ['A little progress each day adds up to big results.', 'Satya Nani'],
  ['Success is the sum of small efforts, repeated day in and day out.', 'Robert Collier'],
  ['The beautiful thing about learning is that no one can take it away from you.', 'B.B. King'],
  ['You do not have to be perfect to make progress.', 'Unknown'],
  ['Start where you are. Use what you have. Do what you can.', 'Arthur Ashe'],
  ['The secret of getting ahead is getting started.', 'Mark Twain'],
  ['Great things are done by a series of small things brought together.', 'Vincent van Gogh'],
  ['Your future is created by what you do today.', 'Unknown'],
]

function ThemeToggle({ theme, onToggle }) {
  return <button className="theme-toggle" type="button" onClick={onToggle} aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}>
    <span className="theme-track" aria-hidden="true"><Sun size={14} /><Moon size={14} /><i className={theme} /></span>
  </button>
}

function SiteHeader({ page, onNavigate, theme, onToggleTheme }) {
  const [open, setOpen] = useState(false)
  const navigate = target => { setOpen(false); onNavigate(target) }
  return <header className="site-header">
    <button className="brand-button" type="button" onClick={() => navigate('home')} aria-label="Go home"><Logo compact /></button>
    <nav className={open ? 'open' : ''} aria-label="Main navigation">
      {NAV_ITEMS.map(item => <button type="button" key={item.id} className={page === item.id ? 'active' : ''} aria-current={page === item.id ? 'page' : undefined} onClick={() => navigate(item.id)}>{item.label}</button>)}
    </nav>
    <div className="header-actions"><ThemeToggle theme={theme} onToggle={onToggleTheme} /><button className="nav-cta" type="button" onClick={() => navigate('planner')}><Plus /> New card</button><button className="menu-toggle" type="button" aria-label="Toggle navigation" aria-expanded={open} onClick={() => setOpen(value => !value)}><span /><span /></button></div>
  </header>
}

function StudyCat() {
  const spots = [
    { x: 'calc(100vw - 116px)', y: 'calc(100vh - 112px)', flip: 1 }, { x: '24px', y: 'calc(100vh - 112px)', flip: -1 },
    { x: 'calc(100vw - 126px)', y: '24vh', flip: 1 }, { x: '34px', y: '38vh', flip: -1 },
    { x: 'calc(50vw - 44px)', y: 'calc(100vh - 108px)', flip: 1 },
  ]
  const [spot, setSpot] = useState(0)
  const move = () => setSpot(value => (value + 1) % spots.length)
  const position = spots[spot]
  return <button className="study-cat" type="button" aria-label="Mochi the study cat — hover to make Mochi run" onPointerEnter={move} onFocus={move} style={{ '--cat-x': position.x, '--cat-y': position.y, '--cat-flip': position.flip }}>
    <span className="cat-speech">catch me!</span>
    <svg viewBox="0 0 120 92" role="img" aria-label="A cheerful cat carrying a pencil">
      <path className="cat-tail" d="M95 62c22 1 22-25 9-27-9-2-12 8-7 13" /><path className="cat-body" d="M35 48c-8 5-12 16-8 26 5 13 19 15 37 14 22-1 35-7 34-22-1-12-9-20-21-22z" /><path className="cat-head" d="M31 22l8 7c6-4 22-4 29 0l9-8 2 22c2 19-9 27-27 27S25 60 28 43z" /><path className="cat-inner" d="M34 27l5 5-7 5zm39 0l-4 6 7 4z" /><circle cx="43" cy="45" r="2.5" /><circle cx="64" cy="45" r="2.5" /><path className="cat-face" d="M52 49l3 2 3-2m-3 2v4m0 0c-3 3-6 2-8 0m8 0c3 3 6 2 8 0" /><path className="cat-paw" d="M38 70c-1 9 5 13 11 7m26-8c2 9-2 13-9 9" /><g className="cat-pencil"><path d="M20 71L82 33" /><path d="M82 33l9-2-5 8z" /></g>
    </svg>
  </button>
}

function QuoteTicker() {
  const loop = [...QUOTES.slice(0, 5), ...QUOTES.slice(0, 5)]
  return <div className="quote-ticker" aria-label="Study motivation"><div>{loop.map(([quote], index) => <span key={`${quote}-${index}`}><Sparkles /> {quote}</span>)}</div></div>
}

function HomePage({ onStart }) {
  return <main className="page home-page">
    <section className="home-hero">
      <div className="floating-field" aria-hidden="true"><span className="float-shape shape-book"><BookOpen /></span><span className="float-shape shape-star">✦</span><span className="float-shape shape-note">Small steps</span><span className="float-shape shape-focus">Focus gently</span><span className="float-shape shape-pencil">✎</span><i className="soft-orb orb-one" /><i className="soft-orb orb-two" /><i className="soft-orb orb-three" /></div>
      <div className="hero-content"><p className="eyebrow"><span /> A softer place to study</p><h1>Make room for<br /><em>little wins.</em></h1><p className="hero-lead">A calm study companion for planning what matters, building gentle momentum, and celebrating every card you complete.</p><div className="hero-actions"><button className="primary-button" type="button" onClick={onStart}>Open my planner <ArrowRight /></button><a href="#how-it-works" className="text-link">See how it works <span>↓</span></a></div><div className="hero-note"><Heart /> No pressure. Just progress at your pace.</div></div>
      <div className="hero-visual" aria-label="A preview of colorful study cards"><div className="visual-halo" /><article className="demo-card card-back"><span>Bangla</span><h3>Read one short story</h3></article><article className="demo-card card-middle"><span>General Knowledge</span><h3>Explore world capitals</h3></article><article className="demo-card card-front"><div className="card-doodle"><Feather /></div><span>English</span><h3>Practice new vocabulary</h3><p><Clock3 /> 30 gentle minutes</p><i>Today, 6:00 PM</i></article><span className="orbit-word word-plan">plan</span><span className="orbit-word word-focus">focus</span><span className="orbit-word word-grow">grow</span></div>
    </section>
    <QuoteTicker />
    <section className="story-section" id="how-it-works"><div className="section-intro"><p className="eyebrow"><span /> Your gentle rhythm</p><h2>Studying can feel<br /><em>simple again.</em></h2><p>Turn a big day into a few friendly cards. Choose one, give it your attention, then enjoy the tiny spark of finishing.</p></div><div className="steps-row">
      {[
        ['01', 'Plan a card', 'Choose English, Bangla, or General Knowledge and give your session a clear intention.', <CalendarDays />],
        ['02', 'Find your focus', 'Set a realistic time and let one small task be enough for right now.', <Lightbulb />],
        ['03', 'Celebrate progress', 'Flip completed cards and watch your steady rhythm grow over time.', <Sparkles />],
      ].map(([number, title, copy, icon]) => <article className="story-card" key={number}><span>{number}</span><i>{icon}</i><h3>{title}</h3><p>{copy}</p></article>)}
    </div></section>
    <section className="home-quote"><span className="quote-mark">“</span><blockquote>The secret of getting ahead is getting started.</blockquote><p>— Mark Twain</p><button className="primary-button" type="button" onClick={onStart}>Start with one card <ArrowRight /></button></section>
  </main>
}

function PlannerPage({ month, selectedDate, today, tasks, dayTasks, completedToday, progress, focusMinutes, changeMonth, setSelectedDate, setDeck, toggleTask, setDeleteTask }) {
  return <main className="page inner-page">
    <section className="page-heading"><div><p className="eyebrow"><span /> Your study garden</p><h1>Today’s <em>gentle plan.</em></h1><p>Choose one card at a time. There is no need to hurry.</p></div><button type="button" className="primary-button" onClick={() => setDeck({ date: selectedDate })}><Plus /> Add a study card</button></section>
    <section className="stats-grid"><StatCard icon={<Target />} tone="violet" label="Daily progress" value={`${progress}%`} detail={`${completedToday} of ${dayTasks.length} cards complete`} progress={progress} /><StatCard icon={<Clock3 />} tone="cyan" label="Focus time" value={minutesLabel(focusMinutes)} detail="Planned for this day" /><StatCard icon={<BookOpen />} tone="amber" label="Subjects" value="3" detail="English · Bangla · General Knowledge" /></section>
    <section className="planner-grid"><div className="panel calendar-panel"><div className="panel-heading"><div><p className="eyebrow">Pick a day</p><h2>{formatMonth(month)}</h2></div><div className="month-controls"><button type="button" onClick={() => changeMonth(-1)} disabled={month === PLANNER_MONTHS[0]} aria-label="Previous month"><ChevronLeft /></button><button type="button" onClick={() => changeMonth(1)} disabled={month === PLANNER_MONTHS.at(-1)} aria-label="Next month"><ChevronRight /></button></div></div><Calendar month={month} tasks={tasks} selectedDate={selectedDate} today={today} onSelect={setSelectedDate} /></div><aside className="daily-note"><Sparkles /><p>Today’s reminder</p><blockquote>“You don’t need more time. You only need a kinder first step.”</blockquote><span>Take a breath, then begin.</span></aside></section>
    <section className="tasks-section"><div className="section-heading"><div><p className="eyebrow">Daily focus</p><h2>{selectedDate === today ? 'Today’s cards' : formatDate(selectedDate)}</h2><p>{dayTasks.length ? `${dayTasks.length} gentle goal${dayTasks.length > 1 ? 's' : ''} · ${completedToday} complete` : 'A little space for something meaningful'}</p></div></div>{dayTasks.length ? <div className="task-list">{dayTasks.map((task, index) => <TaskCard key={task.id} task={task} index={index} accent={accentFor(task.subject)} onToggle={() => toggleTask(task)} onEdit={() => setDeck(task)} onDelete={() => setDeleteTask(task)} />)}</div> : <EmptyDeck onAdd={() => setDeck({ date: selectedDate })} />}</section>
  </main>
}

function ProgressPage({ summary, summaryMode, setSummaryMode }) {
  return <main className="page inner-page"><section className="page-heading"><div><p className="eyebrow"><span /> Your steady rhythm</p><h1>Progress, not <em>perfection.</em></h1><p>A quiet look at every small effort you have made.</p></div><div className="segmented" role="group" aria-label="Summary range"><button type="button" className={summaryMode === 'week' ? 'active' : ''} aria-pressed={summaryMode === 'week'} onClick={() => setSummaryMode('week')}>Week</button><button type="button" className={summaryMode === 'month' ? 'active' : ''} aria-pressed={summaryMode === 'month'} onClick={() => setSummaryMode('month')}>Month</button></div></section>
    <section className="progress-layout"><div className="panel progress-main"><div className="panel-heading"><div><p className="eyebrow">Momentum</p><h2>Your study rhythm</h2></div><span className="completion-badge">{summary?.completionPercentage ?? 0}% complete</span></div><ProgressChart summary={summary} /></div><div className="progress-stats"><StatCard icon={<Target />} tone="violet" label="Cards completed" value={summary?.completedTasks ?? 0} detail={`${summary?.pendingTasks ?? 0} still waiting`} /><StatCard icon={<Clock3 />} tone="cyan" label="Focused time" value={minutesLabel(summary?.completedMinutes ?? 0)} detail={`${minutesLabel(summary?.plannedMinutes ?? 0)} planned`} /><StatCard icon={<Flame />} tone="amber" label="Current streak" value={`${summary?.studyStreak ?? 0} days`} detail="One day at a time" /></div></section>
    <section className="subject-section"><div><p className="eyebrow">By subject</p><h2>Where your time is blooming</h2></div><div className="subject-progress-list">{['English', 'Bangla', 'General Knowledge'].map(subject => { const data = summary?.subjectProgress?.find(item => item.subject === subject); const percentage = data?.total ? Math.round((data.completed / data.total) * 100) : 0; return <article key={subject}><div><strong>{subject}</strong><span>{data?.completed ?? 0} of {data?.total ?? 0} cards</span></div><i><b style={{ width: `${percentage}%` }} /></i><em>{percentage}%</em></article> })}</div></section><section className="soft-quote"><Feather /><blockquote>“It does not matter how slowly you go as long as you do not stop.”</blockquote><span>— Confucius</span></section>
  </main>
}

function InspirationPage({ onStart }) {
  return <main className="page inspiration-page"><section className="inspiration-hero"><p className="eyebrow"><span /> A pause for your mind</p><h1>Words for the days<br />you need a <em>little lift.</em></h1><p>Keep these close. Return whenever studying feels heavy.</p></section><section className="quote-cloud">{QUOTES.map(([quote, author], index) => <article key={quote} style={{ '--quote-delay': `${index * 90}ms` }}><span>0{index + 1}</span><Sparkles /><blockquote>“{quote}”</blockquote><p>— {author}</p></article>)}</section><section className="breathing-card"><div className="breathing-orb"><i /></div><div><p className="eyebrow">Before you begin</p><h2>Breathe in. Breathe out.</h2><p>Let your shoulders soften. Pick the smallest useful task. That is enough.</p><button type="button" className="primary-button" onClick={onStart}>Choose a study card <ArrowRight /></button></div></section></main>
}

export default function App() {
  const initial = useMemo(() => plannerNow(), []), today = useMemo(() => todayIso(), [])
  const [page, setPage] = useState(() => window.location.hash.replace('#/', '') || 'home')
  const [theme, setTheme] = useState(() => localStorage.getItem('mahin-theme') || 'light')
  const [month, setMonth] = useState(initial.month), [selectedDate, setSelectedDate] = useState(initial.date)
  const [tasks, setTasks] = useState([]), [summary, setSummary] = useState(null), [summaryMode, setSummaryMode] = useState('week')
  const [loader, setLoader] = useState('Gathering your study cards…'), [notice, setNotice] = useState(null)
  const [deck, setDeck] = useState(null), [deleteTask, setDeleteTask] = useState(null)

  useEffect(() => { document.documentElement.dataset.theme = theme; localStorage.setItem('mahin-theme', theme) }, [theme])
  useEffect(() => { const onHash = () => setPage(window.location.hash.replace('#/', '') || 'home'); window.addEventListener('hashchange', onHash); return () => window.removeEventListener('hashchange', onHash) }, [])
  const navigate = target => { setPage(target); window.history.replaceState(null, '', `#/${target}`); window.scrollTo?.({ top: 0, behavior: 'smooth' }) }
  const runAction = useCallback(async (message, action) => { setLoader(message); setNotice(null); try { return await action() } catch (error) { setNotice({ type: 'error', text: error.message }); throw error } finally { setLoader(null) } }, [])
  const loadMonth = useCallback(async (targetMonth, quiet = false) => { const range = monthRange(targetMonth); if (!quiet) setLoader('Gathering your study cards…'); try { setTasks(await api(`/api/tasks?start=${range.start}&end=${range.end}`)); setNotice(null) } catch (error) { setNotice({ type: 'error', text: `${error.message} Is the backend running?` }) } finally { if (!quiet) setLoader(null) } }, [])
  useEffect(() => { loadMonth(month) }, [month, loadMonth])
  useEffect(() => { const { start, end } = summaryRange(selectedDate, summaryMode); let active = true; api(`/api/tasks/summary?start=${start}&end=${end}`).then(data => { if (active) setSummary(data) }).catch(() => { if (active) setSummary(null) }); return () => { active = false } }, [selectedDate, summaryMode, tasks])

  const dayTasks = useMemo(() => tasks.filter(task => task.date === selectedDate), [tasks, selectedDate])
  const completedToday = dayTasks.filter(task => task.completed).length, progress = dayTasks.length ? Math.round((completedToday * 100) / dayTasks.length) : 0, focusMinutes = dayTasks.reduce((sum, task) => sum + task.durationMinutes, 0)
  const changeMonth = direction => { const next = month + direction; if (!PLANNER_MONTHS.includes(next)) return; setMonth(next); setSelectedDate(`${PLANNER_YEAR}-${String(next + 1).padStart(2, '0')}-01`) }
  const saveTask = async form => { const editing = Boolean(deck?.id); try { await runAction(editing ? 'Softly updating your card…' : 'Making space for a new goal…', () => api(editing ? `/api/tasks/${deck.id}` : '/api/tasks', { method: editing ? 'PUT' : 'POST', body: JSON.stringify(form) })); setDeck(null); await loadMonth(month, true); setNotice({ type: 'success', text: editing ? 'Your card is beautifully updated.' : 'Your new study card is ready.' }) } catch { /* surfaced */ } }
  const toggleTask = async task => { try { await runAction(task.completed ? 'Putting this card back in your plan…' : 'Celebrating this little win…', () => api(`/api/tasks/${task.id}/completion`, { method: 'PATCH', body: JSON.stringify({ completed: !task.completed }) })); await loadMonth(month, true); setNotice({ type: 'success', text: task.completed ? 'The card is ready when you are.' : 'Lovely work — one gentle goal complete.' }) } catch { /* surfaced */ } }
  const removeTask = async () => { if (!deleteTask) return; try { await runAction('Tidying up your planner…', () => api(`/api/tasks/${deleteTask.id}`, { method: 'DELETE' })); setDeleteTask(null); await loadMonth(month, true); setNotice({ type: 'success', text: 'The card has been removed.' }) } catch { /* surfaced */ } }

  return <div className="app-shell">
    {loader && <Loader message={loader} />}
    <SiteHeader page={page} onNavigate={navigate} theme={theme} onToggleTheme={() => setTheme(value => value === 'light' ? 'dark' : 'light')} />
    {notice && <div className={`notice ${notice.type}`} role="status" aria-live="polite"><span>{notice.type === 'success' ? '✓' : '!'}</span><p>{notice.text}</p><button type="button" aria-label="Dismiss message" onClick={() => setNotice(null)}><X /></button></div>}
    <div className="page-transition" key={page}>
      {page === 'home' && <HomePage onStart={() => navigate('planner')} />}
      {page === 'planner' && <PlannerPage {...{ month, selectedDate, today, tasks, dayTasks, completedToday, progress, focusMinutes, changeMonth, setSelectedDate, setDeck, toggleTask, setDeleteTask }} />}
      {page === 'progress' && <ProgressPage summary={summary} summaryMode={summaryMode} setSummaryMode={setSummaryMode} />}
      {page === 'inspiration' && <InspirationPage onStart={() => navigate('planner')} />}
    </div>
    <footer className="site-footer"><Logo compact /><p>Made gently for Mahin · one thoughtful card at a time.</p><span>November — December 2026</span></footer><StudyCat />
    {deck && <FlashCardDeck task={deck} onClose={() => setDeck(null)} onSave={saveTask} />}{deleteTask && <DeleteDialog task={deleteTask} onClose={() => setDeleteTask(null)} onConfirm={removeTask} />}
  </div>
}
