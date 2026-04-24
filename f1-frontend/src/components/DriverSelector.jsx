const DRIVERS_BY_YEAR = {
  2026: [
    { code: 'VER', name: 'Max Verstappen', team: 'Red Bull' },
    { code: 'LAW', name: 'Liam Lawson', team: 'Red Bull' },
    { code: 'NOR', name: 'Lando Norris', team: 'McLaren' },
    { code: 'PIA', name: 'Oscar Piastri', team: 'McLaren' },
    { code: 'LEC', name: 'Charles Leclerc', team: 'Ferrari' },
    { code: 'HAM', name: 'Lewis Hamilton', team: 'Ferrari' },
    { code: 'RUS', name: 'George Russell', team: 'Mercedes' },
    { code: 'ANT', name: 'Kimi Antonelli', team: 'Mercedes' },
    { code: 'ALO', name: 'Fernando Alonso', team: 'Aston Martin' },
    { code: 'STR', name: 'Lance Stroll', team: 'Aston Martin' },
    { code: 'GAS', name: 'Pierre Gasly', team: 'Alpine' },
    { code: 'DOO', name: 'Jack Doohan', team: 'Alpine' },
    { code: 'ALB', name: 'Alexander Albon', team: 'Williams' },
    { code: 'SAI', name: 'Carlos Sainz', team: 'Williams' },
    { code: 'HUL', name: 'Nico Hulkenberg', team: 'Sauber' },
    { code: 'BOR', name: 'Gabriel Bortoleto', team: 'Sauber' },
    { code: 'OCO', name: 'Esteban Ocon', team: 'Haas' },
    { code: 'BEA', name: 'Oliver Bearman', team: 'Haas' },
    { code: 'TSU', name: 'Yuki Tsunoda', team: 'Racing Bulls' },
    { code: 'HAD', name: 'Isack Hadjar', team: 'Racing Bulls' },
  ],
  2025: [
    { code: 'VER', name: 'Max Verstappen', team: 'Red Bull' },
    { code: 'TSU', name: 'Yuki Tsunoda', team: 'Red Bull' },
    { code: 'NOR', name: 'Lando Norris', team: 'McLaren' },
    { code: 'PIA', name: 'Oscar Piastri', team: 'McLaren' },
    { code: 'LEC', name: 'Charles Leclerc', team: 'Ferrari' },
    { code: 'HAM', name: 'Lewis Hamilton', team: 'Ferrari' },
    { code: 'RUS', name: 'George Russell', team: 'Mercedes' },
    { code: 'ANT', name: 'Kimi Antonelli', team: 'Mercedes' },
    { code: 'ALO', name: 'Fernando Alonso', team: 'Aston Martin' },
    { code: 'STR', name: 'Lance Stroll', team: 'Aston Martin' },
    { code: 'GAS', name: 'Pierre Gasly', team: 'Alpine' },
    { code: 'DOO', name: 'Jack Doohan', team: 'Alpine' },
    { code: 'ALB', name: 'Alexander Albon', team: 'Williams' },
    { code: 'SAI', name: 'Carlos Sainz', team: 'Williams' },
    { code: 'HUL', name: 'Nico Hulkenberg', team: 'Sauber' },
    { code: 'BOR', name: 'Gabriel Bortoleto', team: 'Sauber' },
    { code: 'OCO', name: 'Esteban Ocon', team: 'Haas' },
    { code: 'BEA', name: 'Oliver Bearman', team: 'Haas' },
    { code: 'LAW', name: 'Liam Lawson', team: 'Racing Bulls' },
    { code: 'HAD', name: 'Isack Hadjar', team: 'Racing Bulls' },
  ],
  2024: [
    { code: 'VER', name: 'Max Verstappen', team: 'Red Bull' },
    { code: 'PER', name: 'Sergio Perez', team: 'Red Bull' },
    { code: 'NOR', name: 'Lando Norris', team: 'McLaren' },
    { code: 'PIA', name: 'Oscar Piastri', team: 'McLaren' },
    { code: 'LEC', name: 'Charles Leclerc', team: 'Ferrari' },
    { code: 'SAI', name: 'Carlos Sainz', team: 'Ferrari' },
    { code: 'RUS', name: 'George Russell', team: 'Mercedes' },
    { code: 'HAM', name: 'Lewis Hamilton', team: 'Mercedes' },
    { code: 'ALO', name: 'Fernando Alonso', team: 'Aston Martin' },
    { code: 'STR', name: 'Lance Stroll', team: 'Aston Martin' },
    { code: 'GAS', name: 'Pierre Gasly', team: 'Alpine' },
    { code: 'OCO', name: 'Esteban Ocon', team: 'Alpine' },
    { code: 'ALB', name: 'Alexander Albon', team: 'Williams' },
    { code: 'SAR', name: 'Logan Sargeant', team: 'Williams' },
    { code: 'BOT', name: 'Valtteri Bottas', team: 'Sauber' },
    { code: 'ZHO', name: 'Guanyu Zhou', team: 'Sauber' },
    { code: 'MAG', name: 'Kevin Magnussen', team: 'Haas' },
    { code: 'HUL', name: 'Nico Hulkenberg', team: 'Haas' },
    { code: 'TSU', name: 'Yuki Tsunoda', team: 'Racing Bulls' },
    { code: 'RIC', name: 'Daniel Ricciardo', team: 'Racing Bulls' },
  ],
  2023: [
    { code: 'VER', name: 'Max Verstappen', team: 'Red Bull' },
    { code: 'PER', name: 'Sergio Perez', team: 'Red Bull' },
    { code: 'NOR', name: 'Lando Norris', team: 'McLaren' },
    { code: 'PIA', name: 'Oscar Piastri', team: 'McLaren' },
    { code: 'LEC', name: 'Charles Leclerc', team: 'Ferrari' },
    { code: 'SAI', name: 'Carlos Sainz', team: 'Ferrari' },
    { code: 'RUS', name: 'George Russell', team: 'Mercedes' },
    { code: 'HAM', name: 'Lewis Hamilton', team: 'Mercedes' },
    { code: 'ALO', name: 'Fernando Alonso', team: 'Aston Martin' },
    { code: 'STR', name: 'Lance Stroll', team: 'Aston Martin' },
    { code: 'GAS', name: 'Pierre Gasly', team: 'Alpine' },
    { code: 'OCO', name: 'Esteban Ocon', team: 'Alpine' },
    { code: 'ALB', name: 'Alexander Albon', team: 'Williams' },
    { code: 'SAR', name: 'Logan Sargeant', team: 'Williams' },
    { code: 'BOT', name: 'Valtteri Bottas', team: 'Alfa Romeo' },
    { code: 'ZHO', name: 'Guanyu Zhou', team: 'Alfa Romeo' },
    { code: 'MAG', name: 'Kevin Magnussen', team: 'Haas' },
    { code: 'HUL', name: 'Nico Hulkenberg', team: 'Haas' },
    { code: 'TSU', name: 'Yuki Tsunoda', team: 'AlphaTauri' },
    { code: 'DEV', name: 'Nyck de Vries', team: 'AlphaTauri' },
  ],
  2022: [
    { code: 'VER', name: 'Max Verstappen', team: 'Red Bull' },
    { code: 'PER', name: 'Sergio Perez', team: 'Red Bull' },
    { code: 'NOR', name: 'Lando Norris', team: 'McLaren' },
    { code: 'RIC', name: 'Daniel Ricciardo', team: 'McLaren' },
    { code: 'LEC', name: 'Charles Leclerc', team: 'Ferrari' },
    { code: 'SAI', name: 'Carlos Sainz', team: 'Ferrari' },
    { code: 'RUS', name: 'George Russell', team: 'Mercedes' },
    { code: 'HAM', name: 'Lewis Hamilton', team: 'Mercedes' },
    { code: 'ALO', name: 'Fernando Alonso', team: 'Alpine' },
    { code: 'OCO', name: 'Esteban Ocon', team: 'Alpine' },
    { code: 'ALB', name: 'Alexander Albon', team: 'Williams' },
    { code: 'LAT', name: 'Nicholas Latifi', team: 'Williams' },
    { code: 'BOT', name: 'Valtteri Bottas', team: 'Alfa Romeo' },
    { code: 'ZHO', name: 'Guanyu Zhou', team: 'Alfa Romeo' },
    { code: 'MAG', name: 'Kevin Magnussen', team: 'Haas' },
    { code: 'MSC', name: 'Mick Schumacher', team: 'Haas' },
    { code: 'TSU', name: 'Yuki Tsunoda', team: 'AlphaTauri' },
    { code: 'GAS', name: 'Pierre Gasly', team: 'AlphaTauri' },
    { code: 'STR', name: 'Lance Stroll', team: 'Aston Martin' },
    { code: 'VET', name: 'Sebastian Vettel', team: 'Aston Martin' },
  ]
}

export default function DriverSelector({ value, onChange, label, year }) {
  const drivers = DRIVERS_BY_YEAR[year] || DRIVERS_BY_YEAR[2024]
  return (
    <div className="flex flex-col gap-1">
      {label && <span className="text-zinc-400 text-xs">{label}</span>}
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="bg-zinc-800 text-white px-4 py-2 rounded-lg border border-zinc-700 min-w-48"
      >
        {drivers.map(d => (
          <option key={d.code} value={d.code}>
            {d.code} — {d.name} ({d.team})
          </option>
        ))}
      </select>
    </div>
  )
}
