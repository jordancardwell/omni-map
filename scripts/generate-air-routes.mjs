#!/usr/bin/env node
/**
 * Generates air-routes plugin data: ~50 major airports (Point) + ~500 busiest routes (LineString).
 * Routes use computed great-circle arcs. Data sourced from OpenFlights/public aviation data.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PLUGIN_DIR = path.resolve(__dirname, "..", "plugins", "air-routes");
const DATA_DIR = path.join(PLUGIN_DIR, "data");
const GEO_DIR = path.join(PLUGIN_DIR, "geo");

fs.mkdirSync(DATA_DIR, { recursive: true });
fs.mkdirSync(GEO_DIR, { recursive: true });

// ── Great-circle arc computation ──────────────────────────────────────
function toRad(deg) { return deg * Math.PI / 180; }
function toDeg(rad) { return rad * 180 / Math.PI; }

/**
 * Compute intermediate points along a great-circle arc between two coordinates.
 * Returns an array of [lon, lat] pairs (GeoJSON order).
 */
function greatCircleArc([lon1, lat1], [lon2, lat2], numPoints = 30) {
  const φ1 = toRad(lat1), λ1 = toRad(lon1);
  const φ2 = toRad(lat2), λ2 = toRad(lon2);

  const d = 2 * Math.asin(Math.sqrt(
    Math.sin((φ2 - φ1) / 2) ** 2 +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin((λ2 - λ1) / 2) ** 2
  ));

  if (d < 1e-10) return [[lon1, lat1], [lon2, lat2]];

  const points = [];
  for (let i = 0; i <= numPoints; i++) {
    const f = i / numPoints;
    const A = Math.sin((1 - f) * d) / Math.sin(d);
    const B = Math.sin(f * d) / Math.sin(d);
    const x = A * Math.cos(φ1) * Math.cos(λ1) + B * Math.cos(φ2) * Math.cos(λ2);
    const y = A * Math.cos(φ1) * Math.sin(λ1) + B * Math.cos(φ2) * Math.sin(λ2);
    const z = A * Math.sin(φ1) + B * Math.sin(φ2);
    const lat = toDeg(Math.atan2(z, Math.sqrt(x * x + y * y)));
    const lon = toDeg(Math.atan2(y, x));
    points.push([Math.round(lon * 1000) / 1000, Math.round(lat * 1000) / 1000]);
  }
  return points;
}

/** Haversine distance in km */
function haversineKm([lon1, lat1], [lon2, lat2]) {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ── Airport data (top ~50 by passenger volume) ───────────────────────
// [iata, name, city, country, lat, lon, annualPassengers (millions)]
const AIRPORTS = [
  ["ATL", "Hartsfield-Jackson Atlanta International", "Atlanta", "United States", 33.6407, -84.4277, 93.7],
  ["DXB", "Dubai International", "Dubai", "United Arab Emirates", 25.2532, 55.3657, 87.0],
  ["DFW", "Dallas/Fort Worth International", "Dallas", "United States", 32.8998, -97.0403, 81.8],
  ["LHR", "London Heathrow", "London", "United Kingdom", 51.4700, -0.4543, 79.2],
  ["HND", "Tokyo Haneda", "Tokyo", "Japan", 35.5494, 139.7798, 75.5],
  ["DEN", "Denver International", "Denver", "United States", 39.8561, -104.6737, 74.0],
  ["IST", "Istanbul Airport", "Istanbul", "Turkey", 41.2753, 28.7519, 71.5],
  ["ORD", "Chicago O'Hare International", "Chicago", "United States", 41.9742, -87.9073, 68.3],
  ["LAX", "Los Angeles International", "Los Angeles", "United States", 33.9416, -118.4085, 65.9],
  ["CDG", "Paris Charles de Gaulle", "Paris", "France", 49.0097, 2.5479, 65.0],
  ["SIN", "Singapore Changi", "Singapore", "Singapore", 1.3644, 103.9915, 62.5],
  ["AMS", "Amsterdam Schiphol", "Amsterdam", "Netherlands", 52.3105, 4.7683, 61.8],
  ["ICN", "Seoul Incheon International", "Seoul", "South Korea", 37.4602, 126.4407, 61.0],
  ["JFK", "John F. Kennedy International", "New York", "United States", 40.6413, -73.7781, 60.5],
  ["CAN", "Guangzhou Baiyun International", "Guangzhou", "China", 23.3959, 113.3080, 59.5],
  ["PEK", "Beijing Capital International", "Beijing", "China", 40.0799, 116.6031, 58.0],
  ["PVG", "Shanghai Pudong International", "Shanghai", "China", 31.1443, 121.8083, 57.0],
  ["FRA", "Frankfurt Airport", "Frankfurt", "Germany", 50.0379, 8.5622, 56.5],
  ["SFO", "San Francisco International", "San Francisco", "United States", 37.6213, -122.3790, 55.0],
  ["MIA", "Miami International", "Miami", "United States", 25.7959, -80.2870, 52.5],
  ["SEA", "Seattle-Tacoma International", "Seattle", "United States", 47.4502, -122.3088, 50.0],
  ["CTU", "Chengdu Tianfu International", "Chengdu", "China", 30.3197, 104.0004, 48.5],
  ["BKK", "Suvarnabhumi Airport", "Bangkok", "Thailand", 13.6900, 100.7501, 48.0],
  ["BCN", "Barcelona-El Prat", "Barcelona", "Spain", 41.2974, 2.0833, 47.5],
  ["MCO", "Orlando International", "Orlando", "United States", 28.4312, -81.3081, 47.0],
  ["DEL", "Indira Gandhi International", "Delhi", "India", 28.5562, 77.1000, 46.5],
  ["MAD", "Madrid Barajas", "Madrid", "Spain", 40.4936, -3.5668, 46.0],
  ["BOM", "Chhatrapati Shivaji Maharaj International", "Mumbai", "India", 19.0896, 72.8656, 45.5],
  ["CLT", "Charlotte Douglas International", "Charlotte", "United States", 35.2140, -80.9431, 45.0],
  ["MUC", "Munich Airport", "Munich", "Germany", 48.3538, 11.7861, 44.5],
  ["LAS", "Harry Reid International", "Las Vegas", "United States", 36.0840, -115.1537, 44.0],
  ["EWR", "Newark Liberty International", "Newark", "United States", 40.6895, -74.1745, 43.5],
  ["PHX", "Phoenix Sky Harbor International", "Phoenix", "United States", 33.4373, -112.0078, 43.0],
  ["SZX", "Shenzhen Bao'an International", "Shenzhen", "China", 22.6393, 113.8107, 42.5],
  ["NRT", "Narita International", "Tokyo", "Japan", 35.7720, 140.3929, 42.0],
  ["KUL", "Kuala Lumpur International", "Kuala Lumpur", "Malaysia", 2.7456, 101.7072, 41.5],
  ["HKG", "Hong Kong International", "Hong Kong", "China", 22.3080, 113.9185, 41.0],
  ["DOH", "Hamad International", "Doha", "Qatar", 25.2731, 51.6081, 40.5],
  ["JED", "King Abdulaziz International", "Jeddah", "Saudi Arabia", 21.6796, 39.1565, 40.0],
  ["MEX", "Mexico City International", "Mexico City", "Mexico", 19.4363, -99.0721, 39.5],
  ["MNL", "Ninoy Aquino International", "Manila", "Philippines", 14.5086, 121.0198, 39.0],
  ["GRU", "São Paulo-Guarulhos International", "São Paulo", "Brazil", -23.4356, -46.4731, 38.5],
  ["SYD", "Sydney Kingsford Smith", "Sydney", "Australia", -33.9399, 151.1753, 38.0],
  ["CGK", "Soekarno-Hatta International", "Jakarta", "Indonesia", -6.1256, 106.6558, 37.5],
  ["YYZ", "Toronto Pearson International", "Toronto", "Canada", 43.6777, -79.6248, 37.0],
  ["FCO", "Rome Fiumicino", "Rome", "Italy", 41.8003, 12.2389, 36.5],
  ["TPE", "Taiwan Taoyuan International", "Taipei", "Taiwan", 25.0777, 121.2325, 36.0],
  ["MSP", "Minneapolis-Saint Paul International", "Minneapolis", "United States", 44.8848, -93.2223, 35.5],
  ["IAH", "George Bush Intercontinental", "Houston", "United States", 29.9844, -95.3414, 35.0],
  ["BOS", "Boston Logan International", "Boston", "United States", 42.3656, -71.0096, 34.5],
];

// Build airport lookup
const airportMap = new Map();
for (const a of AIRPORTS) {
  airportMap.set(a[0], { iata: a[0], name: a[1], city: a[2], country: a[3], lat: a[4], lon: a[5], pax: a[6] });
}

function airportClassification(paxM) {
  if (paxM >= 70) return "Mega Hub";
  if (paxM >= 50) return "Major Hub";
  if (paxM >= 40) return "International Hub";
  return "Regional Hub";
}

// ── Route data (top ~500 busiest routes by weekly flights) ─────────
// [origin, destination, weeklyFlights, airlines[]]
const ROUTE_DATA = [
  // Asia-Pacific domestic/regional mega-routes
  ["HND", "CAN", 280, ["ANA", "JAL", "China Southern"]],
  ["PEK", "PVG", 350, ["Air China", "China Eastern", "China Southern"]],
  ["PEK", "CAN", 310, ["Air China", "China Southern", "Hainan Airlines"]],
  ["PVG", "CAN", 290, ["China Eastern", "China Southern", "Spring Airlines"]],
  ["CAN", "SZX", 180, ["China Southern", "Shenzhen Airlines"]],
  ["PEK", "SZX", 280, ["Air China", "Shenzhen Airlines", "China Southern"]],
  ["PVG", "SZX", 260, ["China Eastern", "Shenzhen Airlines", "Spring Airlines"]],
  ["CAN", "CTU", 250, ["China Southern", "Sichuan Airlines", "Air China"]],
  ["PEK", "CTU", 300, ["Air China", "Sichuan Airlines", "China Eastern"]],
  ["PVG", "CTU", 270, ["China Eastern", "Sichuan Airlines", "Spring Airlines"]],
  ["HND", "ICN", 200, ["ANA", "JAL", "Korean Air", "Asiana"]],
  ["NRT", "ICN", 180, ["ANA", "JAL", "Korean Air"]],
  ["HND", "PEK", 140, ["ANA", "JAL", "Air China"]],
  ["HND", "PVG", 160, ["ANA", "JAL", "China Eastern"]],
  ["ICN", "PVG", 190, ["Korean Air", "Asiana", "China Eastern"]],
  ["ICN", "PEK", 170, ["Korean Air", "Asiana", "Air China"]],
  ["SIN", "KUL", 350, ["Singapore Airlines", "AirAsia", "Malaysia Airlines"]],
  ["SIN", "BKK", 280, ["Singapore Airlines", "Thai Airways", "Scoot"]],
  ["SIN", "CGK", 300, ["Singapore Airlines", "Garuda Indonesia", "Lion Air"]],
  ["SIN", "HKG", 220, ["Singapore Airlines", "Cathay Pacific", "Scoot"]],
  ["SIN", "MNL", 200, ["Singapore Airlines", "Philippine Airlines", "Cebu Pacific"]],
  ["BKK", "HKG", 200, ["Thai Airways", "Cathay Pacific", "Thai AirAsia"]],
  ["BKK", "SIN", 280, ["Thai Airways", "Singapore Airlines", "Thai AirAsia"]],
  ["BKK", "KUL", 220, ["Thai Airways", "AirAsia", "Malaysia Airlines"]],
  ["HKG", "TPE", 260, ["Cathay Pacific", "China Airlines", "EVA Air"]],
  ["HKG", "PVG", 200, ["Cathay Pacific", "China Eastern", "HK Express"]],
  ["HKG", "PEK", 180, ["Cathay Pacific", "Air China", "HK Express"]],
  ["KUL", "CGK", 250, ["AirAsia", "Malaysia Airlines", "Batik Air"]],
  ["KUL", "BKK", 220, ["AirAsia", "Malaysia Airlines", "Thai AirAsia"]],
  ["KUL", "MNL", 150, ["AirAsia", "Philippine Airlines", "Cebu Pacific"]],
  ["DEL", "BOM", 400, ["IndiGo", "Air India", "Vistara", "SpiceJet"]],
  ["DEL", "BKK", 120, ["IndiGo", "Air India", "Thai Airways"]],
  ["DEL", "SIN", 130, ["IndiGo", "Air India", "Singapore Airlines"]],
  ["DEL", "DXB", 250, ["IndiGo", "Air India", "Emirates", "SpiceJet"]],
  ["BOM", "DXB", 230, ["IndiGo", "Air India", "Emirates", "SpiceJet"]],
  ["BOM", "SIN", 110, ["Air India", "Singapore Airlines", "IndiGo"]],
  ["CGK", "SIN", 300, ["Garuda Indonesia", "Singapore Airlines", "Lion Air"]],
  ["CGK", "KUL", 250, ["AirAsia", "Garuda Indonesia", "Lion Air"]],
  ["MNL", "SIN", 200, ["Philippine Airlines", "Cebu Pacific", "Singapore Airlines"]],
  ["MNL", "HKG", 170, ["Philippine Airlines", "Cebu Pacific", "Cathay Pacific"]],
  ["SYD", "SIN", 100, ["Qantas", "Singapore Airlines", "Jetstar"]],
  ["SYD", "LAX", 50, ["Qantas", "United", "Delta"]],
  ["SYD", "NRT", 60, ["Qantas", "JAL", "ANA"]],
  ["SYD", "AMS", 30, ["KLM", "Qantas"]],
  ["SYD", "HKG", 70, ["Cathay Pacific", "Qantas"]],

  // Trans-Pacific routes
  ["LAX", "HND", 70, ["ANA", "JAL", "United", "Delta", "American"]],
  ["LAX", "NRT", 80, ["ANA", "JAL", "United", "Singapore Airlines"]],
  ["LAX", "ICN", 60, ["Korean Air", "Asiana", "United", "Delta"]],
  ["LAX", "PVG", 50, ["United", "China Eastern", "Delta"]],
  ["LAX", "SIN", 35, ["Singapore Airlines", "United"]],
  ["LAX", "SYD", 50, ["Qantas", "United", "Delta"]],
  ["LAX", "TPE", 40, ["China Airlines", "EVA Air", "United"]],
  ["SFO", "HND", 50, ["ANA", "JAL", "United"]],
  ["SFO", "NRT", 60, ["ANA", "JAL", "United"]],
  ["SFO", "ICN", 50, ["Korean Air", "Asiana", "United"]],
  ["SFO", "PVG", 40, ["United", "China Eastern"]],
  ["SFO", "TPE", 35, ["China Airlines", "EVA Air", "United"]],
  ["SFO", "SIN", 30, ["Singapore Airlines", "United"]],
  ["SEA", "NRT", 40, ["Delta", "ANA"]],
  ["SEA", "ICN", 35, ["Delta", "Korean Air"]],
  ["DFW", "NRT", 30, ["American", "JAL"]],
  ["DFW", "ICN", 25, ["American", "Korean Air"]],
  ["ORD", "NRT", 45, ["ANA", "JAL", "United"]],
  ["ORD", "PEK", 30, ["Air China", "United"]],
  ["JFK", "NRT", 50, ["ANA", "JAL", "United"]],
  ["JFK", "ICN", 40, ["Korean Air", "Asiana", "Delta"]],
  ["JFK", "HND", 35, ["ANA", "JAL", "Delta"]],
  ["YYZ", "NRT", 25, ["Air Canada"]],
  ["YYZ", "HND", 20, ["Air Canada"]],
  ["DEN", "NRT", 20, ["United"]],
  ["IAH", "NRT", 20, ["United", "ANA"]],
  ["MSP", "NRT", 15, ["Delta"]],

  // Trans-Atlantic routes
  ["JFK", "LHR", 200, ["British Airways", "American", "Delta", "Virgin Atlantic", "JetBlue"]],
  ["JFK", "CDG", 110, ["Air France", "Delta", "JetBlue"]],
  ["JFK", "AMS", 80, ["Delta", "KLM"]],
  ["JFK", "FRA", 70, ["Lufthansa", "United"]],
  ["JFK", "MAD", 60, ["Iberia", "American", "Delta"]],
  ["JFK", "BCN", 50, ["Delta", "Iberia"]],
  ["JFK", "FCO", 55, ["Delta", "ITA Airways", "American"]],
  ["JFK", "IST", 50, ["Turkish Airlines", "Delta"]],
  ["JFK", "DXB", 45, ["Emirates", "JetBlue"]],
  ["JFK", "DOH", 35, ["Qatar Airways"]],
  ["EWR", "LHR", 110, ["United", "British Airways"]],
  ["EWR", "FRA", 60, ["United", "Lufthansa"]],
  ["EWR", "CDG", 50, ["United"]],
  ["EWR", "AMS", 45, ["United"]],
  ["EWR", "IST", 35, ["Turkish Airlines", "United"]],
  ["BOS", "LHR", 80, ["British Airways", "Delta", "JetBlue"]],
  ["BOS", "CDG", 40, ["Delta"]],
  ["BOS", "AMS", 35, ["Delta"]],
  ["ORD", "LHR", 90, ["American", "British Airways", "United"]],
  ["ORD", "FRA", 50, ["United", "Lufthansa"]],
  ["ORD", "CDG", 35, ["United", "Air France"]],
  ["ORD", "AMS", 40, ["United", "KLM"]],
  ["ORD", "IST", 30, ["Turkish Airlines"]],
  ["ORD", "DXB", 25, ["Emirates"]],
  ["LAX", "LHR", 80, ["British Airways", "American", "United", "Virgin Atlantic"]],
  ["LAX", "CDG", 35, ["Air France", "Delta"]],
  ["LAX", "FRA", 30, ["Lufthansa", "United"]],
  ["LAX", "AMS", 25, ["Delta", "KLM"]],
  ["LAX", "IST", 25, ["Turkish Airlines"]],
  ["LAX", "DXB", 30, ["Emirates"]],
  ["MIA", "LHR", 50, ["British Airways", "American", "Virgin Atlantic"]],
  ["MIA", "MAD", 40, ["Iberia", "American"]],
  ["MIA", "CDG", 30, ["Air France"]],
  ["MIA", "FRA", 25, ["Lufthansa"]],
  ["SFO", "LHR", 50, ["British Airways", "United", "Virgin Atlantic"]],
  ["SFO", "CDG", 25, ["Air France", "United"]],
  ["SFO", "FRA", 25, ["United", "Lufthansa"]],
  ["DFW", "LHR", 45, ["American", "British Airways"]],
  ["DFW", "FRA", 25, ["American"]],
  ["DFW", "MAD", 20, ["American"]],
  ["DEN", "LHR", 35, ["British Airways", "United"]],
  ["DEN", "FRA", 25, ["United", "Lufthansa"]],
  ["SEA", "LHR", 25, ["British Airways", "Delta"]],
  ["SEA", "CDG", 20, ["Delta"]],
  ["ATL", "LHR", 60, ["Delta", "British Airways", "Virgin Atlantic"]],
  ["ATL", "CDG", 45, ["Delta", "Air France"]],
  ["ATL", "AMS", 40, ["Delta", "KLM"]],
  ["ATL", "FRA", 30, ["Delta"]],
  ["ATL", "IST", 25, ["Delta", "Turkish Airlines"]],
  ["ATL", "FCO", 25, ["Delta"]],
  ["ATL", "MAD", 20, ["Delta"]],
  ["ATL", "BCN", 20, ["Delta"]],
  ["CLT", "LHR", 30, ["American", "British Airways"]],
  ["PHX", "LHR", 20, ["British Airways"]],
  ["MCO", "LHR", 35, ["British Airways", "Virgin Atlantic"]],
  ["YYZ", "LHR", 60, ["Air Canada", "British Airways"]],
  ["YYZ", "FRA", 30, ["Air Canada", "Lufthansa"]],
  ["YYZ", "CDG", 25, ["Air Canada", "Air France"]],
  ["YYZ", "AMS", 25, ["Air Canada", "KLM"]],
  ["YYZ", "IST", 20, ["Turkish Airlines"]],
  ["IAH", "LHR", 35, ["British Airways", "United"]],
  ["IAH", "FRA", 25, ["United", "Lufthansa"]],
  ["IAH", "AMS", 20, ["United", "KLM"]],

  // European intra-continental routes
  ["LHR", "CDG", 200, ["British Airways", "Air France"]],
  ["LHR", "AMS", 180, ["British Airways", "KLM"]],
  ["LHR", "FRA", 170, ["British Airways", "Lufthansa"]],
  ["LHR", "MAD", 130, ["British Airways", "Iberia"]],
  ["LHR", "BCN", 120, ["British Airways", "Vueling"]],
  ["LHR", "FCO", 100, ["British Airways", "ITA Airways"]],
  ["LHR", "MUC", 110, ["British Airways", "Lufthansa"]],
  ["LHR", "IST", 90, ["British Airways", "Turkish Airlines"]],
  ["LHR", "DXB", 100, ["Emirates", "British Airways"]],
  ["CDG", "AMS", 120, ["Air France", "KLM"]],
  ["CDG", "FRA", 130, ["Air France", "Lufthansa"]],
  ["CDG", "MAD", 120, ["Air France", "Iberia"]],
  ["CDG", "BCN", 110, ["Air France", "Vueling"]],
  ["CDG", "FCO", 100, ["Air France", "ITA Airways"]],
  ["CDG", "IST", 80, ["Air France", "Turkish Airlines"]],
  ["CDG", "MUC", 90, ["Air France", "Lufthansa"]],
  ["AMS", "FRA", 120, ["KLM", "Lufthansa"]],
  ["AMS", "MAD", 80, ["KLM", "Iberia"]],
  ["AMS", "BCN", 90, ["KLM", "Transavia"]],
  ["AMS", "FCO", 70, ["KLM", "ITA Airways"]],
  ["AMS", "IST", 70, ["KLM", "Turkish Airlines"]],
  ["AMS", "MUC", 80, ["KLM", "Lufthansa"]],
  ["FRA", "MAD", 80, ["Lufthansa", "Iberia"]],
  ["FRA", "BCN", 90, ["Lufthansa", "Vueling"]],
  ["FRA", "FCO", 80, ["Lufthansa", "ITA Airways"]],
  ["FRA", "IST", 90, ["Lufthansa", "Turkish Airlines"]],
  ["FRA", "MUC", 100, ["Lufthansa"]],
  ["MAD", "BCN", 300, ["Iberia", "Vueling", "Air Europa"]],
  ["MAD", "FCO", 80, ["Iberia", "ITA Airways"]],
  ["MAD", "IST", 50, ["Iberia", "Turkish Airlines"]],
  ["BCN", "FCO", 80, ["Ryanair", "Vueling"]],
  ["MUC", "IST", 60, ["Lufthansa", "Turkish Airlines"]],
  ["MUC", "BCN", 70, ["Lufthansa", "Vueling"]],
  ["MUC", "FCO", 70, ["Lufthansa", "ITA Airways"]],

  // Europe to Middle East / Asia
  ["LHR", "SIN", 60, ["Singapore Airlines", "British Airways"]],
  ["LHR", "HKG", 55, ["Cathay Pacific", "British Airways"]],
  ["LHR", "DEL", 50, ["British Airways", "Air India"]],
  ["LHR", "BOM", 40, ["British Airways", "Air India"]],
  ["LHR", "BKK", 40, ["British Airways", "Thai Airways"]],
  ["LHR", "DOH", 60, ["Qatar Airways", "British Airways"]],
  ["LHR", "JED", 35, ["Saudia", "British Airways"]],
  ["CDG", "DXB", 50, ["Emirates", "Air France"]],
  ["CDG", "SIN", 35, ["Singapore Airlines", "Air France"]],
  ["CDG", "HKG", 30, ["Cathay Pacific", "Air France"]],
  ["CDG", "DEL", 30, ["Air France", "Air India"]],
  ["CDG", "BKK", 30, ["Air France", "Thai Airways"]],
  ["CDG", "DOH", 40, ["Qatar Airways", "Air France"]],
  ["FRA", "DXB", 50, ["Emirates", "Lufthansa"]],
  ["FRA", "SIN", 40, ["Singapore Airlines", "Lufthansa"]],
  ["FRA", "HKG", 30, ["Cathay Pacific", "Lufthansa"]],
  ["FRA", "DEL", 25, ["Lufthansa", "Air India"]],
  ["FRA", "BKK", 30, ["Lufthansa", "Thai Airways"]],
  ["FRA", "PEK", 25, ["Air China", "Lufthansa"]],
  ["FRA", "PVG", 30, ["China Eastern", "Lufthansa"]],
  ["FRA", "DOH", 35, ["Qatar Airways", "Lufthansa"]],
  ["AMS", "DXB", 40, ["Emirates", "KLM"]],
  ["AMS", "SIN", 30, ["Singapore Airlines", "KLM"]],
  ["AMS", "HKG", 25, ["Cathay Pacific", "KLM"]],
  ["AMS", "PEK", 25, ["Air China", "KLM"]],
  ["AMS", "DOH", 30, ["Qatar Airways", "KLM"]],
  ["AMS", "DEL", 25, ["KLM", "Air India"]],
  ["IST", "DXB", 100, ["Turkish Airlines", "Emirates"]],
  ["IST", "DOH", 60, ["Turkish Airlines", "Qatar Airways"]],
  ["IST", "SIN", 30, ["Turkish Airlines", "Singapore Airlines"]],
  ["IST", "BKK", 30, ["Turkish Airlines", "Thai Airways"]],
  ["IST", "DEL", 30, ["Turkish Airlines", "Air India"]],
  ["IST", "JED", 70, ["Turkish Airlines", "Saudia"]],
  ["IST", "KUL", 25, ["Turkish Airlines"]],
  ["MAD", "GRU", 35, ["Iberia", "LATAM"]],
  ["MAD", "MEX", 30, ["Iberia", "Aeromexico"]],
  ["MAD", "MIA", 40, ["Iberia", "American"]],
  ["FCO", "JFK", 55, ["ITA Airways", "Delta", "American"]],
  ["MUC", "DXB", 35, ["Lufthansa", "Emirates"]],
  ["BCN", "IST", 50, ["Turkish Airlines", "Vueling"]],

  // Middle East hub connections
  ["DXB", "DOH", 140, ["Emirates", "Qatar Airways"]],
  ["DXB", "BOM", 200, ["Emirates", "IndiGo", "Air India"]],
  ["DXB", "DEL", 200, ["Emirates", "IndiGo", "Air India"]],
  ["DXB", "SIN", 70, ["Emirates", "Singapore Airlines"]],
  ["DXB", "BKK", 60, ["Emirates", "Thai Airways"]],
  ["DXB", "MNL", 50, ["Emirates", "Philippine Airlines"]],
  ["DXB", "CGK", 40, ["Emirates", "Garuda Indonesia"]],
  ["DXB", "KUL", 50, ["Emirates", "Malaysia Airlines"]],
  ["DXB", "HKG", 50, ["Emirates", "Cathay Pacific"]],
  ["DXB", "PEK", 30, ["Emirates"]],
  ["DXB", "JED", 120, ["Emirates", "Saudia"]],
  ["DXB", "GRU", 20, ["Emirates"]],
  ["DXB", "JFK", 45, ["Emirates", "JetBlue"]],
  ["DXB", "SFO", 20, ["Emirates"]],
  ["DXB", "LAX", 30, ["Emirates"]],
  ["DXB", "ORD", 20, ["Emirates"]],
  ["DXB", "SYD", 25, ["Emirates", "Qantas"]],
  ["DOH", "LHR", 60, ["Qatar Airways", "British Airways"]],
  ["DOH", "CDG", 40, ["Qatar Airways"]],
  ["DOH", "FRA", 35, ["Qatar Airways"]],
  ["DOH", "DEL", 80, ["Qatar Airways", "IndiGo"]],
  ["DOH", "BOM", 70, ["Qatar Airways", "IndiGo"]],
  ["DOH", "SIN", 40, ["Qatar Airways", "Singapore Airlines"]],
  ["DOH", "BKK", 35, ["Qatar Airways"]],
  ["DOH", "JFK", 35, ["Qatar Airways"]],
  ["DOH", "JED", 90, ["Qatar Airways", "Saudia"]],
  ["DOH", "IST", 60, ["Qatar Airways", "Turkish Airlines"]],
  ["JED", "IST", 70, ["Turkish Airlines", "Saudia"]],
  ["JED", "DEL", 60, ["Saudia", "IndiGo"]],
  ["JED", "BOM", 50, ["Saudia", "IndiGo"]],
  ["JED", "CGK", 40, ["Saudia", "Garuda Indonesia"]],
  ["JED", "MNL", 35, ["Saudia", "Philippine Airlines"]],

  // Americas domestic / intra-continental
  ["ATL", "LAX", 130, ["Delta", "Southwest", "Spirit"]],
  ["ATL", "ORD", 150, ["Delta", "United", "American"]],
  ["ATL", "DFW", 120, ["Delta", "American"]],
  ["ATL", "JFK", 130, ["Delta", "JetBlue"]],
  ["ATL", "MIA", 100, ["Delta", "American", "Spirit"]],
  ["ATL", "MCO", 120, ["Delta", "Southwest", "Spirit"]],
  ["ATL", "DEN", 100, ["Delta", "United", "Southwest"]],
  ["ATL", "SFO", 70, ["Delta", "United"]],
  ["ATL", "SEA", 50, ["Delta", "Alaska"]],
  ["ATL", "BOS", 80, ["Delta", "JetBlue"]],
  ["ATL", "EWR", 90, ["Delta", "United"]],
  ["ATL", "PHX", 60, ["Delta", "Southwest"]],
  ["ATL", "CLT", 100, ["American", "Delta"]],
  ["ATL", "LAS", 80, ["Delta", "Southwest", "Spirit"]],
  ["ATL", "IAH", 70, ["Delta", "United"]],
  ["DFW", "LAX", 120, ["American", "Southwest", "Spirit"]],
  ["DFW", "ORD", 120, ["American", "United"]],
  ["DFW", "MIA", 80, ["American"]],
  ["DFW", "DEN", 100, ["American", "United", "Southwest"]],
  ["DFW", "JFK", 80, ["American", "JetBlue"]],
  ["DFW", "SFO", 60, ["American", "United"]],
  ["DFW", "PHX", 80, ["American", "Southwest"]],
  ["DFW", "LAS", 70, ["American", "Southwest", "Spirit"]],
  ["DFW", "MCO", 70, ["American", "Southwest"]],
  ["DFW", "SEA", 50, ["American", "Delta"]],
  ["DFW", "EWR", 60, ["American", "United"]],
  ["DFW", "CLT", 70, ["American"]],
  ["DFW", "MSP", 60, ["American", "Delta", "Sun Country"]],
  ["ORD", "LAX", 120, ["American", "United", "Southwest"]],
  ["ORD", "DEN", 100, ["United", "Southwest"]],
  ["ORD", "SFO", 80, ["United", "American"]],
  ["ORD", "JFK", 100, ["American", "Delta", "United"]],
  ["ORD", "MIA", 70, ["American", "United"]],
  ["ORD", "LAS", 70, ["United", "Southwest", "Spirit"]],
  ["ORD", "PHX", 60, ["American", "United", "Southwest"]],
  ["ORD", "MCO", 60, ["United", "Southwest", "Spirit"]],
  ["ORD", "SEA", 60, ["United", "Alaska", "Delta"]],
  ["ORD", "BOS", 70, ["United", "American", "JetBlue"]],
  ["ORD", "MSP", 90, ["Delta", "United", "Sun Country"]],
  ["ORD", "EWR", 80, ["United"]],
  ["ORD", "ATL", 150, ["Delta", "United", "American"]],
  ["LAX", "SFO", 200, ["United", "Delta", "Southwest", "JetBlue"]],
  ["LAX", "JFK", 150, ["Delta", "American", "JetBlue", "United"]],
  ["LAX", "DEN", 100, ["United", "Southwest", "Spirit"]],
  ["LAX", "SEA", 100, ["Alaska", "Delta", "Southwest"]],
  ["LAX", "LAS", 150, ["Southwest", "Spirit", "Delta"]],
  ["LAX", "PHX", 100, ["American", "Southwest"]],
  ["LAX", "MIA", 70, ["American", "Delta"]],
  ["LAX", "MCO", 50, ["Delta", "JetBlue"]],
  ["LAX", "EWR", 80, ["United", "Delta", "JetBlue"]],
  ["LAX", "BOS", 50, ["Delta", "JetBlue", "United"]],
  ["LAX", "IAH", 60, ["United", "Southwest"]],
  ["DEN", "LAX", 100, ["United", "Southwest", "Spirit"]],
  ["DEN", "SFO", 80, ["United", "Southwest"]],
  ["DEN", "PHX", 80, ["United", "Southwest", "Spirit"]],
  ["DEN", "SEA", 70, ["United", "Alaska", "Southwest"]],
  ["DEN", "LAS", 90, ["United", "Southwest", "Spirit"]],
  ["DEN", "ORD", 100, ["United", "Southwest"]],
  ["DEN", "DFW", 100, ["American", "United", "Southwest"]],
  ["DEN", "MSP", 70, ["United", "Delta", "Sun Country"]],
  ["DEN", "MCO", 50, ["United", "Southwest"]],
  ["DEN", "JFK", 50, ["United", "Delta"]],
  ["DEN", "IAH", 60, ["United", "Southwest"]],
  ["SFO", "SEA", 100, ["United", "Alaska", "Delta"]],
  ["SFO", "LAX", 200, ["United", "Delta", "Southwest", "JetBlue"]],
  ["SFO", "JFK", 80, ["United", "Delta", "JetBlue"]],
  ["SFO", "DEN", 80, ["United", "Southwest"]],
  ["SFO", "LAS", 70, ["United", "Southwest"]],
  ["SFO", "PHX", 60, ["United", "American"]],
  ["SFO", "BOS", 40, ["United", "JetBlue"]],
  ["MIA", "JFK", 100, ["American", "Delta", "JetBlue"]],
  ["MIA", "EWR", 60, ["United", "Spirit"]],
  ["MIA", "ATL", 100, ["Delta", "American", "Spirit"]],
  ["MIA", "ORD", 70, ["American", "United"]],
  ["MIA", "BOS", 50, ["American", "JetBlue"]],
  ["MIA", "MCO", 60, ["American", "Southwest"]],
  ["MIA", "GRU", 40, ["American", "LATAM"]],
  ["MIA", "MEX", 50, ["American", "Aeromexico"]],
  ["SEA", "SFO", 100, ["United", "Alaska", "Delta"]],
  ["SEA", "LAX", 100, ["Alaska", "Delta", "Southwest"]],
  ["SEA", "DEN", 70, ["United", "Alaska", "Southwest"]],
  ["SEA", "PHX", 60, ["Alaska", "Southwest"]],
  ["SEA", "LAS", 50, ["Alaska", "Southwest"]],
  ["SEA", "DFW", 50, ["American", "Delta"]],
  ["JFK", "LAX", 150, ["Delta", "American", "JetBlue", "United"]],
  ["JFK", "SFO", 80, ["United", "Delta", "JetBlue"]],
  ["JFK", "MIA", 100, ["American", "Delta", "JetBlue"]],
  ["JFK", "MCO", 70, ["Delta", "JetBlue"]],
  ["JFK", "BOS", 100, ["Delta", "JetBlue", "American"]],
  ["EWR", "LAX", 80, ["United", "Delta", "JetBlue"]],
  ["EWR", "SFO", 60, ["United"]],
  ["EWR", "MIA", 60, ["United", "Spirit"]],
  ["EWR", "ORD", 80, ["United"]],
  ["EWR", "DEN", 50, ["United"]],
  ["EWR", "ATL", 90, ["Delta", "United"]],
  ["EWR", "MCO", 50, ["United", "Spirit"]],
  ["BOS", "JFK", 100, ["Delta", "JetBlue", "American"]],
  ["BOS", "ORD", 70, ["United", "American", "JetBlue"]],
  ["BOS", "MIA", 50, ["American", "JetBlue"]],
  ["BOS", "ATL", 80, ["Delta", "JetBlue"]],
  ["BOS", "DEN", 40, ["United", "JetBlue"]],
  ["BOS", "LAX", 50, ["Delta", "JetBlue", "United"]],
  ["BOS", "SFO", 40, ["United", "JetBlue"]],
  ["LAS", "LAX", 150, ["Southwest", "Spirit", "Delta"]],
  ["LAS", "SFO", 70, ["United", "Southwest"]],
  ["LAS", "DEN", 90, ["United", "Southwest", "Spirit"]],
  ["LAS", "DFW", 70, ["American", "Southwest", "Spirit"]],
  ["LAS", "SEA", 50, ["Alaska", "Southwest"]],
  ["LAS", "PHX", 80, ["Southwest", "Spirit"]],
  ["PHX", "LAX", 100, ["American", "Southwest"]],
  ["PHX", "DEN", 80, ["United", "Southwest", "Spirit"]],
  ["PHX", "DFW", 80, ["American", "Southwest"]],
  ["PHX", "SFO", 60, ["United", "American"]],
  ["PHX", "SEA", 60, ["Alaska", "Southwest"]],
  ["PHX", "LAS", 80, ["Southwest", "Spirit"]],
  ["CLT", "ATL", 100, ["American", "Delta"]],
  ["CLT", "DFW", 70, ["American"]],
  ["CLT", "ORD", 60, ["American"]],
  ["CLT", "JFK", 60, ["American", "JetBlue"]],
  ["CLT", "MIA", 50, ["American"]],
  ["CLT", "MCO", 50, ["American"]],
  ["MCO", "ATL", 120, ["Delta", "Southwest", "Spirit"]],
  ["MCO", "JFK", 70, ["Delta", "JetBlue"]],
  ["MCO", "EWR", 50, ["United", "Spirit"]],
  ["MCO", "DFW", 70, ["American", "Southwest"]],
  ["MCO", "ORD", 60, ["United", "Southwest", "Spirit"]],
  ["MCO", "BOS", 50, ["JetBlue"]],
  ["MSP", "DEN", 70, ["United", "Delta", "Sun Country"]],
  ["MSP", "ORD", 90, ["Delta", "United", "Sun Country"]],
  ["MSP", "DFW", 60, ["American", "Delta", "Sun Country"]],
  ["MSP", "ATL", 60, ["Delta"]],
  ["MSP", "LAX", 40, ["Delta", "Sun Country"]],
  ["MSP", "PHX", 50, ["Delta", "Sun Country"]],
  ["MSP", "LAS", 40, ["Delta", "Sun Country"]],
  ["IAH", "DFW", 60, ["United", "Southwest"]],
  ["IAH", "ATL", 70, ["Delta", "United"]],
  ["IAH", "LAX", 60, ["United", "Southwest"]],
  ["IAH", "DEN", 60, ["United", "Southwest"]],
  ["IAH", "MIA", 50, ["United", "American"]],
  ["IAH", "ORD", 60, ["United"]],
  ["IAH", "MEX", 80, ["United", "Aeromexico"]],
  ["GRU", "MIA", 40, ["American", "LATAM"]],
  ["GRU", "JFK", 30, ["American", "LATAM"]],
  ["GRU", "MEX", 25, ["LATAM", "Aeromexico"]],
  ["GRU", "MAD", 35, ["Iberia", "LATAM"]],
  ["GRU", "CDG", 25, ["Air France", "LATAM"]],
  ["GRU", "LHR", 25, ["British Airways", "LATAM"]],
  ["GRU", "FRA", 20, ["Lufthansa"]],
  ["MEX", "JFK", 40, ["Aeromexico", "Delta"]],
  ["MEX", "LAX", 50, ["Aeromexico", "Delta"]],
  ["MEX", "MIA", 50, ["American", "Aeromexico"]],
  ["MEX", "DFW", 40, ["American", "Aeromexico"]],
  ["MEX", "IAH", 80, ["United", "Aeromexico"]],
  ["MEX", "ORD", 30, ["United", "Aeromexico"]],
  ["MEX", "ATL", 30, ["Delta"]],
  ["MEX", "SFO", 25, ["United", "Aeromexico"]],
  ["YYZ", "JFK", 70, ["Air Canada", "Delta"]],
  ["YYZ", "ORD", 60, ["Air Canada", "United"]],
  ["YYZ", "LAX", 30, ["Air Canada", "WestJet"]],
  ["YYZ", "MIA", 30, ["Air Canada", "WestJet"]],
  ["YYZ", "SFO", 25, ["Air Canada"]],
  ["YYZ", "DEN", 20, ["Air Canada", "United"]],
  ["YYZ", "ATL", 30, ["Delta", "WestJet"]],
  ["YYZ", "DFW", 25, ["American"]],
  ["YYZ", "MCO", 40, ["Air Canada", "WestJet"]],

  // Additional intercontinental/long-haul routes
  ["SIN", "LHR", 60, ["Singapore Airlines", "British Airways"]],
  ["SIN", "FRA", 40, ["Singapore Airlines", "Lufthansa"]],
  ["SIN", "SYD", 100, ["Qantas", "Singapore Airlines", "Jetstar"]],
  ["SIN", "NRT", 50, ["Singapore Airlines", "ANA"]],
  ["SIN", "ICN", 60, ["Singapore Airlines", "Korean Air"]],
  ["SIN", "PVG", 40, ["Singapore Airlines", "China Eastern"]],
  ["SIN", "DEL", 130, ["IndiGo", "Singapore Airlines", "Air India"]],
  ["SIN", "TPE", 50, ["Singapore Airlines", "China Airlines"]],
  ["BKK", "ICN", 80, ["Thai Airways", "Korean Air"]],
  ["BKK", "NRT", 60, ["Thai Airways", "ANA"]],
  ["BKK", "PEK", 40, ["Thai Airways", "Air China"]],
  ["BKK", "PVG", 50, ["Thai Airways", "China Eastern"]],
  ["BKK", "LHR", 40, ["British Airways", "Thai Airways"]],
  ["BKK", "FRA", 30, ["Lufthansa", "Thai Airways"]],
  ["BKK", "SYD", 30, ["Thai Airways", "Qantas"]],
  ["BKK", "DEL", 60, ["IndiGo", "Thai Airways", "Air India"]],
  ["HKG", "SIN", 220, ["Singapore Airlines", "Cathay Pacific", "Scoot"]],
  ["HKG", "ICN", 120, ["Cathay Pacific", "Korean Air"]],
  ["HKG", "NRT", 90, ["Cathay Pacific", "ANA", "JAL"]],
  ["HKG", "BKK", 200, ["Thai Airways", "Cathay Pacific", "Thai AirAsia"]],
  ["HKG", "LHR", 55, ["Cathay Pacific", "British Airways"]],
  ["HKG", "LAX", 30, ["Cathay Pacific"]],
  ["HKG", "SFO", 25, ["Cathay Pacific", "United"]],
  ["HKG", "JFK", 25, ["Cathay Pacific"]],
  ["HKG", "SYD", 40, ["Cathay Pacific", "Qantas"]],
  ["ICN", "SIN", 60, ["Singapore Airlines", "Korean Air"]],
  ["ICN", "BKK", 80, ["Korean Air", "Thai Airways"]],
  ["ICN", "CAN", 100, ["Korean Air", "China Southern"]],
  ["ICN", "CDG", 25, ["Korean Air", "Air France"]],
  ["ICN", "FRA", 25, ["Korean Air", "Lufthansa"]],
  ["ICN", "LHR", 30, ["Korean Air", "British Airways"]],
  ["ICN", "JFK", 40, ["Korean Air", "Asiana", "Delta"]],
  ["ICN", "LAX", 60, ["Korean Air", "Asiana", "United", "Delta"]],
  ["ICN", "SFO", 50, ["Korean Air", "Asiana", "United"]],
  ["NRT", "SIN", 50, ["Singapore Airlines", "ANA"]],
  ["NRT", "BKK", 60, ["Thai Airways", "ANA"]],
  ["NRT", "HKG", 90, ["Cathay Pacific", "ANA", "JAL"]],
  ["NRT", "CDG", 20, ["ANA", "Air France"]],
  ["NRT", "LHR", 25, ["British Airways", "ANA"]],
  ["NRT", "FRA", 20, ["Lufthansa", "ANA"]],
  ["TPE", "NRT", 100, ["China Airlines", "EVA Air", "ANA"]],
  ["TPE", "ICN", 80, ["China Airlines", "Korean Air"]],
  ["TPE", "SIN", 50, ["Singapore Airlines", "China Airlines"]],
  ["TPE", "BKK", 50, ["China Airlines", "EVA Air", "Thai Airways"]],
  ["TPE", "PVG", 60, ["China Airlines", "China Eastern"]],
  ["TPE", "CAN", 50, ["China Airlines", "China Southern"]],
  ["KUL", "HKG", 80, ["AirAsia", "Malaysia Airlines", "Cathay Pacific"]],
  ["KUL", "ICN", 40, ["AirAsia X", "Korean Air"]],
  ["KUL", "NRT", 30, ["AirAsia X", "Malaysia Airlines"]],
  ["KUL", "PVG", 25, ["AirAsia X", "China Eastern"]],
  ["KUL", "DEL", 40, ["AirAsia X", "IndiGo"]],
  ["KUL", "SYD", 30, ["AirAsia X", "Malaysia Airlines"]],
  ["KUL", "LHR", 20, ["Malaysia Airlines"]],
  ["DEL", "SIN", 130, ["IndiGo", "Air India", "Singapore Airlines"]],
  ["DEL", "BKK", 120, ["IndiGo", "Air India", "Thai Airways"]],
  ["DEL", "HKG", 40, ["Air India", "Cathay Pacific"]],
  ["DEL", "LHR", 50, ["British Airways", "Air India"]],
  ["DEL", "FRA", 25, ["Lufthansa", "Air India"]],
  ["DEL", "IST", 30, ["Turkish Airlines", "Air India"]],
  ["DEL", "JFK", 20, ["Air India"]],
  ["BOM", "SIN", 110, ["Air India", "Singapore Airlines", "IndiGo"]],
  ["BOM", "LHR", 40, ["British Airways", "Air India"]],
  ["BOM", "HKG", 30, ["Cathay Pacific", "Air India"]],
  ["CGK", "SIN", 300, ["Garuda Indonesia", "Singapore Airlines", "Lion Air"]],
  ["CGK", "KUL", 250, ["AirAsia", "Garuda Indonesia", "Lion Air"]],
  ["CGK", "BKK", 60, ["Garuda Indonesia", "Thai AirAsia"]],
  ["CGK", "HKG", 40, ["Cathay Pacific", "Garuda Indonesia"]],
  ["CGK", "NRT", 30, ["Garuda Indonesia", "ANA"]],
  ["CGK", "ICN", 30, ["Garuda Indonesia", "Korean Air"]],
  ["MNL", "HKG", 170, ["Philippine Airlines", "Cebu Pacific", "Cathay Pacific"]],
  ["MNL", "SIN", 200, ["Philippine Airlines", "Cebu Pacific", "Singapore Airlines"]],
  ["MNL", "ICN", 60, ["Philippine Airlines", "Korean Air"]],
  ["MNL", "NRT", 50, ["Philippine Airlines", "ANA"]],
  ["MNL", "BKK", 40, ["Philippine Airlines", "Thai Airways"]],
  ["MNL", "TPE", 60, ["Philippine Airlines", "China Airlines"]],
  ["SYD", "SIN", 100, ["Qantas", "Singapore Airlines", "Jetstar"]],
  ["SYD", "BKK", 30, ["Thai Airways", "Qantas"]],
  ["SYD", "HKG", 70, ["Cathay Pacific", "Qantas"]],
  ["SYD", "NRT", 60, ["Qantas", "JAL", "ANA"]],
  ["SYD", "LAX", 50, ["Qantas", "United", "Delta"]],
  ["SYD", "DXB", 25, ["Emirates", "Qantas"]],
  ["SYD", "LHR", 20, ["Qantas"]],

  // Additional regional routes to reach ~500
  // Africa & connections
  ["IST", "CDG", 80, ["Turkish Airlines", "Air France"]],
  ["IST", "FRA", 90, ["Turkish Airlines", "Lufthansa"]],
  ["IST", "AMS", 70, ["Turkish Airlines", "KLM"]],
  ["IST", "FCO", 60, ["Turkish Airlines", "ITA Airways"]],
  ["IST", "MAD", 50, ["Turkish Airlines", "Iberia"]],
  ["IST", "MUC", 60, ["Turkish Airlines", "Lufthansa"]],
  ["IST", "LHR", 90, ["Turkish Airlines", "British Airways"]],
  ["DXB", "IST", 100, ["Emirates", "Turkish Airlines"]],
  ["DXB", "CDG", 50, ["Emirates", "Air France"]],
  ["DXB", "FRA", 50, ["Emirates", "Lufthansa"]],
  ["DXB", "AMS", 40, ["Emirates", "KLM"]],
  ["DXB", "FCO", 30, ["Emirates"]],
  ["DXB", "MUC", 35, ["Emirates", "Lufthansa"]],
  ["DXB", "BCN", 25, ["Emirates"]],
  ["DXB", "MAD", 25, ["Emirates"]],
  ["DOH", "AMS", 30, ["Qatar Airways"]],
  ["DOH", "MUC", 25, ["Qatar Airways"]],
  ["DOH", "FCO", 25, ["Qatar Airways"]],
  ["DOH", "BCN", 20, ["Qatar Airways"]],
  ["DOH", "MAD", 20, ["Qatar Airways"]],
  ["DOH", "BKK", 35, ["Qatar Airways"]],
  ["DOH", "KUL", 25, ["Qatar Airways"]],
  ["DOH", "MNL", 25, ["Qatar Airways"]],
  ["DOH", "CGK", 20, ["Qatar Airways"]],
  ["DOH", "SYD", 15, ["Qatar Airways"]],
  ["DOH", "LAX", 15, ["Qatar Airways"]],
  ["DOH", "ORD", 15, ["Qatar Airways"]],
  ["JED", "CDG", 25, ["Saudia"]],
  ["JED", "LHR", 30, ["Saudia", "British Airways"]],
  ["JED", "FRA", 20, ["Saudia"]],
  ["JED", "KUL", 30, ["Saudia"]],
  ["JED", "SIN", 20, ["Saudia"]],
  ["JED", "BKK", 20, ["Saudia"]],

  // More Asia-Pacific
  ["CTU", "SIN", 25, ["Sichuan Airlines", "Singapore Airlines"]],
  ["CTU", "BKK", 30, ["Sichuan Airlines", "Thai Airways"]],
  ["CTU", "NRT", 20, ["Sichuan Airlines"]],
  ["CTU", "ICN", 25, ["Sichuan Airlines", "Korean Air"]],
  ["CTU", "SZX", 200, ["Sichuan Airlines", "Shenzhen Airlines"]],
  ["CTU", "HKG", 40, ["Sichuan Airlines", "Cathay Pacific"]],
  ["SZX", "SIN", 30, ["Shenzhen Airlines", "Singapore Airlines"]],
  ["SZX", "BKK", 30, ["Shenzhen Airlines"]],
  ["SZX", "ICN", 30, ["Shenzhen Airlines", "Korean Air"]],
  ["SZX", "NRT", 20, ["Shenzhen Airlines"]],
  ["SZX", "KUL", 25, ["Shenzhen Airlines", "AirAsia"]],
  ["SZX", "HKG", 80, ["Shenzhen Airlines"]],
  ["PEK", "ICN", 170, ["Air China", "Korean Air", "Asiana"]],
  ["PEK", "SIN", 40, ["Air China", "Singapore Airlines"]],
  ["PEK", "BKK", 40, ["Air China", "Thai Airways"]],
  ["PEK", "HKG", 120, ["Air China", "Cathay Pacific"]],
  ["PEK", "NRT", 80, ["Air China", "ANA"]],
  ["PEK", "FRA", 25, ["Air China", "Lufthansa"]],
  ["PEK", "LHR", 25, ["Air China"]],
  ["PVG", "SIN", 40, ["China Eastern", "Singapore Airlines"]],
  ["PVG", "BKK", 50, ["China Eastern", "Thai Airways"]],
  ["PVG", "HKG", 120, ["China Eastern", "Cathay Pacific"]],
  ["PVG", "NRT", 80, ["China Eastern", "ANA"]],
  ["PVG", "ICN", 100, ["China Eastern", "Korean Air"]],
  ["PVG", "FRA", 30, ["China Eastern", "Lufthansa"]],
  ["PVG", "LHR", 25, ["China Eastern"]],
  ["PVG", "LAX", 40, ["China Eastern", "Delta"]],
  ["CAN", "SIN", 40, ["China Southern", "Singapore Airlines"]],
  ["CAN", "BKK", 50, ["China Southern", "Thai Airways"]],
  ["CAN", "NRT", 30, ["China Southern"]],
  ["CAN", "ICN", 60, ["China Southern", "Korean Air"]],
  ["CAN", "KUL", 35, ["China Southern", "AirAsia"]],
  ["CAN", "MNL", 30, ["China Southern", "Philippine Airlines"]],
  ["CAN", "HKG", 100, ["China Southern"]],
  ["CAN", "PVG", 290, ["China Eastern", "China Southern", "Spring Airlines"]],
  ["HND", "SIN", 30, ["ANA", "Singapore Airlines"]],
  ["HND", "BKK", 30, ["ANA", "Thai Airways"]],
  ["HND", "HKG", 40, ["ANA", "Cathay Pacific"]],
  ["HND", "SFO", 30, ["ANA", "JAL"]],
  ["HND", "LAX", 50, ["ANA", "JAL", "United"]],
  ["HND", "CDG", 20, ["ANA", "Air France"]],
  ["HND", "LHR", 25, ["ANA", "British Airways"]],
  ["HND", "DXB", 15, ["Emirates"]],

  // More US-Canada regional
  ["DEN", "EWR", 50, ["United"]],
  ["DEN", "BOS", 40, ["United", "JetBlue"]],
  ["DEN", "ATL", 100, ["Delta", "United", "Southwest"]],
  ["DEN", "MIA", 40, ["United"]],
  ["DEN", "CLT", 30, ["American"]],
  ["CLT", "EWR", 50, ["American"]],
  ["CLT", "LAX", 30, ["American"]],
  ["CLT", "DEN", 30, ["American"]],
  ["CLT", "PHX", 30, ["American"]],
  ["CLT", "SFO", 20, ["American"]],
  ["MSP", "EWR", 40, ["Delta", "United"]],
  ["MSP", "JFK", 40, ["Delta"]],
  ["MSP", "BOS", 30, ["Delta", "Sun Country"]],
  ["MSP", "SEA", 40, ["Delta", "Alaska"]],
  ["MSP", "SFO", 30, ["Delta", "Sun Country"]],
  ["IAH", "JFK", 50, ["United", "JetBlue"]],
  ["IAH", "EWR", 50, ["United"]],
  ["IAH", "SEA", 30, ["United"]],
  ["IAH", "BOS", 30, ["United", "JetBlue"]],
  ["IAH", "SFO", 40, ["United"]],
  ["IAH", "LAS", 40, ["United", "Southwest"]],
  ["IAH", "PHX", 35, ["United", "Southwest"]],
  ["IAH", "MSP", 35, ["United", "Delta"]],
  ["MCO", "LAX", 40, ["Delta", "JetBlue"]],
  ["MCO", "DEN", 40, ["United", "Southwest"]],
  ["MCO", "MIA", 60, ["American", "Southwest"]],
  ["MCO", "CLT", 50, ["American"]],
  ["MCO", "PHX", 30, ["Southwest"]],
  ["MCO", "MSP", 25, ["Delta", "Sun Country"]],
  ["MCO", "IAH", 35, ["United"]],
  ["MCO", "LAS", 35, ["Southwest", "Spirit"]],
  ["MCO", "SEA", 20, ["Delta", "Alaska"]],
  ["LAS", "EWR", 40, ["United", "Spirit"]],
  ["LAS", "JFK", 40, ["Delta", "JetBlue"]],
  ["LAS", "BOS", 25, ["JetBlue"]],
  ["LAS", "ORD", 70, ["United", "Southwest", "Spirit"]],
  ["LAS", "ATL", 80, ["Delta", "Southwest", "Spirit"]],
  ["LAS", "MSP", 40, ["Delta", "Sun Country"]],
  ["LAS", "IAH", 40, ["United", "Southwest"]],
  ["LAS", "MIA", 30, ["Spirit"]],
  ["LAS", "CLT", 25, ["American"]],
  ["LAS", "MCO", 35, ["Southwest", "Spirit"]],
  ["PHX", "EWR", 30, ["United"]],
  ["PHX", "JFK", 30, ["Delta", "JetBlue"]],
  ["PHX", "BOS", 20, ["JetBlue"]],
  ["PHX", "ATL", 60, ["Delta", "Southwest"]],
  ["PHX", "ORD", 60, ["American", "United", "Southwest"]],
  ["PHX", "MSP", 50, ["Delta", "Sun Country"]],
  ["PHX", "IAH", 35, ["United", "Southwest"]],
  ["PHX", "MIA", 25, ["American"]],
  ["PHX", "MCO", 30, ["Southwest"]],
  ["YYZ", "BOS", 40, ["Air Canada", "Porter"]],
  ["YYZ", "EWR", 50, ["Air Canada", "United"]],
  ["YYZ", "SEA", 15, ["Air Canada"]],
  ["YYZ", "LAS", 20, ["WestJet"]],
  ["YYZ", "PHX", 15, ["WestJet", "Air Canada"]],
  ["YYZ", "MSP", 15, ["Air Canada"]],
  ["YYZ", "IAH", 15, ["Air Canada", "United"]],
  ["YYZ", "CLT", 15, ["American"]],

  // Latin America connections
  ["GRU", "ATL", 15, ["Delta"]],
  ["GRU", "DFW", 15, ["American"]],
  ["GRU", "ORD", 15, ["United"]],
  ["GRU", "IAH", 15, ["United"]],
  ["GRU", "DXB", 15, ["Emirates"]],
  ["GRU", "IST", 15, ["Turkish Airlines"]],
  ["GRU", "AMS", 15, ["KLM"]],
  ["GRU", "FCO", 15, ["ITA Airways"]],
  ["MEX", "GRU", 25, ["LATAM", "Aeromexico"]],
  ["MEX", "MAD", 30, ["Iberia", "Aeromexico"]],
  ["MEX", "CDG", 15, ["Air France"]],
  ["MEX", "LHR", 15, ["British Airways"]],
  ["MEX", "AMS", 15, ["KLM"]],
  ["MEX", "FRA", 15, ["Lufthansa"]],
  ["MEX", "DEN", 20, ["United"]],
  ["MEX", "SEA", 15, ["Delta"]],
  ["MEX", "CLT", 15, ["American"]],
  ["MEX", "MCO", 20, ["Aeromexico"]],
  ["MEX", "LAS", 20, ["Southwest"]],
  ["MEX", "PHX", 25, ["American", "Southwest"]],
  ["MEX", "EWR", 20, ["United"]],
  ["MEX", "BOS", 15, ["JetBlue"]],
  ["MEX", "YYZ", 15, ["Air Canada", "Aeromexico"]],
];

// ── Deduplicate routes (keep first occurrence, canonicalize pair) ─────
const seenRoutes = new Set();
const uniqueRoutes = [];
for (const r of ROUTE_DATA) {
  const pair = [r[0], r[1]].sort().join("-");
  if (!seenRoutes.has(pair)) {
    seenRoutes.add(pair);
    uniqueRoutes.push(r);
  }
}

console.log(`Unique routes after deduplication: ${uniqueRoutes.length}`);

function routeClassification(weeklyFlights) {
  if (weeklyFlights >= 200) return "Ultra High Frequency";
  if (weeklyFlights >= 100) return "High Frequency";
  if (weeklyFlights >= 50) return "Medium Frequency";
  return "Standard Frequency";
}

// ── Generate airport files ───────────────────────────────────────────
let airportCount = 0;
for (const a of AIRPORTS) {
  const [iata, name, city, country, lat, lon, paxM] = a;
  const code = iata.toLowerCase();
  const classification = airportClassification(paxM);

  const data = {
    code,
    name,
    iataCode: iata,
    city,
    country,
    annualPassengers: Math.round(paxM * 1_000_000),
    classification,
    itemCategory: classification,
    description: `${name} (${iata}) in ${city}, ${country}. Annual passengers: ~${paxM}M. Classification: ${classification}.`,
    geojson: `${code}.geojson`,
  };

  const geojson = {
    type: "FeatureCollection",
    features: [{
      type: "Feature",
      properties: {
        code,
        name,
        featureType: "airport",
        iataCode: iata,
        annualPassengers: Math.round(paxM * 1_000_000),
        classification,
      },
      geometry: {
        type: "Point",
        coordinates: [lon, lat],
      },
    }],
  };

  fs.writeFileSync(path.join(DATA_DIR, `${code}.json`), JSON.stringify(data, null, 2) + "\n");
  fs.writeFileSync(path.join(GEO_DIR, `${code}.geojson`), JSON.stringify(geojson) + "\n");
  airportCount++;
}

// ── Generate route files ─────────────────────────────────────────────
let routeCount = 0;
for (const r of uniqueRoutes) {
  const [orig, dest, weeklyFlights, airlines] = r;
  const origAirport = airportMap.get(orig);
  const destAirport = airportMap.get(dest);

  if (!origAirport || !destAirport) {
    console.warn(`Skipping route ${orig}-${dest}: airport not found`);
    continue;
  }

  const code = `${orig.toLowerCase()}-${dest.toLowerCase()}`;
  const routeName = `${origAirport.city} — ${destAirport.city}`;
  const classification = routeClassification(weeklyFlights);

  const origCoords = [origAirport.lon, origAirport.lat];
  const destCoords = [destAirport.lon, destAirport.lat];
  const distanceKm = Math.round(haversineKm(origCoords, destCoords));

  // More points for longer routes
  const numArcPoints = distanceKm > 5000 ? 40 : distanceKm > 2000 ? 30 : 20;
  const arcCoords = greatCircleArc(origCoords, destCoords, numArcPoints);

  const data = {
    code,
    name: routeName,
    airports: [orig, dest],
    distanceKm,
    weeklyFlights,
    airlines,
    classification,
    itemCategory: classification,
    description: `${orig}–${dest} route between ${origAirport.city} and ${destAirport.city}. Distance: ${distanceKm.toLocaleString()} km. ~${weeklyFlights} weekly flights operated by ${airlines.join(", ")}.`,
    geojson: `${code}.geojson`,
  };

  const geojson = {
    type: "FeatureCollection",
    features: [{
      type: "Feature",
      properties: {
        code,
        name: routeName,
        featureType: "route",
        origin: orig,
        destination: dest,
        weeklyFlights,
        distanceKm,
        classification,
      },
      geometry: {
        type: "LineString",
        coordinates: arcCoords,
      },
    }],
  };

  fs.writeFileSync(path.join(DATA_DIR, `${code}.json`), JSON.stringify(data, null, 2) + "\n");
  fs.writeFileSync(path.join(GEO_DIR, `${code}.geojson`), JSON.stringify(geojson) + "\n");
  routeCount++;
}

console.log(`Generated ${airportCount} airports + ${routeCount} routes = ${airportCount + routeCount} total items`);
