import { useState } from 'react'
import axios from 'axios'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import RaceSelector from '../components/RaceSelector'

export default function WeatherAnalysis() {
  const [year, setYear] = useState(2024)
  const [round, setRound] = useState('')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchData = async () => {
    if (!round) return setError('Please select a race first')
    setLoading(true); setError('')
    try {
      const res = await axios.get(`/api/weather/${year}/${round}`)
      if (res.data.error) setError(res.data.error)
      else setData(res.data)
    } catch { setError('Failed to fetch') }
    setLoading(false)
  }

  return (
    <div>
      <h1 className="text-3xl font-black text-white mb-2">🌤️ Weather & Track Conditions</h1>
      <p className="text-zinc-400 mb-6">Real weather data from the race — air temp, track temp, humidity, wind. AI explains impact on strategy.</p>

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
          {loading ? 'Loading...' : 'Analyze Weather'}
        </button>
      </div>

      {error && <div className="text-red-400 mb-4">{error}</div>}

      {data && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-white">{data.race} {data.year}</h2>

          {/* Rainfall Alert */}
          {data.rainfall && (
            <div className="bg-blue-900/30 border border-blue-700 rounded-xl p-4 flex items-center gap-3">
              <span className="text-3xl">🌧️</span>
              <div>
                <div className="text-blue-300 font-bold">Wet Race Conditions</div>
                <div className="text-blue-400 text-sm">Rainfall was recorded during this race — significantly impacted tyre strategy</div>
              </div>
            </div>
          )}

          {/* Weather Cards */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 text-center">
              <div className="text-3xl mb-2">🌡️</div>
              <div className="text-2xl font-black text-red-400">{data.avg_air_temp}°C</div>
              <div className="text-zinc-400 text-sm">Avg Air Temp</div>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 text-center">
              <div className="text-3xl mb-2">🏁</div>
              <div className="text-2xl font-black text-orange-400">{data.avg_track_temp}°C</div>
              <div className="text-zinc-400 text-sm">Avg Track Temp</div>
              <div className="text-zinc-500 text-xs">max {data.max_track_temp}°C</div>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 text-center">
              <div className="text-3xl mb-2">💧</div>
              <div className="text-2xl font-black text-blue-400">{data.avg_humidity}%</div>
              <div className="text-zinc-400 text-sm">Avg Humidity</div>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 text-center">
              <div className="text-3xl mb-2">💨</div>
              <div className="text-2xl font-black text-teal-400">{data.avg_wind_speed}</div>
              <div className="text-zinc-400 text-sm">Wind Speed km/h</div>
            </div>
          </div>

          {/* Temperature Chart */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h3 className="text-white font-semibold mb-4">📈 Temperature Over Race</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.weather_over_time.filter((_, i) => i % 10 === 0)}>
                <XAxis dataKey="Time_seconds" stroke="#666"
                  tickFormatter={v => `${Math.floor(v/60)}m`} />
                <YAxis stroke="#666" />
                <Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid #333' }}
                  formatter={(v, name) => [`${v}°C`, name]} />
                <Legend />
                <Line type="monotone" dataKey="AirTemp" stroke="#e10600" dot={false} name="Air Temp" strokeWidth={2} />
                <Line type="monotone" dataKey="TrackTemp" stroke="#ffd700" dot={false} name="Track Temp" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* AI Weather Analysis */}
          <div className="bg-zinc-900 border border-red-900 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🧠</span>
              <h3 className="text-white font-black text-lg">AI Weather Impact Analysis</h3>
              <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-1 rounded">Powered by AI</span>
            </div>
            <div className="text-zinc-300 leading-relaxed whitespace-pre-wrap text-sm">
              {data.ai_weather_analysis}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}