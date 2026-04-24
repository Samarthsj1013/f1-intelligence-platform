export const TEAM_COLORS = {
  'Red Bull': '#3671C6',
  'Red Bull Racing': '#3671C6',
  'McLaren': '#FF8000',
  'Ferrari': '#E8002D',
  'Mercedes': '#27F4D2',
  'Aston Martin': '#229971',
  'Alpine': '#FF87BC',
  'Williams': '#64C4FF',
  'Racing Bulls': '#6692FF',
  'RB': '#6692FF',
  'AlphaTauri': '#5E8FAA',
  'Sauber': '#52E252',
  'Kick Sauber': '#52E252',
  'Alfa Romeo': '#C92D4B',
  'Haas': '#B6BABD',
  'Haas F1 Team': '#B6BABD',
}

export const TYRE_COLORS = {
  SOFT: '#e10600',
  MEDIUM: '#ffd700',
  HARD: '#ffffff',
  INTERMEDIATE: '#00d2be',
  WET: '#0067ff',
}

export const DRIVER_TEAM_MAP = {
  // 2025/2026
  'VER': 'Red Bull', 'TSU': 'Red Bull', 'LAW': 'Red Bull',
  'NOR': 'McLaren', 'PIA': 'McLaren',
  'LEC': 'Ferrari', 'HAM': 'Ferrari',
  'RUS': 'Mercedes', 'ANT': 'Mercedes',
  'ALO': 'Aston Martin', 'STR': 'Aston Martin',
  'GAS': 'Alpine', 'DOO': 'Alpine',
  'ALB': 'Williams', 'SAI': 'Williams',
  'HUL': 'Sauber', 'BOR': 'Sauber',
  'OCO': 'Haas', 'BEA': 'Haas',
  'HAD': 'Racing Bulls',
  // 2024
  'PER': 'Red Bull',
  'RIC': 'Racing Bulls',
  'SAR': 'Williams',
  'BOT': 'Sauber',
  'ZHO': 'Sauber',
  'MAG': 'Haas',
  // 2023 and older
  'DEV': 'AlphaTauri',
  'VET': 'Aston Martin',
  'MSC': 'Haas',
  'LAT': 'Williams',
  'RAI': 'Alfa Romeo',
  'GIO': 'Alfa Romeo',
  'MAZ': 'Haas',
}

export function getDriverColor(driverCode) {
  const team = DRIVER_TEAM_MAP[driverCode]
  return TEAM_COLORS[team] || '#888888'
}