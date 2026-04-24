from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import fastf1
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
import requests as req
import warnings
import os
from dotenv import load_dotenv
load_dotenv()

warnings.filterwarnings('ignore')

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

fastf1.Cache.enable_cache('cache')
fastf1.set_log_level('WARNING')

DRIVER_MAP = {
    'VER': 'max_verstappen', 'HAM': 'hamilton', 'LEC': 'leclerc',
    'SAI': 'sainz', 'PER': 'perez', 'NOR': 'norris', 'PIA': 'piastri',
    'RUS': 'russell', 'ALO': 'alonso', 'STR': 'stroll', 'GAS': 'gasly',
    'OCO': 'ocon', 'ALB': 'albon', 'BOT': 'bottas', 'HUL': 'hulkenberg',
    'MAG': 'magnussen', 'TSU': 'tsunoda', 'RIC': 'ricciardo', 'ZHO': 'zhou',
    'SAR': 'sargeant', 'DEV': 'de_vries', 'LAW': 'lawson', 'BEA': 'bearman',
    'COL': 'colapinto', 'DOO': 'doohan', 'HAD': 'hadjar', 'ANT': 'antonelli'
}

BASE_URL = "https://api.jolpi.ca/ergast/f1"

CIRCUIT_LOCATIONS = {
    1: {"name": "Albert Park", "city": "Melbourne", "country": "AU", "lat": -37.8497, "lon": 144.9680},
    2: {"name": "Jeddah", "city": "Jeddah", "country": "SA", "lat": 21.6319, "lon": 39.1044},
    3: {"name": "Bahrain", "city": "Sakhir", "country": "BH", "lat": 26.0325, "lon": 50.5106},
    4: {"name": "Suzuka", "city": "Suzuka", "country": "JP", "lat": 34.8431, "lon": 136.5414},
    5: {"name": "Shanghai", "city": "Shanghai", "country": "CN", "lat": 31.3389, "lon": 121.2198},
    6: {"name": "Miami", "city": "Miami", "country": "US", "lat": 25.9581, "lon": -80.2389},
    7: {"name": "Imola", "city": "Imola", "country": "IT", "lat": 44.3439, "lon": 11.7167},
    8: {"name": "Monaco", "city": "Monaco", "country": "MC", "lat": 43.7347, "lon": 7.4206},
    9: {"name": "Barcelona", "city": "Barcelona", "country": "ES", "lat": 41.5700, "lon": 2.2611},
    10: {"name": "Montreal", "city": "Montreal", "country": "CA", "lat": 45.5000, "lon": -73.5228},
    11: {"name": "Spielberg", "city": "Spielberg", "country": "AT", "lat": 47.2197, "lon": 14.7647},
    12: {"name": "Silverstone", "city": "Silverstone", "country": "GB", "lat": 52.0786, "lon": -1.0169},
    13: {"name": "Spa", "city": "Spa", "country": "BE", "lat": 50.4372, "lon": 5.9714},
    14: {"name": "Budapest", "city": "Budapest", "country": "HU", "lat": 47.5830, "lon": 19.2526},
    15: {"name": "Zandvoort", "city": "Zandvoort", "country": "NL", "lat": 52.3888, "lon": 4.5409},
    16: {"name": "Monza", "city": "Monza", "country": "IT", "lat": 45.6156, "lon": 9.2811},
    17: {"name": "Baku", "city": "Baku", "country": "AZ", "lat": 40.3725, "lon": 49.8533},
    18: {"name": "Singapore", "city": "Singapore", "country": "SG", "lat": 1.2914, "lon": 103.8644},
    19: {"name": "Austin", "city": "Austin", "country": "US", "lat": 30.1328, "lon": -97.6411},
    20: {"name": "Mexico City", "city": "Mexico City", "country": "MX", "lat": 19.4042, "lon": -99.0907},
    21: {"name": "Sao Paulo", "city": "Sao Paulo", "country": "BR", "lat": -23.7036, "lon": -46.6997},
    22: {"name": "Las Vegas", "city": "Las Vegas", "country": "US", "lat": 36.1147, "lon": -115.1728},
    23: {"name": "Lusail", "city": "Lusail", "country": "QA", "lat": 25.4900, "lon": 51.4542},
    24: {"name": "Yas Marina", "city": "Abu Dhabi", "country": "AE", "lat": 24.4672, "lon": 54.6031},
}


def call_ai(prompt, max_tokens=1000):
    """Try multiple AI providers in order until one works"""

    # ─── OPTION 1: GROQ ───────────────────────────────────────
    GROQ_KEY = os.getenv("GROQ_KEY", "")
    if GROQ_KEY:
        try:
            res = req.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={"Authorization": f"Bearer {GROQ_KEY}", "Content-Type": "application/json"},
                json={"model": "llama-3.1-8b-instant", "messages": [{"role": "user", "content": prompt}], "max_tokens": max_tokens},
                timeout=30
            )
            data = res.json()
            if "choices" in data:
                return data["choices"][0]["message"]["content"]
        except Exception as e:
            print(f"Groq failed: {e}")

    # ─── OPTION 2: TOGETHER AI ────────────────────────────────
    TOGETHER_KEY = os.getenv("TOGETHER_KEY", "")
    if TOGETHER_KEY:
        try:
            res = req.post(
                "https://api.together.xyz/v1/chat/completions",
                headers={"Authorization": f"Bearer {TOGETHER_KEY}", "Content-Type": "application/json"},
                json={"model": "meta-llama/Llama-3-8b-chat-hf", "messages": [{"role": "user", "content": prompt}], "max_tokens": max_tokens},
                timeout=30
            )
            data = res.json()
            if "choices" in data:
                return data["choices"][0]["message"]["content"]
        except Exception as e:
            print(f"Together failed: {e}")

    # ─── OPTION 3: OPENROUTER ────────────────────────────────
    OPENROUTER_KEY = os.getenv("OPENROUTER_KEY", "")
    if OPENROUTER_KEY:
        try:
            res = req.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers={"Authorization": f"Bearer {OPENROUTER_KEY}", "Content-Type": "application/json"},
                json={"model": "meta-llama/llama-3.1-8b-instruct:free", "messages": [{"role": "user", "content": prompt}], "max_tokens": max_tokens},
                timeout=30
            )
            data = res.json()
            if "choices" in data:
                return data["choices"][0]["message"]["content"]
        except Exception as e:
            print(f"OpenRouter failed: {e}")

    # ─── OPTION 4: RULE-BASED FALLBACK ───────────────────────
    return "AI analysis unavailable — all providers exhausted. Check your API keys in .env file."


# ─── STANDINGS ───────────────────────────────────────────────
@app.get("/standings/{year}")
def get_standings(year: int):
    try:
        url = f"{BASE_URL}/{year}/driverStandings.json"
        res = req.get(url, timeout=10)
        data = res.json()
        standings_list = data['MRData']['StandingsTable']['StandingsLists']
        if not standings_list:
            return {"error": "No data found"}
        standings = standings_list[0]['DriverStandings']
        result = []
        for s in standings:
            result.append({
                "Abbreviation": s['Driver']['code'],
                "FullName": f"{s['Driver']['givenName']} {s['Driver']['familyName']}",
                "TeamName": s['Constructors'][0]['name'],
                "Points": float(s['points'])
            })
        return result
    except Exception as e:
        return {"error": str(e)}


# ─── TYRE STRATEGY ───────────────────────────────────────────
@app.get("/tyre-strategy/{year}/{round_number}")
def get_tyre_strategy(year: int, round_number: int):
    try:
        session = fastf1.get_session(year, round_number, 'R')
        session.load(telemetry=False, weather=False, messages=False)
        laps = session.laps[['Driver', 'LapNumber', 'Compound', 'TyreLife', 'LapTime']].copy()
        laps['LapTimeSeconds'] = laps['LapTime'].dt.total_seconds()
        laps = laps.dropna(subset=['Compound'])
        strategy = laps.groupby(['Driver', 'Compound']).agg(
            Laps=('LapNumber', 'count'),
            AvgLapTime=('LapTimeSeconds', 'mean')
        ).reset_index()
        strategy['AvgLapTime'] = strategy['AvgLapTime'].round(3)
        return {"strategy": strategy.to_dict(orient='records'), "race": session.event['EventName'], "year": year}
    except Exception as e:
        return {"error": str(e)}


# ─── PIT STOPS ───────────────────────────────────────────────
@app.get("/pitstops/{year}/{round_number}")
def get_pitstops(year: int, round_number: int):
    try:
        session = fastf1.get_session(year, round_number, 'R')
        session.load(telemetry=False, weather=False, messages=False)
        laps = session.laps.copy()
        pit_data = laps.groupby('Driver').agg(TotalStops=('PitInTime', lambda x: x.notna().sum())).reset_index()
        results = session.results[['Abbreviation', 'TeamName', 'Position']].copy()
        results = results.rename(columns={'Abbreviation': 'Driver'})
        pit_data = pit_data.merge(results, on='Driver', how='left')
        return {"pitstops": pit_data.to_dict(orient='records'), "race": session.event['EventName']}
    except Exception as e:
        return {"error": str(e)}


# ─── SEASON DRIVER COMPARATOR ────────────────────────────────
@app.get("/compare/{year}/{driver1}/{driver2}")
def compare_drivers(year: int, driver1: str, driver2: str):
    try:
        stats = {}
        for driver in [driver1, driver2]:
            driver_id = DRIVER_MAP.get(driver.upper(), driver.lower())
            url = f"{BASE_URL}/{year}/drivers/{driver_id}/results.json?limit=100"
            res = req.get(url, timeout=10)
            data = res.json()
            races = data['MRData']['RaceTable']['Races']
            points = wins = podiums = dnf = 0
            for race in races:
                r = race['Results'][0]
                points += float(r.get('points', 0))
                pos = int(r.get('position', 99))
                if pos == 1: wins += 1
                if pos <= 3: podiums += 1
                if r.get('status', '') not in ['Finished', '+1 Lap', '+2 Laps']:
                    dnf += 1
            stats[driver] = {'points': points, 'wins': wins, 'podiums': podiums, 'dnf': dnf}
        return stats
    except Exception as e:
        return {"error": str(e)}


# ─── RACE WEEKEND COMPARATOR ─────────────────────────────────
@app.get("/race-compare/{year}/{round_number}/{driver1}/{driver2}")
def race_compare(year: int, round_number: int, driver1: str, driver2: str):
    try:
        session = fastf1.get_session(year, round_number, 'R')
        session.load(telemetry=False, weather=False, messages=False)
        result = {"race": session.event['EventName']}
        for drv in [driver1, driver2]:
            laps = session.laps.pick_driver(drv).copy()
            laps['LapTimeSeconds'] = laps['LapTime'].dt.total_seconds()
            laps = laps.dropna(subset=['LapTimeSeconds'])
            tyres = laps.groupby('Compound').agg(Laps=('LapNumber', 'count'), AvgLapTime=('LapTimeSeconds', 'mean')).reset_index()
            tyres['AvgLapTime'] = tyres['AvgLapTime'].round(3)
            stops = int(laps['PitInTime'].notna().sum())
            driver_result = session.results[session.results['Abbreviation'] == drv]
            position = int(driver_result['Position'].values[0]) if not driver_result.empty else 'N/A'
            result[drv] = {
                "laps": laps[['LapNumber', 'LapTimeSeconds']].to_dict(orient='records'),
                "tyres": tyres.to_dict(orient='records'),
                "stops": stops,
                "fastest_lap": round(float(laps['LapTimeSeconds'].min()), 3),
                "avg_lap": round(float(laps['LapTimeSeconds'].mean()), 3),
                "position": position
            }
        return result
    except Exception as e:
        return {"error": str(e)}


# ─── ANOMALY DETECTOR ─────────────────────────────────────────
@app.get("/anomaly/{year}/{round_number}/{driver}")
def detect_anomaly(year: int, round_number: int, driver: str):
    try:
        session = fastf1.get_session(year, round_number, 'R')
        session.load(telemetry=False, weather=False, messages=False)
        laps = session.laps.pick_driver(driver).copy()
        laps['LapTimeSeconds'] = laps['LapTime'].dt.total_seconds()
        laps = laps.dropna(subset=['LapTimeSeconds'])
        Q1 = laps['LapTimeSeconds'].quantile(0.25)
        Q3 = laps['LapTimeSeconds'].quantile(0.75)
        IQR = Q3 - Q1
        laps['Anomaly'] = ((laps['LapTimeSeconds'] < Q1 - 1.5 * IQR) | (laps['LapTimeSeconds'] > Q3 + 1.5 * IQR))
        result = laps[['LapNumber', 'LapTimeSeconds', 'Compound', 'Anomaly']].copy()
        result['LapTimeSeconds'] = result['LapTimeSeconds'].round(3)
        return {"laps": result.to_dict(orient='records'), "total_anomalies": int(laps['Anomaly'].sum()), "driver": driver, "race": session.event['EventName']}
    except Exception as e:
        return {"error": str(e)}


# ─── TYRE DEGRADATION ─────────────────────────────────────────
@app.get("/tyre-degradation/{year}/{round_number}/{driver}")
def tyre_degradation(year: int, round_number: int, driver: str):
    try:
        session = fastf1.get_session(year, round_number, 'R')
        session.load(telemetry=False, weather=False, messages=False)
        laps = session.laps.pick_driver(driver).copy()
        laps['LapTimeSeconds'] = laps['LapTime'].dt.total_seconds()
        laps = laps.dropna(subset=['LapTimeSeconds', 'Compound', 'TyreLife'])
        Q1 = laps['LapTimeSeconds'].quantile(0.25)
        Q3 = laps['LapTimeSeconds'].quantile(0.75)
        IQR = Q3 - Q1
        laps = laps[(laps['LapTimeSeconds'] >= Q1 - 1.5 * IQR) & (laps['LapTimeSeconds'] <= Q3 + 1.5 * IQR)]
        result = laps[['LapNumber', 'TyreLife', 'Compound', 'LapTimeSeconds']].copy()
        result['LapTimeSeconds'] = result['LapTimeSeconds'].round(3)
        result['TyreLife'] = result['TyreLife'].astype(int)
        deg_rates = []
        for compound in result['Compound'].unique():
            comp_laps = result[result['Compound'] == compound].copy()
            if len(comp_laps) > 3:
                x = comp_laps['TyreLife'].values
                y = comp_laps['LapTimeSeconds'].values
                slope = float(np.polyfit(x, y, 1)[0])
                deg_rates.append({
                    'Compound': compound,
                    'DegradationPerLap': round(slope, 4),
                    'TotalLaps': len(comp_laps),
                    'AvgLapTime': round(float(comp_laps['LapTimeSeconds'].mean()), 3)
                })
        return {"laps": result.to_dict(orient='records'), "degradation_rates": deg_rates, "driver": driver, "race": session.event['EventName']}
    except Exception as e:
        return {"error": str(e)}


# ─── QUALIFYING ANALYSIS ──────────────────────────────────────
@app.get("/qualifying/{year}/{round_number}")
def get_qualifying(year: int, round_number: int):
    try:
        session = fastf1.get_session(year, round_number, 'Q')
        session.load(telemetry=False, weather=False, messages=False)
        results = session.results[['Abbreviation', 'FullName', 'TeamName', 'Position', 'Q1', 'Q2', 'Q3']].copy()
        results['Position'] = pd.to_numeric(results['Position'], errors='coerce')
        results = results.sort_values('Position')

        def format_time(t):
            try:
                secs = t.total_seconds()
                mins = int(secs // 60)
                s = secs % 60
                return f"{mins}:{s:06.3f}"
            except:
                return "N/A"

        quali_data = []
        for _, row in results.iterrows():
            quali_data.append({
                "Position": int(row['Position']) if pd.notna(row['Position']) else 99,
                "Driver": row['Abbreviation'],
                "FullName": row['FullName'],
                "Team": row['TeamName'],
                "Q1": format_time(row['Q1']),
                "Q2": format_time(row['Q2']),
                "Q3": format_time(row['Q3']),
            })

        laps = session.laps.copy()
        laps['LapTimeSeconds'] = laps['LapTime'].dt.total_seconds()
        best_laps = laps.groupby('Driver')['LapTimeSeconds'].min().reset_index()
        best_laps.columns = ['Driver', 'BestLap']
        pole_time = best_laps['BestLap'].min()
        best_laps['GapToPole'] = (best_laps['BestLap'] - pole_time).round(3)

        return {"qualifying": quali_data, "best_laps": best_laps.to_dict(orient='records'), "race": session.event['EventName'], "year": year}
    except Exception as e:
        return {"error": str(e)}


# ─── WEATHER & TRACK CONDITIONS ───────────────────────────────
@app.get("/weather/{year}/{round_number}")
def get_weather(year: int, round_number: int):
    try:
        session = fastf1.get_session(year, round_number, 'R')
        session.load(telemetry=False, weather=True, messages=False)
        weather = session.weather_data.copy()
        if weather.empty:
            return {"error": "No weather data available"}
        weather['Time_seconds'] = weather['Time'].dt.total_seconds()
        result = {
            "race": session.event['EventName'],
            "year": year,
            "avg_air_temp": round(float(weather['AirTemp'].mean()), 1),
            "avg_track_temp": round(float(weather['TrackTemp'].mean()), 1),
            "max_track_temp": round(float(weather['TrackTemp'].max()), 1),
            "min_track_temp": round(float(weather['TrackTemp'].min()), 1),
            "avg_humidity": round(float(weather['Humidity'].mean()), 1),
            "avg_wind_speed": round(float(weather['WindSpeed'].mean()), 1),
            "rainfall": bool(weather['Rainfall'].any()),
            "weather_over_time": weather[['Time_seconds', 'AirTemp', 'TrackTemp', 'Humidity', 'WindSpeed', 'Rainfall']].round(2).to_dict(orient='records')
        }
        rain_str = "with rainfall during the race" if result['rainfall'] else "in dry conditions"
        prompt = f"""You are an F1 engineer. Analyze weather impact for {result['race']} {year}.
Weather: Air {result['avg_air_temp']}°C, Track {result['avg_track_temp']}°C (max {result['max_track_temp']}°C), Humidity {result['avg_humidity']}%, Wind {result['avg_wind_speed']}km/h, {rain_str}.
Give 3 bullet points: tyre degradation impact, aerodynamic impact, optimal strategy."""
        result['ai_weather_analysis'] = call_ai(prompt, max_tokens=500)
        return result
    except Exception as e:
        return {"error": str(e)}


# ─── RACE POSITIONS OVER TIME ─────────────────────────────────
@app.get("/race-positions/{year}/{round_number}")
def get_race_positions(year: int, round_number: int):
    try:
        session = fastf1.get_session(year, round_number, 'R')
        session.load(telemetry=False, weather=False, messages=False)
        laps = session.laps[['Driver', 'LapNumber', 'Position', 'PitInTime', 'PitOutTime', 'Compound']].copy()
        laps['Position'] = pd.to_numeric(laps['Position'], errors='coerce')
        laps = laps.dropna(subset=['Position'])
        results = session.results[['Abbreviation', 'GridPosition', 'Position', 'TeamName']].copy()
        results['GridPosition'] = pd.to_numeric(results['GridPosition'], errors='coerce')
        results['FinalPosition'] = pd.to_numeric(results['Position'], errors='coerce')
        results['PositionsGained'] = results['GridPosition'] - results['FinalPosition']
        results = results.sort_values('FinalPosition')
        pit_details = []
        for driver in laps['Driver'].unique():
            driver_laps = laps[laps['Driver'] == driver].sort_values('LapNumber')
            pit_laps_df = driver_laps[driver_laps['PitInTime'].notna()]
            for _, pit in pit_laps_df.iterrows():
                lap_num = int(pit['LapNumber'])
                pos_before = driver_laps[driver_laps['LapNumber'] == lap_num]['Position'].values
                pos_after = driver_laps[driver_laps['LapNumber'] == lap_num + 1]['Position'].values
                pit_details.append({
                    'Driver': driver, 'Lap': lap_num,
                    'PositionBefore': int(pos_before[0]) if len(pos_before) > 0 else None,
                    'PositionAfter': int(pos_after[0]) if len(pos_after) > 0 else None,
                    'Compound': str(pit['Compound'])
                })
        position_data = []
        for lap_num in sorted(laps['LapNumber'].unique()):
            if lap_num % 3 == 0 or lap_num == 1:
                lap_data = laps[laps['LapNumber'] == lap_num][['Driver', 'Position']].copy()
                for _, row in lap_data.iterrows():
                    position_data.append({'Lap': int(lap_num), 'Driver': row['Driver'], 'Position': int(row['Position'])})
        return {
            "race": session.event['EventName'], "year": year,
            "position_changes": results[['Abbreviation', 'TeamName', 'GridPosition', 'FinalPosition', 'PositionsGained']].to_dict(orient='records'),
            "pit_details": pit_details, "position_over_laps": position_data
        }
    except Exception as e:
        return {"error": str(e)}


# ─── AI RACE SUMMARY (DETAILED) ───────────────────────────────
@app.get("/race-summary-detailed/{year}/{round_number}")
def race_summary_detailed(year: int, round_number: int):
    try:
        session = fastf1.get_session(year, round_number, 'R')
        session.load(telemetry=False, weather=True, messages=False)
        results = session.results[['Abbreviation', 'FullName', 'TeamName', 'Position', 'Points', 'Status', 'GridPosition']].copy()
        results['Position'] = pd.to_numeric(results['Position'], errors='coerce')
        results['GridPosition'] = pd.to_numeric(results['GridPosition'], errors='coerce')
        results = results.sort_values('Position')
        laps = session.laps.copy()
        laps['LapTimeSeconds'] = laps['LapTime'].dt.total_seconds()
        clean_laps = laps.dropna(subset=['LapTimeSeconds'])
        fastest = clean_laps.loc[clean_laps['LapTimeSeconds'].idxmin()]
        fastest_driver = fastest['Driver']
        fastest_time = round(float(fastest['LapTimeSeconds']), 3)
        top3 = results.head(3)[['Abbreviation', 'FullName', 'TeamName', 'GridPosition']].to_dict(orient='records')
        dnfs = results[~results['Status'].isin(['Finished', '+1 Lap', '+2 Laps', '+3 Laps'])][['Abbreviation', 'Status']].to_dict(orient='records')
        strategies = {}
        for driver in results.head(10)['Abbreviation'].tolist():
            driver_laps = laps[laps['Driver'] == driver]
            compounds_used = driver_laps['Compound'].dropna().unique().tolist()
            pit_count = int(driver_laps['PitInTime'].notna().sum())
            pit_lap_nums = driver_laps[driver_laps['PitInTime'].notna()]['LapNumber'].tolist()
            strategies[driver] = {'compounds': compounds_used, 'pit_count': pit_count, 'pit_laps': [int(x) for x in pit_lap_nums]}
        weather = session.weather_data
        rainfall = bool(weather['Rainfall'].any()) if not weather.empty else False
        avg_track_temp = round(float(weather['TrackTemp'].mean()), 1) if not weather.empty else "N/A"
        strategy_text = "\n".join([f"  - {d}: {i['pit_count']} stops on laps {i['pit_laps']}, compounds: {i['compounds']}" for d, i in strategies.items()])
        prompt = f"""Expert F1 analyst. Write exciting race report for {session.event['EventName']} {year}.
Winner: {top3[0]['FullName']} ({top3[0]['TeamName']}) P{int(top3[0].get('GridPosition',0))}
P2: {top3[1]['FullName']} P3: {top3[2]['FullName']}
Fastest: {fastest_driver} {fastest_time}s | DNFs: {', '.join([f"{d['Abbreviation']}({d['Status']})" for d in dnfs]) if dnfs else 'None'}
Conditions: {'Wet' if rainfall else f'Dry {avg_track_temp}°C'} | Laps: {int(laps['LapNumber'].max())}
Strategies:\n{strategy_text}
Write 4-5 paragraphs: race start, pit strategies with lap numbers and compounds, key battles, podium, championship. Like Sky Sports F1."""
        ai_summary = call_ai(prompt, max_tokens=1200)
        return {
            "race": session.event['EventName'], "year": year, "podium": top3,
            "fastest_lap_driver": fastest_driver, "fastest_lap_time": fastest_time,
            "dnfs": dnfs, "total_laps": int(laps['LapNumber'].max()),
            "rainfall": rainfall, "avg_track_temp": avg_track_temp,
            "strategies": strategies, "ai_summary": ai_summary
        }
    except Exception as e:
        return {"error": str(e)}


# ─── AI RACE SUMMARY (BASIC) ──────────────────────────────────
@app.get("/race-summary/{year}/{round_number}")
def race_summary(year: int, round_number: int):
    try:
        session = fastf1.get_session(year, round_number, 'R')
        session.load(telemetry=False, weather=False, messages=False)
        results = session.results[['Abbreviation', 'FullName', 'TeamName', 'Position', 'Points', 'Status']].copy()
        results['Position'] = pd.to_numeric(results['Position'], errors='coerce')
        results = results.sort_values('Position')
        laps = session.laps.copy()
        laps['LapTimeSeconds'] = laps['LapTime'].dt.total_seconds()
        clean_laps = laps.dropna(subset=['LapTimeSeconds'])
        fastest = clean_laps.loc[clean_laps['LapTimeSeconds'].idxmin()]
        fastest_driver = fastest['Driver']
        fastest_time = round(float(fastest['LapTimeSeconds']), 3)
        pit_counts = laps.groupby('Driver').agg(Stops=('PitInTime', lambda x: x.notna().sum())).reset_index()
        top3 = results.head(3)[['Abbreviation', 'FullName', 'TeamName']].to_dict(orient='records')
        dnfs = results[~results['Status'].isin(['Finished', '+1 Lap', '+2 Laps', '+3 Laps'])]['Abbreviation'].tolist()
        summary_data = {
            "race": session.event['EventName'], "year": year,
            "winner": top3[0] if top3 else {}, "podium": top3,
            "fastest_lap_driver": fastest_driver, "fastest_lap_time": fastest_time,
            "dnfs": dnfs, "total_laps": int(laps['LapNumber'].max()),
            "pit_counts": pit_counts.to_dict(orient='records')
        }
        prompt = f"""F1 analyst. Race summary for {summary_data['race']} {year}.
Winner: {summary_data['winner'].get('FullName')} ({summary_data['winner'].get('TeamName')})
Podium: {', '.join([f"{p['FullName']} ({p['TeamName']})" for p in summary_data['podium']])}
Fastest: {fastest_driver} {fastest_time}s | DNFs: {', '.join(dnfs) if dnfs else 'None'} | Laps: {summary_data['total_laps']}
Write 3-4 paragraphs: result, strategy, incidents, championship. Professional F1 analyst style."""
        summary_data['ai_summary'] = call_ai(prompt)
        return summary_data
    except Exception as e:
        return {"error": str(e)}


# ─── PIT STOP TEAM COMPARISON ─────────────────────────────────
@app.get("/pitstops-teams/{year}/{round_number}")
def pitstops_teams(year: int, round_number: int):
    try:
        session = fastf1.get_session(year, round_number, 'R')
        session.load(telemetry=False, weather=False, messages=False)
        laps = session.laps.copy()
        results = session.results[['Abbreviation', 'TeamName', 'Position']].copy()
        results = results.rename(columns={'Abbreviation': 'Driver'})
        pit_data = laps.groupby('Driver').agg(TotalStops=('PitInTime', lambda x: x.notna().sum())).reset_index()
        pit_data = pit_data.merge(results, on='Driver', how='left')
        team_data = pit_data.groupby('TeamName').agg(
            AvgStops=('TotalStops', 'mean'), TotalStops=('TotalStops', 'sum'),
            Drivers=('Driver', lambda x: ', '.join(x))
        ).reset_index()
        team_data['AvgStops'] = team_data['AvgStops'].round(1)
        return {"teams": team_data.to_dict(orient='records'), "drivers": pit_data.to_dict(orient='records'), "race": session.event['EventName']}
    except Exception as e:
        return {"error": str(e)}


# ─── AI TYRE STRATEGY ────────────────────────────────────────
@app.get("/ai-strategy/{year}/{round_number}/{driver}")
def ai_strategy(year: int, round_number: int, driver: str):
    try:
        session = fastf1.get_session(year, round_number, 'R')
        session.load(telemetry=False, weather=False, messages=False)
        laps = session.laps.pick_driver(driver).copy()
        laps['LapTimeSeconds'] = laps['LapTime'].dt.total_seconds()
        laps = laps.dropna(subset=['LapTimeSeconds', 'Compound'])
        tyre_stints = laps.groupby('Compound').agg(
            Laps=('LapNumber', 'count'), AvgLapTime=('LapTimeSeconds', 'mean'), MinLapTime=('LapTimeSeconds', 'min')
        ).reset_index()
        tyre_stints['AvgLapTime'] = tyre_stints['AvgLapTime'].round(3)
        tyre_stints['MinLapTime'] = tyre_stints['MinLapTime'].round(3)
        pit_laps = laps[laps['PitInTime'].notna()]['LapNumber'].tolist()
        total_laps = int(laps['LapNumber'].max())
        driver_result = session.results[session.results['Abbreviation'] == driver]
        finish_pos = int(driver_result['Position'].values[0]) if not driver_result.empty else 'N/A'
        stint_text = "\n".join([f"  - {row['Compound']}: {row['Laps']} laps, avg {row['AvgLapTime']}s, best {row['MinLapTime']}s" for _, row in tyre_stints.iterrows()])
        prompt = f"""F1 strategist. Analyze {driver} at {session.event['EventName']} {session.event.year}.
P{finish_pos} | {total_laps} laps | Pitted: {pit_laps}
Stints:\n{stint_text}
Format exactly:
**STRATEGY VERDICT:** [one line]
**WHAT WORKED:** [2 bullets]
**WHAT DIDN'T WORK:** [2 bullets]
**OPTIMAL STRATEGY:** [description]
**KEY INSIGHT:** [one line]"""
        ai_analysis = call_ai(prompt, max_tokens=800)
        return {
            "driver": driver, "race": session.event['EventName'], "finish_position": finish_pos,
            "pit_laps": pit_laps, "tyre_stints": tyre_stints.to_dict(orient='records'), "ai_analysis": ai_analysis
        }
    except Exception as e:
        return {"error": str(e)}


# ─── ML PIT STRATEGY PREDICTOR ────────────────────────────────
@app.get("/ml-strategy/{year}/{round_number}/{driver}")
def ml_pit_strategy(year: int, round_number: int, driver: str):
    try:
        from sklearn.ensemble import GradientBoostingClassifier
        from sklearn.preprocessing import StandardScaler
        all_training = []
        schedule = fastf1.get_event_schedule(year, include_testing=False)
        past_rounds = [r for r in schedule['RoundNumber'].tolist() if r < round_number][:8]
        for rnd in past_rounds:
            try:
                s = fastf1.get_session(year, rnd, 'R')
                s.load(telemetry=False, weather=False, messages=False)
                laps = s.laps.copy()
                laps['LapTimeSeconds'] = laps['LapTime'].dt.total_seconds()
                laps = laps.dropna(subset=['LapTimeSeconds', 'TyreLife', 'Compound'])
                compound_map = {'SOFT': 0, 'MEDIUM': 1, 'HARD': 2, 'INTERMEDIATE': 3, 'WET': 4}
                laps['CompoundNum'] = laps['Compound'].map(compound_map).fillna(2)
                laps['WillPit'] = laps['PitInTime'].notna().astype(int)
                for drv in laps['Driver'].unique():
                    mask = laps['Driver'] == drv
                    laps.loc[mask, 'RollingAvgLap'] = laps.loc[mask, 'LapTimeSeconds'].rolling(3, min_periods=1).mean()
                laps['LapTimeDelta'] = laps['LapTimeSeconds'] - laps['RollingAvgLap']
                total_laps = int(laps['LapNumber'].max())
                laps['RacePct'] = laps['LapNumber'] / total_laps
                features = laps[['TyreLife', 'CompoundNum', 'LapTimeSeconds', 'LapTimeDelta', 'RacePct', 'WillPit']].dropna()
                all_training.append(features)
            except:
                continue
        if not all_training:
            return {"error": "Not enough training data. Try a later round."}
        train_df = pd.concat(all_training, ignore_index=True)
        X = train_df[['TyreLife', 'CompoundNum', 'LapTimeSeconds', 'LapTimeDelta', 'RacePct']].values
        y = train_df['WillPit'].values
        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X)
        model = GradientBoostingClassifier(n_estimators=100, max_depth=4, random_state=42)
        model.fit(X_scaled, y)
        session = fastf1.get_session(year, round_number, 'R')
        session.load(telemetry=False, weather=False, messages=False)
        laps = session.laps.pick_driver(driver).copy()
        laps['LapTimeSeconds'] = laps['LapTime'].dt.total_seconds()
        laps = laps.dropna(subset=['LapTimeSeconds', 'TyreLife', 'Compound'])
        compound_map = {'SOFT': 0, 'MEDIUM': 1, 'HARD': 2, 'INTERMEDIATE': 3, 'WET': 4}
        laps['CompoundNum'] = laps['Compound'].map(compound_map).fillna(2)
        laps['RollingAvgLap'] = laps['LapTimeSeconds'].rolling(3, min_periods=1).mean()
        laps['LapTimeDelta'] = laps['LapTimeSeconds'] - laps['RollingAvgLap']
        total_laps = int(session.laps['LapNumber'].max())
        laps['RacePct'] = laps['LapNumber'] / total_laps
        features_df = laps[['TyreLife', 'CompoundNum', 'LapTimeSeconds', 'LapTimeDelta', 'RacePct']].dropna()
        if features_df.empty:
            return {"error": "No feature data for this driver"}
        X_pred = scaler.transform(features_df.values)
        pit_probs = model.predict_proba(X_pred)[:, 1]
        actual_pits = laps[laps['PitInTime'].notna()]['LapNumber'].tolist()
        lap_predictions = []
        for i, (_, row) in enumerate(laps.iterrows()):
            if i < len(pit_probs):
                prob = float(pit_probs[i])
                lap_num = int(row['LapNumber'])
                decision = "🟢 Stay Out"
                if prob > 0.7: decision = "🔴 PIT NOW"
                elif prob > 0.4: decision = "🟡 Consider Pitting"
                lap_predictions.append({
                    "Lap": lap_num, "TyreAge": int(row['TyreLife']),
                    "Compound": str(row['Compound']), "LapTime": round(float(row['LapTimeSeconds']), 3),
                    "PitProbability": round(prob * 100, 1), "Decision": decision,
                    "ActuallyPitted": lap_num in [int(x) for x in actual_pits]
                })
        high_prob_laps = [p for p in lap_predictions if p['PitProbability'] > 60]
        optimal_pit = high_prob_laps[0]['Lap'] if high_prob_laps else None
        actual_pit_laps = set(int(x) for x in actual_pits)
        predicted_pit_laps = set(p['Lap'] for p in lap_predictions if p['PitProbability'] > 60)
        correct = len(actual_pit_laps & predicted_pit_laps)
        accuracy = round(correct / max(len(actual_pit_laps), 1) * 100, 1)
        return {
            "driver": driver, "race": session.event['EventName'], "year": year,
            "lap_predictions": lap_predictions, "optimal_pit_window": optimal_pit,
            "actual_pit_laps": [int(x) for x in actual_pits],
            "model_accuracy": accuracy, "training_races": len(all_training)
        }
    except Exception as e:
        return {"error": str(e)}


# ─── DECISION ENGINE ──────────────────────────────────────────
@app.get("/decision-engine/{year}/{round_number}/{driver}")
def decision_engine(year: int, round_number: int, driver: str):
    try:
        session = fastf1.get_session(year, round_number, 'R')
        session.load(telemetry=False, weather=True, messages=False)
        laps = session.laps.pick_driver(driver).copy()
        laps['LapTimeSeconds'] = laps['LapTime'].dt.total_seconds()
        laps = laps.dropna(subset=['LapTimeSeconds', 'Compound', 'TyreLife'])
        decisions = []
        compounds_used = []
        for compound in laps['Compound'].unique():
            stint = laps[laps['Compound'] == compound].copy()
            if len(stint) < 3: continue
            x = stint['TyreLife'].values
            y = stint['LapTimeSeconds'].values
            slope = float(np.polyfit(x, y, 1)[0])
            best_lap = float(stint['LapTimeSeconds'].min())
            last_lap = float(stint['LapTimeSeconds'].iloc[-1])
            tyre_age = int(stint['TyreLife'].iloc[-1])
            deg_threshold = {'SOFT': 0.08, 'MEDIUM': 0.05, 'HARD': 0.03}.get(compound, 0.05)
            lap_loss = last_lap - best_lap
            compounds_used.append({
                'Compound': compound, 'Laps': len(stint),
                'DegRate': round(slope, 4), 'BestLap': round(best_lap, 3),
                'LastLap': round(last_lap, 3), 'LapLoss': round(lap_loss, 3), 'TyreAge': tyre_age
            })
            if slope > deg_threshold:
                decisions.append({'Type': '🔴 CRITICAL', 'Decision': f'Pit NOW — {compound} degrading at +{round(slope,4)}s/lap (threshold {deg_threshold}s/lap)', 'Confidence': 'HIGH'})
            elif lap_loss > 1.5:
                decisions.append({'Type': '🟡 WARNING', 'Decision': f'Consider pitting — losing {round(lap_loss,3)}s vs best on {compound}', 'Confidence': 'MEDIUM'})
            else:
                decisions.append({'Type': '🟢 STABLE', 'Decision': f'{compound} performing well — {round(lap_loss,3)}s from best, stay out', 'Confidence': 'HIGH'})
        if compounds_used:
            fastest_compound = min(compounds_used, key=lambda x: x['BestLap'])
            slowest_deg = min(compounds_used, key=lambda x: x['DegRate'])
            rec = f"Best pace on {fastest_compound['Compound']} ({fastest_compound['BestLap']}s). Most durable: {slowest_deg['Compound']} ({slowest_deg['DegRate']}s/lap deg). "
            if fastest_compound['Compound'] != slowest_deg['Compound']:
                rec += f"Optimal: start {fastest_compound['Compound']} for pace, switch to {slowest_deg['Compound']} for longevity."
            else:
                rec += f"Stay on {fastest_compound['Compound']} — best pace and durability."
        else:
            rec = "Insufficient data."
        weather = session.weather_data
        track_temp = round(float(weather['TrackTemp'].mean()), 1) if not weather.empty else 0
        temp_warning = ""
        if track_temp > 45: temp_warning = f"⚠️ HIGH TRACK TEMP ({track_temp}°C) — accelerated SOFT deg. Prefer MEDIUM/HARD."
        elif track_temp < 25: temp_warning = f"❄️ LOW TRACK TEMP ({track_temp}°C) — tyres slow to warm up."
        driver_result = session.results[session.results['Abbreviation'] == driver]
        finish_pos = int(driver_result['Position'].values[0]) if not driver_result.empty else 'N/A'
        return {
            "driver": driver, "race": session.event['EventName'], "finish_position": finish_pos,
            "track_temp": track_temp, "temp_warning": temp_warning,
            "decisions": decisions, "compounds": compounds_used, "strategic_recommendation": rec
        }
    except Exception as e:
        return {"error": str(e)}


# ─── 2026 WEATHER FORECAST ────────────────────────────────────
@app.get("/weather-forecast/{round_number}")
def weather_forecast(round_number: int):
    try:
        circuit = CIRCUIT_LOCATIONS.get(round_number)
        if not circuit:
            return {"error": f"Circuit not found for round {round_number}"}
        lat = circuit['lat']
        lon = circuit['lon']
        url = (
            f"https://api.open-meteo.com/v1/forecast"
            f"?latitude={lat}&longitude={lon}"
            f"&current=temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation,weather_code"
            f"&hourly=temperature_2m,precipitation_probability,wind_speed_10m,weather_code"
            f"&forecast_days=2&timezone=auto"
        )
        response = req.get(url, timeout=15)
        data = response.json()
        if 'current' not in data:
            return {"error": "Weather API returned unexpected response"}
        current = data['current']
        current_temp = round(float(current.get('temperature_2m', 20)), 1)
        humidity = int(current.get('relative_humidity_2m', 50))
        wind_speed = round(float(current.get('wind_speed_10m', 10)), 1)
        precipitation = float(current.get('precipitation', 0))
        weather_code = int(current.get('weather_code', 0))

        def get_weather_desc(code):
            if code == 0: return "Clear Sky ☀️"
            elif code in [1, 2, 3]: return "Partly Cloudy ⛅"
            elif code in [45, 48]: return "Foggy 🌫️"
            elif code in [51, 53, 55]: return "Light Drizzle 🌦️"
            elif code in [61, 63, 65]: return "Rain 🌧️"
            elif code in [80, 81, 82]: return "Rain Showers 🌧️"
            elif code in [95, 96, 99]: return "Thunderstorm ⛈️"
            else: return "Mixed Conditions 🌤️"

        weather_desc = get_weather_desc(weather_code)
        is_sunny = weather_code in [0, 1, 2]
        estimated_track_temp = round(current_temp + (15 if is_sunny else 5), 1)
        rain_expected = precipitation > 0 or weather_code in [51,53,55,61,63,65,80,81,82,95,96,99]
        if rain_expected: tyre_rec, deg_prediction = "INTERMEDIATE or WET — rain expected", "LOW on wets — unpredictable"
        elif estimated_track_temp > 50: tyre_rec, deg_prediction = "HARD only — extreme temps", "VERY HIGH — 2+ stops mandatory"
        elif estimated_track_temp > 40: tyre_rec, deg_prediction = "MEDIUM or HARD", "HIGH — SOFT max 15-20 laps"
        elif estimated_track_temp > 30: tyre_rec, deg_prediction = "MEDIUM recommended", "MODERATE — MEDIUM lasts 25-30 laps"
        else: tyre_rec, deg_prediction = "SOFT viable — cool conditions", "LOW — SOFT can last 30+ laps"
        hourly = data.get('hourly', {})
        times = hourly.get('time', [])[:16]
        temps = hourly.get('temperature_2m', [])[:16]
        rain_probs = hourly.get('precipitation_probability', [])[:16]
        winds = hourly.get('wind_speed_10m', [])[:16]
        w_codes = hourly.get('weather_code', [])[:16]
        forecast = []
        for i in range(min(8, len(times))):
            forecast.append({
                'time': str(times[i]).replace('T', ' '),
                'temp': round(float(temps[i]), 1) if i < len(temps) else current_temp,
                'rain_prob': int(rain_probs[i]) if i < len(rain_probs) else 0,
                'wind': round(float(winds[i]), 1) if i < len(winds) else wind_speed,
                'description': get_weather_desc(int(w_codes[i])) if i < len(w_codes) else weather_desc
            })
        prompt = f"""F1 pit wall engineer. 3-bullet strategy for {circuit['name']}:
Weather: {current_temp}°C air, ~{estimated_track_temp}°C track, {humidity}% humidity, {wind_speed}km/h wind, {weather_desc}, Rain: {'YES' if rain_expected else 'No'}
• Tyre compound and why | • Expected pit stops | • Main risk"""
        ai_rec = call_ai(prompt, max_tokens=300)
        return {
            "circuit": circuit['name'], "city": circuit['city'], "round": round_number,
            "current_temp": current_temp, "estimated_track_temp": estimated_track_temp,
            "humidity": humidity, "wind_speed": wind_speed, "weather_description": weather_desc,
            "rain_chance": precipitation, "rain_expected": rain_expected,
            "tyre_recommendation": tyre_rec, "degradation_prediction": deg_prediction,
            "forecast": forecast, "ai_recommendation": ai_rec
        }
    except Exception as e:
        return {"error": str(e)}


# ─── RACE SCHEDULE ───────────────────────────────────────────
@app.get("/races/{year}")
def get_races(year: int):
    try:
        url = f"{BASE_URL}/{year}/races.json?limit=30"
        res = req.get(url, timeout=10)
        data = res.json()
        races = data['MRData']['RaceTable']['Races']
        result = []
        for r in races:
            result.append({
                "RoundNumber": int(r['round']),
                "EventName": r['raceName'],
                "EventDate": r['date'],
                "Circuit": r['Circuit']['circuitName'],
                "Country": r['Circuit']['Location']['country']
            })
        return result
    except Exception as e:
        return {"error": str(e)}