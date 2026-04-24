export default function Home() {
  const stats = [
    { label: 'Seasons', value: '74+' },
    { label: 'Drivers', value: '800+' },
    { label: 'Constructors', value: '210+' },
    { label: 'Circuits', value: '77+' },
  ]

  const modules = [
    { icon: '🏆', title: 'Season Standings', desc: 'Driver championship points via live API' },
    { icon: '⚡', title: 'Qualifying Analysis', desc: 'Q1/Q2/Q3 times and gap to pole' },
    { icon: '🔴', title: 'Tyre Strategy', desc: 'Compound usage and average pace per stint' },
    { icon: '🔻', title: 'Tyre Degradation', desc: 'Lap time vs tyre age with degradation rate' },
    { icon: '⏱️', title: 'Pit Stop Analysis', desc: 'Stop timing and position impact per stop' },
    { icon: '🏁', title: 'Team Pit Stops', desc: 'Strategy comparison across all teams' },
    { icon: '📈', title: 'Race Positions', desc: 'Position tracker with overtake data' },
    { icon: '👥', title: 'Driver Comparator', desc: 'Head to head lap times and tyre strategy' },
    { icon: '🌤️', title: 'Weather & Track', desc: 'Real weather data with AI strategy impact' },
    { icon: '🚨', title: 'Anomaly Detector', desc: 'Statistical detection of unusual lap times' },
    { icon: '📰', title: 'AI Race Summary', desc: 'Detailed race report with strategy analysis' },
    { icon: '🧠', title: 'AI Strategy Analyst', desc: 'AI explains what worked and what did not' },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-black text-white mb-2">
          🏎️ F1 Intelligence <span className="text-red-500">Platform</span>
        </h1>
        <p className="text-zinc-400 text-lg">Professional Formula 1 data analytics — real telemetry, real strategy, real insights</p>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-10">
        {stats.map(s => (
          <div key={s.label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 text-center">
            <div className="text-3xl font-black text-red-500">{s.value}</div>
            <div className="text-zinc-400 text-sm mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <h2 className="text-xl font-bold text-white mb-4">📌 12 Analytics Modules</h2>
      <div className="grid grid-cols-3 gap-4">
        {modules.map(m => (
          <div key={m.title} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-red-500 transition-all cursor-pointer">
            <div className="text-2xl mb-2">{m.icon}</div>
            <div className="text-white font-semibold mb-1">{m.title}</div>
            <div className="text-zinc-400 text-sm">{m.desc}</div>
          </div>
        ))}
      </div>
    </div>
  )
}