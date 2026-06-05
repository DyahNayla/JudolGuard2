import { useState, useEffect } from 'react'
import { getAccountDetail, sendCopilotMessage } from '../api'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts'

const PROFILE_LABELS = {
  normal:        { label: 'Normal',        color: '#22c55e' },
  early_stage:   { label: 'Early Stage',   color: '#eab308' },
  escalating:    { label: 'Escalating',    color: '#f97316' },
  heavy_gambler: { label: 'Heavy Gambler', color: '#ef4444' },
}

function StatCard({ label, value, sub, color }) {
  return (
    <div style={{
      background: 'var(--bg-surface)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md)', padding: '14px',
    }}>
      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {label}
      </div>
      <div style={{ fontSize: '1.4rem', fontWeight: 800, color: color || 'var(--text-primary)', marginTop: 4 }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 2 }}>{sub}</div>}
    </div>
  )
}

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--border-md)',
      borderRadius: 8, padding: '10px 14px', fontSize: '0.72rem'
    }}>
      <div style={{ color: 'var(--text-muted)', marginBottom: 6 }}>Day {label}</div>
      {payload.map(p => (
        <div key={p.dataKey} style={{ color: p.color, display: 'flex', gap: 8 }}>
          <span>{p.name}:</span>
          <span style={{ fontWeight: 700 }}>{typeof p.value === 'number' ? p.value.toFixed(2) : p.value}</span>
        </div>
      ))}
    </div>
  )
}

/* ── Typing dots for AI loading ──────────────────────────────── */
function TypingDots() {
  return (
    <span style={{ display: 'inline-flex', gap: 3, alignItems: 'center', marginLeft: 6 }}>
      {[0,1,2].map(i => (
        <span key={i} style={{
          width: 5, height: 5, borderRadius: '50%',
          background: '#00d4ff',
          animation: `typing-dot 1.2s ${i*0.2}s ease-in-out infinite`,
          display: 'inline-block',
        }} />
      ))}
    </span>
  )
}

/* ── AI Generate Panel ───────────────────────────────────────── */
function AIGeneratePanel({ accountId, accountData }) {
  const [mode, setMode]       = useState(null) // 'overview' | 'solution' | null
  const [result, setResult]   = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)

  const generate = async (type) => {
    setMode(type)
    setResult(null)
    setError(null)
    setLoading(true)

    const prompts = {
      overview: `Berikan OVERVIEW SINGKAT untuk akun ${accountId}:
- Risk Score: ${accountData.final_risk_score}/100
- Risk Level: ${accountData.risk_level}
- Profile: ${accountData.profile}
- Archetype: ${accountData.archetype}
- Night Ratio: ${((accountData.avg_night_ratio||0)*100).toFixed(0)}%
- Burst Score: ${(accountData.avg_burst_score||0).toFixed(1)}
- Unique Recipients/7d: ${(accountData.avg_unique_recv||0).toFixed(0)}
- QRIS Ratio: ${((accountData.avg_qris_ratio||0)*100).toFixed(0)}%
Berikan analisis overview dalam 3-4 kalimat singkat dan padat tentang profil risiko akun ini.`,

      solution: `Berikan REKOMENDASI TINDAKAN KONKRET untuk compliance officer dalam menangani akun ${accountId}:
- Risk Score: ${accountData.final_risk_score}/100
- Risk Level: ${accountData.risk_level}
- Profile: ${accountData.profile}
- Archetype: ${accountData.archetype}
- Top Triggers: ${accountData.top_triggers || '-'}
Berikan 3-5 langkah tindakan spesifik yang harus dilakukan, dengan urutan prioritas dari yang paling mendesak.`,
    }

    try {
      const res = await sendCopilotMessage({
        message: prompts[type],
        account_id: accountId,
        conversation: [],
      })
      setResult(res.reply)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(0,212,255,0.04), rgba(139,92,246,0.04))',
      border: '1px solid rgba(0,212,255,0.15)',
      borderRadius: 'var(--radius-lg)',
      padding: '18px 20px',
      marginBottom: 16,
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* AI sparkle icon */}
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: 'linear-gradient(135deg, rgba(0,212,255,0.2), rgba(139,92,246,0.2))',
            border: '1px solid rgba(0,212,255,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#00d4ff',
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </div>
          <div>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#00d4ff' }}>AI Generate</div>
            <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>Powered by Azure OpenAI GPT-4o</div>
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => generate('overview')}
            disabled={loading}
            style={{
              padding: '6px 14px',
              borderRadius: 20,
              border: `1px solid ${mode === 'overview' ? '#00d4ff' : 'rgba(0,212,255,0.25)'}`,
              background: mode === 'overview' ? 'rgba(0,212,255,0.12)' : 'transparent',
              color: '#00d4ff',
              fontSize: '0.72rem', fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
              transition: 'all 0.2s ease',
              fontFamily: 'var(--font-sans)',
            }}
          >
            ◎ Overview
          </button>
          <button
            onClick={() => generate('solution')}
            disabled={loading}
            style={{
              padding: '6px 14px',
              borderRadius: 20,
              border: `1px solid ${mode === 'solution' ? '#8b5cf6' : 'rgba(139,92,246,0.25)'}`,
              background: mode === 'solution' ? 'rgba(139,92,246,0.12)' : 'transparent',
              color: '#a78bfa',
              fontSize: '0.72rem', fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
              transition: 'all 0.2s ease',
              fontFamily: 'var(--font-sans)',
            }}
          >
            ◆ Solution
          </button>
        </div>
      </div>

      {/* Output area */}
      {!mode && !result && (
        <div style={{
          padding: '20px',
          textAlign: 'center',
          color: 'var(--text-muted)',
          fontSize: '0.78rem',
          border: '1px dashed rgba(255,255,255,0.08)',
          borderRadius: 10,
        }}>
          Click <strong style={{ color: '#00d4ff' }}>Overview</strong> for an AI summary of this account, or{' '}
          <strong style={{ color: '#a78bfa' }}>Solution</strong> for recommended compliance actions.
        </div>
      )}

      {loading && (
        <div style={{
          padding: '20px',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          fontSize: '0.78rem', color: 'var(--text-muted)',
        }}>
          <div className="spinner" style={{ width: 14, height: 14, borderWidth: 1.5 }} />
          Generating AI {mode}... <TypingDots />
        </div>
      )}

      {error && (
        <div style={{
          padding: '12px 16px',
          background: 'rgba(239,68,68,0.08)',
          border: '1px solid rgba(239,68,68,0.2)',
          borderRadius: 8,
          fontSize: '0.75rem', color: 'var(--critical)',
        }}>
          ⚠ {error}
        </div>
      )}

      {result && !loading && (
        <div style={{
          padding: '14px 16px',
          background: mode === 'overview'
            ? 'rgba(0,212,255,0.05)'
            : 'rgba(139,92,246,0.05)',
          border: `1px solid ${mode === 'overview' ? 'rgba(0,212,255,0.15)' : 'rgba(139,92,246,0.15)'}`,
          borderRadius: 10,
          fontSize: '0.78rem',
          color: 'var(--text-primary)',
          lineHeight: 1.75,
          whiteSpace: 'pre-wrap',
          position: 'relative',
        }}>
          <div style={{
            fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em',
            color: mode === 'overview' ? '#00d4ff' : '#a78bfa',
            marginBottom: 8,
          }}>
            {mode === 'overview' ? '◎ AI Overview' : '◆ AI Solution'}
          </div>
          {result}
          {/* Re-generate button */}
          <button
            onClick={() => generate(mode)}
            style={{
              marginTop: 10, display: 'block',
              fontSize: '0.62rem', color: 'var(--text-muted)',
              background: 'transparent', border: 'none',
              cursor: 'pointer', textDecoration: 'underline',
              fontFamily: 'var(--font-sans)',
            }}
          >
            ↺ Regenerate
          </button>
        </div>
      )}
    </div>
  )
}

/* ── Main AccountDetail Component ────────────────────────────── */
export default function AccountDetail({ accountId, onBack }) {
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  useEffect(() => {
    if (!accountId) return
    setLoading(true)
    setError(null)
    getAccountDetail(accountId)
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [accountId])

  if (!accountId) return (
    <div className="empty-state fade-in">
      <div className="icon" style={{ fontSize: '2.5rem' }}>—</div>
      <p>Select an account from the Risk Table to view details</p>
    </div>
  )

  if (loading) return (
    <div className="loading-state fade-in">
      <div className="spinner" />
      <span>Loading <strong style={{ color: 'var(--brand-from)' }}>{accountId}</strong>...</span>
    </div>
  )

  if (error) return (
    <div className="empty-state fade-in">
      <div className="icon" style={{ fontSize: '2.5rem' }}>⚠</div>
      <p style={{ color: 'var(--critical)' }}>{error}</p>
      <button className="btn btn-ghost" style={{ marginTop: 12 }} onClick={onBack}>← Back</button>
    </div>
  )

  const score      = data.final_risk_score
  const level      = data.risk_level
  const prof       = PROFILE_LABELS[data.profile]
  const scoreColor = score >= 81 ? '#ef4444' : score >= 61 ? '#f97316' : score >= 31 ? '#eab308' : '#22c55e'

  const timeline = (data.timeline || []).map(t => ({
    ...t,
    amount_k: t.amount != null ? Math.round(t.amount / 1000) : null,
  }))

  return (
    <div className="fade-in">
      {/* ── Header ─────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 18, flexWrap: 'wrap' }}>
        {onBack && (
          <button className="btn btn-ghost" onClick={onBack} style={{ flexShrink: 0, marginTop: 2 }}>
            ← Back
          </button>
        )}
        <div className="page-header" style={{ margin: 0, flex: 1 }}>
          <h2 className="mono">{accountId}</h2>
          <p>Full risk profile — multi-dimensional behavioral analysis</p>
        </div>
        {/* Risk score badge */}
        <div style={{
          flexShrink: 0, textAlign: 'center', padding: '10px 18px',
          background: `${scoreColor}15`, border: `1px solid ${scoreColor}40`,
          borderRadius: 'var(--radius-lg)',
        }}>
          <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Risk Score
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 900, color: scoreColor, lineHeight: 1.1 }}>
            {score}
          </div>
          <span className={`risk-badge ${level}`} style={{ marginTop: 4 }}>{level}</span>
        </div>
      </div>

      {/* ── AI Generate Panel ──────────────────────────────────── */}
      <AIGeneratePanel accountId={accountId} accountData={data} />

      {/* ── Profile + Recommendation ───────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
        <div className="card" style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
          <div style={{
            width: 44, height: 44, borderRadius: '50%',
            background: `${prof?.color || '#4b5563'}20`,
            border: `2px solid ${prof?.color || '#4b5563'}40`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.1rem', fontWeight: 800, color: prof?.color || 'var(--text-muted)',
          }}>
            {(prof?.label || 'N')[0]}
          </div>
          <div>
            <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Behavioral Profile</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: prof?.color || 'var(--text-primary)', marginTop: 2 }}>
              {prof?.label || data.profile}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: 3 }}>
              {data.archetype || '—'}
            </div>
          </div>
        </div>

        <div className="card">
          <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 6 }}>
            Recommended Action
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-primary)', lineHeight: 1.6 }}>
            {data.recommendation || '—'}
          </div>
        </div>
      </div>

      {/* ── Behavioral Stats ───────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 16 }}>
        <StatCard
          label="Night Ratio"
          value={data.avg_night_ratio != null ? `${(data.avg_night_ratio * 100).toFixed(0)}%` : '—'}
          sub="Transactions 22:00–04:00"
          color={data.avg_night_ratio > 0.5 ? '#ef4444' : undefined}
        />
        <StatCard
          label="Temporal Shift"
          value={data.avg_temporal_shift != null ? `${data.avg_temporal_shift > 0 ? '+' : ''}${Number(data.avg_temporal_shift).toFixed(3)}` : '—'}
          sub="Activity time shift"
          color={data.avg_temporal_shift > 0.1 ? '#f97316' : undefined}
        />
        <StatCard
          label="Burst Score"
          value={data.avg_burst_score != null ? Number(data.avg_burst_score).toFixed(1) : '—'}
          sub="Transaction burst/24h"
          color={data.avg_burst_score > 3 ? '#eab308' : undefined}
        />
        <StatCard
          label="Unique Recipients/7d"
          value={data.avg_unique_recv != null ? Number(data.avg_unique_recv).toFixed(0) : '—'}
          sub="Multi-recipient pattern"
          color={data.avg_unique_recv > 10 ? '#f97316' : undefined}
        />
        <StatCard
          label="QRIS Ratio"
          value={data.avg_qris_ratio != null ? `${(data.avg_qris_ratio * 100).toFixed(0)}%` : '—'}
          sub="QRIS transaction share"
          color={data.avg_qris_ratio > 0.6 ? '#ef4444' : undefined}
        />
        <StatCard
          label="Transactions/24h"
          value={data.avg_tx_24h != null ? Number(data.avg_tx_24h).toFixed(1) : '—'}
          sub="Average daily transactions"
        />
      </div>

      {/* ── Top Triggers ───────────────────────────────────────── */}
      {data.top_triggers && data.top_triggers !== '—' && (
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="card-title">Top Risk Triggers</div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            {data.top_triggers}
          </div>
        </div>
      )}

      {/* ── AI Explanation (from backend) ──────────────────────── */}
      {data.explanation && (
        <div className="card" style={{ marginBottom: 16, background: 'rgba(0,120,212,0.06)', border: '1px solid rgba(0,120,212,0.2)' }}>
          <div className="card-title" style={{ color: '#0078d4' }}>Azure OpenAI — Risk Explanation</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
            {data.explanation}
          </div>
        </div>
      )}

      {/* ── Timeline Chart ─────────────────────────────────────── */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div className="card-title" style={{ margin: 0 }}>Behavioral Timeline</div>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
            {timeline.length} daily snapshots
          </span>
        </div>

        {timeline.length === 0 ? (
          <div className="empty-state" style={{ padding: '32px' }}>
            <p>Timeline data not available for this account</p>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 8 }}>
                Temporal Shift & Night Ratio (7 Days)
              </div>
              <ResponsiveContainer width="100%" height={160}>
                <LineChart data={timeline} margin={{ top: 4, right: 12, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="day" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '0.7rem', color: 'var(--text-muted)' }} />
                  <Line type="monotone" dataKey="temporal_shift" name="Temporal Shift"
                    stroke="#f97316" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="night_ratio_7d" name="Night Ratio 7d"
                    stroke="#8b5cf6" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 8 }}>
                Transactions Frequency & Burst Score
              </div>
              <ResponsiveContainer width="100%" height={160}>
                <LineChart data={timeline} margin={{ top: 4, right: 12, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="day" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '0.7rem', color: 'var(--text-muted)' }} />
                  <Line type="monotone" dataKey="tx_count_24h" name="Transactions/24h"
                    stroke="#3b82f6" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="burst_score" name="Burst Score"
                    stroke="#ef4444" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 8 }}>
                Transaction Amount (in Rp thousands)
              </div>
              <ResponsiveContainer width="100%" height={160}>
                <LineChart data={timeline} margin={{ top: 4, right: 12, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="day" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltip />} />
                  <Line type="monotone" dataKey="amount_k" name="Amount (Rp K)"
                    stroke="#22c55e" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
