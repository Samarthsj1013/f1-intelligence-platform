import { useState } from 'react'
import axios from 'axios'
import { ScatterChart, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import RaceSelector from '../components/RaceSelector'
import DriverSelector from '../components/DriverSelector'
import { formatLapTime } from '../utils/formatTime'
import { TYRE_COLORS } from '../utils/teamColors'

export default function TyreDegradation() {
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
      const res = await axios.get(`/api/tyre-degradation/${year}/${round}/${driver}`)
      if (res.data.error) setError(res.data.error)
      else setData(res.data)
    } catch { setError('Failed to fetch') }
    setLoading(false)
  }

  const compounds = data ? [...new Set(data.laps.map(l => l.Compound))] : []

  return (
    <div>
      <h1 className="text-3xl font-black text-white mb-2">🔻 Tyre Degradation Analysis</h1>
      <p className="text-zinc-400 mb-6">Shows how lap times increase as tyres get older — the steeper the slope, the faster the degradation.</p>

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
          {loading ? 'Loading...' : 'Analyze Degradation'}
        </button>
      </div>

      {error && <div className="text-red-400 mb-4">{error}</div>}

      {data && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-white">{data.race} — {data.driver}</h2>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h3 className="text-white font-semibold mb-4">Lap Time vs Tyre Age — by Compound</h3>
            <ResponsiveContainer width="100%" height={400}>
              <ScatterChart>
                <XAxis dataKey="TyreLife" stroke="#666" name="Tyre Age (laps)"
                  label={{ value: 'Tyre Age (laps)', position: 'insideBottom', fill: '#666', offset: -5 }} />
                <YAxis dataKey="LapTimeSeconds" stroke="#666" name="Lap Time"
                  tickFormatter={v => formatLapTime(v)} />
                <Tooltip
                  contentStyle={{ background: '#1a1a1a', border: '1px solid #333' }}
                  formatter={(v, name) => [name === 'LapTimeSeconds' ? formatLapTime(v) : `${v} laps`, name === 'LapTimeSeconds' ? 'Lap Time' : 'Tyre Age']}
                />
                <Legend />
                {compounds.map(compound => (
                  <Scatter
                    key={compound}
                    name={compound}
                    data={data.laps.filter(l => l.Compound === compound)}
                    fill={TYRE_COLORS[compound] || '#888'}
                    opacity={0.8}
                  />
                ))}
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {data.degradation_rates.map((d, i) => (
              <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-3 h-3 rounded-full" style={{ background: TYRE_COLORS[d.Compound] || '#888' }} />
                  <span style={{ color: TYRE_COLORS[d.Compound] || '#fff' }} className="font-black text-lg">{d.Compound}</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Laps Run</span>
                    <span className="text-white font-bold">{d.TotalLaps}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Deg Rate</span>
                    <span className={`font-bold ${d.DegradationPerLap > 0.08 ? 'text-red-400' : d.DegradationPerLap > 0.04 ? 'text-yellow-400' : 'text-green-400'}`}>
                      +{d.DegradationPerLap}s/lap
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Avg Lap</span>
                    <span className="text-white font-bold font-mono">{formatLapTime(d.AvgLapTime)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
