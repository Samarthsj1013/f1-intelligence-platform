import { useState } from 'react'
import axios from 'axios'
import { ScatterChart, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import RaceSelector from '../components/RaceSelector'
import DriverSelector from '../components/DriverSelector'
import { formatLapTime } from '../utils/formatTime'

export default function AnomalyDetector() {
  const [year, setYear] = useState(2025)
  const [round, setRound] = useState('')
  const [driver, setDriver] = useState('VER')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchData = async () => {
    if (!round) return setError('Please select a race first')
    if (year >= 2026) return setError('2026 race data not available yet')
    setLoading(true); setError('')
    try {
      const res = await axios.get(`/api/anomaly/${year}/${round}/${driver}`)
      if (res.data.error) setError(res.data.error)
      else setData(res.data)
    } catch { setError('Failed to fetch') }
    setLoading(false)
  }

  const normal = data?.laps?.filter(l => !l.Anomaly) || []
  const anomalies = data?.laps?.filter(l => l.Anomaly) || []

  return (
    <div>
      <h1 className="text-3xl font-black text-white mb-2">🚨 Lap Time Anomaly Detector</h1>
      <p className="text-zinc-400 mb-6">Detects statistically unusual lap times using IQR method. <span className="text-red-400">Red dots</span> = pit stops, safety car laps, or incidents.</p>

      <div className="flex gap-4 mb-6 flex-wrap items-end">
        <div className="flex flex-col gap-1">
          <span className="text-zinc-400 text-xs">Season</span>
          <select value={year} onChange={e => { setYear(Number(e.target.value)); setRound(''); setDriver('VER') }}
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
          {loading ? 'Detecting...' : 'Detect Anomalies'}
        </button>
      </div>

      {error && <div className="text-red-400 mb-4">{error}</div>}

      {data && (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-white">{data.race} — {data.driver}</h2>
            <span className={`px-3 py-1 rounded-lg text-sm font-bold ${
              data.total_anomalies > 3 ? 'bg-red-900/50 text-red-400' : 'bg-green-900/50 text-green-400'
            }`}>
              {data.total_anomalies} anomalies detected
            </span>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h3 className="text-white font-semibold mb-4">Lap Times — Anomalies in Red</h3>
            <ResponsiveContainer width="100%" height={350}>
              <ScatterChart>
                <XAxis dataKey="LapNumber" stroke="#666" name="Lap" />
                <YAxis dataKey="LapTimeSeconds" stroke="#666" name="Lap Time"
                  tickFormatter={v => formatLapTime(v)} domain={['auto', 'auto']} />
                <Tooltip
                  contentStyle={{ background: '#1a1a1a', border: '1px solid #333' }}
                  formatter={(v, name) => [name === 'LapTimeSeconds' ? formatLapTime(v) : v, name === 'LapTimeSeconds' ? 'Lap Time' : 'Lap']}
                />
                <Scatter name="Normal" data={normal} fill="#00d2be" opacity={0.8} />
                <Scatter name="Anomaly" data={anomalies} fill="#e10600" opacity={1} r={6} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          {anomalies.length > 0 && (
            <div className="bg-zinc-900 border border-red-900 rounded-xl overflow-hidden">
              <div className="p-4 border-b border-zinc-800">
                <h3 className="text-white font-semibold">🔴 Anomalous Laps Detail</h3>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-800">
                    <th className="text-left p-3 text-zinc-400">Lap</th>
                    <th className="text-left p-3 text-zinc-400">Lap Time</th>
                    <th className="text-left p-3 text-zinc-400">Compound</th>
                    <th className="text-left p-3 text-zinc-400">Likely Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {anomalies.map((lap, i) => (
                    <tr key={i} className="border-b border-zinc-800 hover:bg-zinc-800">
                      <td className="p-3 text-white">Lap {lap.LapNumber}</td>
                      <td className="p-3 text-red-400 font-bold font-mono">{formatLapTime(lap.LapTimeSeconds)}</td>
                      <td className="p-3 text-zinc-400">{lap.Compound}</td>
                      <td className="p-3 text-zinc-500 text-sm">Pit stop, Safety Car, or Incident</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
