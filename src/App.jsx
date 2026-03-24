import { useEffect, useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import StatCard from './components/StatCard'
import { bangladeshCities, germanyCities, mockFinance, mockGoals, mockWeight } from './lib/mockData'
import { hasSupabaseEnv, supabase } from './lib/supabase'

/* ---------------- AUTH ---------------- */
function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()

    if (!supabase) {
      setMessage('Supabase not connected')
      return
    }

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setMessage(error.message)
    } else {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) setMessage(error.message)
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <h1>Ahsan Journey</h1>

        <form onSubmit={handleSubmit}>
          <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" />
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" />
          <button>{isLogin ? 'Login' : 'Signup'}</button>
        </form>

        <button onClick={() => setIsLogin(!isLogin)}>
          Switch
        </button>

        <p>{message}</p>
      </div>
    </div>
  )
}

/* ---------------- DASHBOARD ---------------- */
function DashboardPage({ user }) {
  return (
    <div className="page">
      <h1>Dashboard</h1>

      <div className="stats-grid">
        <StatCard label="Weight" value="84 kg" />
        <StatCard label="Goals" value="2 / 5" />
      </div>

      <div className="content-grid">
        <section className="card">
          <h2>Quick Goals</h2>

          <div className="list">
            {mockGoals.map(g => (
              <div key={g.title} className="list-item">
                <strong>{g.title}</strong>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

/* ---------------- GOALS ---------------- */
function GoalsPage({ user }) {
  const [entries, setEntries] = useState([])

  async function loadEntries() {
    if (!supabase || !user?.id) return

    const { data } = await supabase
      .from('daily_goals')
      .select('*')

    setEntries(data || [])
  }

  useEffect(() => {
    loadEntries()
  }, [])

  async function toggleGoal(entry) {
    await supabase
      .from('daily_goals')
      .update({
        status: entry.status === 'done' ? 'pending' : 'done'
      })
      .eq('id', entry.id)

    loadEntries()
  }

  async function deleteGoal(id) {
    await supabase.from('daily_goals').delete().eq('id', id)
    loadEntries()
  }

  return (
    <div className="page">
      <h1>Goals</h1>

      <section className="card">
        <h2>Checklist</h2>

        <div className="list">
          {entries.map(e => (
            <div key={e.id} className="list-item">

              <input
                type="checkbox"
                checked={e.status === 'done'}
                onChange={() => toggleGoal(e)}
              />

              <span>{e.title}</span>

              <button onClick={() => deleteGoal(e.id)}>Delete</button>

            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

/* ---------------- FOCUS ---------------- */
function FocusPage() {
  const [seconds, setSeconds] = useState(1500)
  const [running, setRunning] = useState(false)

  useEffect(() => {
    if (!running) return

    const timer = setInterval(() => {
      setSeconds(s => s - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [running])

  return (
    <div className="page">
      <h1>Focus</h1>

      <div>{seconds}s</div>

      <button onClick={() => setRunning(!running)}>
        {running ? 'Pause' : 'Start'}
      </button>
    </div>
  )
}

/* ---------------- APP SHELL ---------------- */
function AppShell({ user }) {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<DashboardPage user={user} />} />
        <Route path="/goals" element={<GoalsPage user={user} />} />
        <Route path="/focus" element={<FocusPage />} />
      </Routes>
    </Layout>
  )
}

/* ---------------- MAIN ---------------- */
export default function App() {
  const [session, setSession] = useState(null)

  useEffect(() => {
    if (!supabase) return

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
    })
  }, [])

  if (!session) return <AuthScreen />

  return <AppShell user={session.user} />
}
