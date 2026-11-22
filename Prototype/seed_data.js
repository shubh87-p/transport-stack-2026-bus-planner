const fs = require('node:fs');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');

const BASE_DIR = __dirname;
const DATA_DIR = path.join(BASE_DIR, 'data');
const GTFS_DIR = path.join(DATA_DIR, 'gtfs');
const GPS_DIR = path.join(DATA_DIR, 'historical_gps');

fs.mkdirSync(GTFS_DIR, { recursive: true });
fs.mkdirSync(GPS_DIR, { recursive: true });

// 1. Real Delhi Bus Stops (~45 major transit stops across North, Central, South, East, West Delhi)
const STOPS = [
  { stop_id: 'DL_STOP_001', stop_name: 'Kashmere Gate ISBT', stop_lat: 28.6675, stop_lon: 77.2282, zone: 'North' },
  { stop_id: 'DL_STOP_002', stop_name: 'Red Fort (Lal Qila)', stop_lat: 28.6562, stop_lon: 77.2370, zone: 'Central' },
  { stop_id: 'DL_STOP_003', stop_name: 'Delhi Gate / Daryaganj', stop_lat: 28.6412, stop_lon: 77.2405, zone: 'Central' },
  { stop_id: 'DL_STOP_004', stop_name: 'ITO Crossing', stop_lat: 28.6285, stop_lon: 77.2415, zone: 'Central' },
  { stop_id: 'DL_STOP_005', stop_name: 'Pragati Maidan / Supreme Court', stop_lat: 28.6206, stop_lon: 77.2435, zone: 'Central' },
  { stop_id: 'DL_STOP_006', stop_name: 'Mandi House', stop_lat: 28.6258, stop_lon: 77.2342, zone: 'Central' },
  { stop_id: 'DL_STOP_007', stop_name: 'Connaught Place (Rajiv Chowk)', stop_lat: 28.6328, stop_lon: 77.2197, zone: 'Central' },
  { stop_id: 'DL_STOP_008', stop_name: 'New Delhi Railway Station (Ajmeri Gate)', stop_lat: 28.6425, stop_lon: 77.2215, zone: 'Central' },
  { stop_id: 'DL_STOP_009', stop_name: 'India Gate / C-Hexagon', stop_lat: 28.6129, stop_lon: 77.2295, zone: 'Central' },
  { stop_id: 'DL_STOP_010', stop_name: 'Khan Market / Sujan Singh Park', stop_lat: 28.6001, stop_lon: 77.2275, zone: 'Central' },
  { stop_id: 'DL_STOP_011', stop_name: 'JLN Stadium / Lodhi Road', stop_lat: 28.5846, stop_lon: 77.2338, zone: 'South' },
  { stop_id: 'DL_STOP_012', stop_name: 'Lajpat Nagar Central Market', stop_lat: 28.5677, stop_lon: 77.2433, zone: 'South' },
  { stop_id: 'DL_STOP_013', stop_name: 'Moolchand Hospital', stop_lat: 28.5644, stop_lon: 77.2342, zone: 'South' },
  { stop_id: 'DL_STOP_014', stop_name: 'Kailash Colony', stop_lat: 28.5552, stop_lon: 77.2422, zone: 'South' },
  { stop_id: 'DL_STOP_015', stop_name: 'Nehru Place Terminal', stop_lat: 28.5494, stop_lon: 77.2519, zone: 'South' },
  { stop_id: 'DL_STOP_016', stop_name: 'Ashram Chowk (Ring Road)', stop_lat: 28.5714, stop_lon: 77.2588, zone: 'South' },
  { stop_id: 'DL_STOP_017', stop_name: 'Sarai Kale Khan ISBT', stop_lat: 28.5889, stop_lon: 77.2568, zone: 'East-South' },
  { stop_id: 'DL_STOP_018', stop_name: 'AIIMS / Safdarjung Hospital', stop_lat: 28.5672, stop_lon: 77.2100, zone: 'South' },
  { stop_id: 'DL_STOP_019', stop_name: 'INA Market / Dilli Haat', stop_lat: 28.5754, stop_lon: 77.2096, zone: 'South' },
  { stop_id: 'DL_STOP_020', stop_name: 'Central Secretariat / Udyog Bhawan', stop_lat: 28.6147, stop_lon: 77.2119, zone: 'Central' },
  { stop_id: 'DL_STOP_021', stop_name: 'Hauz Khas / IIT Delhi', stop_lat: 28.5458, stop_lon: 77.1995, zone: 'South' },
  { stop_id: 'DL_STOP_022', stop_name: 'Chirag Delhi', stop_lat: 28.5398, stop_lon: 77.2286, zone: 'South' },
  { stop_id: 'DL_STOP_023', stop_name: 'Saket District Centre', stop_lat: 28.5245, stop_lon: 77.2165, zone: 'South' },
  { stop_id: 'DL_STOP_024', stop_name: 'Qutub Minar / Mehrauli', stop_lat: 28.5244, stop_lon: 77.1855, zone: 'South' },
  { stop_id: 'DL_STOP_025', stop_name: 'Kalkaji Mandir / Okhla Phase 3', stop_lat: 28.5503, stop_lon: 77.2608, zone: 'South' },
  { stop_id: 'DL_STOP_026', stop_name: 'Govindpuri / Okhla Industrial Area', stop_lat: 28.5356, stop_lon: 77.2639, zone: 'South' },
  { stop_id: 'DL_STOP_027', stop_name: 'Badarpur Border', stop_lat: 28.4945, stop_lon: 77.3032, zone: 'South' },
  { stop_id: 'DL_STOP_028', stop_name: 'Civil Lines / Vidhan Sabha', stop_lat: 28.6814, stop_lon: 77.2225, zone: 'North' },
  { stop_id: 'DL_STOP_029', stop_name: 'Delhi University (North Campus)', stop_lat: 28.6902, stop_lon: 77.2136, zone: 'North' },
  { stop_id: 'DL_STOP_030', stop_name: 'GTB Nagar / Kingsway Camp', stop_lat: 28.6981, stop_lon: 77.2063, zone: 'North' },
  { stop_id: 'DL_STOP_031', stop_name: 'Azadpur Terminal', stop_lat: 28.7077, stop_lon: 77.1795, zone: 'North' },
  { stop_id: 'DL_STOP_032', stop_name: 'Netaji Subhash Place (Pitampura)', stop_lat: 28.6961, stop_lon: 77.1525, zone: 'North-West' },
  { stop_id: 'DL_STOP_033', stop_name: 'Rohini Sector 18 / Badli', stop_lat: 28.7383, stop_lon: 77.1398, zone: 'North-West' },
  { stop_id: 'DL_STOP_034', stop_name: 'Karol Bagh Terminal', stop_lat: 28.6442, stop_lon: 77.1895, zone: 'West' },
  { stop_id: 'DL_STOP_035', stop_name: 'Rajendra Place / Patel Nagar', stop_lat: 28.6451, stop_lon: 77.1685, zone: 'West' },
  { stop_id: 'DL_STOP_036', stop_name: 'Rajouri Garden Crossing', stop_lat: 28.6492, stop_lon: 77.1225, zone: 'West' },
  { stop_id: 'DL_STOP_037', stop_name: 'Janakpuri District Centre', stop_lat: 28.6289, stop_lon: 77.0815, zone: 'West' },
  { stop_id: 'DL_STOP_038', stop_name: 'Uttam Nagar Terminal', stop_lat: 28.6219, stop_lon: 77.0585, zone: 'West' },
  { stop_id: 'DL_STOP_039', stop_name: 'Dwarka Mor / Sector 10', stop_lat: 28.5921, stop_lon: 77.0462, zone: 'South-West' },
  { stop_id: 'DL_STOP_040', stop_name: 'Dhaula Kuan Ring Road', stop_lat: 28.5918, stop_lon: 77.1618, zone: 'South-West' },
  { stop_id: 'DL_STOP_041', stop_name: 'Vasant Vihar / Munirka', stop_lat: 28.5562, stop_lon: 77.1682, zone: 'South-West' },
  { stop_id: 'DL_STOP_042', stop_name: 'IGI Airport Terminal 3', stop_lat: 28.5562, stop_lon: 77.0999, zone: 'South-West' },
  { stop_id: 'DL_STOP_043', stop_name: 'Laxmi Nagar / Vikas Marg', stop_lat: 28.6304, stop_lon: 77.2775, zone: 'East' },
  { stop_id: 'DL_STOP_044', stop_name: 'Preet Vihar / Karkardooma', stop_lat: 28.6415, stop_lon: 77.2952, zone: 'East' },
  { stop_id: 'DL_STOP_045', stop_name: 'Anand Vihar ISBT', stop_lat: 28.6469, stop_lon: 77.3160, zone: 'East' },
  { stop_id: 'DL_STOP_046', stop_name: 'Mayur Vihar Phase 1', stop_lat: 28.6045, stop_lon: 77.2915, zone: 'East' }
];

// 2. Real DTC & Cluster Bus Routes connecting these stops
const ROUTES = [
  {
    route_id: 'DTC_425',
    route_short_name: '425',
    route_long_name: 'Kashmere Gate ISBT - Nehru Place Terminal (via ITO & Ashram)',
    agency_id: 'DTC',
    route_color: '1D4ED8',
    headway_peak_min: 7,
    headway_offpeak_min: 14,
    stops: ['DL_STOP_001', 'DL_STOP_002', 'DL_STOP_003', 'DL_STOP_004', 'DL_STOP_005', 'DL_STOP_017', 'DL_STOP_016', 'DL_STOP_012', 'DL_STOP_015']
  },
  {
    route_id: 'DTC_405',
    route_short_name: '405',
    route_long_name: 'Kashmere Gate ISBT - Badarpur Border (via Daryaganj, India Gate & Moolchand)',
    agency_id: 'DTC',
    route_color: '059669',
    headway_peak_min: 8,
    headway_offpeak_min: 15,
    stops: ['DL_STOP_001', 'DL_STOP_002', 'DL_STOP_003', 'DL_STOP_004', 'DL_STOP_009', 'DL_STOP_010', 'DL_STOP_011', 'DL_STOP_013', 'DL_STOP_014', 'DL_STOP_015', 'DL_STOP_025', 'DL_STOP_026', 'DL_STOP_027']
  },
  {
    route_id: 'DTC_433',
    route_short_name: '433',
    route_long_name: 'New Delhi Railway Station - Nehru Place Terminal (via Connaught Place & Lajpat Nagar)',
    agency_id: 'CLUSTER',
    route_color: 'D97706',
    headway_peak_min: 6,
    headway_offpeak_min: 12,
    stops: ['DL_STOP_008', 'DL_STOP_007', 'DL_STOP_006', 'DL_STOP_009', 'DL_STOP_010', 'DL_STOP_011', 'DL_STOP_012', 'DL_STOP_013', 'DL_STOP_014', 'DL_STOP_015']
  },
  {
    route_id: 'DTC_505',
    route_short_name: '505',
    route_long_name: 'Kashmere Gate ISBT - Qutub Minar / Mehrauli (via CP, AIIMS & Hauz Khas)',
    agency_id: 'DTC',
    route_color: '7C3AED',
    headway_peak_min: 8,
    headway_offpeak_min: 15,
    stops: ['DL_STOP_001', 'DL_STOP_008', 'DL_STOP_007', 'DL_STOP_020', 'DL_STOP_019', 'DL_STOP_018', 'DL_STOP_021', 'DL_STOP_024']
  },
  {
    route_id: 'DTC_OMS',
    route_short_name: 'OMS (+)',
    route_long_name: 'Outer Mudrika Service (Ring Road Circular: Kashmere Gate - AIIMS - Nehru Place - ITO)',
    agency_id: 'DTC',
    route_color: 'DC2626',
    headway_peak_min: 5,
    headway_offpeak_min: 10,
    stops: ['DL_STOP_001', 'DL_STOP_028', 'DL_STOP_029', 'DL_STOP_030', 'DL_STOP_031', 'DL_STOP_032', 'DL_STOP_036', 'DL_STOP_040', 'DL_STOP_018', 'DL_STOP_013', 'DL_STOP_015', 'DL_STOP_016', 'DL_STOP_017', 'DL_STOP_004', 'DL_STOP_001']
  },
  {
    route_id: 'DTC_534',
    route_short_name: '534',
    route_long_name: 'Anand Vihar ISBT - Qutub Minar (via Sarai Kale Khan, Ashram, Nehru Place & Saket)',
    agency_id: 'DTC',
    route_color: '0284C7',
    headway_peak_min: 7,
    headway_offpeak_min: 14,
    stops: ['DL_STOP_045', 'DL_STOP_044', 'DL_STOP_043', 'DL_STOP_046', 'DL_STOP_017', 'DL_STOP_016', 'DL_STOP_012', 'DL_STOP_015', 'DL_STOP_022', 'DL_STOP_021', 'DL_STOP_023', 'DL_STOP_024']
  },
  {
    route_id: 'DTC_729',
    route_short_name: '729',
    route_long_name: 'Connaught Place - Dwarka Sector 10 (via Karol Bagh, Rajouri Garden & Janakpuri)',
    agency_id: 'CLUSTER',
    route_color: 'EA580C',
    headway_peak_min: 7,
    headway_offpeak_min: 14,
    stops: ['DL_STOP_004', 'DL_STOP_006', 'DL_STOP_007', 'DL_STOP_034', 'DL_STOP_035', 'DL_STOP_036', 'DL_STOP_037', 'DL_STOP_038', 'DL_STOP_039']
  },
  {
    route_id: 'DTC_620',
    route_short_name: '620',
    route_long_name: 'Connaught Place - Vasant Vihar / Munirka (via Central Secretariat, Dhaula Kuan & IIT)',
    agency_id: 'DTC',
    route_color: '0D9488',
    headway_peak_min: 9,
    headway_offpeak_min: 16,
    stops: ['DL_STOP_006', 'DL_STOP_007', 'DL_STOP_020', 'DL_STOP_040', 'DL_STOP_041', 'DL_STOP_021', 'DL_STOP_022', 'DL_STOP_015']
  },
  {
    route_id: 'DTC_114',
    route_short_name: '114',
    route_long_name: 'Kashmere Gate ISBT - Rohini Sector 18 (via DU North Campus, Azadpur & Pitampura)',
    agency_id: 'DTC',
    route_color: '4F46E5',
    headway_peak_min: 8,
    headway_offpeak_min: 15,
    stops: ['DL_STOP_001', 'DL_STOP_028', 'DL_STOP_029', 'DL_STOP_030', 'DL_STOP_031', 'DL_STOP_032', 'DL_STOP_033']
  },
  {
    route_id: 'DTC_307',
    route_short_name: '307',
    route_long_name: 'Anand Vihar ISBT - Karol Bagh Terminal (via Laxmi Nagar, ITO & Connaught Place)',
    agency_id: 'CLUSTER',
    route_color: '9333EA',
    headway_peak_min: 7,
    headway_offpeak_min: 13,
    stops: ['DL_STOP_045', 'DL_STOP_044', 'DL_STOP_043', 'DL_STOP_004', 'DL_STOP_006', 'DL_STOP_007', 'DL_STOP_008', 'DL_STOP_034']
  },
  {
    route_id: 'DTC_AIRPORT_EXP',
    route_short_name: 'EXP-4',
    route_long_name: 'Kashmere Gate ISBT - IGI Airport Terminal 3 (via CP & Dhaula Kuan)',
    agency_id: 'DTC',
    route_color: '2563EB',
    headway_peak_min: 12,
    headway_offpeak_min: 20,
    stops: ['DL_STOP_001', 'DL_STOP_008', 'DL_STOP_007', 'DL_STOP_020', 'DL_STOP_040', 'DL_STOP_042']
  },
  {
    route_id: 'DTC_543',
    route_short_name: '543',
    route_long_name: 'Anand Vihar ISBT - AIIMS (via Mayur Vihar, Ashram, Lajpat Nagar & INA)',
    agency_id: 'DTC',
    route_color: '16A34A',
    headway_peak_min: 8,
    headway_offpeak_min: 15,
    stops: ['DL_STOP_045', 'DL_STOP_046', 'DL_STOP_017', 'DL_STOP_016', 'DL_STOP_012', 'DL_STOP_013', 'DL_STOP_018', 'DL_STOP_019']
  }
];

function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371.0;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Road tortuosity multiplier in Delhi (road distance vs straight-line distance)
function roadDistanceKm(s1, s2) {
  return Math.max(0.35, haversineKm(s1.stop_lat, s1.stop_lon, s2.stop_lat, s2.stop_lon) * 1.16);
}

const stopMap = new Map(STOPS.map(s => [s.stop_id, s]));

// Write stops.txt
const stopsCsv = ['stop_id,stop_code,stop_name,stop_lat,stop_lon,zone_id'];
for (const s of STOPS) {
  stopsCsv.push(`${s.stop_id},${s.stop_id},"${s.stop_name}",${s.stop_lat.toFixed(6)},${s.stop_lon.toFixed(6)},${s.zone}`);
}
fs.writeFileSync(path.join(GTFS_DIR, 'stops.txt'), stopsCsv.join('\n'));

// Write routes.txt
const routesCsv = ['route_id,agency_id,route_short_name,route_long_name,route_type,route_color'];
for (const r of ROUTES) {
  routesCsv.push(`${r.route_id},${r.agency_id},${r.route_short_name},"${r.route_long_name}",3,${r.route_color}`);
}
fs.writeFileSync(path.join(GTFS_DIR, 'routes.txt'), routesCsv.join('\n'));

// Build bidirectional routes & shapes.txt, trips.txt, stop_times.txt
const shapesCsv = ['shape_id,shape_pt_lat,shape_pt_lon,shape_pt_sequence,shape_dist_traveled'];
const tripsCsv = ['route_id,service_id,trip_id,trip_headsign,direction_id,shape_id'];
const stopTimesCsv = ['trip_id,arrival_time,departure_time,stop_id,stop_sequence,shape_dist_traveled'];

function formatGtfsTime(totalSec) {
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = Math.floor(totalSec % 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

for (const r of ROUTES) {
  for (let dir = 0; dir <= 1; dir++) {
    const stopIds = dir === 0 ? r.stops : [...r.stops].reverse();
    const shapeId = `SHAPE_${r.route_id}_D${dir}`;
    let distAcc = 0;
    let seq = 1;

    for (let i = 0; i < stopIds.length; i++) {
      const curr = stopMap.get(stopIds[i]);
      if (i > 0) {
        const prev = stopMap.get(stopIds[i - 1]);
        const segDist = roadDistanceKm(prev, curr);
        // Add 3 intermediate road waypoints per stop-to-stop segment for smooth polylines
        for (let k = 1; k <= 3; k++) {
          const frac = k / 4;
          // slight realistic curvature offset
          const curveOffset = Math.sin(frac * Math.PI) * 0.0018 * (dir === 0 ? 1 : -1);
          const lat = prev.stop_lat + (curr.stop_lat - prev.stop_lat) * frac + curveOffset;
          const lon = prev.stop_lon + (curr.stop_lon - prev.stop_lon) * frac - curveOffset;
          shapesCsv.push(`${shapeId},${lat.toFixed(6)},${lon.toFixed(6)},${seq++},${(distAcc + segDist * frac).toFixed(3)}`);
        }
        distAcc += segDist;
      }
      shapesCsv.push(`${shapeId},${curr.stop_lat.toFixed(6)},${curr.stop_lon.toFixed(6)},${seq++},${distAcc.toFixed(3)}`);
    }

    // Generate scheduled trips from 05:30 to 23:30
    const headsign = stopMap.get(stopIds[stopIds.length - 1]).stop_name;
    let startMin = 5 * 60 + 30;
    let tripIdx = 1;
    while (startMin <= 23 * 60 + 30) {
      const hour = Math.floor(startMin / 60);
      const isPeak = (hour >= 8 && hour <= 11) || (hour >= 17 && hour <= 20);
      const headway = isPeak ? r.headway_peak_min : r.headway_offpeak_min;
      const tripId = `TRIP_${r.route_id}_D${dir}_${String(tripIdx++).padStart(3, '0')}`;
      tripsCsv.push(`${r.route_id},ALL_DAYS,${tripId},"${headsign}",${dir},${shapeId}`);

      // Static GTFS assumes fixed 24 km/h timetable speed + 25s stop dwell
      let currSec = startMin * 60;
      let tripDist = 0;
      for (let i = 0; i < stopIds.length; i++) {
        if (i > 0) {
          const dKm = roadDistanceKm(stopMap.get(stopIds[i - 1]), stopMap.get(stopIds[i]));
          tripDist += dKm;
          const staticRunSec = Math.round((dKm / 24.0) * 3600);
          currSec += staticRunSec;
        }
        const arrStr = formatGtfsTime(currSec);
        currSec += i === 0 || i === stopIds.length - 1 ? 0 : 25;
        const depStr = formatGtfsTime(currSec);
        stopTimesCsv.push(`${tripId},${arrStr},${depStr},${stopIds[i]},${i + 1},${tripDist.toFixed(3)}`);
      }
      startMin += headway;
    }
  }
}

fs.writeFileSync(path.join(GTFS_DIR, 'shapes.txt'), shapesCsv.join('\n'));
fs.writeFileSync(path.join(GTFS_DIR, 'trips.txt'), tripsCsv.join('\n'));
fs.writeFileSync(path.join(GTFS_DIR, 'stop_times.txt'), stopTimesCsv.join('\n'));

// 3. Create Historical GPS SQLite Database (bus_movements_2026_10.db) & Precomputed Segment Speed Profiles
// Corridor congestion factor based on Delhi zones & hour of day
function getCorridorCongestionMultiplier(s1, s2, hour, isWeekend) {
  const bottleneckStops = new Set([
    'DL_STOP_004', // ITO
    'DL_STOP_016', // Ashram Chowk
    'DL_STOP_007', // Connaught Place
    'DL_STOP_012', // Lajpat Nagar
    'DL_STOP_040', // Dhaula Kuan
    'DL_STOP_001', // Kashmere Gate
    'DL_STOP_036', // Rajouri Garden
    'DL_STOP_043'  // Laxmi Nagar
  ]);
  const isBottleneck = bottleneckStops.has(s1.stop_id) || bottleneckStops.has(s2.stop_id);
  const corridorSensitivity = isBottleneck ? 1.12 : 1.0;

  // Hourly traffic multiplier in Delhi (0..23) relative to 36 km/h arterial cruise speed
  const weekdayCurve = [
    0.82, 0.80, 0.79, 0.80, 0.84, 0.90, // 00 - 05 (quiet night)
    1.02, 1.18, 1.44, 1.52, 1.38, 1.20, // 06 - 11 (morning peak 8-10:30 AM)
    1.14, 1.12, 1.14, 1.20, 1.32, 1.48, // 12 - 17 (afternoon -> evening build-up)
    1.56, 1.48, 1.30, 1.08, 0.92, 0.84  // 18 - 23 (evening peak 6-8 PM, quiet at 10-11 PM)
  ];
  const weekendCurve = [
    0.80, 0.78, 0.78, 0.79, 0.82, 0.86,
    0.92, 0.98, 1.08, 1.14, 1.18, 1.22,
    1.24, 1.22, 1.18, 1.20, 1.26, 1.32,
    1.36, 1.32, 1.20, 1.04, 0.90, 0.83
  ];

  const baseFactor = isWeekend ? weekendCurve[hour] : weekdayCurve[hour];
  const excess = Math.max(0, baseFactor - 0.82);
  return 0.82 + excess * corridorSensitivity;
}

const dbPath = path.join(GPS_DIR, 'bus_movements_2026_10_15.db');
if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);
const db = new DatabaseSync(dbPath);

db.exec(`
  CREATE TABLE bus_movements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    vehicle_id TEXT,
    lat REAL,
    lng REAL,
    speed REAL,
    route_id TEXT,
    trip_id TEXT,
    timestamp INTEGER,
    date TEXT,
    time TEXT
  );
  CREATE TABLE segment_historical_profiles (
    from_stop_id TEXT,
    to_stop_id TEXT,
    hour INTEGER,
    is_weekend INTEGER,
    distance_km REAL,
    scheduled_time_sec REAL,
    mean_cruise_sec REAL,
    mean_dwell_sec REAL,
    median_total_sec REAL,
    p25_total_sec REAL,
    p75_total_sec REAL,
    mean_speed_kmh REAL,
    sample_count INTEGER,
    PRIMARY KEY (from_stop_id, to_stop_id, hour, is_weekend)
  );
`);

// Collect all unique directed stop-to-stop edges across all routes
const uniqueEdges = new Map();
for (const r of ROUTES) {
  for (let dir = 0; dir <= 1; dir++) {
    const sIds = dir === 0 ? r.stops : [...r.stops].reverse();
    for (let i = 0; i < sIds.length - 1; i++) {
      const u = sIds[i];
      const v = sIds[i + 1];
      const key = `${u}->${v}`;
      if (!uniqueEdges.has(key)) {
        uniqueEdges.set(key, { u, v, routes: new Set([r.route_id]) });
      } else {
        uniqueEdges.get(key).routes.add(r.route_id);
      }
    }
  }
}

const insertProfile = db.prepare(`
  INSERT INTO segment_historical_profiles (
    from_stop_id, to_stop_id, hour, is_weekend, distance_km,
    scheduled_time_sec, mean_cruise_sec, mean_dwell_sec,
    median_total_sec, p25_total_sec, p75_total_sec, mean_speed_kmh, sample_count
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

db.exec('BEGIN TRANSACTION');
for (const edge of uniqueEdges.values()) {
  const s1 = stopMap.get(edge.u);
  const s2 = stopMap.get(edge.v);
  const distKm = roadDistanceKm(s1, s2);
  const schedSec = Math.round((distKm / 28.0) * 3600) + 18;
  const freeFlowSpeedKmh = 36.0;

  for (let isWeekend = 0; isWeekend <= 1; isWeekend++) {
    for (let hour = 0; hour < 24; hour++) {
      const mult = getCorridorCongestionMultiplier(s1, s2, hour, isWeekend === 1);
      const effectiveCruiseSpeed = Math.max(12.5, freeFlowSpeedKmh / mult);
      const cruiseSec = (distKm / effectiveCruiseSpeed) * 3600;
      // Stop + traffic signal dwell increases during peak hours
      const dwellSec = 14 + Math.round(18 * Math.max(0, mult - 0.82));
      const totalSec = cruiseSec + dwellSec;
      const effectiveSpeedKmh = (distKm / (totalSec / 3600));
      const routeCount = edge.routes.size;
      const sampleCount = (hour >= 0 && hour <= 4)
        ? Math.max(3, routeCount * 4)
        : routeCount * (isWeekend ? 28 : 46);

      insertProfile.run(
        edge.u,
        edge.v,
        hour,
        isWeekend,
        Number(distKm.toFixed(3)),
        schedSec,
        Number(cruiseSec.toFixed(1)),
        Number(dwellSec.toFixed(1)),
        Number(totalSec.toFixed(1)),
        Number((totalSec * 0.89).toFixed(1)),
        Number((totalSec * 1.14).toFixed(1)),
        Number(effectiveSpeedKmh.toFixed(2)),
        sampleCount
      );
    }
  }
}

// Insert realistic raw GPS trace records into bus_movements table (matching Section 3.2 schema)
const insertGps = db.prepare(`
  INSERT INTO bus_movements (vehicle_id, lat, lng, speed, route_id, trip_id, timestamp, date, time)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

let gpsCount = 0;
const baseEpoch = Math.floor(new Date('2026-10-15T03:00:00Z').getTime() / 1000); // 08:30 IST
for (let rIdx = 0; rIdx < ROUTES.length; rIdx++) {
  const r = ROUTES[rIdx];
  for (let busNum = 1; busNum <= 4; busNum++) {
    const vehicleId = `DL1PC${4100 + rIdx * 10 + busNum}`;
    const tripId = `TRIP_${r.route_id}_D${busNum % 2}_015`;
    const sIds = busNum % 2 === 0 ? r.stops : [...r.stops].reverse();
    let t = baseEpoch + busNum * 420;

    for (let i = 0; i < sIds.length - 1; i++) {
      const s1 = stopMap.get(sIds[i]);
      const s2 = stopMap.get(sIds[i + 1]);
      const distKm = roadDistanceKm(s1, s2);
      const mult = getCorridorCongestionMultiplier(s1, s2, 8, false);
      const segSpeed = Math.max(10, 29.0 / mult);

      for (let step = 0; step <= 4; step++) {
        const frac = step / 4;
        // Include occasional slightly noisy GPS ping to demonstrate map-matching filter
        const jitterLat = (Math.sin(t + step) * 0.00025);
        const jitterLon = (Math.cos(t + step) * 0.00025);
        const lat = s1.stop_lat + (s2.stop_lat - s1.stop_lat) * frac + jitterLat;
        const lng = s1.stop_lon + (s2.stop_lon - s1.stop_lon) * frac + jitterLon;
        const instSpeed = step === 0 ? 0.0 : Number((segSpeed + Math.sin(step) * 2.5).toFixed(1));
        const dObj = new Date((t + 19800) * 1000);
        const dateStr = '2026-10-15';
        const timeStr = dObj.toISOString().slice(11, 19);
        insertGps.run(vehicleId, Number(lat.toFixed(6)), Number(lng.toFixed(6)), instSpeed, r.route_id, tripId, t, dateStr, timeStr);
        t += Math.round(((distKm / 4) / Math.max(8, segSpeed)) * 3600);
        gpsCount++;
      }
    }
  }
}
db.exec('COMMIT');
db.close();

console.log(`Generated Delhi GTFS (${STOPS.length} stops, ${ROUTES.length} routes) and SQLite GPS DB (${gpsCount} GPS pings, ${uniqueEdges.size * 48} historical spatio-temporal segment profiles).`);
