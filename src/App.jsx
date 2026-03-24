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
        <Route path="/health" element={<PlaceholderPage title="Health" text="Weight logs, BMI, photos, and body measurements." />} />
        <Route path="/exercise" element={<PlaceholderPage title="Exercise" text="Exercise library, demo media, and tracking." />} />
        <Route path="/prayer" element={<PlaceholderPage title="Prayer" text="Bangladesh and Germany city-based prayer times." />} />
        <Route path="/finance" element={<PlaceholderPage title="Finance" text="Income, expenses, categories, and summaries." />} />
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
