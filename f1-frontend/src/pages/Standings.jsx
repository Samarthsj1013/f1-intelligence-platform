import { useState, useEffect } from 'react'
import axios from 'axios'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { TEAM_COLORS, DRIVER_TEAM_MAP } from '../utils/teamColors'

export default function Standings() {
  const [year, setYear] = useState(2025)
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchStandings = async () => {
    setLoading(true); setError('')
    try {
      const res = await axios.get(`/api/standings/${year}`)
      if (res.data.error) setError(res.data.error)
      else setData(res.data)
    } catch { setError('Failed to fetch data') }
    setLoading(false)
  }

  return (
    <div>
      <h1 className="text-3xl font-black text-white mb-6">🏆 Season Standings</h1>

      {year === 2026 && (
        <div className="bg-blue-900/30 border border-blue-700 rounded-xl p-4 mb-4">
          <p className="text-blue-300 text-sm">⚡ 2026 season hasn't started yet — showing projected lineup based on confirmed contracts.</p>
        </div>
      )}

      <div className="flex gap-4 mb-6">
        <select value={year} onChange={e => setYear(Number(e.target.value))}
          className="bg-zinc-800 text-white px-4 py-2 rounded-lg border border-zinc-700">
          {[2025, 2024, 2023, 2022, 2021].map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        <button onClick={fetchStandings}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold">
          {loading ? 'Loading...' : 'Load Standings'}
        </button>
      </div>

      {error && <div className="text-red-400 mb-4">{error}</div>}

      {data.length > 0 && (
        <>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-6">
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={data.slice(0, 10)} layout="vertical">
                <XAxis type="number" stroke="#666" />
                <YAxis type="category" dataKey="Abbreviation" stroke="#666" width={50} />
                <Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid #333' }}
                  labelStyle={{ color: '#fff' }} />
                <Bar dataKey="Points" radius={[0, 4, 4, 0]} label={{ position: 'right', fill: '#fff', fontSize: 11 }}>
                  {data.slice(0, 10).map((d, i) => (
                    <Cell key={i} fill={TEAM_COLORS[d.TeamName] || TEAM_COLORS[DRIVER_TEAM_MAP[d.Abbreviation]] || '#666'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left p-4 text-zinc-400">Pos</th>
                  <th className="text-left p-4 text-zinc-400">Driver</th>
                  <th className="text-left p-4 text-zinc-400">Team</th>
                  <th className="text-left p-4 text-zinc-400">Points</th>
                </tr>
              </thead>
              <tbody>
                {data.map((d, i) => (
                  <tr key={i} className="border-b border-zinc-800 hover:bg-zinc-800">
                    <td className="p-4 text-zinc-400">{i + 1}</td>
                    <td className="p-4 text-white font-semibold">{d.FullName}</td>
                    <td className="p-4" style={{ color: TEAM_COLORS[d.TeamName] || '#888' }}>{d.TeamName}</td>
                    <td className="p-4 text-red-400 font-bold">{d.Points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}