import { useState } from 'react'
import axios from 'axios'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import RaceSelector from '../components/RaceSelector'
import { getDriverColor } from '../utils/teamColors'

export default function PitStop() {
  const [year, setYear] = useState(2025)
  const [round, setRound] = useState('')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchData = async () => {
    if (!round) return setError('Please select a race first')
    if (year >= 2026) return setError('2026 race data not available yet')
    setLoading(true); setError('')
    try {
      const res = await axios.get(`/api/pitstops/${year}/${round}`)
      if (res.data.error) setError(res.data.error)
      else setData(res.data)
    } catch { setError('Failed to fetch') }
    setLoading(false)
  }

  return (
    <div>
      <h1 className="text-3xl font-black text-white mb-6">⏱️ Pit Stop Analysis</h1>
      <div className="flex gap-4 mb-6 flex-wrap items-end">
        <div className="flex flex-col gap-1">
          <span className="text-zinc-400 text-xs">Season</span>
          <select value={year} onChange={e => { setYear(Number(e.target.value)); setRound('') }}
            className="bg-zinc-800 text-white px-4 py-2 rounded-lg border border-zinc-700">
            {[2025, 2024, 2023, 2022, 2021].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-zinc-400 text-xs">Race</span>
          <RaceSelector year={year} selectedRound={round} onSelect={setRound} />
        </div>
        <button onClick={fetchData}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold h-10">
          {loading ? 'Loading...' : 'Analyze'}
        </button>
      </div>

      {error && <div className="text-red-400 mb-4">{error}</div>}

      {data && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-white">{data.race}</h2>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h3 className="text-white font-semibold mb-4">Total Pit Stops per Driver</h3>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={data.pitstops}>
                <XAxis dataKey="Driver" stroke="#666"
                  tick={(props) => {
                    const { x, y, payload } = props
                    return (
                      <text x={x} y={y + 12} textAnchor="middle" fontSize={11}
                        fill={getDriverColor(payload.value)}>
                        {payload.value}
                      </text>
                    )
                  }}
                />
                <YAxis stroke="#666" allowDecimals={false} />
                <Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid #333' }} />
                <Bar dataKey="TotalStops" radius={[4, 4, 0, 0]}>
                  {data.pitstops.map((d, i) => (
                    <Cell key={i} fill={getDriverColor(d.Driver)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left p-4 text-zinc-400">Driver</th>
                  <th className="text-left p-4 text-zinc-400">Team</th>
                  <th className="text-left p-4 text-zinc-400">Total Stops</th>
                  <th className="text-left p-4 text-zinc-400">Finish Position</th>
                </tr>
              </thead>
              <tbody>
                {data.pitstops
                  .filter(d => d.Position)
                  .sort((a, b) => a.Position - b.Position)
                  .map((d, i) => (
                    <tr key={i} className="border-b border-zinc-800 hover:bg-zinc-800">
                      <td className="p-4 font-semibold" style={{ color: getDriverColor(d.Driver) }}>{d.Driver}</td>
                      <td className="p-4 text-zinc-400">{d.TeamName}</td>
                      <td className="p-4 text-red-400 font-bold">{d.TotalStops}</td>
                      <td className="p-4 text-zinc-400">{d.Position ? `P${d.Position}` : 'DNF'}</td>
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
