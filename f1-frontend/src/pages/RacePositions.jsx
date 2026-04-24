import { useState } from 'react'
import axios from 'axios'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import RaceSelector from '../components/RaceSelector'
import DriverSelector from '../components/DriverSelector'

const DRIVER_COLORS = ['#e10600','#00d2be','#ffd700','#ff8000','#3671C6','#27F4D2','#229971','#FF87BC','#64C4FF','#B6BABD']

const TYRE_COLORS = { SOFT:'#e10600', MEDIUM:'#ffd700', HARD:'#fff', INTERMEDIATE:'#00d2be', WET:'#0067ff' }

export default function RacePositions() {
  const [year, setYear] = useState(2024)
  const [round, setRound] = useState('')
  const [selectedDrivers, setSelectedDrivers] = useState(['VER', 'NOR'])
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchData = async () => {
    if (!round) return setError('Please select a race first')
    setLoading(true); setError('')
    try {
      const res = await axios.get(`/api/race-positions/${year}/${round}`)
      if (res.data.error) setError(res.data.error)
      else setData(res.data)
    } catch { setError('Failed to fetch') }
    setLoading(false)
  }

  const getDriverPositionData = (driver) => {
    if (!data) return []
    return data.position_over_laps
      .filter(d => d.Driver === driver)
      .map(d => ({ Lap: d.Lap, [driver]: d.Position }))
  }

  const mergeDriverData = () => {
    if (!data) return []
    const laps = [...new Set(data.position_over_laps.map(d => d.Lap))].sort((a,b)=>a-b)
    return laps.map(lap => {
      const entry = { Lap: lap }
      selectedDrivers.forEach(drv => {
        const point = data.position_over_laps.find(d => d.Lap === lap && d.Driver === drv)
        if (point) entry[drv] = point.Position
      })
      return entry
    })
  }

  return (
    <div>
      <h1 className="text-3xl font-black text-white mb-2">📈 Race Position Tracker</h1>
      <p className="text-zinc-400 mb-6">Track position changes, overtakes and pit stop impact throughout the race.</p>

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
          {loading ? 'Loading...' : 'Load Race Data'}
        </button>
      </div>

      {error && <div className="text-red-400 mb-4">{error}</div>}

      {data && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-white">{data.race} {data.year}</h2>

          {/* Positions Gained/Lost */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-zinc-800">
              <h3 className="text-white font-semibold">🏆 Position Changes (Grid → Finish)</h3>
            </div>
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left p-3 text-zinc-400">Driver</th>
                  <th className="text-left p-3 text-zinc-400">Team</th>
                  <th className="text-left p-3 text-zinc-400">Grid</th>
                  <th className="text-left p-3 text-zinc-400">Finish</th>
                  <th className="text-left p-3 text-zinc-400">Change</th>
                </tr>
              </thead>
              <tbody>
                {data.position_changes?.filter(p => p.FinalPosition).map((p, i) => (
                  <tr key={i} className="border-b border-zinc-800 hover:bg-zinc-800">
                    <td className="p-3 text-white font-semibold">{p.Abbreviation}</td>
                    <td className="p-3 text-zinc-400 text-sm">{p.TeamName}</td>
                    <td className="p-3 text-zinc-400">P{p.GridPosition}</td>
                    <td className="p-3 text-white font-bold">P{p.FinalPosition}</td>
                    <td className="p-3">
                      {p.PositionsGained > 0 ? (
                        <span className="text-green-400 font-bold">▲ +{p.PositionsGained}</span>
                      ) : p.PositionsGained < 0 ? (
                        <span className="text-red-400 font-bold">▼ {p.PositionsGained}</span>
                      ) : (
                        <span className="text-zinc-500">— 0</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Position Over Laps Chart */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h3 className="text-white font-semibold mb-2">📈 Position Over Race (select drivers below)</h3>
            <div className="flex gap-2 flex-wrap mb-4">
              {['VER','NOR','LEC','SAI','RUS','HAM','ALO','PIA','TSU','LAW'].map(drv => (
                <button key={drv}
                  onClick={() => setSelectedDrivers(prev =>
                    prev.includes(drv) ? prev.filter(d => d !== drv) : [...prev, drv]
                  )}
                  className={`px-3 py-1 rounded-lg text-sm font-bold transition-all ${
                    selectedDrivers.includes(drv)
                      ? 'bg-red-600 text-white'
                      : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                  }`}
                >
                  {drv}
                </button>
              ))}
            </div>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={mergeDriverData()}>
                <XAxis dataKey="Lap" stroke="#666" label={{ value: 'Lap', position: 'insideBottom', fill: '#666' }} />
                <YAxis stroke="#666" reversed domain={[1, 20]}
                  label={{ value: 'Position', angle: -90, position: 'insideLeft', fill: '#666' }} />
                <Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid #333' }}
                  formatter={(v, name) => [`P${v}`, name]} />
                <Legend />
                {selectedDrivers.map((drv, i) => (
                  <Line key={drv} type="monotone" dataKey={drv}
                    stroke={DRIVER_COLORS[i % DRIVER_COLORS.length]}
                    dot={false} strokeWidth={2} connectNulls />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Pit Stop Details */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-zinc-800">
              <h3 className="text-white font-semibold">⏱️ Pit Stop Details — Position Before & After</h3>
            </div>
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left p-3 text-zinc-400">Driver</th>
                  <th className="text-left p-3 text-zinc-400">Pit Lap</th>
                  <th className="text-left p-3 text-zinc-400">Compound</th>
                  <th className="text-left p-3 text-zinc-400">Position Before</th>
                  <th className="text-left p-3 text-zinc-400">Position After</th>
                  <th className="text-left p-3 text-zinc-400">Impact</th>
                </tr>
              </thead>
              <tbody>
                {data.pit_details?.map((p, i) => (
                  <tr key={i} className="border-b border-zinc-800 hover:bg-zinc-800">
                    <td className="p-3 text-white font-semibold">{p.Driver}</td>
                    <td className="p-3 text-zinc-400">Lap {p.Lap}</td>
                    <td className="p-3">
                      <span style={{ color: TYRE_COLORS[p.Compound] || '#fff' }} className="font-bold text-sm">
                        {p.Compound}
                      </span>
                    </td>
                    <td className="p-3 text-zinc-400">{p.PositionBefore ? `P${p.PositionBefore}` : 'N/A'}</td>
                    <td className="p-3 text-zinc-400">{p.PositionAfter ? `P${p.PositionAfter}` : 'N/A'}</td>
                    <td className="p-3">
                      {p.PositionBefore && p.PositionAfter ? (
                        p.PositionAfter < p.PositionBefore ?
                          <span className="text-green-400 font-bold">▲ Gained {p.PositionBefore - p.PositionAfter}</span> :
                        p.PositionAfter > p.PositionBefore ?
                          <span className="text-red-400 font-bold">▼ Lost {p.PositionAfter - p.PositionBefore}</span> :
                          <span className="text-zinc-500">— No change</span>
                      ) : <span className="text-zinc-600">N/A</span>}
                    </td>
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