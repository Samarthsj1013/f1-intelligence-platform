import { useState } from 'react'
import axios from 'axios'
import RaceSelector from '../components/RaceSelector'
import DriverSelector from '../components/DriverSelector'
import { formatLapTime } from '../utils/formatTime'

const TYRE_COLORS = {
  SOFT: '#e10600', MEDIUM: '#ffd700', HARD: '#ffffff',
  INTERMEDIATE: '#00d2be', WET: '#0067ff',
}

export default function AIStrategy() {
  const [year, setYear] = useState(2024)
  const [round, setRound] = useState('')
  const [driver, setDriver] = useState('VER')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchData = async () => {
    if (!round) return setError('Please select a race first')
    setLoading(true)
    setError('')
    try {
      const res = await axios.get(`/api/ai-strategy/${year}/${round}/${driver}`)
      if (res.data.error) setError(res.data.error)
      else setData(res.data)
    } catch { setError('Failed to fetch') }
    setLoading(false)
  }

  return (
    <div>
      <h1 className="text-3xl font-black text-white mb-2">🧠 AI Strategy Analyst</h1>
      <p className="text-zinc-400 mb-6">AI analyzes a driver's race strategy and tells you what worked, what didn't, and what the optimal strategy would have been.</p>

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
        <DriverSelector value={driver} onChange={setDriver} label="Driver" />
        <button onClick={fetchData}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold h-10">
          {loading ? 'AI Analyzing...' : '🧠 Analyze Strategy'}
        </button>
      </div>

      {error && <div className="text-red-400 mb-4">{error}</div>}

      {loading && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center">
          <div className="text-4xl mb-4">🧠</div>
          <div className="text-white font-semibold">AI is analyzing strategy data...</div>
          <div className="text-zinc-400 text-sm mt-2">This may take 10-15 seconds</div>
        </div>
      )}

      {data && !loading && (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-white">{data.race} — {data.driver}</h2>
            <span className="text-zinc-400">Finished P{data.finish_position}</span>
          </div>

          {/* Tyre Stints */}
          <div className="grid grid-cols-3 gap-4">
            {data.tyre_stints?.map((t, i) => (
              <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-3 h-3 rounded-full" style={{ background: TYRE_COLORS[t.Compound] || '#fff' }} />
                  <span style={{ color: TYRE_COLORS[t.Compound] || '#fff' }} className="font-black text-lg">
                    {t.Compound}
                  </span>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Laps</span>
                    <span className="text-white font-bold">{t.Laps}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Avg Lap</span>
                    <span className="text-white font-bold">{formatLapTime(t.AvgLapTime)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Best Lap</span>
                    <span className="text-green-400 font-bold">{formatLapTime(t.MinLapTime)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pit Stop Laps */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <h3 className="text-white font-semibold mb-3">⏱️ Pit Stop Laps</h3>
            <div className="flex gap-2 flex-wrap">
              {data.pit_laps?.map((lap, i) => (
                <span key={i} className="bg-red-900/30 text-red-400 border border-red-800 px-3 py-1 rounded-lg text-sm font-bold">
                  Lap {lap}
                </span>
              ))}
              {data.pit_laps?.length === 0 && <span className="text-zinc-400">No pit stops recorded</span>}
            </div>
          </div>

          {/* AI Analysis */}
          <div className="bg-zinc-900 border border-red-900 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🧠</span>
              <h3 className="text-white font-black text-lg">AI Strategy Analysis</h3>
              <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-1 rounded">Powered by Claude AI</span>
            </div>
            <div className="text-zinc-300 leading-relaxed whitespace-pre-wrap text-sm">
              {data.ai_analysis}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}