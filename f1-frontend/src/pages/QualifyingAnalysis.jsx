import { useState } from 'react'
import axios from 'axios'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import RaceSelector from '../components/RaceSelector'
import { formatLapTime } from '../utils/formatTime'

const TEAM_COLORS = {
  'Red Bull Racing': '#3671C6', 'McLaren': '#FF8000', 'Ferrari': '#E8002D',
  'Mercedes': '#27F4D2', 'Aston Martin': '#229971', 'Alpine': '#FF87BC',
  'Williams': '#64C4FF', 'RB': '#6692FF', 'Kick Sauber': '#52E252', 'Haas F1 Team': '#B6BABD',
}

export default function QualifyingAnalysis() {
  const [year, setYear] = useState(2024)
  const [round, setRound] = useState('')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchData = async () => {
    if (!round) return setError('Please select a race first')
    setLoading(true); setError('')
    try {
      const res = await axios.get(`/api/qualifying/${year}/${round}`)
      if (res.data.error) setError(res.data.error)
      else setData(res.data)
    } catch { setError('Failed to fetch') }
    setLoading(false)
  }

  return (
    <div>
      <h1 className="text-3xl font-black text-white mb-2">⚡ Qualifying Analysis</h1>
      <p className="text-zinc-400 mb-6">Full qualifying results with Q1/Q2/Q3 times and gap to pole position.</p>

      <div className="flex gap-4 mb-6 flex-wrap items-end">
        <div className="flex flex-col gap-1">
          <span className="text-zinc-400 text-xs">Season</span>
          <select value={year} onChange={e => { setYear(Number(e.target.value)); setRound('') }}
            className="bg-zinc-800 text-white px-4 py-2 rounded-lg border border-zinc-700">
            {[2025, 2024, 2023, 2022].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-zinc-400 text-xs">Race Weekend</span>
          <RaceSelector year={year} selectedRound={round} onSelect={setRound} />
        </div>
        <button onClick={fetchData}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold h-10">
          {loading ? 'Loading...' : 'Load Qualifying'}
        </button>
      </div>

      {error && <div className="text-red-400 mb-4">{error}</div>}

      {data && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-white">{data.race} {data.year} — Qualifying</h2>

          {/* Gap to Pole Chart */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h3 className="text-white font-semibold mb-4">📊 Gap to Pole Position</h3>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={data.best_laps.sort((a, b) => a.GapToPole - b.GapToPole).slice(0, 15)} layout="vertical">
                <XAxis type="number" stroke="#666" tickFormatter={v => `+${v}s`} />
                <YAxis type="category" dataKey="Driver" stroke="#666" width={45} />
                <Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid #333' }}
                  formatter={(v) => [`+${v}s`, 'Gap to Pole']} />
                <Bar dataKey="GapToPole" radius={[0, 4, 4, 0]}>
                  {data.best_laps.map((_, i) => (
                    <Cell key={i} fill={i === 0 ? '#e10600' : i < 3 ? '#ff6b6b' : '#444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Full Results Table */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left p-4 text-zinc-400">Pos</th>
                  <th className="text-left p-4 text-zinc-400">Driver</th>
                  <th className="text-left p-4 text-zinc-400">Team</th>
                  <th className="text-left p-4 text-zinc-400">Q1</th>
                  <th className="text-left p-4 text-zinc-400">Q2</th>
                  <th className="text-left p-4 text-zinc-400">Q3</th>
                </tr>
              </thead>
              <tbody>
                {data.qualifying.map((q, i) => (
                  <tr key={i} className={`border-b border-zinc-800 hover:bg-zinc-800 ${i === 0 ? 'bg-yellow-900/10' : ''}`}>
                    <td className="p-4 text-white font-bold">P{q.Position}</td>
                    <td className="p-4">
                      <div className="text-white font-semibold">{q.Driver}</div>
                      <div className="text-zinc-500 text-xs">{q.FullName}</div>
                    </td>
                    <td className="p-4 text-sm" style={{ color: TEAM_COLORS[q.Team] || '#888' }}>{q.Team}</td>
                    <td className="p-4 text-zinc-400 font-mono text-sm">{q.Q1}</td>
                    <td className="p-4 text-zinc-400 font-mono text-sm">{q.Q2}</td>
                    <td className="p-4 font-mono text-sm" style={{ color: i === 0 ? '#e10600' : '#fff' }}>{q.Q3}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}