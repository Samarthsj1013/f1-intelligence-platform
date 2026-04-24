import { useState } from 'react'
import axios from 'axios'
import RaceSelector from '../components/RaceSelector'
import DriverSelector from '../components/DriverSelector'
import { formatLapTime } from '../utils/formatTime'

const TYRE_COLORS = { SOFT:'#e10600', MEDIUM:'#ffd700', HARD:'#ffffff', INTERMEDIATE:'#00d2be', WET:'#0067ff' }

export default function DecisionEngine() {
  const [year, setYear] = useState(2024)
  const [round, setRound] = useState('')
  const [driver, setDriver] = useState('VER')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchData = async () => {
    if (!round) return setError('Please select a race first')
    setLoading(true); setError('')
    try {
      const res = await axios.get(`/api/decision-engine/${year}/${round}/${driver}`)
      if (res.data.error) setError(res.data.error)
      else setData(res.data)
    } catch { setError('Failed to fetch') }
    setLoading(false)
  }

  return (
    <div>
      <h1 className="text-3xl font-black text-white mb-2">⚡ Strategy Decision Engine</h1>
      <p className="text-zinc-400 mb-6">
        Real-time style decisions — Pit NOW, Stay Out, or Consider Pitting — based on tyre degradation rate, lap delta and track conditions.
      </p>

      <div className="flex gap-4 mb-6 flex-wrap items-end">
        <div className="flex flex-col gap-1">
          <span className="text-zinc-400 text-xs">Season</span>
          <select value={year} onChange={e => { setYear(Number(e.target.value)); setRound('') }}
            className="bg-zinc-800 text-white px-4 py-2 rounded-lg border border-zinc-700">
            {[2025, 2024, 2023, 2022].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-zinc-400 text-xs">Race</span>
          <RaceSelector year={year} selectedRound={round} onSelect={setRound} />
        </div>
        <DriverSelector value={driver} onChange={setDriver} label="Driver" year={year} />
        <button onClick={fetchData}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold h-10">
          {loading ? 'Analyzing...' : '⚡ Get Decisions'}
        </button>
      </div>

      {error && <div className="text-red-400 mb-4">{error}</div>}

      {data && (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-white">{data.race} — {data.driver}</h2>
            <span className="text-zinc-400">Finished P{data.finish_position}</span>
            <span className="text-zinc-400">Track: {data.track_temp}°C</span>
          </div>

          {/* Temperature Warning */}
          {data.temp_warning && (
            <div className="bg-orange-900/30 border border-orange-700 rounded-xl p-4">
              <p className="text-orange-300 font-semibold">{data.temp_warning}</p>
            </div>
          )}

          {/* Strategic Recommendation */}
          <div className="bg-red-900/20 border border-red-700 rounded-xl p-6">
            <h3 className="text-red-400 font-black text-lg mb-2">🎯 STRATEGIC RECOMMENDATION</h3>
            <p className="text-white text-lg font-semibold">{data.strategic_recommendation}</p>
          </div>

          {/* Decisions */}
          <div className="space-y-3">
            <h3 className="text-white font-semibold">⚡ Per-Compound Decisions</h3>
            {data.decisions.map((d, i) => (
              <div key={i} className={`rounded-xl p-5 border ${
                d.Type.includes('CRITICAL') ? 'bg-red-900/20 border-red-700' :
                d.Type.includes('WARNING') ? 'bg-yellow-900/20 border-yellow-700' :
                'bg-green-900/20 border-green-700'
              }`}>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{d.Type.split(' ')[0]}</span>
                  <div>
                    <div className={`font-black ${
                      d.Type.includes('CRITICAL') ? 'text-red-400' :
                      d.Type.includes('WARNING') ? 'text-yellow-400' : 'text-green-400'
                    }`}>{d.Type}</div>
                    <div className="text-white">{d.Decision}</div>
                    <div className="text-zinc-500 text-sm">Confidence: {d.Confidence}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Compound Details */}
          <div className="grid grid-cols-2 gap-4">
            {data.compounds.map((c, i) => (
              <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-3 h-3 rounded-full" style={{ background: TYRE_COLORS[c.Compound] || '#fff' }} />
                  <span style={{ color: TYRE_COLORS[c.Compound] || '#fff' }} className="font-black text-lg">{c.Compound}</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Laps Run</span>
                    <span className="text-white font-bold">{c.Laps}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Degradation Rate</span>
                    <span className={`font-bold ${c.DegRate > 0.08 ? 'text-red-400' : c.DegRate > 0.05 ? 'text-yellow-400' : 'text-green-400'}`}>
                      +{c.DegRate}s/lap
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Best Lap</span>
                    <span className="text-green-400 font-bold">{formatLapTime(c.BestLap)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Last Lap</span>
                    <span className="text-white font-bold">{formatLapTime(c.LastLap)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Time Lost vs Best</span>
                    <span className={`font-bold ${c.LapLoss > 1.5 ? 'text-red-400' : c.LapLoss > 0.5 ? 'text-yellow-400' : 'text-green-400'}`}>
                      +{c.LapLoss}s
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}