/**
 * api.js — Semua fungsi fetch ke FastAPI JudolGuard
 * ===================================================
 * Ganti BASE_URL ke URL Render/Railway saat deploy production.
 * Saat dev, Vite proxy /api/* → localhost:8000 otomatis.
 */

const BASE_URL = import.meta.env.VITE_API_URL || ''

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(err.detail || `HTTP ${res.status}`)
  }
  return res.json()
}

// ── Health Check ─────────────────────────────────────────────
export const healthCheck = () => request('/')

// ── 1. Dashboard Summary ──────────────────────────────────────
export const getDashboardSummary = () => request('/api/dashboard-summary')

// ── 2. All Accounts ───────────────────────────────────────────
export const getAccounts = ({ level, profile, limit = 100, offset = 0 } = {}) => {
  const params = new URLSearchParams()
  if (level)   params.set('level', level)
  if (profile) params.set('profile', profile)
  params.set('limit', limit)
  params.set('offset', offset)
  return request(`/api/accounts?${params}`)
}

// ── 3. Account Detail ─────────────────────────────────────────
export const getAccountDetail = (accountId) =>
  request(`/api/accounts/${encodeURIComponent(accountId)}`)

// ── 4. Recalculate Scores ─────────────────────────────────────
export const recalculateScores = (weights) =>
  request('/api/recalculate', {
    method: 'POST',
    body: JSON.stringify(weights),
  })

// ── 5. Network Graph ──────────────────────────────────────────
export const getNetworkGraph = (accountId) =>
  request(`/api/network/${encodeURIComponent(accountId)}`)

// ── 6. Predict Transaction ────────────────────────────────────
export const predictTransaction = (payload) =>
  request('/api/predict', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

// ── 7. AI Co-Pilot ────────────────────────────────────────────
export const sendCopilotMessage = ({ message, account_id, conversation }) =>
  request('/api/copilot', {
    method: 'POST',
    body: JSON.stringify({ message, account_id, conversation }),
  })

// ── 8. ETL Simulate (SSE) ─────────────────────────────────────
// Mengembalikan EventSource — caller harus listen onmessage + onerror + onclose
export const createETLStream = () =>
  new EventSource(`${BASE_URL}/api/etl-simulate`)

// ── 9. EDA Summary ────────────────────────────────────────────
export const getEDASummary = () => request('/api/eda-summary')

// ── 10. Model Metrics ─────────────────────────────────────────
export const getModelMetrics = () => request('/api/model-metrics')

// ── 11. Azure Proof ───────────────────────────────────────────
export const getAzureProof = () => request('/api/azure-proof')

// ── 12. Strategic Insights ────────────────────────────────────
export const getStrategicInsights = () => request('/api/strategic-insights')
