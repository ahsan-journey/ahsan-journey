import { useEffect, useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import StatCard from './components/StatCard'
import { bangladeshCities, germanyCities, mockFinance, mockGoals, mockWeight } from './lib/mockData'
import { hasSupabaseEnv, supabase } from './lib/supabase'

function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setMessage('')

    if (!supabase) {
      setMessage('Supabase is not connected.')
      return
    }

    setLoading(true)

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) throw error
        setMessage('Login successful.')
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
          },
        })

        if (error) throw error

        if (data.user) {
          setMessage('Signup successful. You can now log in.')
        } else {
          setMessage('Signup submitted. Check your email if confirmation is required.')
        }
      }
    } catch (error) {
      setMessage(error.message || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <h1>Ahsan Journey</h1>
        <p className="auth-subtitle">Login to sync your app across phone and laptop.</p>

        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && (
            <div>
              <label>Full Name</label>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your full name"
              />
            </div>
          )}

          <div>
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              required
            />
          </div>

          <button type="submit" className="primary-btn" disabled={loading}>
            {loading ? 'Please wait...' : isLogin ? 'Login' : 'Create Account'}
          </button>
        </form>

        {message ? <p className="auth-message">{message}</p> : null}

        <button
          type="button"
          className="link-btn"
          onClick={() => {
            setIsLogin(!isLogin)
            setMessage('')
          }}
        >
          {isLogin ? 'Need an account? Sign up' : 'Already have an account? Log in'}
        </button>
      </div>
    </div>
  )
}

function DashboardPage({ user }) {
  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Ahsan Journey</h1>
          <p>Welcome, {user?.user_metadata?.full_name || user?.email || 'User'}</p>
        </div>
        <div className="pill">{hasSupabaseEnv ? 'Supabase Connected' : 'Supabase Not Connected'}</div>
      </div>

      <div className="stats-grid">
        <StatCard label="Current Weight" value="84.1 kg" note="Latest logged weight" />
        <StatCard label="BMI" value="29.0" note="Auto-calculated from latest data" />
        <StatCard label="Daily Goals Done" value="2 / 4" note="Today’s progress" />
        <StatCard label="Finance Balance" value="৳ 17,000" note="Current monthly difference" />
      </div>

      <div className="content-grid">
        <section className="card">
          <h2>Today’s Goals</h2>
          <div className="list">
            {mockGoals.map((goal) => (
              <div key={goal.title} className="list-item">
                <div>
                  <strong>{goal.title}</strong>
                  <p>{goal.type}</p>
                </div>
                <span className={`status ${goal.status}`}>{goal.status}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="card">
          <h2>Prayer Cities</h2>
          <div className="two-col">
            <div>
              <h3>Bangladesh</h3>
              <ul>
                {bangladeshCities.map((city) => <li key={city}>{city}</li>)}
              </ul>
            </div>
            <div>
              <h3>Germany</h3>
              <ul>
                {germanyCities.map((city) => <li key={city}>{city}</li>)}
              </ul>
            </div>
          </div>
        </section>

        <section className="card">
          <h2>Weight Trend</h2>
          <div className="list">
            {mockWeight.map((item) => (
              <div key={item.date} className="list-item">
                <span>{item.date}</span>
                <span>{item.weight} kg · BMI {item.bmi}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="card">
          <h2>Finance Overview</h2>
          <div className="list">
            {mockFinance.map((item) => (
              <div key={item.month} className="list-item">
                <span>{item.month}</span>
                <span>Income {item.income} | Expense {item.expense}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

function HealthPage({ user }) {
  const [logDate, setLogDate] = useState(new Date().toISOString().slice(0, 10))
  const [weightKg, setWeightKg] = useState('')
  const [heightCm, setHeightCm] = useState('')
  const [notes, setNotes] = useState('')
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  function calculateBmi(weight, height) {
    const w = Number(weight)
    const h = Number(height)
    if (!w || !h) return null
    const meters = h / 100
    return (w / (meters * meters)).toFixed(2)
  }

  async function loadEntries() {
    if (!supabase || !user?.id) return

    const { data, error } = await supabase
      .from('weight_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('log_date', { ascending: false })

    if (error) {
      setMessage(error.message)
      return
    }

    setEntries(data || [])
  }

  useEffect(() => {
    loadEntries()
  }, [user?.id])

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const bmi = calculateBmi(weightKg, heightCm)

    const { error } = await supabase.from('weight_logs').insert({
      user_id: user.id,
      log_date: logDate,
      weight_kg: Number(weightKg),
      height_cm: Number(heightCm),
      bmi: bmi ? Number(bmi) : null,
      notes,
    })

    if (error) {
      setMessage(error.message)
      setLoading(false)
      return
    }

    setWeightKg('')
    setHeightCm('')
    setNotes('')
    setMessage('Weight entry saved successfully.')
    setLoading(false)
    loadEntries()
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Health</h1>
          <p>Track your weight, height, BMI, and notes.</p>
        </div>
      </div>

      <div className="content-grid">
        <section className="card">
          <h2>Add Weight Entry</h2>

          <form onSubmit={handleSubmit} className="auth-form">
            <div>
              <label>Date</label>
              <input
                type="date"
                value={logDate}
                onChange={(e) => setLogDate(e.target.value)}
                required
              />
            </div>

            <div>
              <label>Weight (kg)</label>
              <input
                type="number"
                step="0.1"
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
                placeholder="e.g. 84.1"
                required
              />
            </div>

            <div>
              <label>Height (cm)</label>
              <input
                type="number"
                step="0.1"
                value={heightCm}
                onChange={(e) => setHeightCm(e.target.value)}
                placeholder="e.g. 170"
                required
              />
            </div>

            <div>
              <label>Notes</label>
              <input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional notes"
              />
            </div>

            <button type="submit" className="primary-btn" disabled={loading}>
              {loading ? 'Saving...' : 'Save Entry'}
            </button>
          </form>

          {message ? <p className="auth-message">{message}</p> : null}
        </section>

        <section className="card">
          <h2>Saved Weight Entries</h2>

          <div className="list">
            {entries.length === 0 ? (
              <p className="auth-message">No entries yet.</p>
            ) : (
              entries.map((entry) => (
                <div className="list-item" key={entry.id}>
                  <div>
                    <strong>{entry.log_date}</strong>
                    <p>
                      {entry.weight_kg} kg · {entry.height_cm} cm · BMI {entry.bmi ?? '—'}
                    </p>
                    {entry.notes ? <p>{entry.notes}</p> : null}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  )
}

function FinancePage({ user }) {
  const [entryDate, setEntryDate] = useState(new Date().toISOString().slice(0, 10))
  const [type, setType] = useState('expense')
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  async function loadEntries() {
    if (!supabase || !user?.id) return

    const { data, error } = await supabase
      .from('finance_entries')
      .select('*')
      .eq('user_id', user.id)
      .order('entry_date', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) {
      setMessage(error.message)
      return
    }

    setEntries(data || [])
  }

  useEffect(() => {
    loadEntries()
  }, [user?.id])

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const { error } = await supabase.from('finance_entries').insert({
      user_id: user.id,
      entry_date: entryDate,
      type,
      amount: Number(amount),
      note,
    })

    if (error) {
      setMessage(error.message)
      setLoading(false)
      return
    }

    setAmount('')
    setNote('')
    setMessage('Finance entry saved successfully.')
    setLoading(false)
    loadEntries()
  }

  const totalIncome = entries
    .filter((item) => item.type === 'income')
    .reduce((sum, item) => sum + Number(item.amount || 0), 0)

  const totalExpense = entries
    .filter((item) => item.type === 'expense')
    .reduce((sum, item) => sum + Number(item.amount || 0), 0)

  const balance = totalIncome - totalExpense

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Finance</h1>
          <p>Track your income and expenses.</p>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard label="Total Income" value={`৳ ${totalIncome.toFixed(2)}`} note="All saved income entries" />
        <StatCard label="Total Expense" value={`৳ ${totalExpense.toFixed(2)}`} note="All saved expense entries" />
        <StatCard label="Balance" value={`৳ ${balance.toFixed(2)}`} note="Income minus expense" />
        <StatCard label="Entries" value={String(entries.length)} note="Total finance records" />
      </div>

      <div className="content-grid">
        <section className="card">
          <h2>Add Finance Entry</h2>

          <form onSubmit={handleSubmit} className="auth-form">
            <div>
              <label>Date</label>
              <input
                type="date"
                value={entryDate}
                onChange={(e) => setEntryDate(e.target.value)}
                required
              />
            </div>

            <div>
              <label>Type</label>
              <select value={type} onChange={(e) => setType(e.target.value)}>
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </div>

            <div>
              <label>Amount</label>
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 500"
                required
              />
            </div>

            <div>
              <label>Note</label>
              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. groceries, salary, transport"
              />
            </div>

            <button type="submit" className="primary-btn" disabled={loading}>
              {loading ? 'Saving...' : 'Save Entry'}
            </button>
          </form>

          {message ? <p className="auth-message">{message}</p> : null}
        </section>

        <section className="card">
          <h2>Saved Finance Entries</h2>

          <div className="list">
            {entries.length === 0 ? (
              <p className="auth-message">No entries yet.</p>
            ) : (
              entries.map((entry) => (
                <div className="list-item" key={entry.id}>
                  <div>
                    <strong>{entry.entry_date}</strong>
                    <p>
                      {entry.type.toUpperCase()} · ৳ {Number(entry.amount).toFixed(2)}
                    </p>
                    {entry.note ? <p>{entry.note}</p> : null}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  )
}

function PlaceholderPage({ title, text }) {
  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>{title}</h1>
          <p>{text}</p>
        </div>
      </div>
      <section className="card">
        <p>This module UI is ready to expand in the next step.</p>
      </section>
    </div>
  )
}

function AppShell({ user, onLogout }) {
  return (
    <Layout>
      <div className="top-actions">
        <button className="secondary-btn" onClick={onLogout}>Logout</button>
      </div>

      <Routes>
        <Route path="/" element={<DashboardPage user={user} />} />
        <Route path="/goals" element={<PlaceholderPage title="Goals" text="Daily, weekly, monthly, and lifetime targets." />} />
        <Route path="/health" element={<HealthPage user={user} />} />
        <Route path="/exercise" element={<PlaceholderPage title="Exercise" text="Exercise library, demo media, and tracking." />} />
        <Route path="/prayer" element={<PlaceholderPage title="Prayer" text="Bangladesh and Germany city-based prayer times." />} />
        <Route path="/finance" element={<FinancePage user={user} />} />
        <Route path="/focus" element={<PlaceholderPage title="Focus" text="Pomodoro timer and session tracking." />} />
        <Route path="/journal" element={<PlaceholderPage title="Journal" text="Daily reflections, notes, and photos." />} />
        <Route path="/ai-insights" element={<PlaceholderPage title="AI Insights & Compare" text="Analyze, compare, and summarize your data." />} />
        <Route path="/analytics" element={<PlaceholderPage title="Analytics" text="Charts and trend summaries across modules." />} />
        <Route path="/settings" element={<PlaceholderPage title="Settings" text="Profile, city, currency, and app preferences." />} />
      </Routes>
    </Layout>
  )
}

export default function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    async function getSession() {
      if (!supabase) {
        setLoading(false)
        return
      }

      const { data } = await supabase.auth.getSession()
      if (mounted) {
        setSession(data.session ?? null)
        setLoading(false)
      }
    }

    getSession()

    if (!supabase) return

    const { data: listener } = supabase.auth.onAuthStateChange((_event, sessionData) => {
      setSession(sessionData ?? null)
      setLoading(false)
    })

    return () => {
      mounted = false
      listener?.subscription?.unsubscribe()
    }
  }, [])

  async function handleLogout() {
    if (!supabase) return
    await supabase.auth.signOut()
  }

  if (loading) {
    return (
      <div className="auth-shell">
        <div className="auth-card">
          <h1>Ahsan Journey</h1>
          <p className="auth-subtitle">Loading...</p>
        </div>
      </div>
    )
  }

  if (!hasSupabaseEnv) {
    return (
      <div className="auth-shell">
        <div className="auth-card">
          <h1>Ahsan Journey</h1>
          <p className="auth-subtitle">Supabase environment variables are missing.</p>
        </div>
      </div>
    )
  }

  if (!session?.user) {
    return <AuthScreen />
  }

  return <AppShell user={session.user} onLogout={handleLogout} />
}
