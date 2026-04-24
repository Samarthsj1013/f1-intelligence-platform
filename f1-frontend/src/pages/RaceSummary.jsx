import { useState } from 'react'
import axios from 'axios'
import RaceSelector from '../components/RaceSelector'

const TYRE_COLORS = { SOFT:'#e10600', MEDIUM:'#ffd700', HARD:'#fff', INTERMEDIATE:'#00d2be', WET:'#0067ff' }

export default function RaceSummary() {
  const [year, setYear] = useState(2024)
  const [round, setRound] = useState('')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchData = async () => {
    if (!round) return setError('Please select a race first')
    setLoading(true); setError('')
    try {
      const res = await axios.get(`/api/race-summary-detailed/${year}/${round}`)
      if (res.data.error) setError(res.data.error)
      else setData(res.data)
    } catch { setError('Failed to fetch') }
    setLoading(false)
  }

  return (
    <div>
      <h1 className="text-3xl font-black text-white mb-2">📰 AI Race Summariser</h1>
      <p className="text-zinc-400 mb-6">AI generates a detailed race report — strategy, overtakes, pit stops, compound choices, position changes.</p>

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
        <button onClick={fetchData}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold h-10">
          {loading ? '🤖 Generating Report...' : '🤖 Generate AI Report'}
        </button>
      </div>

      {error && <div className="text-red-400 mb-4">{error}</div>}

      {loading && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center">
          <div className="text-4xl mb-4">🤖</div>
          <div className="text-white font-semibold">AI is analyzing race data...</div>
          <div className="text-zinc-400 text-sm mt-2">Loading telemetry, strategies, weather — this takes 15-20 seconds</div>
        </div>
      )}

      {data && !loading && (
        <div className="space-y-6">
          <div className="flex items-center gap-4 flex-wrap">
            <h2 className="text-2xl font-black text-white">{data.race} {data.year}</h2>
            {data.rainfall && <span className="bg-blue-900/50 text-blue-300 border border-blue-700 px-3 py-1 rounded-lg text-sm">🌧️ Wet Race</span>}
            <span className="text-zinc-400 text-sm">Track: {data.avg_track_temp}°C</span>
          </div>

          {/* Podium */}
          <div className="grid grid-cols-3 gap-4">
            {data.podium?.map((p, i) => (
              <div key={i} className={`rounded-xl p-5 border ${
                i === 0 ? 'bg-yellow-900/20 border-yellow-500' :
                i === 1 ? 'bg-zinc-700/20 border-zinc-400' :
                'bg-orange-900/20 border-orange-600'}`}>
                <div className="text-3xl mb-2">{i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}</div>
                <div className="text-white font-black text-lg">{p.Abbreviation}</div>
                <div className="text-zinc-400 text-sm">{p.FullName}</div>
                <div className="text-zinc-500 text-xs">{p.TeamName}</div>
                <div className="text-zinc-500 text-xs mt-1">Started P{p.GridPosition}</div>
              </div>
            ))}
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
              <div className="text-2xl font-black text-white">{data.fastest_lap_driver}</div>
              <div className="text-red-400 font-bold">{data.fastest_lap_time}s</div>
              <div className="text-zinc-400 text-xs">Fastest Lap</div>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
              <div className="text-2xl font-black text-red-400">{data.total_laps}</div>
              <div className="text-zinc-400 text-xs">Total Laps</div>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
              <div className="text-2xl font-black text-red-400">{data.dnfs?.length || 0}</div>
              <div className="text-zinc-400 text-xs">DNFs</div>
            </div>
          </div>

          {/* Strategy Overview */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-zinc-800">
              <h3 className="text-white font-semibold">🔴 Top 10 Strategies</h3>
            </div>
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left p-3 text-zinc-400">Driver</th>
                  <th className="text-left p-3 text-zinc-400">Stops</th>
                  <th className="text-left p-3 text-zinc-400">Pit Laps</th>
                  <th className="text-left p-3 text-zinc-400">Compounds Used</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(data.strategies || {}).map(([driver, info], i) => (
                  <tr key={i} className="border-b border-zinc-800 hover:bg-zinc-800">
                    <td className="p-3 text-white font-semibold">{driver}</td>
                    <td className="p-3 text-red-400 font-bold">{info.pit_count}</td>
                    <td className="p-3 text-zinc-400 text-sm">{info.pit_laps.join(', ')}</td>
                    <td className="p-3 flex gap-1 flex-wrap">
                      {info.compounds.map((c, j) => (
                        <span key={j} style={{ color: TYRE_COLORS[c] || '#fff' }}
                          className="text-xs font-bold border border-zinc-700 px-2 py-0.5 rounded">
                          {c}
                        </span>
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* AI Race Report */}
          <div className="bg-zinc-900 border border-red-900 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🤖</span>
              <h3 className="text-white font-black text-lg">AI Race Report</h3>
              <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-1 rounded">Powered by AI</span>
            </div>
            <div className="text-zinc-300 leading-relaxed whitespace-pre-wrap text-sm">
              {data.ai_summary}
            </div>
          </div>

          {/* DNFs */}
          {data.dnfs?.length > 0 && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
              <h3 className="text-white font-semibold mb-3">❌ DNFs / Retirements</h3>
              <div className="flex gap-2 flex-wrap">
                {data.dnfs.map((d, i) => (
                  <span key={i} className="bg-red-900/30 text-red-400 border border-red-800 px-3 py-1 rounded-lg text-sm font-bold">
                    {d.Abbreviation} — {d.Status}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}