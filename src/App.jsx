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
  <h2>Today's Checklist</h2>

  <div className="list">
    {entries.length === 0 ? (
      <p className="auth-message">No goals yet.</p>
    ) : (
      entries.map((entry) => (
        <div className="list-item" key={entry.id}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input
              type="checkbox"
              checked={entry.status === 'done'}
              onChange={() => toggleGoal(entry)}
            />

            <div>
              <strong
                style={{
                  textDecoration: entry.status === 'done' ? 'line-through' : 'none',
                }}
              >
                {entry.title}
              </strong>

              <p>
                {entry.category} · {entry.priority}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className="secondary-btn"
              onClick={() => editGoal(entry)}
            >
              Edit
            </button>

            <button
              className="secondary-btn"
              onClick={() => deleteGoal(entry.id)}
            >
              Delete
            </button>
          </div>
        </div>
      ))
    )}
  </div>
</section>
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
  if (!user?.id) return
  generateTodayGoals()
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

function GoalsPage({ user }) {
  const today = new Date().toISOString().slice(0, 10)

  const [goalDate, setGoalDate] = useState(today)
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('Deen')
  const [priority, setPriority] = useState('medium')
  const [status, setStatus] = useState('pending')
  const [notes, setNotes] = useState('')
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [editingId, setEditingId] = useState(null)

  async function loadEntries() {
    if (!supabase || !user?.id) return

    const { data, error } = await supabase
      .from('daily_goals')
      .select('*')
      .eq('user_id', user.id)
      .eq('goal_date', today)
      .order('created_at', { ascending: false })

    if (error) {
      setMessage(error.message)
      return
    }

    setEntries(data || [])
  }
async function generateTodayGoals() {
  if (!supabase || !user?.id) return

  const today = new Date().toISOString().slice(0, 10)

  // check if already generated
  const { data: existing } = await supabase
    .from('daily_goals')
    .select('id')
    .eq('user_id', user.id)
    .eq('goal_date', today)

  if (existing && existing.length > 0) return

  // get templates
  const { data: templates } = await supabase
    .from('daily_goal_templates')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_active', true)

  if (!templates || templates.length === 0) return

  const newGoals = templates.map((t) => ({
    user_id: user.id,
    title: t.title,
    category: t.category,
    priority: t.priority,
    notes: t.notes,
    goal_date: today,
    status: 'pending',
    progress: 0,
  }))

  await supabase.from('daily_goals').insert(newGoals)

  loadEntries()
}
  useEffect(() => {
    loadEntries()
  }, [user?.id])

  function resetForm() {
    setGoalDate(today)
    setTitle('')
    setCategory('Deen')
    setPriority('medium')
    setStatus('pending')
    setNotes('')
    setEditingId(null)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const progress =
      status === 'done' ? 100 : status === 'in progress' ? 50 : 0

    if (editingId) {
      const { error } = await supabase
        .from('daily_goals')
        .update({
          title,
          category,
          goal_date: goalDate,
          priority,
          status,
          progress,
          notes,
        })
        .eq('id', editingId)
        .eq('user_id', user.id)

      if (error) {
        setMessage(error.message)
        setLoading(false)
        return
      }

      setMessage('Daily goal updated successfully.')
    } else {
      const { error } = await supabase.from('daily_goals').insert({
        user_id: user.id,
        title,
        category,
        goal_date: goalDate,
        priority,
        status,
        progress,
        notes,
      })

      if (error) {
        setMessage(error.message)
        setLoading(false)
        return
      }

      setMessage('Daily goal saved successfully.')
    }

    resetForm()
    setLoading(false)
    loadEntries()
  }

  async function toggleGoal(entry) {
    const newStatus = entry.status === 'done' ? 'pending' : 'done'
    const newProgress = newStatus === 'done' ? 100 : 0

    const { error } = await supabase
      .from('daily_goals')
      .update({
        status: newStatus,
        progress: newProgress,
      })
      .eq('id', entry.id)
      .eq('user_id', user.id)

    if (error) {
      setMessage(error.message)
      return
    }

    loadEntries()
  }

  async function deleteGoal(id) {
    const confirmDelete = window.confirm('Delete this goal?')
    if (!confirmDelete) return

    const { error } = await supabase
      .from('daily_goals')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      setMessage(error.message)
      return
    }

    if (editingId === id) {
      resetForm()
    }

    setMessage('Goal deleted successfully.')
    loadEntries()
  }

  function editGoal(entry) {
    setEditingId(entry.id)
    setGoalDate(entry.goal_date || today)
    setTitle(entry.title || '')
    setCategory(entry.category || 'Deen')
    setPriority(entry.priority || 'medium')
    setStatus(entry.status || 'pending')
    setNotes(entry.notes || '')
    setMessage('Editing selected goal.')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const totalGoals = entries.length
  const doneGoals = entries.filter((item) => item.status === 'done').length
  const pendingGoals = entries.filter((item) => item.status === 'pending').length
  const progressGoals = entries.filter((item) => item.status === 'in progress').length

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Goals</h1>
          <p>Today’s daily goal checklist.</p>
        </div>
      </div>

      <div className="top-actions">
        <a className="secondary-btn" href="/weekly-goals">Open Weekly Goals</a>
      </div>

      <div className="stats-grid">
        <StatCard label="Total Goals" value={String(totalGoals)} note="Today’s goals" />
        <StatCard label="Done" value={String(doneGoals)} note="Completed goals" />
        <StatCard label="In Progress" value={String(progressGoals)} note="Ongoing goals" />
        <StatCard label="Pending" value={String(pendingGoals)} note="Not started yet" />
      </div>

      <div className="content-grid">
        <section className="card">
  <h2>Add Routine Template</h2>

  <form
    onSubmit={async (e) => {
      e.preventDefault()

      if (!title) return

      const { error } = await supabase.from('daily_goal_templates').insert({
        user_id: user.id,
        title,
        category,
        priority,
        notes,
      })

      if (error) {
        setMessage(error.message)
        return
      }

      setTitle('')
      setNotes('')
      setMessage('Template added successfully.')
    }}
    className="auth-form"
  >
    <div>
      <label>Template Title</label>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="e.g. Fajr prayer"
        required
      />
    </div>

    <button type="submit" className="primary-btn">
      Add Template
    </button>
  </form>
</section>
        <section className="card">
          <h2>{editingId ? 'Edit Daily Goal' : 'Add Daily Goal'}</h2>

          <form onSubmit={handleSubmit} className="auth-form">
            <div>
              <label>Date</label>
              <input
                type="date"
                value={goalDate}
                onChange={(e) => setGoalDate(e.target.value)}
                required
              />
            </div>

            <div>
              <label>Goal Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Pray all 5 on time"
                required
              />
            </div>

            <div>
              <label>Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="Deen">Deen</option>
                <option value="Health">Health</option>
                <option value="Study">Study</option>
                <option value="Career">Career</option>
                <option value="Family">Family</option>
                <option value="Personal">Personal</option>
              </select>
            </div>

            <div>
              <label>Priority</label>
              <select value={priority} onChange={(e) => setPriority(e.target.value)}>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div>
              <label>Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="pending">Pending</option>
                <option value="in progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>

            <div>
              <label>Notes</label>
              <input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional notes"
              />
            </div>

            <div className="pomodoro-actions">
              <button type="submit" className="primary-btn" disabled={loading}>
                {loading ? 'Saving...' : editingId ? 'Update Goal' : 'Save Goal'}
              </button>

              {editingId ? (
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={resetForm}
                >
                  Cancel Edit
                </button>
              ) : null}
            </div>
          </form>

          {message ? <p className="auth-message">{message}</p> : null}
        </section>

        <section className="card">
          <h2>Today’s Checklist</h2>

          <div className="list">
            {entries.length === 0 ? (
              <p className="auth-message">No goals yet for today.</p>
            ) : (
              entries.map((entry) => (
                <div className="list-item" key={entry.id}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                    <input
                      type="checkbox"
                      checked={entry.status === 'done'}
                      onChange={() => toggleGoal(entry)}
                    />

                    <div>
                      <strong
                        style={{
                          textDecoration: entry.status === 'done' ? 'line-through' : 'none',
                        }}
                      >
                        {entry.title}
                      </strong>
                      <p>
                        {entry.category} · {entry.priority} · {entry.status}
                      </p>
                      {entry.notes ? <p>{entry.notes}</p> : null}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      className="secondary-btn"
                      onClick={() => editGoal(entry)}
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      className="secondary-btn"
                      onClick={() => deleteGoal(entry.id)}
                    >
                      Delete
                    </button>
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

function FocusPage({ user }) {
  const WORK_MINUTES = 25
  const BREAK_MINUTES = 5

  const [mode, setMode] = useState('work')
  const [secondsLeft, setSecondsLeft] = useState(WORK_MINUTES * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [sessionsCompleted, setSessionsCompleted] = useState(0)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!isRunning) return

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)

          if (mode === 'work') {
            const newCount = sessionsCompleted + 1
            setSessionsCompleted(newCount)
            savePomodoroSession(newCount)
            setMode('break')
            setIsRunning(false)
            setMessage('Work session completed. Time for a break.')
            return BREAK_MINUTES * 60
          } else {
            setMode('work')
            setIsRunning(false)
            setMessage('Break completed. Ready for the next focus session.')
            return WORK_MINUTES * 60
          }
        }

        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isRunning, mode, sessionsCompleted])

  async function savePomodoroSession(completedCount) {
    if (!supabase || !user?.id) return

    const today = new Date().toISOString().slice(0, 10)

    const { data: existing, error: fetchError } = await supabase
      .from('pomodoro_sessions')
      .select('*')
      .eq('user_id', user.id)
      .eq('session_date', today)
      .maybeSingle()

    if (fetchError) {
      setMessage(fetchError.message)
      return
    }

    if (existing) {
      const { error: updateError } = await supabase
        .from('pomodoro_sessions')
        .update({
          sessions_completed: completedCount,
          work_minutes: WORK_MINUTES,
          break_minutes: BREAK_MINUTES,
        })
        .eq('id', existing.id)

      if (updateError) setMessage(updateError.message)
    } else {
      const { error: insertError } = await supabase
        .from('pomodoro_sessions')
        .insert({
          user_id: user.id,
          session_date: today,
          work_minutes: WORK_MINUTES,
          break_minutes: BREAK_MINUTES,
          sessions_completed: completedCount,
        })

      if (insertError) setMessage(insertError.message)
    }
  }

  function formatTime(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  }

  function handleStartPause() {
    setIsRunning((prev) => !prev)
    setMessage('')
  }

  function handleReset() {
    setIsRunning(false)
    setMode('work')
    setSecondsLeft(WORK_MINUTES * 60)
    setMessage('Timer reset.')
  }

  function switchMode(nextMode) {
    setIsRunning(false)
    setMode(nextMode)
    setSecondsLeft(nextMode === 'work' ? WORK_MINUTES * 60 : BREAK_MINUTES * 60)
    setMessage('')
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Focus</h1>
          <p>Pomodoro timer for deep work and breaks.</p>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard
          label="Mode"
          value={mode === 'work' ? 'Work' : 'Break'}
          note="Current timer mode"
        />
        <StatCard
          label="Time Left"
          value={formatTime(secondsLeft)}
          note="Current countdown"
        />
        <StatCard
          label="Sessions Completed"
          value={String(sessionsCompleted)}
          note="Completed work sessions this session"
        />
        <StatCard
          label="Status"
          value={isRunning ? 'Running' : 'Paused'}
          note="Timer state"
        />
      </div>

      <div className="content-grid">
        <section className="card">
          <h2>Pomodoro Timer</h2>

          <div className="pomodoro-box">
            <div className="pomodoro-time">{formatTime(secondsLeft)}</div>

            <div className="pomodoro-actions">
              <button className="primary-btn" onClick={handleStartPause}>
                {isRunning ? 'Pause' : 'Start'}
              </button>
              <button className="secondary-btn" onClick={handleReset}>
                Reset
              </button>
            </div>

            <div className="pomodoro-actions">
              <button className="secondary-btn" onClick={() => switchMode('work')}>
                Work
              </button>
              <button className="secondary-btn" onClick={() => switchMode('break')}>
                Break
              </button>
            </div>

            {message ? <p className="auth-message">{message}</p> : null}
          </div>
        </section>

        <section className="card">
          <h2>Pomodoro Rules</h2>
          <div className="list">
            <div className="list-item">
              <div>
                <strong>Work Session</strong>
                <p>25 minutes deep focus</p>
              </div>
            </div>
            <div className="list-item">
              <div>
                <strong>Short Break</strong>
                <p>5 minutes rest</p>
              </div>
            </div>
            <div className="list-item">
              <div>
                <strong>Auto Save</strong>
                <p>Completed work sessions are saved to your account</p>
              </div>
            </div>
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
        <Route path="/goals" element={<GoalsPage user={user} />} />
        <Route path="/health" element={<HealthPage user={user} />} />
        <Route path="/exercise" element={<PlaceholderPage title="Exercise" text="Exercise library, demo media, and tracking." />} />
        <Route path="/prayer" element={<PlaceholderPage title="Prayer" text="Bangladesh and Germany city-based prayer times." />} />
        <Route path="/finance" element={<FinancePage user={user} />} />
        <Route path="/focus" element={<FocusPage user={user} />} />
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
