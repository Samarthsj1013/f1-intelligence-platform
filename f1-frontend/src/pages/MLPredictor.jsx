import { useState } from 'react'
import axios from 'axios'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import RaceSelector from '../components/RaceSelector'
import DriverSelector from '../components/DriverSelector'
import { formatLapTime } from '../utils/formatTime'

const TYRE_COLORS = { SOFT:'#e10600', MEDIUM:'#ffd700', HARD:'#ffffff', INTERMEDIATE:'#00d2be', WET:'#0067ff' }

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const d = payload[0]?.payload
    return (
      <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-sm">
        <p className="text-white font-bold">Lap {label}</p>
        <p style={{ color: TYRE_COLORS[d?.Compound] || '#fff' }}>{d?.Compound} — Age: {d?.TyreAge} laps</p>
        <p className="text-zinc-400">Lap Time: {formatLapTime(d?.LapTime)}</p>
        <p className={d?.PitProbability > 60 ? 'text-red-400 font-bold' : 'text-zinc-400'}>
          Pit Probability: {d?.PitProbability}%
        </p>
        <p className="font-bold mt-1">{d?.Decision}</p>
        {d?.ActuallyPitted && <p className="text-yellow-400 font-bold">✅ Actually pitted this lap</p>}
      </div>
    )
  }
  return null
}

export default function MLPredictor() {
  const [year, setYear] = useState(2024)
  const [round, setRound] = useState('')
  const [driver, setDriver] = useState('VER')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchData = async () => {
    if (!round) return setError('Please select a race first')
    if (year >= 2026) return setError('2026 race data not available yet — no races have happened')
    setLoading(true); setError('')
    try {
      const res = await axios.get(`/api/ml-strategy/${year}/${round}/${driver}`)
      if (res.data.error) setError(res.data.error)
      else setData(res.data)
    } catch { setError('Failed to fetch') }
    setLoading(false)
  }

  return (
    <div>
      <h1 className="text-3xl font-black text-white mb-2">🤖 ML Pit Strategy Predictor</h1>
      <p className="text-zinc-400 mb-2">
        Gradient Boosting model trained on past race data predicts optimal pit stop laps.
      </p>
      <div className="bg-yellow-900/20 border border-yellow-700 rounded-xl p-3 mb-6 text-yellow-300 text-sm">
        💡 Tip: Select Round 5 or later for best results — model needs at least 4 past races to train on.
      </div>

      <div className="flex gap-4 mb-6 flex-wrap items-end">
        <div className="flex flex-col gap-1">
          <span className="text-zinc-400 text-xs">Season</span>
          <select value={year} onChange={e => { setYear(Number(e.target.value)); setRound(''); setDriver('VER') }}
            className="bg-zinc-800 text-white px-4 py-2 rounded-lg border border-zinc-700">
            {[2025, 2024, 2023, 2022].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-zinc-400 text-xs">Race (Round 5+ recommended)</span>
          <RaceSelector year={year} selectedRound={round} onSelect={setRound} />
        </div>
        <DriverSelector value={driver} onChange={setDriver} label="Driver" year={year} />
        <button onClick={fetchData}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold h-10">
          {loading ? '🤖 Training & Predicting...' : '🤖 Run ML Predictor'}
        </button>
      </div>

      {loading && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center">
          <div className="text-4xl mb-4">🤖</div>
          <div className="text-white font-semibold">Training Gradient Boosting model on past races...</div>
          <div className="text-zinc-400 text-sm mt-2">Loading telemetry from multiple races — takes 20-40 seconds</div>
        </div>
      )}

      {error && <div className="text-red-400 mb-4 bg-red-900/20 border border-red-800 rounded-xl p-4">{error}</div>}

      {data && !loading && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-white">{data.race} — {data.driver}</h2>

          <div className="grid grid-cols-4 gap-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
              <div className="text-2xl font-black text-green-400">{data.model_accuracy}%</div>
              <div className="text-zinc-400 text-xs">Prediction Accuracy</div>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
              <div className="text-2xl font-black text-white">{data.training_races}</div>
              <div className="text-zinc-400 text-xs">Races Used for Training</div>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
              <div className="text-2xl font-black text-red-400">
                {data.optimal_pit_window ? `Lap ${data.optimal_pit_window}` : 'N/A'}
              </div>
              <div className="text-zinc-400 text-xs">Optimal Pit Window</div>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
              <div className="text-2xl font-black text-yellow-400">
                {data.actual_pit_laps?.join(', ') || 'N/A'}
              </div>
              <div className="text-zinc-400 text-xs">Actual Pit Laps</div>
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h3 className="text-white font-semibold mb-1">📊 Pit Probability per Lap</h3>
            <p className="text-zinc-500 text-xs mb-4">Red dashed = 60% threshold. Yellow lines = actual pit laps.</p>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={data.lap_predictions}>
                <XAxis dataKey="Lap" stroke="#666" />
                <YAxis stroke="#666" domain={[0, 100]} tickFormatter={v => `${v}%`} />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine y={60} stroke="#e10600" strokeDasharray="5 5" />
                {data.actual_pit_laps?.map(lap => (
                  <ReferenceLine key={lap} x={lap} stroke="#ffd700" strokeDasharray="3 3" />
                ))}
                <Line type="monotone" dataKey="PitProbability" stroke="#00d2be"
                  dot={(props) => {
                    const { cx, cy, payload } = props
                    if (payload.ActuallyPitted) return <circle key={cx} cx={cx} cy={cy} r={7} fill="#ffd700" stroke="#000" strokeWidth={2} />
                    if (payload.PitProbability > 60) return <circle key={cx} cx={cx} cy={cy} r={5} fill="#e10600" />
                    return <circle key={cx} cx={cx} cy={cy} r={2} fill="#00d2be" />
                  }}
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
            <div className="flex gap-4 mt-3 text-xs text-zinc-500">
              <span>🟡 Yellow = actual pit lap</span>
              <span>🔴 Red dots = model recommends pit</span>
              <span>🩵 Teal line = pit probability</span>
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-zinc-800">
              <h3 className="text-white font-semibold">📋 Lap-by-Lap ML Decisions</h3>
            </div>
            <div className="max-h-96 overflow-y-auto">
              <table className="w-full">
                <thead className="sticky top-0 bg-zinc-900">
                  <tr className="border-b border-zinc-800">
                    <th className="text-left p-3 text-zinc-400">Lap</th>
                    <th className="text-left p-3 text-zinc-400">Compound</th>
                    <th className="text-left p-3 text-zinc-400">Tyre Age</th>
                    <th className="text-left p-3 text-zinc-400">Lap Time</th>
                    <th className="text-left p-3 text-zinc-400">Pit Prob</th>
                    <th className="text-left p-3 text-zinc-400">Decision</th>
                    <th className="text-left p-3 text-zinc-400">Actual</th>
                  </tr>
                </thead>
                <tbody>
                  {data.lap_predictions.map((p, i) => (
                    <tr key={i} className={`border-b border-zinc-800 hover:bg-zinc-800 ${p.ActuallyPitted ? 'bg-yellow-900/20' : ''}`}>
                      <td className="p-3 text-white">Lap {p.Lap}</td>
                      <td className="p-3">
                        <span style={{ color: TYRE_COLORS[p.Compound] || '#fff' }} className="font-bold text-sm">{p.Compound}</span>
                      </td>
                      <td className="p-3 text-zinc-400">{p.TyreAge} laps</td>
                      <td className="p-3 text-white font-mono">{formatLapTime(p.LapTime)}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-zinc-800 rounded-full h-1.5">
                            <div className="h-1.5 rounded-full"
                              style={{ width: `${p.PitProbability}%`, background: p.PitProbability > 60 ? '#e10600' : '#00d2be' }} />
                          </div>
                          <span className={`text-sm font-bold ${p.PitProbability > 60 ? 'text-red-400' : 'text-zinc-400'}`}>
                            {p.PitProbability}%
                          </span>
                        </div>
                      </td>
                      <td className="p-3 text-sm font-bold">{p.Decision}</td>
                      <td className="p-3">
                        {p.ActuallyPitted
                          ? <span className="text-yellow-400 font-bold">🔄 PITTED</span>
                          : <span className="text-zinc-600">—</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
