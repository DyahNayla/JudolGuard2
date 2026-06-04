import { useState, useEffect, useRef, useCallback } from 'react'
import './Onboarding.css'

/* ── Particle Canvas ─────────────────────────────────────────── */
function ParticleCanvas() {
  const ref = useRef(null)
  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas.getContext('2d')
    let raf, particles = []
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight }
    resize()
    window.addEventListener('resize', resize)
    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.5 + 0.3,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        a: Math.random() * 0.6 + 0.2,
        color: Math.random() > 0.5 ? '0,212,255' : '139,92,246',
      })
    }
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy
        if (p.x < 0) p.x = canvas.width
        if (p.x > canvas.width) p.x = 0
        if (p.y < 0) p.y = canvas.height
        if (p.y > canvas.height) p.y = 0
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${p.color},${p.a})`
        ctx.fill()
      })
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const d = Math.sqrt(dx * dx + dy * dy)
          if (d < 100) {
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.strokeStyle = `rgba(0,212,255,${0.08 * (1 - d / 100)})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }
      }
      raf = requestAnimationFrame(draw)
    }
    draw()
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize) }
  }, [])
  return <canvas ref={ref} className="ob-canvas" />
}

/* ── SVG Icons ───────────────────────────────────────────────── */
const EyeOpen = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
)
const EyeClosed = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
)
const LockIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
)

/* ── Phase 1: Landing ────────────────────────────────────────── */
function LandingPhase({ onConnect, onDashboard }) {
  return (
    <div className="ob-landing fade-in">
      <div className="ob-header">
        <div className="ob-logo">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <path d="M14 2L4 7v8c0 5.5 4.3 10.7 10 12 5.7-1.3 10-6.5 10-12V7L14 2z"
              stroke="#00d4ff" strokeWidth="2" fill="rgba(0,212,255,0.1)" />
          </svg>
          <span>JudolGuard</span>
        </div>
      </div>

      <div className="ob-hero">
        <h1 className="ob-hero-title">
          Enterprise Transaction<br />
          <span className="ob-gradient-text">Intelligence System</span>
        </h1>
        <p className="ob-hero-sub">Sistem Deteksi Risiko Transaksi Berbasis AI untuk Platform Digital</p>
      </div>

      <div className="ob-status-grid">
        {[
          { label: 'Waktu Aktif', icon: '●', value: '99.98%', sub: '● Operasional', subColor: '#22c55e' },
          { label: 'Sumber Data', icon: '↗', value: '847', sub: 'Terhubung ke sumber data', subColor: '#00d4ff' },
          { label: 'Model AI', icon: '●', value: 'Aktif', sub: '● Neural Net v4.2', subColor: '#a78bfa' },
        ].map(s => (
          <div className="ob-status-card" key={s.label}>
            <div className="ob-status-top">
              <span className="ob-status-label">{s.label}</span>
              <span className="ob-status-icon">{s.icon}</span>
            </div>
            <div className="ob-status-value">{s.value}</div>
            <div className="ob-status-sub" style={{ color: s.subColor }}>{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="ob-action-grid">
        <div className="ob-action-card">
          <div className="ob-action-icon" style={{ fontSize: '1.5rem', color: '#00d4ff' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#00d4ff" strokeWidth="1.5"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/></svg>
          </div>
          <h3>Hubungkan Sumber Data Cloud</h3>
          <p>Integrasikan data enterprise melalui koneksi terenkripsi yang aman</p>
          <button className="ob-btn-cyan" onClick={onConnect}>Mulai Koneksi →</button>
        </div>
        <div className="ob-action-card">
          <div className="ob-action-icon" style={{ fontSize: '1.5rem', color: '#8b5cf6' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="1.5"><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></svg>
          </div>
          <h3>Ringkasan Sistem</h3>
          <p>Akses dashboard analitik dengan deteksi ancaman berbasis AI secara real-time</p>
          <button className="ob-btn-blue" onClick={onDashboard}>Masuk Dashboard →</button>
        </div>
      </div>

      <div className="ob-footer-text">
        Platform Enterprise Terenkripsi · ISO 27001 · SOC 2 Type II
      </div>
    </div>
  )
}

/* ── Phase 2: Connect Form ───────────────────────────────────── */
function ConnectPhase({ onBack, onInitialize }) {
  const [form, setForm] = useState({ enterprise: '', container: '', accessKey: '' })
  const [showKey, setShowKey] = useState(false)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const canSubmit = form.enterprise && form.container && form.accessKey

  return (
    <div className="ob-connect fade-in">
      <button className="ob-back" onClick={onBack}>← Kembali</button>
      <div className="ob-connect-card">
        <div className="ob-connect-icon">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#00d4ff" strokeWidth="1.5"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/></svg>
        </div>
        <h2 className="ob-connect-title">Hubungkan Azure Blob Storage</h2>
        <p className="ob-connect-sub">Buat koneksi terenkripsi ke Microsoft Azure</p>

        <div className="ob-form">
          <div className="ob-field">
            <label>Nama Enterprise</label>
            <input type="text" placeholder="contoh: GoPay, BRI, OVO..." value={form.enterprise} onChange={e => set('enterprise', e.target.value)} />
          </div>
          <div className="ob-field">
            <label>Nama Container</label>
            <input type="text" placeholder="my-enterprise-container" value={form.container} onChange={e => set('container', e.target.value)} />
          </div>
          <div className="ob-field">
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><LockIcon /> Access Key / Secret</label>
            <div className="ob-input-wrap">
              <input type={showKey ? 'text' : 'password'} placeholder="••••••••••••••••••••••••••••••" value={form.accessKey} onChange={e => set('accessKey', e.target.value)} />
              <button className="ob-eye" onClick={() => setShowKey(s => !s)}>
                {showKey ? <EyeClosed /> : <EyeOpen />}
              </button>
            </div>
          </div>

          <div className="ob-encrypt-box">
            <span><LockIcon /></span>
            <div>
              <div className="ob-encrypt-title">Enkripsi End-to-End</div>
              <div className="ob-encrypt-desc">Semua kredensial dienkripsi menggunakan AES-256 dan disimpan di vault aman. Koneksi menggunakan protokol TLS 1.3.</div>
            </div>
          </div>

          <button className={`ob-btn-init${canSubmit ? '' : ' disabled'}`} onClick={() => canSubmit && onInitialize(form)} disabled={!canSubmit}>
            Mulai Koneksi Aman
          </button>
        </div>

        <div className="ob-secure-footer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          <LockIcon /> Koneksi Anda dilindungi dengan enkripsi tingkat tinggi
        </div>
      </div>
    </div>
  )
}

/* ── Phase 3: Initializing ───────────────────────────────────── */
const INIT_STEPS = [
  '[01] Menghubungkan ke Azure Blob Storage...',
  '[02] Memverifikasi kredensial akses...',
  '[03] Mengunduh data transaksi dari container...',
  '[04] Memvalidasi format dan integritas data...',
  '[05] Memuat model AI ke memori...',
  '[06] Menginisialisasi modul analisis risiko...',
  '[07] Menyiapkan koneksi Azure OpenAI...',
  '[08] Memuat konfigurasi dashboard...',
  '[09] Sistem siap digunakan ✓',
]

function InitializingPhase({ enterprise, onDone }) {
  const [pct, setPct] = useState(0)
  const [logs, setLogs] = useState([])
  const [step, setStep] = useState(0)
  const logRef = useRef(null)

  useEffect(() => {
    const interval = setInterval(() => {
      setStep(s => {
        if (s >= INIT_STEPS.length) { clearInterval(interval); return s }
        setLogs(l => [...l, INIT_STEPS[s]])
        setPct(Math.min(Math.round(((s + 1) / INIT_STEPS.length) * 100), 100))
        return s + 1
      })
    }, 600)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight
  }, [logs])

  useEffect(() => {
    if (pct === 100) { setTimeout(onDone, 1200) }
  }, [pct, onDone])

  return (
    <div className="ob-init fade-in">
      <div className="ob-gauge-wrap">
        <div className="ob-ring ob-ring-1" />
        <div className="ob-ring ob-ring-2" />
        <div className="ob-ring ob-ring-3" />
        <div className="ob-gauge-center">
          <span className="ob-gauge-pct">{pct}%</span>
        </div>
      </div>

      <h2 className="ob-init-title">Menginisialisasi Sistem</h2>
      <div className="ob-init-step">
        {logs.length > 0 && (<span>● {logs[logs.length - 1].replace(/\[\d+\] /, '')}</span>)}
      </div>

      <div className="ob-progress-track">
        <div className="ob-progress-fill" style={{ width: `${pct}%` }} />
      </div>

      <div className="ob-init-terminal" ref={logRef}>
        {logs.map((l, i) => (
          <div key={i} className={`ob-log-line${i === logs.length - 1 ? ' ob-log-active' : ' ob-log-done'}`}>
            {l} {i < logs.length - 1 ? <span style={{ color: '#22c55e' }}>✓</span> : <span className="ob-cursor" />}
          </div>
        ))}
      </div>

      <div className="ob-init-footer">
        Memproses protokol keamanan untuk {enterprise}...
      </div>
    </div>
  )
}

/* ── Root Onboarding ─────────────────────────────────────────── */
export default function Onboarding({ onEnterDashboard }) {
  const [phase, setPhase] = useState('landing')
  const [enterprise, setEnterprise] = useState('')

  const handleInitialize = useCallback((form) => {
    setEnterprise(form.enterprise)
    setPhase('init')
  }, [])

  return (
    <div className="ob-root">
      <ParticleCanvas />
      {phase === 'landing' && (
        <LandingPhase onConnect={() => setPhase('connect')} onDashboard={onEnterDashboard} />
      )}
      {phase === 'connect' && (
        <ConnectPhase onBack={() => setPhase('landing')} onInitialize={handleInitialize} />
      )}
      {phase === 'init' && (
        <InitializingPhase enterprise={enterprise} onDone={onEnterDashboard} />
      )}
    </div>
  )
}
