import { useState, useEffect } from 'react'
import { healthCheck } from './api'
import Onboarding         from './components/Onboarding'
import Overview           from './components/Overview'
import ETLWizard          from './components/ETLWizard'
import RiskTable          from './components/RiskTable'
import AccountDetail      from './components/AccountDetail'
import ParameterConfig    from './components/ParameterConfig'
import NetworkGraph       from './components/NetworkGraph'
import SimulateTransaction from './components/SimulateTransaction'
import AICopilot          from './components/AICopilot'
import EDAPanel           from './components/EDAPanel'
import ModelMetrics       from './components/ModelMetrics'
import AzureProof         from './components/AzureProof'
import StrategicInsights  from './components/StrategicInsights'
import ChatbotPanel       from './components/ChatbotPanel'

const Placeholder = ({ name }) => (
  <div className="fade-in" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
    <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🚧</div>
    <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{name}</div>
    <div style={{ fontSize: '0.78rem', marginTop: '8px' }}>Komponen ini akan dibuat di tahap berikutnya</div>
  </div>
)

const NAV = [
  {
    section: 'Dashboard',
    items: [
      { id: 'overview',    label: 'Ringkasan',        badge: null },
      { id: 'etl',         label: 'ETL Pipeline',    badge: null },
    ]
  },
  {
    section: 'Analisis Akun',
    items: [
      { id: 'risk-table',  label: 'Tabel Risiko',      badge: null },
      { id: 'detail',      label: 'Detail Akun',       badge: null },
      { id: 'network',     label: 'Graf Jaringan',     badge: null },
    ]
  },
  {
    section: 'Konfigurasi',
    items: [
      { id: 'params',      label: 'Konfigurasi Parameter', badge: null },
      { id: 'simulate',    label: 'Simulasi Transaksi',    badge: null },
      { id: 'copilot',     label: 'Asisten AI',            badge: null },
    ]
  },
  {
    section: 'Panel Juri',
    items: [
      { id: 'eda',         label: 'EDA & Metodologi', badge: null },
      { id: 'model',       label: 'Metrik Model',     badge: null },
      { id: 'azure',       label: 'Bukti Azure',      badge: null },
      { id: 'insights',    label: 'Insight Strategis',badge: null },
    ]
  }
]

export default function App() {
  const [showDashboard, setShowDashboard] = useState(false)
  const [activePage, setActivePage] = useState('overview')
  const [apiStatus, setApiStatus]   = useState('connecting')
  const [apiInfo,   setApiInfo]     = useState(null)
  const [selectedAccount, setSelectedAccount] = useState(null)
  const [chatOpen, setChatOpen]     = useState(false)

  useEffect(() => {
    healthCheck()
      .then(data => {
        setApiStatus('ok')
        setApiInfo(data)
      })
      .catch(() => setApiStatus('error'))
  }, [])

  const renderPage = () => {
    switch (activePage) {
      case 'overview':  return <Overview onSelectAccount={(page, id) => { setActivePage(page); if (id) setSelectedAccount(id) }} />
      case 'etl':       return <ETLWizard />
      case 'risk-table': return (
        <RiskTable
          onSelectAccount={(id) => {
            setSelectedAccount(id)
            setActivePage('detail')
          }}
        />
      )
      case 'detail': return (
        <AccountDetail
          accountId={selectedAccount}
          onBack={() => setActivePage('risk-table')}
        />
      )
      case 'network':   return <NetworkGraph />
      case 'params':    return <ParameterConfig />
      case 'simulate':  return <SimulateTransaction />
      case 'copilot':   return <AICopilot />
      case 'eda':      return <EDAPanel />
      case 'model':    return <ModelMetrics />
      case 'azure':    return <AzureProof />
      case 'insights': return <StrategicInsights />
      default:          return <Placeholder name={activePage} />
    }
  }

  if (!showDashboard) {
    return <Onboarding onEnterDashboard={() => setShowDashboard(true)} />
  }

  return (
    <div className="app-shell">
      {/* ── Sidebar ─────────────────────────────────────────── */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <h1>JudolGuard</h1>
          <p>AI Compliance Intelligence</p>
        </div>

        <div className="sidebar-status">
          <span
            className="status-dot"
            style={{
              background: apiStatus === 'ok'    ? 'var(--low)'
                        : apiStatus === 'error' ? 'var(--critical)'
                        : 'var(--medium)',
              boxShadow: apiStatus === 'ok'    ? '0 0 6px var(--low)'
                       : apiStatus === 'error' ? '0 0 6px var(--critical)'
                       : '0 0 6px var(--medium)',
            }}
          />
          {apiStatus === 'ok'
            ? `API Online · ${apiInfo?.accounts ?? 0} akun`
            : apiStatus === 'error'
            ? 'API Offline'
            : 'Menghubungkan...'}
        </div>

        {/* Navigation */}
        {NAV.map(group => (
          <div className="sidebar-section" key={group.section}>
            <div className="sidebar-section-label">{group.section}</div>
            {group.items.map(item => (
              <button
                key={item.id}
                className={`nav-item${activePage === item.id ? ' active' : ''}`}
                onClick={() => setActivePage(item.id)}
                style={{ paddingLeft: '20px' }}
              >
                <span>{item.label}</span>
                {item.badge && <span className="nav-badge">{item.badge}</span>}
              </button>
            ))}
          </div>
        ))}

        {/* Footer */}
        <div style={{ marginTop: 'auto', padding: '12px 16px', borderTop: '1px solid var(--border)' }}>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
            <div>Azure AI Impact Challenge 2026</div>
            <div style={{ color: 'var(--brand-from)', fontWeight: 600 }}>JudolGuard v1.0</div>
          </div>
        </div>
      </aside>

      {/* ── Main Content ────────────────────────────────────── */}
      <main
        className="main-content"
        key={activePage}
        style={{ marginRight: chatOpen ? 360 : 0, transition: 'margin-right 0.35s cubic-bezier(0.4,0,0.2,1)' }}
      >
        {renderPage()}
      </main>

      {/* ── Floating Chatbot Button ──────────────────────── */}
      <button
        onClick={() => setChatOpen(prev => !prev)}
        title={chatOpen ? 'Tutup Asisten AI' : 'Buka Asisten AI'}
        style={{
          position: 'fixed',
          bottom: 28,
          right: chatOpen ? 372 : 24,
          zIndex: 200,
          width: 52,
          height: 52,
          borderRadius: '50%',
          border: 'none',
          background: chatOpen
            ? 'rgba(239,68,68,0.15)'
            : 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
          color: chatOpen ? 'var(--critical)' : '#fff',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: chatOpen ? '1.5rem' : '1.2rem',
          boxShadow: chatOpen
            ? '0 4px 20px rgba(239,68,68,0.3), 0 0 0 1px rgba(239,68,68,0.2)'
            : '0 4px 20px rgba(59,130,246,0.5), 0 0 0 1px rgba(59,130,246,0.3)',
          transition: 'all 0.35s cubic-bezier(0.4,0,0.2,1)',
        }}
      >
        {chatOpen ? '×' : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M12 2v2M2 15h2m16 0h2m-6-8a4 4 0 1 0-8 0v4h8V7z"/>
          </svg>
        )}
      </button>

      {/* ── Chatbot Slide Panel ───────────────────────────── */}
      <ChatbotPanel isOpen={chatOpen} onClose={() => setChatOpen(false)} />
    </div>
  )
}
