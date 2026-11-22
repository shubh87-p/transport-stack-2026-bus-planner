# Delhi Real-Time Bus Traffic Model & Journey Planner
**Transport Stack Hackathon 2026 (Delhi) — Problem 1 / Phase 1 Working Prototype**

This project turns Delhi's DTC and Cluster bus fleet into a network of **moving traffic sensors**, combining:
1. **Static GTFS (`data/gtfs/`):** `stops.txt`, `routes.txt`, `trips.txt`, `stop_times.txt`, `shapes.txt`
2. **Historical GPS Traces (`data/historical_gps/bus_movements_2026_10_15.db`):** SQLite database storing historical bus GPS telemetry (`vehicle_id, lat, lng, speed, route_id, trip_id, timestamp, date, time`) and spatio-temporal stop-to-stop speed/dwell tensors (`segment_historical_profiles`).
3. **Real-Time Vehicle Positions (GTFS-RT):** Live bus location feed fused with historical profiles via **Empirical Bayes confidence-weighted shrinkage**.

---

## Quick Start (One-Command Run)

### Option 1: Double-click or run `start_prototype.bat` (Windows)
```powershell
.\start_prototype.bat
```

### Option 2: Run directly via Node.js (v22.5+ / v24+ with built-in `node:sqlite`)
```powershell
node seed_data.js
node server.js
```
Then open **http://localhost:3000** in your browser.

---

## REST API Documentation

### 1. Plan a Bus Journey (`GET /journeys`)
Accepts an `origin` (`from`), a `destination` (`to`) as stop names or `"lat,lng"` coordinates, and a `departure time` (`depart` in ISO 8601 or `HH:MM`).

**Example Request (from Problem Statement Section 2.2):**
```http
GET http://localhost:3000/journeys?from=Kashmere%20Gate%20ISBT&to=Nehru%20Place%20Terminal&depart=2026-11-24T08:30:00%2B05:30
```

**What it returns:**
- `query`: Resolved origin and destination coordinates, nearest stops, day of week, and departure time.
- `journeys`: Top 2–3 Pareto-optimal route options (Direct and 1-Transfer). Each option includes:
  - `access_walk`: Walking distance and minutes to the first boarding stop.
  - `legs`: Boarding stop, bus route (`425`, `405`, `OMS (+)`, `433`, etc.), intermediate stop sequence, segment-by-segment predicted travel times, cruise time vs. stop/signal dwell time, and alighting stop.
  - `egress_walk`: Walking distance and minutes from the final stop to the destination.
  - `total_time_min` & `estimated_arrival_time`: Predicted total duration and ETA based on our real-time + historical traffic model (not just the static timetable).
  - `quiet_hour_comparison`: Shows how long the exact same trip takes at a quieter hour (`23:00` / 11:00 PM) and the exact traffic delay in minutes and percentage.
- `hourly_travel_time_curve`: 24-hour travel time profile (`00:00` to `23:00`) showing how the trip duration changes across hours of the day.

### 2. Live GTFS-RT Vehicle Positions (`GET /api/gtfs-rt/vehicles`)
Returns live bus positions (`vehicle_id, route_id, latitude, longitude, speed_kmh, timestamp`) across Delhi corridors.

### 3. Validation Benchmark Report (`GET /api/validation`)
Compares our model's travel-time predictions against **observed DTC bus trip times**, **Google Maps Transit**, and the **Static GTFS Timetable** across major Delhi OD pairs at peak and quiet hours.

### 4. Stops & Routes Directory (`GET /api/stops?q=...`)
Search stops and routes in the Delhi bus network.
