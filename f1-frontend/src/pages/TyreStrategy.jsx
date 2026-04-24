import { useState } from 'react'
import axios from 'axios'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts'
import RaceSelector from '../components/RaceSelector'
import { TYRE_COLORS, TEAM_COLORS, DRIVER_TEAM_MAP, getDriverColor } from '../utils/teamColors'

export default function TyreStrategy() {
  const [year, setYear] = useState(2025)
  const [round, setRound] = useState('')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchData = async () => {
    if (!round) return setError('Please select a race first')
    if (year === 2026) return setError('2026 race data not available yet — season starts in March 2026')
    setLoading(true); setError('')
    try {
      const res = await axios.get(`/api/tyre-strategy/${year}/${round}`)
      if (res.data.error) setError(res.data.error)
      else setData(res.data)
    } catch { setError('Failed to fetch') }
    setLoading(false)
  }

  // Group by driver for chart
  const chartData = data ? Object.entries(
    data.strategy.reduce((acc, s) => {
      if (!acc[s.Driver]) acc[s.Driver] = { Driver: s.Driver, total: 0 }
      acc[s.Driver][s.Compound] = s.Laps
      acc[s.Driver].total += s.Laps
      return acc
    }, {})
  ).map(([_, v]) => v).sort((a, b) => b.total - a.total) : []

  const compounds = data ? [...new Set(data.strategy.map(s => s.Compound))] : []

  return (
    <div>
      <h1 className="text-3xl font-black text-white mb-6">🔴 Tyre Strategy</h1>
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
          {loading ? 'Loading...' : 'Analyze'}
        </button>
      </div>

      {error && <div className="text-red-400 mb-4">{error}</div>}

      {data && (
        <div>
          <h2 className="text-xl font-bold text-white mb-4">{data.race} {data.year}</h2>

          {/* Stacked bar chart by compound */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-6">
            <h3 className="text-white font-semibold mb-4">Laps per Compound per Driver</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={chartData}>
                <XAxis dataKey="Driver" stroke="#666"
                  tick={(props) => {
                    const { x, y, payload } = props
                    return (
                      <text x={x} y={y + 10} textAnchor="middle" fontSize={11}
                        fill={getDriverColor(payload.value)}>
                        {payload.value}
                      </text>
                    )
                  }}
                />
                <YAxis stroke="#666" />
                <Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid #333' }} />
                {compounds.map(compound => (
                  <Bar key={compound} dataKey={compound} stackId="a"
                    fill={TYRE_COLORS_LOCAL[compound] || '#888'}
                    name={compound} radius={compound === compounds[compounds.length-1] ? [4,4,0,0] : [0,0,0,0]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Table */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left p-4 text-zinc-400">Driver</th>
                  <th className="text-left p-4 text-zinc-400">Compound</th>
                  <th className="text-left p-4 text-zinc-400">Laps</th>
                  <th className="text-left p-4 text-zinc-400">Avg Lap Time (s)</th>
                </tr>
              </thead>
              <tbody>
                {data.strategy.map((s, i) => (
                  <tr key={i} className="border-b border-zinc-800 hover:bg-zinc-800">
                    <td className="p-4 font-semibold" style={{ color: getDriverColor(s.Driver) }}>{s.Driver}</td>
                    <td className="p-4">
                      <span style={{ color: TYRE_COLORS_LOCAL[s.Compound] || '#fff' }} className="font-bold">
                        {s.Compound}
                      </span>
                    </td>
                    <td className="p-4 text-zinc-400">{s.Laps}</td>
                    <td className="p-4 text-zinc-400">{s.AvgLapTime}</td>
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