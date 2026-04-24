import { useState } from 'react'
import axios from 'axios'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

const ROUNDS_2026 = [
  { round: 1, name: 'Australia GP', city: 'Melbourne' },
  { round: 2, name: 'Saudi Arabia GP', city: 'Jeddah' },
  { round: 3, name: 'Bahrain GP', city: 'Sakhir' },
  { round: 4, name: 'Japan GP', city: 'Suzuka' },
  { round: 5, name: 'China GP', city: 'Shanghai' },
  { round: 6, name: 'Miami GP', city: 'Miami' },
  { round: 7, name: 'Emilia-Romagna GP', city: 'Imola' },
  { round: 8, name: 'Monaco GP', city: 'Monaco' },
  { round: 9, name: 'Spain GP', city: 'Barcelona' },
  { round: 10, name: 'Canada GP', city: 'Montreal' },
  { round: 11, name: 'Austria GP', city: 'Spielberg' },
  { round: 12, name: 'British GP', city: 'Silverstone' },
  { round: 13, name: 'Belgium GP', city: 'Spa' },
  { round: 14, name: 'Hungary GP', city: 'Budapest' },
  { round: 15, name: 'Netherlands GP', city: 'Zandvoort' },
  { round: 16, name: 'Italy GP', city: 'Monza' },
  { round: 17, name: 'Azerbaijan GP', city: 'Baku' },
  { round: 18, name: 'Singapore GP', city: 'Singapore' },
  { round: 19, name: 'United States GP', city: 'Austin' },
  { round: 20, name: 'Mexico GP', city: 'Mexico City' },
  { round: 21, name: 'Brazil GP', city: 'Sao Paulo' },
  { round: 22, name: 'Las Vegas GP', city: 'Las Vegas' },
  { round: 23, name: 'Qatar GP', city: 'Lusail' },
  { round: 24, name: 'Abu Dhabi GP', city: 'Abu Dhabi' },
]

export default function WeatherForecast() {
  const [selectedRound, setSelectedRound] = useState(1)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchData = async () => {
    setLoading(true)
    setError('')
    setData(null)
    try {
      const res = await axios.get(`/api/weather-forecast/${selectedRound}`)
      if (res.data.error) {
        setError(res.data.error)
      } else {
        setData(res.data)
      }
    } catch (e) {
      setError('Failed to fetch weather data: ' + e.message)
    }
    setLoading(false)
  }

  const selectedRace = ROUNDS_2026.find(r => r.round === selectedRound)

  return (
    <div>
      <h1 className="text-3xl font-black text-white mb-2">🌤️ 2026 Race Weather Forecast</h1>
      <p className="text-zinc-400 mb-6">
        Live weather data from each 2026 circuit location — AI predicts tyre strategy and degradation based on real conditions.
      </p>

      <div className="bg-blue-900/30 border border-blue-700 rounded-xl p-4 mb-6">
        <p className="text-blue-300 text-sm">
          🔮 Uses real-time weather from circuit locations to predict 2026 race conditions and recommend tyre strategy before the season starts.
        </p>
      </div>

      <div className="flex gap-4 mb-6 items-end flex-wrap">
        <div className="flex flex-col gap-1">
          <span className="text-zinc-400 text-xs">2026 Race</span>
          <select
            value={selectedRound}
            onChange={e => setSelectedRound(Number(e.target.value))}
            className="bg-zinc-800 text-white px-4 py-2 rounded-lg border border-zinc-700 min-w-64"
          >
            {ROUNDS_2026.map(r => (
              <option key={r.round} value={r.round}>Round {r.round}: {r.name}</option>
            ))}
          </select>
        </div>
        <button
          onClick={fetchData}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold h-10"
        >
          {loading ? 'Fetching Weather...' : '🌤️ Get Weather & Strategy'}
        </button>
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-700 rounded-xl p-4 mb-4">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {loading && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center">
          <div className="text-4xl mb-4">🌤️</div>
          <div className="text-white font-semibold">Fetching live weather data...</div>
          <div className="text-zinc-400 text-sm mt-2">Getting conditions from {selectedRace?.city}</div>
        </div>
      )}

      {data && !loading && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-white">
            {selectedRace?.name} — {data.city}
          </h2>

          {/* Rain Alert */}
          {data.rain_expected && (
            <div className="bg-blue-900/30 border border-blue-700 rounded-xl p-4 flex items-center gap-3">
              <span className="text-3xl">🌧️</span>
              <div>
                <div className="text-blue-300 font-bold">Rain Expected at Circuit</div>
                <div className="text-blue-400 text-sm">Will significantly impact tyre strategy — intermediates/wets likely</div>
              </div>
            </div>
          )}

          {/* Weather Cards */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 text-center">
              <div className="text-3xl mb-2">🌡️</div>
              <div className="text-2xl font-black text-red-400">{data.current_temp}°C</div>
              <div className="text-zinc-400 text-xs">Air Temperature</div>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 text-center">
              <div className="text-3xl mb-2">🏁</div>
              <div className="text-2xl font-black text-orange-400">{data.estimated_track_temp}°C</div>
              <div className="text-zinc-400 text-xs">Est. Track Temp</div>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 text-center">
              <div className="text-3xl mb-2">💧</div>
              <div className="text-2xl font-black text-blue-400">{data.humidity}%</div>
              <div className="text-zinc-400 text-xs">Humidity</div>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 text-center">
              <div className="text-3xl mb-2">💨</div>
              <div className="text-2xl font-black text-teal-400">{data.wind_speed}</div>
              <div className="text-zinc-400 text-xs">Wind km/h</div>
            </div>
          </div>

          {/* Conditions */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <h3 className="text-white font-semibold mb-2">🌍 Current Conditions at Circuit</h3>
            <p className="text-zinc-300 text-lg">{data.weather_description}</p>
          </div>

          {/* Strategy */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-red-900/20 border border-red-700 rounded-xl p-5">
              <h3 className="text-red-400 font-black mb-2">🔴 Tyre Recommendation</h3>
              <p className="text-white font-semibold">{data.tyre_recommendation}</p>
            </div>
            <div className="bg-orange-900/20 border border-orange-700 rounded-xl p-5">
              <h3 className="text-orange-400 font-black mb-2">📊 Degradation Prediction</h3>
              <p className="text-white font-semibold">{data.degradation_prediction}</p>
            </div>
          </div>

          {/* Forecast Chart */}
          {data.forecast && data.forecast.length > 0 && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <h3 className="text-white font-semibold mb-4">📈 Temperature Forecast (Next 24 Hours)</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={data.forecast}>
                  <XAxis
                    dataKey="time"
                    stroke="#666"
                    tick={{ fontSize: 10 }}
                    tickFormatter={v => v.split(' ')[1]?.slice(0, 5) || v}
                  />
                  <YAxis stroke="#666" tickFormatter={v => `${v}°C`} />
                  <Tooltip
                    contentStyle={{ background: '#1a1a1a', border: '1px solid #333' }}
                    formatter={(v) => [`${v}°C`, 'Temperature']}
                  />
                  <Line type="monotone" dataKey="temp" stroke="#e10600" dot={false} strokeWidth={2} name="Air Temp" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Forecast Table */}
          {data.forecast && data.forecast.length > 0 && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
              <div className="p-4 border-b border-zinc-800">
                <h3 className="text-white font-semibold">📋 Hourly Forecast</h3>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-800">
                    <th className="text-left p-3 text-zinc-400">Time</th>
                    <th className="text-left p-3 text-zinc-400">Temp</th>
                    <th className="text-left p-3 text-zinc-400">Conditions</th>
                    <th className="text-left p-3 text-zinc-400">Rain Chance</th>
                  </tr>
                </thead>
                <tbody>
                  {data.forecast.map((f, i) => (
                    <tr key={i} className="border-b border-zinc-800 hover:bg-zinc-800">
                      <td className="p-3 text-zinc-400">{f.time}</td>
                      <td className="p-3 text-white font-bold">{f.temp}°C</td>
                      <td className="p-3 text-zinc-400">{f.description}</td>
                      <td className="p-3">
                        <span className={f.rain_prob > 50 ? 'text-blue-400 font-bold' : 'text-zinc-500'}>
                          {f.rain_prob}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* AI Recommendation */}
          {data.ai_recommendation && (
            <div className="bg-zinc-900 border border-red-900 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">🧠</span>
                <h3 className="text-white font-black text-lg">AI Pit Wall Recommendation</h3>
                <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-1 rounded">Powered by AI</span>
              </div>
              <div className="text-zinc-300 leading-relaxed whitespace-pre-wrap text-sm">
                {data.ai_recommendation}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}