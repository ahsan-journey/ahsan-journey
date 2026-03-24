import { Link, useLocation } from 'react-router-dom'
import { BarChart3, Brain, CircleDollarSign, Dumbbell, HeartPulse, House, NotebookPen, Settings, TimerReset, Target, MoonStar } from 'lucide-react'

const navItems = [
  { to: '/', label: 'Dashboard', icon: House },
  { to: '/goals', label: 'Goals', icon: Target },
  { to: '/health', label: 'Health', icon: HeartPulse },
  { to: '/exercise', label: 'Exercise', icon: Dumbbell },
  { to: '/prayer', label: 'Prayer', icon: MoonStar },
  { to: '/finance', label: 'Finance', icon: CircleDollarSign },
  { to: '/focus', label: 'Focus', icon: TimerReset },
  { to: '/journal', label: 'Journal', icon: NotebookPen },
  { to: '/ai-insights', label: 'AI Insights', icon: Brain },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export default function Layout({ children }) {
  const location = useLocation()

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-badge">AJ</div>
          <div>
            <strong>Ahsan Journey</strong>
            <p>Personal life OS</p>
          </div>
        </div>

        <nav className="nav">
          {navItems.map(({ to, label, icon: Icon }) => {
            const active = location.pathname === to
            return (
              <Link key={to} to={to} className={`nav-link ${active ? 'active' : ''}`}>
                <Icon size={18} />
                <span>{label}</span>
              </Link>
            )
          })}
        </nav>
      </aside>

      <main className="main-content">{children}</main>
    </div>
  )
}
