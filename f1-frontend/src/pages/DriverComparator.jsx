import { useState } from 'react'
import axios from 'axios'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import RaceSelector from '../components/RaceSelector'
import DriverSelector from '../components/DriverSelector'
import { formatLapTime } from '../utils/formatTime'
import { TYRE_COLORS, getDriverColor } from '../utils/teamColors'

export default function DriverComparator() {
  const [year, setYear] = useState(2025)
  const [round, setRound] = useState('')
  const [driver1, setDriver1] = useState('VER')
  const [driver2, setDriver2] = useState('NOR')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchData = async () => {
    if (!round) return setError('Please select a race first')
    if (year >= 2026) return setError('2026 race data not available yet')
    setLoading(true); setError('')
    try {
      const res = await axios.get(`/api/race-compare/${year}/${round}/${driver1}/${driver2}`)
      if (res.data.error) setError(res.data.error)
      else setData(res.data)
    } catch { setError('Failed to fetch') }
    setLoading(false)
  }

  const d1color = getDriverColor(driver1)
  const d2color = getDriverColor(driver2)

  const mergeLapData = () => {
    if (!data || !data[driver1] || !data[driver2]) return []
    const d1laps = Object.fromEntries(data[driver1].laps.map(l => [l.LapNumber, l.LapTimeSeconds]))
    const d2laps = Object.fromEntries(data[driver2].laps.map(l => [l.LapNumber, l.LapTimeSeconds]))
    const allLaps = [...new Set([...Object.keys(d1laps), ...Object.keys(d2laps)])].map(Number).sort((a,b)=>a-b)
    return allLaps.map(lap => ({
      lap,
      [driver1]: d1laps[lap] || null,
      [driver2]: d2laps[lap] || null,
    }))
  }

  return (
    <div>
      <h1 className="text-3xl font-black text-white mb-2">👥 Driver Comparator</h1>
      <p className="text-zinc-400 mb-6">Compare lap times, tyre strategy and pit stops within a race weekend</p>

      <div className="flex gap-4 mb-6 flex-wrap items-end">
        <div className="flex flex-col gap-1">
          <span className="text-zinc-400 text-xs">Season</span>
          <select value={year} onChange={e => { setYear(Number(e.target.value)); setRound(''); setDriver1('VER'); setDriver2('NOR') }}
            className="bg-zinc-800 text-white px-4 py-2 rounded-lg border border-zinc-700">
            {[2025, 2024, 2023, 2022].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-zinc-400 text-xs">Race</span>
          <RaceSelector year={year} selectedRound={round} onSelect={setRound} />
        </div>
        <DriverSelector value={driver1} onChange={setDriver1} label="Driver 1" year={year} />
        <DriverSelector value={driver2} onChange={setDriver2} label="Driver 2" year={year} />
        <button onClick={fetchData}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold h-10">
          {loading ? 'Loading...' : 'Compare'}
        </button>
      </div>

      {error && <div className="text-red-400 mb-4">{error}</div>}

      {data && data[driver1] && data[driver2] && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-white">{data.race}</h2>

          {/* Stats comparison */}
          <div className="grid grid-cols-2 gap-4">
            {[driver1, driver2].map((drv, idx) => (
              <div key={drv} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5"
                style={{ borderColor: idx === 0 ? d1color : d2color }}>
                <h3 className="font-black text-lg mb-3" style={{ color: idx === 0 ? d1color : d2color }}>{drv}</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Finish Position</span>
                    <span className="text-white font-bold">P{data[drv].position}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Fastest Lap</span>
                    <span className="text-green-400 font-bold font-mono">{formatLapTime(data[drv].fastest_lap)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Avg Lap</span>
                    <span className="text-white font-mono">{formatLapTime(data[drv].avg_lap)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Pit Stops</span>
                    <span className="text-white font-bold">{data[drv].stops}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Lap time chart */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h3 className="text-white font-semibold mb-4">Lap Times Comparison</h3>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={mergeLapData()}>
                <XAxis dataKey="lap" stroke="#666" />
                <YAxis stroke="#666" tickFormatter={v => formatLapTime(v)} domain={['auto', 'auto']} />
                <Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid #333' }}
                  formatter={(v) => [formatLapTime(v), '']} />
                <Legend />
                <Line type="monotone" dataKey={driver1} stroke={d1color} dot={false} strokeWidth={2} connectNulls />
                <Line type="monotone" dataKey={driver2} stroke={d2color} dot={false} strokeWidth={2} connectNulls />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Tyre strategy comparison */}
          <div className="grid grid-cols-2 gap-4">
            {[driver1, driver2].map((drv, idx) => (
              <div key={drv} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                <h3 className="font-semibold mb-3" style={{ color: idx === 0 ? d1color : d2color }}>{drv} — Tyre Strategy</h3>
                <div className="space-y-2">
                  {data[drv].tyres.map((t, i) => (
                    <div key={i} className="flex justify-between items-center">
                      <span style={{ color: TYRE_COLORS[t.Compound] || '#fff' }} className="font-bold">{t.Compound}</span>
                      <span className="text-zinc-400">{t.Laps} laps</span>
                      <span className="text-zinc-400 font-mono">{formatLapTime(t.AvgLapTime)} avg</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
