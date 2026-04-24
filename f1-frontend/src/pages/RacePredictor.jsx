import { useState } from 'react'
import axios from 'axios'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import RaceSelector from '../components/RaceSelector'

export default function RacePredictor() {
  const [year, setYear] = useState(2026)
  const [round, setRound] = useState('')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchData = async () => {
    if (!round) return setError('Please select a race first')
    setLoading(true)
    setError('')
    try {
      const res = await axios.get(`/api/predict/${year}/${round}`)
      if (res.data.error) setError(res.data.error)
      else setData(res.data)
    } catch { setError('Failed to fetch') }
    setLoading(false)
  }

  return (
    <div>
      <h1 className="text-3xl font-black text-white mb-2">🤖 Race Outcome Predictor</h1>
      <p className="text-zinc-400 mb-6">
        ML model trained on historical data to predict podium probability.
        {year === 2026 && <span className="text-red-400 ml-2">⚡ Using 2025 data to predict 2026 season</span>}
      </p>

      <div className="flex gap-4 mb-6 flex-wrap items-center">
        <select value={year} onChange={e => { setYear(Number(e.target.value)); setRound('') }}
          className="bg-zinc-800 text-white px-4 py-2 rounded-lg border border-zinc-700">
          {[2026, 2025, 2024, 2023].map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        <RaceSelector year={year === 2026 ? 2025 : year} selectedRound={round} onSelect={setRound} />
        <button onClick={fetchData}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold">
          {loading ? 'Predicting...' : 'Predict'}
        </button>
      </div>

      {error && <div className="text-red-400 mb-4">{error}</div>}

      {data && (
        <div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-6">
            <h3 className="text-white font-semibold mb-4">Podium Probability by Driver</h3>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={data.predictions.slice(0, 10)}>
                <XAxis dataKey="Driver" stroke="#666" />
                <YAxis stroke="#666" domain={[0, 100]} />
                <Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid #333' }}
                  formatter={(v) => [`${v}%`, 'Podium Probability']} />
                <Bar dataKey="PodiumProbability" radius={[4, 4, 0, 0]}>
                  {data.predictions.slice(0, 10).map((_, i) => (
                    <Cell key={i} fill={i === 0 ? '#e10600' : i === 1 ? '#ff6b6b' : i === 2 ? '#ff9999' : '#444'} />
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
                  <th className="text-left p-4 text-zinc-400">Quali Position</th>
                  <th className="text-left p-4 text-zinc-400">Podium Probability</th>
                </tr>
              </thead>
              <tbody>
                {data.predictions.map((p, i) => (
                  <tr key={i} className="border-b border-zinc-800 hover:bg-zinc-800">
                    <td className="p-4 text-white font-semibold">{p.Driver}</td>
                    <td className="p-4 text-zinc-400">P{p.QualiPosition}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 bg-zinc-800 rounded-full h-2">
                          <div className="bg-red-500 h-2 rounded-full"
                            style={{ width: `${p.PodiumProbability}%` }} />
                        </div>
                        <span className="text-red-400 font-bold w-12">{p.PodiumProbability}%</span>
                      </div>
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