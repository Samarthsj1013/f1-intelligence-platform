import { useState, useEffect } from 'react'
import axios from 'axios'

const FUTURE_2026_RACES = [
  { RoundNumber: 1, Country: 'Australia' },
  { RoundNumber: 2, Country: 'China' },
  { RoundNumber: 3, Country: 'Japan' },
  { RoundNumber: 4, Country: 'Bahrain' },
  { RoundNumber: 5, Country: 'Saudi Arabia' },
  { RoundNumber: 6, Country: 'Miami' },
  { RoundNumber: 7, Country: 'Emilia-Romagna' },
  { RoundNumber: 8, Country: 'Monaco' },
  { RoundNumber: 9, Country: 'Spain' },
  { RoundNumber: 10, Country: 'Canada' },
  { RoundNumber: 11, Country: 'Austria' },
  { RoundNumber: 12, Country: 'Great Britain' },
  { RoundNumber: 13, Country: 'Belgium' },
  { RoundNumber: 14, Country: 'Hungary' },
  { RoundNumber: 15, Country: 'Netherlands' },
  { RoundNumber: 16, Country: 'Italy' },
  { RoundNumber: 17, Country: 'Azerbaijan' },
  { RoundNumber: 18, Country: 'Singapore' },
  { RoundNumber: 19, Country: 'United States' },
  { RoundNumber: 20, Country: 'Mexico' },
  { RoundNumber: 21, Country: 'Brazil' },
  { RoundNumber: 22, Country: 'Las Vegas' },
  { RoundNumber: 23, Country: 'Qatar' },
  { RoundNumber: 24, Country: 'Abu Dhabi' },
]

export default function RaceSelector({ year, onSelect, selectedRound }) {
  const [races, setRaces] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchRaces = async () => {
      if (year === 2026) {
        setRaces(FUTURE_2026_RACES.map(r => ({
          RoundNumber: r.RoundNumber,
          Country: r.Country,
          EventName: `${r.Country} Grand Prix`
        })))
        return
      }
      setLoading(true)
      try {
        const res = await axios.get(`/api/races/${year}`)
        if (!res.data.error) setRaces(res.data)
      } catch {}
      setLoading(false)
    }
    fetchRaces()
  }, [year])

  if (loading) return <div className="text-zinc-400 text-sm px-4 py-2">Loading races...</div>

  return (
    <select value={selectedRound} onChange={e => onSelect(Number(e.target.value))}
      className="bg-zinc-800 text-white px-4 py-2 rounded-lg border border-zinc-700 min-w-64">
      <option value="">Select Race</option>
      {races.map(r => (
        <option key={r.RoundNumber} value={r.RoundNumber}>
          Round {r.RoundNumber}: {r.Country || r.EventName?.replace(' Grand Prix', '')} GP
        </option>
      ))}
    </select>
  )
}