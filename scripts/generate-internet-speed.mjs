/**
 * Generate internet-speed plugin data files and GeoJSON.
 * Data is based on approximate Ookla Speedtest Global Index 2024 rankings.
 * GeoJSON polygons are copied from the power-grids plugin.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const PLUGIN_DIR = path.join(ROOT, "plugins", "internet-speed");
const DATA_DIR = path.join(PLUGIN_DIR, "data");
const GEO_DIR = path.join(PLUGIN_DIR, "geo");
const POWER_GRIDS_GEO = path.join(ROOT, "plugins", "power-grids", "geo");

fs.mkdirSync(DATA_DIR, { recursive: true });
fs.mkdirSync(GEO_DIR, { recursive: true });

// Country data: [code, name, region, fixedDL, fixedUL, mobileDL, mobileUL, latency, rank, trend]
// Based on approximate Ookla Speedtest Global Index 2024 data
const countries = [
  ["ae", "United Arab Emirates", "Middle East", 261.5, 188.2, 238.1, 33.4, 5, 2, "Continued investment in fiber and 5G infrastructure has kept the UAE among the world's fastest. Speeds increased ~12% year-over-year."],
  ["sg", "Singapore", "East Asia", 283.6, 256.3, 104.2, 22.8, 4, 1, "World leader in fixed broadband with near-universal fiber coverage. Speeds grew ~8% year-over-year."],
  ["hk", "Hong Kong", "East Asia", 270.3, 224.1, 88.6, 15.3, 5, 3, "Dense urban fiber network delivers exceptional speeds. Growth of ~10% year-over-year."],
  ["kr", "South Korea", "East Asia", 241.6, 200.8, 131.5, 20.7, 6, 5, "Pioneer in broadband. 5G rollout has pushed mobile speeds significantly. ~7% year-over-year improvement."],
  ["ch", "Switzerland", "Western Europe", 246.8, 123.4, 92.3, 17.1, 8, 4, "High-quality infrastructure across the country. Steady ~9% year-over-year growth."],
  ["dk", "Denmark", "Northern Europe", 231.5, 118.2, 105.4, 18.6, 9, 6, "Strong fiber penetration and 5G expansion. ~11% year-over-year improvement."],
  ["no", "Norway", "Northern Europe", 222.4, 112.3, 120.8, 19.4, 10, 7, "Excellent connectivity even in rural areas. ~10% year-over-year growth."],
  ["us", "United States", "North America", 242.4, 31.5, 110.6, 15.2, 14, 8, "Steadily improving with fiber and 5G expansion. Average speeds increased ~15% year-over-year."],
  ["ro", "Romania", "Eastern Europe", 217.8, 146.2, 68.4, 14.8, 7, 9, "Among Europe's fastest due to early fiber adoption. ~6% year-over-year growth."],
  ["fr", "France", "Western Europe", 211.3, 108.7, 73.2, 14.1, 12, 10, "Aggressive fiber rollout nationwide. ~14% year-over-year improvement."],
  ["es", "Spain", "Southern Europe", 202.5, 98.4, 61.8, 12.7, 13, 11, "Fiber-to-the-home expansion driving growth. ~13% year-over-year."],
  ["se", "Sweden", "Northern Europe", 198.6, 95.2, 98.7, 17.3, 9, 12, "Well-established broadband infrastructure. ~8% year-over-year growth."],
  ["nl", "Netherlands", "Western Europe", 193.4, 87.6, 81.4, 14.2, 10, 13, "Dense cable and fiber networks. ~7% year-over-year improvement."],
  ["hu", "Hungary", "Eastern Europe", 191.2, 102.3, 53.8, 11.4, 11, 14, "Rapid fiber rollout in urban areas. ~16% year-over-year growth."],
  ["jp", "Japan", "East Asia", 186.4, 120.8, 55.2, 12.1, 8, 15, "Mature broadband market with very stable speeds. ~5% year-over-year growth."],
  ["th", "Thailand", "Southeast Asia", 183.7, 118.6, 54.3, 10.8, 9, 16, "Major investment in fiber infrastructure. ~18% year-over-year improvement."],
  ["cn", "China", "East Asia", 178.9, 98.4, 118.3, 22.6, 13, 17, "Massive 5G deployment and fiber expansion. ~12% year-over-year growth."],
  ["pt", "Portugal", "Southern Europe", 175.2, 88.1, 56.7, 11.3, 14, 18, "Growing fiber penetration. ~11% year-over-year improvement."],
  ["pl", "Poland", "Eastern Europe", 171.8, 68.4, 58.2, 13.6, 15, 19, "Competitive broadband market driving speeds up. ~14% year-over-year growth."],
  ["ca", "Canada", "North America", 168.3, 24.8, 85.4, 13.7, 18, 20, "Fiber expansion in urban centers. ~10% year-over-year improvement."],
  ["de", "Germany", "Western Europe", 164.7, 48.2, 61.3, 12.8, 16, 21, "Accelerating fiber deployment after lagging behind neighbors. ~17% year-over-year growth."],
  ["at", "Austria", "Western Europe", 159.3, 52.6, 63.8, 13.2, 14, 22, "Steady infrastructure improvements. ~9% year-over-year growth."],
  ["it", "Italy", "Southern Europe", 155.8, 44.3, 52.4, 10.6, 17, 23, "Fiber rollout gaining momentum. ~15% year-over-year improvement."],
  ["nz", "New Zealand", "Oceania", 152.4, 78.3, 72.6, 14.8, 15, 24, "UFB fiber network nearly complete. ~8% year-over-year growth."],
  ["au", "Australia", "Oceania", 148.6, 22.3, 78.4, 12.6, 16, 25, "NBN upgrades improving speeds. ~12% year-over-year improvement."],
  ["be", "Belgium", "Western Europe", 146.2, 36.8, 57.3, 11.4, 15, 26, "Cable-dominant market transitioning to fiber. ~10% year-over-year growth."],
  ["gb", "United Kingdom", "Western Europe", 142.8, 28.6, 48.2, 9.8, 16, 27, "Full fiber rollout accelerating. ~14% year-over-year improvement."],
  ["lt", "Lithuania", "Northern Europe", 139.4, 72.3, 45.6, 10.2, 10, 28, "Strong fiber infrastructure in urban areas. ~7% year-over-year growth."],
  ["lv", "Latvia", "Northern Europe", 135.6, 68.2, 42.3, 9.8, 11, 29, "Good fiber coverage in cities. ~8% year-over-year growth."],
  ["ee", "Estonia", "Northern Europe", 132.8, 54.6, 52.4, 11.7, 12, 30, "Digital-first country with strong broadband. ~9% year-over-year growth."],
  ["cz", "Czech Republic", "Eastern Europe", 128.4, 48.2, 47.8, 10.3, 16, 31, "Improving fixed broadband market. ~11% year-over-year growth."],
  ["il", "Israel", "Middle East", 125.7, 24.8, 52.6, 10.8, 13, 32, "Strong mobile and fixed infrastructure. ~8% year-over-year improvement."],
  ["bg", "Bulgaria", "Eastern Europe", 122.3, 62.4, 42.1, 9.6, 14, 33, "Affordable high-speed options. ~10% year-over-year growth."],
  ["lu", "Luxembourg", "Western Europe", 118.6, 52.3, 68.4, 14.2, 11, 34, "Small but well-connected country. ~7% year-over-year growth."],
  ["ie", "Ireland", "Western Europe", 115.4, 36.8, 52.8, 10.4, 17, 35, "Rural broadband plan improving coverage. ~13% year-over-year growth."],
  ["hr", "Croatia", "Southern Europe", 112.6, 42.3, 38.4, 8.6, 18, 36, "EU funds driving infrastructure upgrades. ~12% year-over-year growth."],
  ["fi", "Finland", "Northern Europe", 110.8, 38.4, 68.2, 14.6, 13, 37, "Strong mobile broadband, fixed improving. ~6% year-over-year growth."],
  ["rs", "Serbia", "Eastern Europe", 108.2, 48.6, 35.2, 8.4, 16, 38, "Growing broadband market. ~14% year-over-year improvement."],
  ["si", "Slovenia", "Southern Europe", 105.4, 42.8, 41.3, 9.2, 15, 39, "Steady infrastructure development. ~9% year-over-year growth."],
  ["sk", "Slovakia", "Eastern Europe", 102.8, 38.6, 39.8, 8.8, 17, 40, "Fiber expansion in progress. ~11% year-over-year growth."],
  ["cl", "Chile", "South America", 98.6, 42.3, 32.4, 7.8, 22, 41, "Leading South American broadband market. ~15% year-over-year growth."],
  ["tw", "Taiwan", "East Asia", 96.4, 48.2, 58.6, 12.4, 10, 42, "Dense fiber and 5G network. ~6% year-over-year growth."],
  ["my", "Malaysia", "Southeast Asia", 93.8, 52.6, 42.8, 9.6, 14, 43, "JENDELA plan driving national connectivity. ~16% year-over-year improvement."],
  ["sa", "Saudi Arabia", "Middle East", 91.2, 48.4, 78.6, 14.2, 12, 44, "Vision 2030 investments boosting infrastructure. ~20% year-over-year growth."],
  ["md", "Moldova", "Eastern Europe", 88.6, 62.3, 28.4, 6.8, 13, 45, "Surprisingly fast for the region. ~8% year-over-year growth."],
  ["uy", "Uruguay", "South America", 86.4, 32.8, 38.2, 8.4, 20, 46, "State-owned fiber network expansion. ~12% year-over-year growth."],
  ["gr", "Greece", "Southern Europe", 84.2, 12.8, 42.6, 8.2, 22, 47, "Recovering infrastructure investment. ~18% year-over-year growth."],
  ["cy", "Cyprus", "Southern Europe", 82.6, 18.4, 36.8, 7.6, 19, 48, "Small island with growing connectivity. ~14% year-over-year growth."],
  ["br", "Brazil", "South America", 78.4, 44.6, 28.6, 6.8, 24, 49, "Fiber expansion in urban centers. ~16% year-over-year improvement."],
  ["kw", "Kuwait", "Middle East", 76.8, 12.4, 42.3, 8.6, 11, 50, "5G and fiber investments ongoing. ~10% year-over-year growth."],
  ["mk", "North Macedonia", "Eastern Europe", 74.6, 28.4, 32.6, 7.2, 18, 51, "Growing broadband access. ~12% year-over-year growth."],
  ["me", "Montenegro", "Eastern Europe", 72.8, 24.6, 30.4, 6.8, 19, 52, "Tourism-driven infrastructure investment. ~11% year-over-year growth."],
  ["ba", "Bosnia and Herzegovina", "Eastern Europe", 70.2, 22.8, 28.6, 6.4, 20, 53, "Broadband development continuing. ~13% year-over-year growth."],
  ["mx", "Mexico", "North America", 68.4, 28.6, 34.2, 7.8, 26, 54, "Growing middle class driving demand. ~14% year-over-year improvement."],
  ["pa", "Panama", "Central America", 66.8, 18.4, 28.4, 6.2, 28, 55, "Hub city with good connectivity. ~10% year-over-year growth."],
  ["qa", "Qatar", "Middle East", 65.2, 14.8, 98.4, 16.8, 8, 56, "Strong mobile 5G. Fixed broadband catching up. ~18% year-over-year growth."],
  ["ar", "Argentina", "South America", 63.4, 22.6, 24.8, 5.6, 28, 57, "Infrastructure investment increasing. ~12% year-over-year growth."],
  ["cr", "Costa Rica", "Central America", 61.8, 16.4, 26.2, 5.8, 30, 58, "Central America's connectivity leader. ~15% year-over-year improvement."],
  ["co", "Colombia", "South America", 59.6, 18.2, 22.4, 5.2, 32, 59, "Growing fiber market. ~16% year-over-year growth."],
  ["tr", "Turkey", "Middle East", 57.2, 12.8, 42.8, 8.4, 22, 60, "Large market with increasing fiber penetration. ~13% year-over-year improvement."],
  ["bh", "Bahrain", "Middle East", 55.8, 12.4, 62.3, 10.8, 10, 61, "Small island nation with strong 5G. ~9% year-over-year growth."],
  ["ru", "Russia", "Eastern Europe", 54.2, 38.6, 28.4, 6.8, 18, 62, "Vast geography creates uneven connectivity. ~8% year-over-year growth."],
  ["om", "Oman", "Middle East", 52.6, 14.2, 44.6, 8.2, 14, 63, "Growing infrastructure investment. ~15% year-over-year growth."],
  ["pe", "Peru", "South America", 50.8, 22.4, 22.6, 5.4, 34, 64, "Improving urban connectivity. ~18% year-over-year growth."],
  ["jo", "Jordan", "Middle East", 49.2, 10.8, 26.8, 5.6, 24, 65, "Fiber deployment underway. ~14% year-over-year growth."],
  ["do", "Dominican Republic", "Caribbean", 47.6, 14.2, 22.4, 4.8, 32, 66, "Caribbean connectivity improving. ~16% year-over-year growth."],
  ["tt", "Trinidad and Tobago", "Caribbean", 46.2, 12.8, 18.6, 4.2, 30, 67, "Small island market with steady growth. ~10% year-over-year improvement."],
  ["ec", "Ecuador", "South America", 44.8, 16.4, 18.2, 4.6, 36, 68, "Fiber and 4G expansion. ~15% year-over-year growth."],
  ["vn", "Vietnam", "Southeast Asia", 43.2, 28.6, 42.8, 8.4, 15, 69, "Rapid digital transformation. ~22% year-over-year growth."],
  ["za", "South Africa", "Sub-Saharan Africa", 42.6, 18.4, 32.4, 7.2, 22, 70, "Leading African broadband market. ~14% year-over-year growth."],
  ["in", "India", "South Asia", 40.8, 28.6, 22.4, 4.8, 24, 71, "Massive Jio effect with affordable data. ~18% year-over-year improvement."],
  ["ph", "Philippines", "Southeast Asia", 39.4, 22.8, 26.8, 5.6, 20, 72, "Improving connectivity with new towers. ~20% year-over-year growth."],
  ["id", "Indonesia", "Southeast Asia", 37.8, 18.6, 24.6, 5.2, 22, 73, "Archipelago challenges, urban areas improving. ~16% year-over-year growth."],
  ["ma", "Morocco", "North Africa", 36.2, 14.8, 28.4, 6.4, 26, 74, "North Africa's connectivity leader. ~15% year-over-year growth."],
  ["ge", "Georgia", "Eastern Europe", 35.6, 22.4, 28.2, 6.2, 16, 75, "Affordable broadband market. ~10% year-over-year growth."],
  ["am", "Armenia", "Eastern Europe", 34.8, 18.6, 22.6, 5.4, 18, 76, "Growing tech sector driving demand. ~12% year-over-year growth."],
  ["by", "Belarus", "Eastern Europe", 34.2, 24.8, 18.4, 4.6, 14, 77, "State-controlled broadband market. ~6% year-over-year growth."],
  ["az", "Azerbaijan", "Eastern Europe", 33.6, 16.8, 20.4, 4.8, 20, 78, "Infrastructure development ongoing. ~14% year-over-year growth."],
  ["ua", "Ukraine", "Eastern Europe", 32.8, 22.6, 24.2, 5.8, 16, 79, "Infrastructure under pressure but resilient. ~4% year-over-year growth."],
  ["kz", "Kazakhstan", "Central Asia", 31.4, 14.2, 22.8, 5.2, 26, 80, "Central Asia's largest broadband market. ~16% year-over-year growth."],
  ["lk", "Sri Lanka", "South Asia", 30.6, 12.8, 18.4, 4.2, 28, 81, "Island nation improving connectivity. ~12% year-over-year growth."],
  ["eg", "Egypt", "North Africa", 29.8, 8.4, 22.6, 4.8, 32, 82, "Large market with growing demand. ~18% year-over-year growth."],
  ["tn", "Tunisia", "North Africa", 28.4, 6.8, 18.2, 4.2, 30, 83, "North African broadband growing. ~14% year-over-year growth."],
  ["jm", "Jamaica", "Caribbean", 27.6, 10.4, 22.4, 4.6, 34, 84, "Caribbean connectivity improving. ~12% year-over-year growth."],
  ["lb", "Lebanon", "Middle East", 26.8, 5.4, 14.6, 3.2, 42, 85, "Infrastructure challenges but improving. ~8% year-over-year growth."],
  ["bo", "Bolivia", "South America", 25.4, 8.6, 16.8, 3.8, 38, 86, "Growing but limited infrastructure. ~15% year-over-year growth."],
  ["py", "Paraguay", "South America", 24.6, 8.2, 18.4, 4.2, 36, 87, "Improving broadband access. ~14% year-over-year growth."],
  ["gt", "Guatemala", "Central America", 23.8, 7.4, 14.6, 3.4, 40, 88, "Central American market developing. ~16% year-over-year growth."],
  ["hn", "Honduras", "Central America", 22.4, 6.8, 12.8, 3.2, 42, 89, "Growing mobile internet access. ~18% year-over-year growth."],
  ["sv", "El Salvador", "Central America", 21.8, 7.2, 16.2, 3.6, 38, 90, "Improving connectivity options. ~14% year-over-year growth."],
  ["ni", "Nicaragua", "Central America", 20.6, 5.8, 12.4, 2.8, 44, 91, "Limited but growing broadband. ~12% year-over-year growth."],
  ["ke", "Kenya", "Sub-Saharan Africa", 19.8, 8.4, 18.6, 4.2, 28, 92, "Mobile-first market with growing fiber. ~20% year-over-year growth."],
  ["gh", "Ghana", "Sub-Saharan Africa", 18.4, 6.2, 14.2, 3.4, 32, 93, "West Africa's digital leader. ~16% year-over-year growth."],
  ["ng", "Nigeria", "Sub-Saharan Africa", 17.6, 5.8, 16.4, 3.8, 34, 94, "Africa's largest market. Mobile dominant. ~18% year-over-year growth."],
  ["pk", "Pakistan", "South Asia", 16.8, 8.4, 18.2, 4.2, 32, 95, "Improving with 4G expansion. ~22% year-over-year growth."],
  ["bd", "Bangladesh", "South Asia", 16.2, 12.4, 14.6, 3.4, 36, 96, "Growing digital economy driving demand. ~20% year-over-year growth."],
  ["kh", "Cambodia", "Southeast Asia", 15.8, 14.6, 22.4, 4.8, 18, 97, "Fast-growing broadband market. ~24% year-over-year growth."],
  ["mn", "Mongolia", "East Asia", 15.2, 8.4, 16.8, 3.6, 28, 98, "Vast distances challenge connectivity. ~14% year-over-year growth."],
  ["np", "Nepal", "South Asia", 14.6, 10.2, 16.4, 3.8, 32, 99, "Challenging terrain but improving. ~18% year-over-year growth."],
  ["iq", "Iraq", "Middle East", 14.2, 4.8, 22.6, 4.4, 36, 100, "Post-conflict rebuilding of infrastructure. ~16% year-over-year growth."],
  ["ly", "Libya", "North Africa", 13.8, 3.6, 12.4, 2.8, 42, 101, "Infrastructure recovery ongoing. ~10% year-over-year growth."],
  ["dz", "Algeria", "North Africa", 13.2, 3.2, 14.8, 3.2, 38, 102, "Large country with limited fixed broadband. ~12% year-over-year growth."],
  ["uz", "Uzbekistan", "Central Asia", 12.8, 8.4, 18.6, 4.2, 30, 103, "Rapidly developing broadband market. ~26% year-over-year growth."],
  ["kg", "Kyrgyzstan", "Central Asia", 12.4, 6.8, 14.2, 3.4, 32, 104, "Mountain geography limits coverage. ~15% year-over-year growth."],
  ["tj", "Tajikistan", "Central Asia", 11.8, 5.4, 10.6, 2.6, 38, 105, "Central Asia's developing market. ~14% year-over-year growth."],
  ["la", "Laos", "Southeast Asia", 11.4, 8.2, 18.4, 3.8, 24, 106, "Growing connectivity with Chinese investment. ~20% year-over-year growth."],
  ["mm", "Myanmar", "Southeast Asia", 10.8, 6.4, 16.2, 3.6, 28, 107, "Mobile-first market with limited fixed. ~12% year-over-year growth."],
  ["cm", "Cameroon", "Sub-Saharan Africa", 10.4, 3.8, 12.6, 2.8, 38, 108, "Central Africa's growing market. ~14% year-over-year growth."],
  ["sn", "Senegal", "Sub-Saharan Africa", 10.2, 4.2, 14.8, 3.4, 34, 109, "West African broadband expanding. ~16% year-over-year growth."],
  ["ci", "Ivory Coast", "Sub-Saharan Africa", 9.8, 3.6, 12.4, 2.8, 36, 110, "Growing connectivity hub in West Africa. ~18% year-over-year growth."],
  ["tz", "Tanzania", "Sub-Saharan Africa", 9.4, 3.4, 10.8, 2.6, 38, 111, "East African market developing. ~16% year-over-year growth."],
  ["ug", "Uganda", "Sub-Saharan Africa", 9.2, 3.2, 12.2, 2.8, 36, 112, "Mobile internet dominant. ~18% year-over-year growth."],
  ["rw", "Rwanda", "Sub-Saharan Africa", 8.8, 4.6, 14.6, 3.4, 30, 113, "Vision 2020 tech investments showing results. ~22% year-over-year growth."],
  ["mz", "Mozambique", "Sub-Saharan Africa", 8.4, 2.8, 8.6, 2.2, 42, 114, "Limited infrastructure but growing. ~14% year-over-year growth."],
  ["zm", "Zambia", "Sub-Saharan Africa", 8.2, 3.4, 10.4, 2.6, 38, 115, "Southern African market developing. ~16% year-over-year growth."],
  ["zw", "Zimbabwe", "Sub-Saharan Africa", 7.8, 2.6, 8.8, 2.4, 44, 116, "Limited broadband with economic constraints. ~8% year-over-year growth."],
  ["bw", "Botswana", "Sub-Saharan Africa", 7.6, 3.2, 12.8, 3.2, 36, 117, "Small Southern African market. ~12% year-over-year growth."],
  ["na", "Namibia", "Sub-Saharan Africa", 7.4, 2.8, 14.2, 3.4, 38, 118, "Sparse population challenges infrastructure. ~14% year-over-year growth."],
  ["mu", "Mauritius", "Sub-Saharan Africa", 38.4, 14.8, 22.6, 5.2, 22, 71, "Island nation with good submarine cable access. ~12% year-over-year growth."],
  ["sc", "Seychelles", "Sub-Saharan Africa", 18.6, 8.4, 16.4, 3.8, 28, 119, "Tourism-driven infrastructure investment. ~10% year-over-year growth."],
  ["mg", "Madagascar", "Sub-Saharan Africa", 6.8, 2.4, 8.2, 2.2, 46, 120, "Large island with limited infrastructure. ~12% year-over-year growth."],
  ["ml", "Mali", "Sub-Saharan Africa", 6.4, 2.2, 8.6, 2.4, 48, 121, "Sahel region with limited connectivity. ~10% year-over-year growth."],
  ["bf", "Burkina Faso", "Sub-Saharan Africa", 6.2, 2.0, 8.4, 2.2, 48, 122, "West African broadband developing. ~12% year-over-year growth."],
  ["ne", "Niger", "Sub-Saharan Africa", 5.8, 1.8, 6.8, 1.8, 52, 123, "Limited connectivity in vast Saharan nation. ~10% year-over-year growth."],
  ["td", "Chad", "Sub-Saharan Africa", 5.4, 1.6, 6.2, 1.6, 56, 124, "Among the least connected nations. ~8% year-over-year growth."],
  ["sd", "Sudan", "North Africa", 5.2, 1.8, 8.4, 2.2, 48, 125, "Infrastructure limited by conflict. ~6% year-over-year growth."],
  ["ss", "South Sudan", "Sub-Saharan Africa", 3.2, 1.2, 4.6, 1.4, 62, 126, "Newest nation with minimal infrastructure. ~12% year-over-year growth."],
  ["so", "Somalia", "Sub-Saharan Africa", 4.8, 1.6, 8.2, 2.2, 52, 127, "Mobile-first market rebuilding. ~14% year-over-year growth."],
  ["er", "Eritrea", "Sub-Saharan Africa", 2.8, 0.8, 3.4, 1.0, 68, 128, "Among the world's least connected countries. ~4% year-over-year growth."],
  ["et", "Ethiopia", "Sub-Saharan Africa", 6.4, 2.6, 12.8, 3.2, 38, 129, "Telecom liberalization beginning. ~20% year-over-year growth."],
  ["dj", "Djibouti", "Sub-Saharan Africa", 12.6, 4.8, 18.4, 4.2, 28, 130, "Strategic submarine cable hub. ~16% year-over-year growth."],
  ["gn", "Guinea", "Sub-Saharan Africa", 5.6, 1.8, 7.8, 2.0, 48, 131, "West African connectivity developing. ~12% year-over-year growth."],
  ["sl", "Sierra Leone", "Sub-Saharan Africa", 5.2, 1.6, 7.4, 1.8, 50, 132, "Post-conflict infrastructure recovery. ~14% year-over-year growth."],
  ["lr", "Liberia", "Sub-Saharan Africa", 4.8, 1.4, 6.8, 1.6, 52, 133, "Limited broadband infrastructure. ~12% year-over-year growth."],
  ["gm", "Gambia", "Sub-Saharan Africa", 5.4, 1.8, 8.2, 2.0, 46, 134, "Small West African market. ~14% year-over-year growth."],
  ["gw", "Guinea-Bissau", "Sub-Saharan Africa", 4.2, 1.2, 5.8, 1.4, 54, 135, "Very limited infrastructure. ~10% year-over-year growth."],
  ["cv", "Cabo Verde", "Sub-Saharan Africa", 16.4, 6.8, 14.8, 3.4, 30, 136, "Island nation with submarine cable access. ~12% year-over-year growth."],
  ["st", "São Tomé and Príncipe", "Sub-Saharan Africa", 8.6, 2.8, 8.4, 2.2, 42, 137, "Small island state developing connectivity. ~10% year-over-year growth."],
  ["gq", "Equatorial Guinea", "Sub-Saharan Africa", 7.8, 2.4, 6.8, 1.8, 46, 138, "Oil-wealthy but limited broadband. ~8% year-over-year growth."],
  ["ga", "Gabon", "Sub-Saharan Africa", 8.2, 2.6, 10.4, 2.6, 40, 139, "Central African connectivity developing. ~12% year-over-year growth."],
  ["cg", "Republic of the Congo", "Sub-Saharan Africa", 6.8, 2.2, 8.6, 2.2, 44, 140, "Limited broadband in Central Africa. ~10% year-over-year growth."],
  ["cd", "DR Congo", "Sub-Saharan Africa", 4.6, 1.4, 6.4, 1.6, 52, 141, "Large country with minimal coverage. ~12% year-over-year growth."],
  ["ao", "Angola", "Sub-Saharan Africa", 7.2, 2.4, 10.2, 2.6, 42, 142, "Oil economy investing in digital. ~14% year-over-year growth."],
  ["bi", "Burundi", "Sub-Saharan Africa", 3.8, 1.2, 5.4, 1.4, 56, 143, "Among the least connected. ~10% year-over-year growth."],
  ["ls", "Lesotho", "Sub-Saharan Africa", 6.4, 2.2, 8.8, 2.4, 44, 144, "Mountain kingdom with limited coverage. ~12% year-over-year growth."],
  ["sz", "Eswatini", "Sub-Saharan Africa", 7.2, 2.6, 10.6, 2.8, 40, 145, "Small Southern African nation. ~10% year-over-year growth."],
  ["mw", "Malawi", "Sub-Saharan Africa", 4.4, 1.4, 6.2, 1.6, 50, 146, "Limited infrastructure in Southeast Africa. ~14% year-over-year growth."],
  ["sy", "Syria", "Middle East", 4.2, 1.2, 6.8, 1.8, 56, 147, "Conflict-damaged infrastructure. ~4% year-over-year growth."],
  ["ye", "Yemen", "Middle East", 3.6, 1.0, 5.2, 1.4, 62, 148, "Conflict has severely impacted connectivity. ~2% year-over-year growth."],
  ["ir", "Iran", "Middle East", 18.4, 6.8, 28.6, 5.8, 28, 82, "Large market with growing demand despite restrictions. ~10% year-over-year growth."],
  ["af", "Afghanistan", "South Asia", 3.4, 1.2, 6.4, 1.8, 58, 149, "Limited infrastructure and instability. ~4% year-over-year growth."],
  ["tm", "Turkmenistan", "Central Asia", 5.8, 2.2, 4.8, 1.4, 52, 150, "State-controlled limited internet. ~6% year-over-year growth."],
  ["kp", "North Korea", "East Asia", 1.8, 0.4, 0.0, 0.0, 0, 151, "Virtually no public internet access. Intranet only for most citizens."],
  ["cu", "Cuba", "Caribbean", 7.4, 2.8, 5.6, 1.6, 48, 152, "Recently expanded home internet access. ~20% year-over-year growth."],
  ["gy", "Guyana", "South America", 22.6, 8.4, 14.8, 3.4, 36, 88, "Oil wealth driving infrastructure investment. ~18% year-over-year growth."],
  ["sr", "Suriname", "South America", 18.4, 6.2, 12.6, 2.8, 38, 103, "Small South American market. ~10% year-over-year growth."],
  ["bz", "Belize", "Central America", 20.8, 7.6, 16.4, 3.6, 34, 92, "Small Central American market improving. ~12% year-over-year growth."],
  ["ve", "Venezuela", "South America", 12.4, 3.6, 8.4, 2.2, 48, 130, "Economic crisis impacting infrastructure. ~4% year-over-year growth."],
  ["bs", "Bahamas", "Caribbean", 32.6, 12.4, 22.8, 5.2, 28, 78, "Island tourism economy with good connectivity. ~10% year-over-year growth."],
  ["ag", "Antigua and Barbuda", "Caribbean", 28.4, 10.6, 18.6, 4.2, 30, 82, "Small Caribbean island improving broadband. ~8% year-over-year growth."],
  ["bb", "Barbados", "Caribbean", 34.8, 14.2, 24.6, 5.4, 26, 75, "Well-connected Caribbean island. ~10% year-over-year growth."],
  ["dm", "Dominica", "Caribbean", 22.4, 8.2, 16.2, 3.6, 34, 93, "Small Caribbean market. ~12% year-over-year growth."],
  ["gd", "Grenada", "Caribbean", 20.6, 7.4, 14.8, 3.2, 36, 96, "Small island developing connectivity. ~10% year-over-year growth."],
  ["kn", "Saint Kitts and Nevis", "Caribbean", 24.6, 8.8, 18.2, 4.0, 32, 88, "Small Caribbean economy with improving broadband. ~8% year-over-year growth."],
  ["lc", "Saint Lucia", "Caribbean", 22.8, 8.4, 16.6, 3.8, 34, 91, "Tourism-driven island connectivity. ~10% year-over-year growth."],
  ["vc", "Saint Vincent and the Grenadines", "Caribbean", 18.4, 6.8, 14.2, 3.2, 36, 98, "Small Caribbean market developing. ~8% year-over-year growth."],
  ["fj", "Fiji", "Oceania", 24.8, 8.6, 18.4, 4.2, 32, 87, "Pacific island with submarine cable access. ~14% year-over-year growth."],
  ["pg", "Papua New Guinea", "Oceania", 6.2, 2.0, 8.4, 2.2, 48, 140, "Challenging geography limits coverage. ~12% year-over-year growth."],
  ["sb", "Solomon Islands", "Oceania", 5.4, 1.6, 6.8, 1.8, 52, 145, "Remote Pacific island chain. ~10% year-over-year growth."],
  ["vu", "Vanuatu", "Oceania", 8.6, 2.8, 10.4, 2.6, 44, 136, "Pacific island developing connectivity. ~12% year-over-year growth."],
  ["ws", "Samoa", "Oceania", 12.4, 4.2, 14.6, 3.4, 36, 125, "Small Pacific island with submarine cable. ~10% year-over-year growth."],
  ["to", "Tonga", "Oceania", 10.8, 3.6, 12.2, 2.8, 40, 130, "Remote Pacific nation. ~8% year-over-year growth."],
  ["ki", "Kiribati", "Oceania", 4.2, 1.2, 4.8, 1.4, 56, 148, "One of the most remote nations. Limited connectivity. ~6% year-over-year growth."],
  ["nr", "Nauru", "Oceania", 6.8, 2.2, 8.2, 2.0, 48, 142, "Tiny island nation with satellite internet. ~8% year-over-year growth."],
  ["tv", "Tuvalu", "Oceania", 3.8, 1.0, 4.2, 1.2, 58, 150, "Among the world's smallest and most remote. ~4% year-over-year growth."],
  ["mh", "Marshall Islands", "Oceania", 5.2, 1.6, 6.4, 1.6, 52, 146, "Remote Pacific nation. ~6% year-over-year growth."],
  ["fm", "Micronesia", "Oceania", 4.6, 1.4, 5.6, 1.4, 54, 147, "Remote Pacific islands with limited connectivity. ~6% year-over-year growth."],
  ["pw", "Palau", "Oceania", 8.4, 2.6, 10.8, 2.6, 42, 138, "Small Pacific nation with submarine cable. ~10% year-over-year growth."],
  ["tl", "Timor-Leste", "Southeast Asia", 5.8, 1.8, 8.4, 2.2, 46, 141, "Young nation developing infrastructure. ~14% year-over-year growth."],
  ["mv", "Maldives", "South Asia", 28.6, 10.4, 22.8, 5.2, 28, 80, "Tourism-driven infrastructure. ~12% year-over-year growth."],
  ["bt", "Bhutan", "South Asia", 12.8, 4.6, 10.4, 2.6, 38, 126, "Mountainous terrain limits coverage. ~14% year-over-year growth."],
  ["li", "Liechtenstein", "Western Europe", 142.6, 58.4, 72.8, 14.6, 10, 28, "Small wealthy nation with excellent infrastructure. ~6% year-over-year growth."],
  ["mc", "Monaco", "Western Europe", 168.4, 72.6, 82.4, 16.8, 8, 20, "Dense urban fiber network. ~5% year-over-year growth."],
  ["sm", "San Marino", "Southern Europe", 88.4, 32.6, 42.6, 8.4, 16, 45, "Small European microstate. ~8% year-over-year growth."],
  ["ad", "Andorra", "Southern Europe", 118.6, 48.4, 56.8, 11.2, 12, 34, "Pyrenean microstate with good connectivity. ~7% year-over-year growth."],
  ["xk", "Kosovo", "Eastern Europe", 52.4, 22.8, 28.6, 6.2, 22, 63, "Young nation developing broadband. ~16% year-over-year growth."],
  ["ps", "Palestine", "Middle East", 14.6, 4.2, 12.8, 3.0, 42, 100, "Infrastructure constraints limit speeds. ~8% year-over-year growth."],
  ["mr", "Mauritania", "Sub-Saharan Africa", 5.8, 1.8, 7.4, 1.8, 48, 135, "Saharan nation with limited broadband. ~10% year-over-year growth."],
  ["bj", "Benin", "Sub-Saharan Africa", 7.4, 2.4, 10.2, 2.6, 42, 128, "West African market growing. ~14% year-over-year growth."],
  ["tg", "Togo", "Sub-Saharan Africa", 6.8, 2.2, 8.8, 2.4, 44, 132, "Small West African market developing. ~12% year-over-year growth."],
  ["cf", "Central African Republic", "Sub-Saharan Africa", 3.4, 1.0, 4.8, 1.2, 58, 149, "Among the least connected countries. ~6% year-over-year growth."],
  ["bn", "Brunei", "Southeast Asia", 48.6, 18.4, 32.6, 6.8, 18, 66, "Oil-wealthy nation with growing broadband. ~10% year-over-year growth."],
  ["mo", "Macau", "East Asia", 198.4, 108.6, 68.4, 14.2, 8, 12, "Dense urban area with excellent fiber coverage. ~8% year-over-year growth."],
  ["mt", "Malta", "Southern Europe", 98.6, 38.4, 42.8, 8.6, 16, 42, "Mediterranean island with good connectivity. ~10% year-over-year growth."],
  ["is", "Iceland", "Northern Europe", 178.4, 98.6, 82.4, 16.8, 8, 17, "Small population with excellent fiber coverage. ~6% year-over-year growth."],
];

function getSpeedTier(avgDownloadMbps) {
  if (avgDownloadMbps >= 150) return "Very Fast (150+ Mbps)";
  if (avgDownloadMbps >= 75) return "Fast (75–150 Mbps)";
  if (avgDownloadMbps >= 30) return "Moderate (30–75 Mbps)";
  if (avgDownloadMbps >= 10) return "Slow (10–30 Mbps)";
  return "Very Slow (<10 Mbps)";
}

// Sort countries by fixed download speed descending to assign proper ranks
const sortedCountries = [...countries].sort((a, b) => b[3] - a[3]);
const rankMap = {};
sortedCountries.forEach((c, i) => {
  rankMap[c[0]] = i + 1;
});

for (const entry of countries) {
  const [code, name, region, fixedDL, fixedUL, mobileDL, mobileUL, latency, , trend] = entry;
  const avgDL = fixedDL; // Use fixed broadband as the main metric
  const computedRank = rankMap[code];
  const speedTier = getSpeedTier(avgDL);

  const data = {
    code,
    name,
    avgDownloadMbps: fixedDL,
    avgUploadMbps: fixedUL,
    avgLatencyMs: latency,
    mobileDownloadMbps: mobileDL,
    mobileUploadMbps: mobileUL,
    fixedDownloadMbps: fixedDL,
    fixedUploadMbps: fixedUL,
    rank: computedRank,
    speedTier,
    region,
    dataYear: 2024,
    trendDescription: trend,
    geojson: `${code}.geojson`,
  };

  fs.writeFileSync(
    path.join(DATA_DIR, `${code}.json`),
    JSON.stringify(data, null, 2) + "\n"
  );

  // Copy GeoJSON from power-grids and update properties
  const srcGeo = path.join(POWER_GRIDS_GEO, `${code}.geojson`);
  if (fs.existsSync(srcGeo)) {
    const geo = JSON.parse(fs.readFileSync(srcGeo, "utf-8"));
    // Update properties for internet-speed context
    for (const feature of geo.features) {
      feature.properties = {
        code,
        name,
        country: feature.properties.country || code.toUpperCase(),
        speedTier,
      };
    }
    fs.writeFileSync(
      path.join(GEO_DIR, `${code}.geojson`),
      JSON.stringify(geo) + "\n"
    );
  }
}

console.log(`Generated ${countries.length} data files in ${DATA_DIR}`);
console.log(`Generated GeoJSON files in ${GEO_DIR}`);
