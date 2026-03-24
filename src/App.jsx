import { Routes, Route } from 'react-router-dom'
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from 'recharts'
import Layout from './components/Layout'
import StatCard from './components/StatCard'
import { hasSupabaseEnv } from './lib/supabase'
import { bangladeshCities, germanyCities, mockFinance, mockGoals, mockWeight } from './lib/mockData'
import { useMemo, useState } from 'react'

function PageHeader({ title, subtitle }) {
  return (
    <div className="page-header">
      <div>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      {!hasSupabaseEnv ? <span className="pill warning">Demo mode until Supabase keys are added</span> : <span className="pill success">Supabase ready</span>}
    </div>
  )
}

function DashboardPage() {
  const [country, setCountry] = useState('Bangladesh')
  const cities = country === 'Bangladesh' ? bangladeshCities : germanyCities
  const [city, setCity] = useState(cities[0])

  const todayPrayer = {
    fajr: '04:52',
    dhuhr: '12:05',
    asr: '16:29',
    maghrib: '18:13',
    isha: '19:25',
  }

  return (
    <>
      <PageHeader title="Dashboard" subtitle="Your all-in-one personal control center." />
      <div className="grid stats-grid">
        <StatCard label="Current Weight" value="84.1 kg" note="Down 2.4 kg this month" />
        <StatCard label="Current BMI" value="29.0" note="Auto analysis will be live after DB setup" />
        <StatCard label="Daily Goal Progress" value="68%" note="5 of 8 daily goals completed" />
        <StatCard label="This Month Savings" value="৳13,500" note="Income minus expenses" />
      </div>
      <div className="grid two-col">
        <section className="card">
          <div className="section-top">
            <h2>Prayer Times</h2>
            <div className="inline-fields">
              <select value={country} onChange={(e) => { const value = e.target.value; setCountry(value); setCity((value === 'Bangladesh' ? bangladeshCities : germanyCities)[0]) }}>
                <option>Bangladesh</option>
                <option>Germany</option>
              </select>
              <select value={city} onChange={(e) => setCity(e.target.value)}>
                {cities.map((option) => <option key={option}>{option}</option>)}
              </select>
            </div>
          </div>
          <div className="prayer-grid">
            {Object.entries(todayPrayer).map(([name, time]) => (
              <div key={name} className="prayer-box">
                <span>{name.toUpperCase()}</span>
                <strong>{time}</strong>
              </div>
            ))}
          </div>
          <p className="muted">Selected city: {city}. Full city-based Bangladesh and Germany datasets will be connected after database import.</p>
        </section>
        <section className="card">
          <h2>Today’s Priority Goals</h2>
          <div className="list">
            {mockGoals.map((goal) => (
              <div key={goal.title} className="list-item">
                <div>
                  <strong>{goal.title}</strong>
                  <span>{goal.type}</span>
                </div>
                <span className="pill">{goal.status}</span>
              </div>
            ))}
          </div>
        </section>
        <section className="card">
          <h2>Weight Trend</h2>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockWeight}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="weight" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>
        <section className="card">
          <h2>Finance Snapshot</h2>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockFinance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="income" />
                <Bar dataKey="expense" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>
    </>
  )
}

function GoalsPage() {
  return (
    <>
      <PageHeader title="Goals" subtitle="Daily, weekly, monthly and lifetime targets in one system." />
      <div className="grid two-col">
        {['Daily Goals', 'Weekly Goals', 'Monthly Goals', 'Lifetime Targets'].map((name) => (
          <section key={name} className="card">
            <h2>{name}</h2>
            <div className="empty-state">
              <p>{name} table will connect to Supabase in later steps.</p>
              <ul>
                <li>Title</li>
                <li>Status</li>
                <li>Priority</li>
                <li>Progress %</li>
                <li>Notes</li>
              </ul>
            </div>
          </section>
        ))}
      </div>
    </>
  )
}

function HealthPage() {
  return (
    <>
      <PageHeader title="Health" subtitle="Weight journal, BMI analysis, measurements and progress photos." />
      <div className="grid two-col">
        <section className="card">
          <h2>Weight & BMI</h2>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockWeight}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="weight" strokeWidth={3} />
                <Line type="monotone" dataKey="bmi" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>
        <section className="card">
          <h2>Health Inputs Planned</h2>
          <ul className="feature-list">
            <li>Weight entries</li>
            <li>Auto BMI from saved height</li>
            <li>Waist, chest, hip, arm, thigh</li>
            <li>Progress photos</li>
            <li>Comparison analysis</li>
          </ul>
        </section>
      </div>
    </>
  )
}

function ExercisePage() {
  return (
    <>
      <PageHeader title="Exercise" subtitle="Exercise goals, routines, demo media and completion tracking." />
      <section className="card">
        <div className="grid three-col">
          {['Exercise library', 'Workout log', 'Demo photo/video attachments'].map((item) => (
            <div className="mini-card" key={item}>
              <h3>{item}</h3>
              <p>Ready in structure. We will connect forms, uploads and database tables after setup.</p>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}

function PrayerPage() {
  const cities = useMemo(() => [...bangladeshCities, ...germanyCities], [])
  return (
    <>
      <PageHeader title="Prayer" subtitle="Yearly city-based prayer times for Bangladesh and Germany." />
      <section className="card">
        <h2>Supported Cities (initial list)</h2>
        <div className="chip-wrap">
          {cities.map((city) => <span key={city} className="pill">{city}</span>)}
        </div>
      </section>
    </>
  )
}

function FinancePage() {
  return (
    <>
      <PageHeader title="Finance" subtitle="Income, expenses, categories, summaries and charts." />
      <div className="grid two-col">
        <section className="card">
          <h2>Monthly Overview</h2>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockFinance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="income" />
                <Bar dataKey="expense" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
        <section className="card">
          <h2>Categories Planned</h2>
          <div className="chip-wrap">
            {['Food', 'Transport', 'Medical', 'Study', 'Bills', 'Family', 'Charity', 'Savings', 'Other'].map((c) => <span className="pill" key={c}>{c}</span>)}
          </div>
        </section>
      </div>
    </>
  )
}

function FocusPage() {
  const [seconds, setSeconds] = useState(25 * 60)
  const [running, setRunning] = useState(false)

  useMemo(() => {
    if (!running) return
    const timer = setInterval(() => setSeconds((value) => (value > 0 ? value - 1 : 0)), 1000)
    return () => clearInterval(timer)
  }, [running])

  const minutes = String(Math.floor(seconds / 60)).padStart(2, '0')
  const secs = String(seconds % 60).padStart(2, '0')

  return (
    <>
      <PageHeader title="Focus" subtitle="Built-in Pomodoro timer for study, work and deep focus." />
      <section className="card timer-card">
        <div className="timer-display">{minutes}:{secs}</div>
        <div className="timer-actions">
          <button onClick={() => setRunning(true)}>Start</button>
          <button onClick={() => setRunning(false)}>Pause</button>
          <button onClick={() => { setRunning(false); setSeconds(25 * 60) }}>Reset</button>
        </div>
      </section>
    </>
  )
}

function JournalPage() {
  return (
    <>
      <PageHeader title="Journal" subtitle="Reflections, notes and personal entries with future media support." />
      <section className="card">
        <textarea className="journal-box" placeholder="Write here... this is UI-only for now. Database connection comes later." />
      </section>
    </>
  )
}

function AIInsightsPage() {
  return (
    <>
      <PageHeader title="AI Insights & Compare" subtitle="Analyze and compare your own data with guided prompts." />
      <div className="grid two-col">
        <section className="card">
          <h2>Quick analysis prompts</h2>
          <div className="list compact-list">
            {[
              'Analyze my weight trend',
              'Compare this month vs last month spending',
              'Analyze my daily goal completion',
              'Compare exercise consistency across two weeks',
              'Compare one prayer city vs another',
            ].map((text) => <div key={text} className="list-item"><strong>{text}</strong></div>)}
          </div>
        </section>
        <section className="card">
          <h2>Custom AI compare box</h2>
          <textarea className="journal-box" placeholder="Example: Compare my March weight, finance, and workout consistency with February." />
          <button className="primary-btn disabled-btn" disabled>AI hookup comes after core app setup</button>
        </section>
      </div>
    </>
  )
}

function AnalyticsPage() {
  return (
    <>
      <PageHeader title="Analytics" subtitle="Cross-module charts and summary reporting." />
      <section className="card">
        <p className="muted">This page will combine health, finance, goals and exercise analytics from your live database.</p>
      </section>
    </>
  )
}

function SettingsPage() {
  return (
    <>
      <PageHeader title="Settings" subtitle="Profile, height, target weight, default city, currency and backups." />
      <section className="card">
        <ul className="feature-list">
          <li>Profile setup</li>
          <li>Height for BMI</li>
          <li>Target weight</li>
          <li>Default prayer city</li>
          <li>Currency</li>
          <li>Backup/export</li>
        </ul>
      </section>
    </>
  )
}

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/goals" element={<GoalsPage />} />
        <Route path="/health" element={<HealthPage />} />
        <Route path="/exercise" element={<ExercisePage />} />
        <Route path="/prayer" element={<PrayerPage />} />
        <Route path="/finance" element={<FinancePage />} />
        <Route path="/focus" element={<FocusPage />} />
        <Route path="/journal" element={<JournalPage />} />
        <Route path="/ai-insights" element={<AIInsightsPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </Layout>
  )
}
