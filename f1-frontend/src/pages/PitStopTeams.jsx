import { useState } from 'react'
import axios from 'axios'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import RaceSelector from '../components/RaceSelector'

const TEAM_COLORS = {
  'Red Bull Racing': '#3671C6',
  'Mercedes': '#27F4D2',
  'Ferrari': '#E8002D',
  'McLaren': '#FF8000',
  'Aston Martin': '#229971',
  'Alpine': '#FF87BC',
  'Williams': '#64C4FF',
  'RB': '#6692FF',
  'Kick Sauber': '#52E252',
  'Haas F1 Team': '#B6BABD',
}

export default function PitStopTeams() {
  const [year, setYear] = useState(2024)
  const [round, setRound] = useState('')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchData = async () => {
    if (!round) return setError('Please select a race first')
    setLoading(true)
    setError('')
    try {
      const res = await axios.get(`/api/pitstops-teams/${year}/${round}`)
      if (res.data.error) setError(res.data.error)
      else setData(res.data)
    } catch { setError('Failed to fetch') }
    setLoading(false)
  }

  return (
    <div>
      <h1 className="text-3xl font-black text-white mb-2">🏁 Pit Stop Team Comparison</h1>
      <p className="text-zinc-400 mb-6">Compare pit stop strategies across all teams in a race.</p>

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
          {loading ? 'Loading...' : 'Compare Teams'}
        </button>
      </div>

      {error && <div className="text-red-400 mb-4">{error}</div>}

      {data && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-white">{data.race}</h2>

          {/* Team Chart */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h3 className="text-white font-semibold mb-4">Average Pit Stops per Team</h3>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={data.teams} layout="vertical">
                <XAxis type="number" stroke="#666" domain={[0, 3]} />
                <YAxis type="category" dataKey="TeamName" stroke="#666" width={120} tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid #333' }} />
                <Bar dataKey="AvgStops" radius={[0, 4, 4, 0]} name="Avg Stops">
                  {data.teams.map((t, i) => (
                    <Cell key={i} fill={TEAM_COLORS[t.TeamName] || '#666'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Team Table */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left p-4 text-zinc-400">Team</th>
                  <th className="text-left p-4 text-zinc-400">Drivers</th>
                  <th className="text-left p-4 text-zinc-400">Avg Stops</th>
                  <th className="text-left p-4 text-zinc-400">Total Stops</th>
                </tr>
              </thead>
              <tbody>
                {data.teams.map((t, i) => (
                  <tr key={i} className="border-b border-zinc-800 hover:bg-zinc-800">
                    <td className="p-4">
                      <span style={{ color: TEAM_COLORS[t.TeamName] || '#fff' }} className="font-bold">
                        {t.TeamName}
                      </span>
                    </td>
                    <td className="p-4 text-zinc-400 text-sm">{t.Drivers}</td>
                    <td className="p-4 text-white font-bold">{t.AvgStops}</td>
                    <td className="p-4 text-red-400 font-bold">{t.TotalStops}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Driver breakdown */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-zinc-800">
              <h3 className="text-white font-semibold">Driver Breakdown</h3>
            </div>
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left p-3 text-zinc-400">Driver</th>
                  <th className="text-left p-3 text-zinc-400">Team</th>
                  <th className="text-left p-3 text-zinc-400">Stops</th>
                  <th className="text-left p-3 text-zinc-400">Position</th>
                </tr>
              </thead>
              <tbody>
                {data.drivers?.sort((a, b) => (a.Position || 99) - (b.Position || 99)).map((d, i) => (
                  <tr key={i} className="border-b border-zinc-800 hover:bg-zinc-800">
                    <td className="p-3 text-white font-semibold">{d.Driver}</td>
                    <td className="p-3 text-zinc-400 text-sm">{d.TeamName}</td>
                    <td className="p-3 text-red-400 font-bold">{d.TotalStops}</td>
                    <td className="p-3 text-zinc-400">P{d.Position}</td>
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