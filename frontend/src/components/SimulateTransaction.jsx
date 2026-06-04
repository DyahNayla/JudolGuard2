import { useState } from 'react'
import { predictTransaction } from '../api'

const CHANNELS = ['qris', 'transfer', 'ewallet', 'atm']

const RISK_COLORS = {
  Critical: '#ef4444', High: '#f97316', Medium: '#eab308', Low: '#22c55e'
}

const PRESETS = [
  {
    label: '🌙 Midnight QRIS',
    desc: 'Transaksi QRIS tengah malam, nominal kecil, frekuensi tinggi',
    values: { hour: 2, amount: 45000, channel: 'qris', tx_count_24h: 18, unique_recv_7d: 14, avg_amount_7d: 60000 }
  },
  {
    label: '🔀 Smurfing Pattern',
    desc: 'Transfer ke banyak penerima unik dengan nominal hampir sama',
    values: { hour: 23, amount: 490000, channel: 'transfer', tx_count_24h: 22, unique_recv_7d: 20, avg_amount_7d: 300000 }
  },
  {
    label: '📊 Normal Transaction',
    desc: 'Transaksi wajar di jam kerja, nominal normal',
    values: { hour: 10, amount: 150000, channel: 'ewallet', tx_count_24h: 2, unique_recv_7d: 3, avg_amount_7d: 200000 }
  },
  {
    label: '⚡ Burst Activity',
    desc: 'Aktivitas mendadak melonjak setelah lama dormant',
    values: { hour: 1, amount: 95000, channel: 'qris', tx_count_24h: 30, unique_recv_7d: 8, avg_amount_7d: 50000 }
  },
]

// Gauge SVG
function RiskGauge({ score, level }) {
  const color = RISK_COLORS[level] || '#4b5563'
  const angle = -135 + (score / 100) * 270
  const r = 70, cx = 90, cy = 90
  const toRad = deg => deg * Math.PI / 180
  const arcX = cx + r * Math.cos(toRad(angle))
  const arcY = cy + r * Math.sin(toRad(angle))

  // Arc path
  const startAngle = -135, endAngle = 135
  const startX = cx + r * Math.cos(toRad(startAngle))
  const startY = cy + r * Math.sin(toRad(startAngle))
  const endX   = cx + r * Math.cos(toRad(endAngle))
  const endY   = cy + r * Math.sin(toRad(endAngle))

  const scoreAngle = -135 + (score / 100) * 270
  const sweepX = cx + r * Math.cos(toRad(scoreAngle))
  const sweepY = cy + r * Math.sin(toRad(scoreAngle))
  const largeArc = score > 55 ? 1 : 0

  return (
    <svg viewBox="0 0 180 130" style={{ width: '100%', maxWidth: 220 }}>
      {/* Track */}
      <path
        d={`M ${startX} ${startY} A ${r} ${r} 0 1 1 ${endX} ${endY}`}
        fill="none" stroke="var(--bg-hover)" strokeWidth="10" strokeLinecap="round"
      />
      {/* Filled arc */}
      {score > 0 && (
        <path
          d={`M ${startX} ${startY} A ${r} ${r} 0 ${largeArc} 1 ${sweepX} ${sweepY}`}
          fill="none" stroke={color} strokeWidth="10" strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 6px ${color}80)` }}
        />
      )}
      {/* Needle tip */}
      <circle cx={arcX} cy={arcY} r={6} fill={color}
        style={{ filter: `drop-shadow(0 0 4px ${color})` }} />
      {/* Score */}
      <text x={cx} y={cy + 8} textAnchor="middle"
        fill={color} fontSize="26" fontWeight="900" fontFamily="Inter, sans-serif">
        {score}
      </text>
      <text x={cx} y={cy + 26} textAnchor="middle"
        fill="var(--text-muted)" fontSize="10" fontFamily="Inter, sans-serif">
        /100
      </text>
      {/* Labels */}
      <text x={startX - 4} y={startY + 14} textAnchor="middle"
        fill="var(--text-muted)" fontSize="9">0</text>
      <text x={endX + 4} y={endY + 14} textAnchor="middle"
        fill="var(--text-muted)" fontSize="9">100</text>
    </svg>
  )
}

function FormField({ label, children, hint }) {
  return (
    <div>
      <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>
        {label}
      </label>
      {children}
      {hint && <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', marginTop: 3 }}>{hint}</div>}
    </div>
  )
}

export default function SimulateTransaction() {
  const [form, setForm] = useState({
    hour:          2,
    amount:        50000,
    channel:       'qris',
    tx_count_24h:  12,
    unique_recv_7d:15,
    avg_amount_7d: 80000,
  })
  const [result,  setResult]  = useState(null)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)
  const [history, setHistory] = useState([])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const applyPreset = (preset) => {
    setForm(preset.values)
    setResult(null)
  }

  const predict = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await predictTransaction({
        hour:          Number(form.hour),
        amount:        Number(form.amount),
        channel:       form.channel,
        tx_count_24h:  Number(form.tx_count_24h),
        unique_recv_7d:Number(form.unique_recv_7d),
        avg_amount_7d: Number(form.avg_amount_7d),
      })
      setResult(res)
      // Simpan ke history (max 5)
      setHistory(h => [{
        ...res,
        input: { ...form },
        time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
      }, ...h].slice(0, 5))
    } catch(e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const isNight = form.hour >= 22 || form.hour <= 4

  return (
    <div className="fade-in">
      <div className="page-header">
        <h2>⚡ Real-Time Transaction Simulator</h2>
        <p>Prediksi skor risiko transaksi baru secara instan — demo interaktif untuk juri</p>
      </div>

      {/* ── Quick presets ─────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginBottom: 16 }}>
        {PRESETS.map(p => (
          <button
            key={p.label}
            onClick={() => applyPreset(p)}
            style={{
              padding: '10px 12px', borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-md)', background: 'var(--bg-card)',
              cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--brand-from)'; e.currentTarget.style.background = 'rgba(59,130,246,0.08)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-md)'; e.currentTarget.style.background = 'var(--bg-card)' }}
          >
            <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 3 }}>{p.label}</div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>{p.desc}</div>
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 16 }}>
        {/* ── Left: Form ────────────────────────────────────────── */}
        <div className="card">
          <div className="card-title">📝 Input Transaksi</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <FormField label="⏰ Jam Transaksi (0–23)" hint={isNight ? '🌙 Jam malam terdeteksi' : ''}>
              <input
                className="input"
                type="number" min={0} max={23}
                value={form.hour}
                onChange={e => set('hour', e.target.value)}
                style={{ borderColor: isNight ? 'rgba(239,68,68,0.5)' : undefined }}
              />
            </FormField>

            <FormField label="💰 Nominal (Rp)">
              <input
                className="input"
                type="number" min={0}
                value={form.amount}
                onChange={e => set('amount', e.target.value)}
                placeholder="50000"
              />
            </FormField>

            <FormField label="📱 Channel">
              <select className="input" value={form.channel} onChange={e => set('channel', e.target.value)}>
                {CHANNELS.map(c => (
                  <option key={c} value={c}>{c.toUpperCase()}</option>
                ))}
              </select>
            </FormField>

            <FormField label="🔢 Tx count 24h">
              <input
                className="input"
                type="number" min={0}
                value={form.tx_count_24h}
                onChange={e => set('tx_count_24h', e.target.value)}
              />
            </FormField>

            <FormField label="👥 Unique Receivers 7d">
              <input
                className="input"
                type="number" min={0}
                value={form.unique_recv_7d}
                onChange={e => set('unique_recv_7d', e.target.value)}
              />
            </FormField>

            <FormField label="📊 Avg Amount 7d (Rp)">
              <input
                className="input"
                type="number" min={0}
                value={form.avg_amount_7d}
                onChange={e => set('avg_amount_7d', e.target.value)}
              />
            </FormField>
          </div>

          {/* Visualisasi input */}
          <div style={{ marginTop: 14, padding: '10px 14px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: 6 }}>Preview indikator risiko input:</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {isNight && <span className="chip" style={{ color: 'var(--critical)', borderColor: 'rgba(239,68,68,0.3)' }}>🌙 Jam Malam</span>}
              {form.channel === 'qris' && <span className="chip" style={{ color: 'var(--high)', borderColor: 'rgba(249,115,22,0.3)' }}>📱 QRIS</span>}
              {form.tx_count_24h > 10 && <span className="chip" style={{ color: 'var(--medium)', borderColor: 'rgba(234,179,8,0.3)' }}>⚡ High Freq</span>}
              {form.unique_recv_7d > 10 && <span className="chip" style={{ color: 'var(--high)', borderColor: 'rgba(249,115,22,0.3)' }}>👥 Multi-Recv</span>}
              {form.amount > 0 && form.avg_amount_7d > 0 && form.amount / form.avg_amount_7d > 1.5 && (
                <span className="chip" style={{ color: 'var(--critical)', borderColor: 'rgba(239,68,68,0.3)' }}>💸 Anomali Nominal</span>
              )}
            </div>
          </div>

          <button
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', marginTop: 14, padding: '13px' }}
            onClick={predict}
            disabled={loading}
          >
            {loading
              ? <><span className="spinner" style={{ width: 14, height: 14 }} /> Memprediksi...</>
              : '🚀 Prediksi Risiko Sekarang'}
          </button>

          {error && (
            <div style={{ marginTop: 10, padding: '10px 14px', background: 'var(--critical-bg)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius-sm)', color: 'var(--critical)', fontSize: '0.78rem' }}>
              ⚠️ {error}
            </div>
          )}
        </div>

        {/* ── Right: Result ─────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {!result ? (
            <div className="card" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: '3rem', marginBottom: 12 }}>⚡</div>
                <div style={{ fontSize: '0.82rem' }}>Isi form di sebelah kiri<br />atau pilih preset, lalu klik Prediksi</div>
              </div>
            </div>
          ) : (
            <>
              {/* Gauge + Level */}
              <div className="card" style={{ textAlign: 'center' }}>
                <div className="card-title">Hasil Prediksi</div>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <RiskGauge score={result.risk_score} level={result.risk_level} />
                </div>
                <div style={{ marginTop: -10, marginBottom: 10 }}>
                  <span className={`risk-badge ${result.risk_level}`} style={{ fontSize: '0.85rem', padding: '5px 16px' }}>
                    {result.risk_level}
                  </span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: 6 }}>
                  {result.archetype}
                </div>
                <div style={{
                  padding: '10px 14px', borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-surface)', fontSize: '0.75rem',
                  color: 'var(--text-secondary)', lineHeight: 1.6
                }}>
                  {result.recommendation}
                </div>
              </div>

              {/* Key triggers */}
              <div className="card">
                <div className="card-title">🔑 Key Triggers</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {Object.entries(result.key_triggers).map(([k, v]) => {
                    const labels = {
                      is_night:    { label: 'Jam Malam', fmt: v => v ? '✅ Ya' : '—' },
                      burst_score: { label: 'Burst Score', fmt: v => v.toFixed(2) },
                      qris_ratio:  { label: 'QRIS Ratio',  fmt: v => `${(v*100).toFixed(0)}%` },
                      amt_vs_avg:  { label: 'Nominal vs Avg', fmt: v => `${v.toFixed(2)}×` },
                    }
                    const cfg = labels[k]
                    const isHigh = (k === 'is_night' && v) || (k === 'burst_score' && v > 3) ||
                                   (k === 'qris_ratio' && v > 0.6) || (k === 'amt_vs_avg' && v > 1.5)
                    return (
                      <div key={k} style={{
                        padding: '8px 10px',
                        background: isHigh ? 'rgba(239,68,68,0.08)' : 'var(--bg-surface)',
                        borderRadius: 'var(--radius-sm)', border: `1px solid ${isHigh ? 'rgba(239,68,68,0.2)' : 'var(--border)'}`,
                      }}>
                        <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>{cfg?.label || k}</div>
                        <div style={{ fontWeight: 700, fontSize: '0.85rem', color: isHigh ? 'var(--critical)' : 'var(--text-primary)', marginTop: 2 }} className="mono">
                          {cfg?.fmt(v) ?? String(v)}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </>
          )}

          {/* History */}
          {history.length > 0 && (
            <div className="card">
              <div className="card-title">📋 Riwayat Prediksi</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {history.map((h, i) => (
                  <div key={i} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '6px 10px', background: 'var(--bg-surface)',
                    borderRadius: 6, fontSize: '0.72rem',
                  }}>
                    <span style={{ color: 'var(--text-muted)' }}>{h.time} · {h.input.channel.toUpperCase()} · Jam {h.input.hour}</span>
                    <span className={`risk-badge ${h.risk_level}`}>{h.risk_score} — {h.risk_level}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
