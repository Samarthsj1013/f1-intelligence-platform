import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import Home from './pages/Home'
import Standings from './pages/Standings'
import TyreStrategy from './pages/TyreStrategy'
import TyreDegradation from './pages/TyreDegradation'
import PitStop from './pages/PitStop'
import PitStopTeams from './pages/PitStopTeams'
import DriverComparator from './pages/DriverComparator'
import AnomalyDetector from './pages/AnomalyDetector'
import RaceSummary from './pages/RaceSummary'
import AIStrategy from './pages/AIStrategy'
import WeatherAnalysis from './pages/WeatherAnalysis'
import WeatherForecast from './pages/WeatherForecast'
import QualifyingAnalysis from './pages/QualifyingAnalysis'
import RacePositions from './pages/RacePositions'
import MLPredictor from './pages/MLPredictor'
import DecisionEngine from './pages/DecisionEngine'

const navItems = [
  { path: '/', label: '🏠 Home' },
  { path: '/standings', label: '🏆 Standings' },
  { path: '/qualifying', label: '⚡ Qualifying' },
  { path: '/tyre', label: '🔴 Tyre Strategy' },
  { path: '/degradation', label: '🔻 Tyre Degradation' },
  { path: '/pitstop', label: '⏱️ Pit Stops' },
  { path: '/pitstop-teams', label: '🏁 Team Pit Stops' },
  { path: '/positions', label: '📈 Race Positions' },
  { path: '/compare', label: '👥 Comparator' },
  { path: '/weather', label: '🌤️ Race Weather' },
  { path: '/weather-forecast', label: '🔮 2026 Forecast' },
  { path: '/anomaly', label: '🚨 Anomaly' },
  { path: '/ml-predictor', label: '🤖 ML Pit Predictor' },
  { path: '/decision', label: '⚡ Decision Engine' },
  { path: '/summary', label: '📰 Race Summary' },
  { path: '/ai-strategy', label: '🧠 AI Strategy' },
]

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen">
        <aside className="w-56 bg-zinc-900 border-r border-zinc-800 flex flex-col p-4 fixed h-full overflow-y-auto">
          <div className="mb-6">
            <div className="text-red-500 text-3xl font-black tracking-tighter">F1</div>
            <div className="text-white text-sm font-semibold">Intelligence Platform</div>
          </div>
          <nav className="flex flex-col gap-1">
            {navItems.map(item => (
              <NavLink key={item.path} to={item.path} end={item.path === '/'}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-lg text-sm transition-all ${isActive
                    ? 'bg-red-600 text-white font-semibold'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800'}`}>
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="mt-auto pt-4 text-zinc-600 text-xs">Built with FastF1 + React</div>
        </aside>
        <main className="ml-56 flex-1 p-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/standings" element={<Standings />} />
            <Route path="/qualifying" element={<QualifyingAnalysis />} />
            <Route path="/tyre" element={<TyreStrategy />} />
            <Route path="/degradation" element={<TyreDegradation />} />
            <Route path="/pitstop" element={<PitStop />} />
            <Route path="/pitstop-teams" element={<PitStopTeams />} />
            <Route path="/positions" element={<RacePositions />} />
            <Route path="/compare" element={<DriverComparator />} />
            <Route path="/weather" element={<WeatherAnalysis />} />
            <Route path="/weather-forecast" element={<WeatherForecast />} />
            <Route path="/anomaly" element={<AnomalyDetector />} />
            <Route path="/ml-predictor" element={<MLPredictor />} />
            <Route path="/decision" element={<DecisionEngine />} />
            <Route path="/summary" element={<RaceSummary />} />
            <Route path="/ai-strategy" element={<AIStrategy />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}