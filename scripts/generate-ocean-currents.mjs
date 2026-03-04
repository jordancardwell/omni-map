/**
 * Generates data/*.json and geo/*.geojson files for the ocean-currents plugin.
 * Run with: node scripts/generate-ocean-currents.mjs
 */
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

const PLUGIN_DIR = join(import.meta.dirname, "..", "plugins", "ocean-currents");
const DATA_DIR = join(PLUGIN_DIR, "data");
const GEO_DIR = join(PLUGIN_DIR, "geo");

mkdirSync(DATA_DIR, { recursive: true });
mkdirSync(GEO_DIR, { recursive: true });

// Helper: compute bearing between two [lon,lat] points in radians
function bearing(a, b) {
  const dLon = ((b[0] - a[0]) * Math.PI) / 180;
  const lat1 = (a[1] * Math.PI) / 180;
  const lat2 = (b[1] * Math.PI) / 180;
  const y = Math.sin(dLon) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
  return Math.atan2(y, x);
}

// Helper: offset a [lon,lat] point by distance in a bearing direction
function offsetPoint(pt, brng, distDeg) {
  const lon = pt[0] + distDeg * Math.sin(brng);
  const lat = pt[1] + distDeg * Math.cos(brng);
  return [Math.round(lon * 100) / 100, Math.round(lat * 100) / 100];
}

// Create arrow triangle polygon at a point on the path
function makeArrow(coords, segIndex, code, name, size = 1.2) {
  const a = coords[segIndex];
  const b = coords[Math.min(segIndex + 1, coords.length - 1)];
  const brng = bearing(a, b);
  const tip = offsetPoint(a, brng, size * 0.6);
  const left = offsetPoint(a, brng - Math.PI / 2, size * 0.3);
  const right = offsetPoint(a, brng + Math.PI / 2, size * 0.3);
  const back = offsetPoint(a, brng + Math.PI, size * 0.2);
  const leftBack = [
    (left[0] + back[0]) / 2,
    (left[1] + back[1]) / 2,
  ];
  const rightBack = [
    (right[0] + back[0]) / 2,
    (right[1] + back[1]) / 2,
  ];
  return {
    type: "Feature",
    properties: { code, name, featureType: "arrow" },
    geometry: {
      type: "Polygon",
      coordinates: [[tip, rightBack, leftBack, tip]],
    },
  };
}

// Generate arrow features along a path
function generateArrows(coords, code, name, count = 3) {
  if (coords.length < 3) return [];
  const arrows = [];
  const step = Math.floor(coords.length / (count + 1));
  for (let i = 1; i <= count; i++) {
    const idx = Math.min(i * step, coords.length - 2);
    arrows.push(makeArrow(coords, idx, code, name));
  }
  return arrows;
}

// All 40 major ocean currents
const currents = [
  // === WARM CURRENTS ===
  {
    code: "gulf-stream",
    name: "Gulf Stream",
    currentType: "Warm",
    speedRange: "1.0–2.5 m/s",
    currentStrength: 5,
    origin: "Gulf of Mexico",
    destination: "North Atlantic / Europe",
    climateEffects: ["Warms Western Europe", "Moderates UK/Scandinavian climate", "Fuels North Atlantic weather systems"],
    connectedEcosystems: ["Sargasso Sea", "North Atlantic fisheries", "Gulf of Mexico coral reefs"],
    description: "One of the strongest and most studied ocean currents, the Gulf Stream carries warm water from the Gulf of Mexico northeast across the Atlantic. It transports roughly 30 million cubic meters per second and significantly warms the climate of Western Europe.",
    itemCategory: "Warm",
    coords: [[-80, 25], [-79.5, 27], [-78, 30], [-75, 35], [-70, 38], [-65, 40], [-55, 43], [-45, 47], [-35, 50], [-25, 52], [-15, 53]],
  },
  {
    code: "north-atlantic-drift",
    name: "North Atlantic Drift",
    currentType: "Warm",
    speedRange: "0.3–0.5 m/s",
    currentStrength: 3,
    origin: "Mid-Atlantic (Gulf Stream extension)",
    destination: "Norwegian Sea / Arctic",
    climateEffects: ["Keeps Norwegian ports ice-free", "Moderates Northern European winters", "Influences Arctic sea ice extent"],
    connectedEcosystems: ["Norwegian Sea fisheries", "Barents Sea ecosystem", "Iceland marine habitats"],
    description: "The North Atlantic Drift is the northeastern extension of the Gulf Stream, carrying warm subtropical water toward Northern Europe and the Arctic. It is a key component of the Atlantic thermohaline circulation.",
    itemCategory: "Warm",
    coords: [[-20, 50], [-15, 52], [-10, 55], [-5, 58], [0, 60], [5, 63], [10, 67], [15, 70]],
  },
  {
    code: "kuroshio",
    name: "Kuroshio Current",
    currentType: "Warm",
    speedRange: "1.0–2.0 m/s",
    currentStrength: 5,
    origin: "Philippine Sea",
    destination: "North Pacific",
    climateEffects: ["Warms southern Japan", "Influences East Asian monsoons", "Feeds Pacific typhoons"],
    connectedEcosystems: ["Japanese coral reefs", "Kuroshio fisheries", "East China Sea biodiversity"],
    description: "The Kuroshio (Black Current) is the Pacific equivalent of the Gulf Stream, flowing northeast from the Philippines past Japan. It is one of the strongest currents in the world, transporting about 25 million cubic meters per second.",
    itemCategory: "Warm",
    coords: [[125, 15], [127, 20], [130, 25], [133, 30], [136, 33], [140, 35], [145, 37], [150, 38], [155, 39]],
  },
  {
    code: "north-pacific",
    name: "North Pacific Current",
    currentType: "Warm",
    speedRange: "0.1–0.3 m/s",
    currentStrength: 2,
    origin: "Western North Pacific (Kuroshio extension)",
    destination: "Eastern North Pacific",
    climateEffects: ["Moderates Pacific Northwest climate", "Drives North Pacific gyre", "Influences Pacific weather patterns"],
    connectedEcosystems: ["North Pacific gyre", "Pacific salmon habitats", "Aleutian marine ecosystem"],
    description: "The North Pacific Current flows eastward across the Pacific Ocean, carrying warm water from the Kuroshio Extension toward North America. It divides into the Alaska Current (north) and California Current (south).",
    itemCategory: "Warm",
    coords: [[155, 39], [165, 40], [175, 41], [-175, 42], [-165, 43], [-155, 44], [-145, 45], [-135, 46], [-128, 47]],
  },
  {
    code: "agulhas",
    name: "Agulhas Current",
    currentType: "Warm",
    speedRange: "1.5–2.5 m/s",
    currentStrength: 5,
    origin: "Mozambique Channel / Indian Ocean",
    destination: "South Africa / South Atlantic",
    climateEffects: ["Warms southeastern Africa", "Creates extreme rogue waves", "Leaks warm water into Atlantic via Agulhas rings"],
    connectedEcosystems: ["East African coral reefs", "South African marine habitats", "Indian Ocean pelagic zone"],
    description: "The Agulhas Current is the western boundary current of the Indian Ocean, flowing southward along the east coast of Africa. It is one of the fastest ocean currents, notorious for producing dangerous rogue waves where it meets the Southern Ocean.",
    itemCategory: "Warm",
    coords: [[40, -10], [38, -15], [36, -20], [34, -25], [31, -30], [28, -33], [25, -35], [22, -37]],
  },
  {
    code: "brazil",
    name: "Brazil Current",
    currentType: "Warm",
    speedRange: "0.3–0.7 m/s",
    currentStrength: 3,
    origin: "South Equatorial Current (Atlantic)",
    destination: "South Atlantic convergence zone",
    climateEffects: ["Warms Brazilian coast", "Influences South American weather", "Creates subtropical convergence with Falkland Current"],
    connectedEcosystems: ["Brazilian coral reefs", "South Atlantic fisheries", "Rio de la Plata estuary"],
    description: "The Brazil Current is a warm, southward-flowing western boundary current in the South Atlantic Ocean. It carries tropical water along the coast of Brazil before meeting the cold Falkland Current near the Rio de la Plata.",
    itemCategory: "Warm",
    coords: [[-35, -5], [-37, -10], [-39, -15], [-42, -20], [-45, -25], [-48, -30], [-50, -35]],
  },
  {
    code: "east-australian",
    name: "East Australian Current",
    currentType: "Warm",
    speedRange: "0.5–1.5 m/s",
    currentStrength: 4,
    origin: "Coral Sea",
    destination: "Tasman Sea",
    climateEffects: ["Warms eastern Australia", "Influences rainfall patterns", "Strengthening due to climate change"],
    connectedEcosystems: ["Great Barrier Reef", "Tasman Sea marine life", "Lord Howe Island ecosystem"],
    description: "The East Australian Current (EAC) flows southward along the eastern coast of Australia, made famous by the film Finding Nemo. It transports warm Coral Sea water into the Tasman Sea and has been strengthening and extending further south in recent decades.",
    itemCategory: "Warm",
    coords: [[150, -15], [152, -18], [153, -22], [154, -26], [153, -30], [152, -34], [151, -37], [150, -40]],
  },
  {
    code: "mozambique",
    name: "Mozambique Current",
    currentType: "Warm",
    speedRange: "0.5–1.5 m/s",
    currentStrength: 3,
    origin: "South Equatorial Current (Indian Ocean)",
    destination: "Agulhas Current",
    climateEffects: ["Transports warm water southward", "Influences East African rainfall", "Feeds the Agulhas system"],
    connectedEcosystems: ["Mozambique Channel reefs", "Madagascar marine habitats", "East African mangroves"],
    description: "The Mozambique Current flows southward through the Mozambique Channel between Madagascar and mainland Africa, carrying warm tropical water that feeds into the Agulhas Current.",
    itemCategory: "Warm",
    coords: [[42, -10], [41, -14], [40, -18], [38, -22], [36, -26], [34, -30]],
  },
  {
    code: "caribbean",
    name: "Caribbean Current",
    currentType: "Warm",
    speedRange: "0.3–0.7 m/s",
    currentStrength: 3,
    origin: "South Atlantic (via North Equatorial Current)",
    destination: "Gulf of Mexico (via Yucatan Channel)",
    climateEffects: ["Transports warm water into the Caribbean", "Influences hurricane intensity", "Feeds Gulf Stream system"],
    connectedEcosystems: ["Caribbean coral reefs", "Mesoamerican Barrier Reef", "Lesser Antilles marine habitats"],
    description: "The Caribbean Current flows westward through the Caribbean Sea, carrying warm Atlantic water toward the Yucatan Channel and ultimately feeding the Loop Current and Gulf Stream.",
    itemCategory: "Warm",
    coords: [[-60, 12], [-65, 13], [-70, 14], [-75, 15], [-78, 17], [-82, 18], [-85, 20]],
  },
  {
    code: "loop-current",
    name: "Loop Current",
    currentType: "Warm",
    speedRange: "0.5–1.8 m/s",
    currentStrength: 4,
    origin: "Yucatan Channel",
    destination: "Florida Strait (becomes Gulf Stream)",
    climateEffects: ["Drives Gulf of Mexico circulation", "Intensifies hurricanes in the Gulf", "Transports warm water to Atlantic"],
    connectedEcosystems: ["Gulf of Mexico deep reefs", "Florida Keys coral reefs", "Mississippi Delta ecosystem"],
    description: "The Loop Current enters the Gulf of Mexico through the Yucatan Channel, loops northward, and exits through the Florida Strait. Its warm waters are a major factor in intensifying Gulf hurricanes.",
    itemCategory: "Warm",
    coords: [[-86, 22], [-87, 24], [-88, 26], [-87, 28], [-85, 28], [-83, 27], [-82, 25]],
  },
  {
    code: "alaska",
    name: "Alaska Current",
    currentType: "Warm",
    speedRange: "0.1–0.3 m/s",
    currentStrength: 2,
    origin: "North Pacific Current",
    destination: "Gulf of Alaska / Aleutian Islands",
    climateEffects: ["Moderates Alaskan coastal climate", "Keeps ports ice-free", "Supports productive fisheries"],
    connectedEcosystems: ["Gulf of Alaska fisheries", "Alaskan kelp forests", "Aleutian marine ecosystem"],
    description: "The Alaska Current is the northward branch of the North Pacific Current, flowing counterclockwise around the Gulf of Alaska. It carries relatively warm water that keeps southern Alaskan waters productive.",
    itemCategory: "Warm",
    coords: [[-130, 47], [-135, 50], [-140, 53], [-148, 56], [-155, 57], [-162, 56], [-168, 54]],
  },
  {
    code: "norwegian",
    name: "Norwegian Current",
    currentType: "Warm",
    speedRange: "0.2–0.5 m/s",
    currentStrength: 3,
    origin: "North Atlantic Drift",
    destination: "Barents Sea / Arctic Ocean",
    climateEffects: ["Keeps Norwegian coast ice-free", "Warms Northern Scandinavia", "Major heat transport to Arctic"],
    connectedEcosystems: ["Norwegian fjord ecosystems", "Barents Sea fisheries", "Lofoten Islands marine habitats"],
    description: "The Norwegian Current carries warm Atlantic water northward along the Norwegian coast into the Barents Sea and Arctic Ocean. It is the primary source of heat for the Norwegian and Barents seas.",
    itemCategory: "Warm",
    coords: [[5, 60], [7, 63], [10, 66], [13, 69], [17, 71], [22, 72], [28, 72]],
  },
  {
    code: "irminger",
    name: "Irminger Current",
    currentType: "Warm",
    speedRange: "0.2–0.4 m/s",
    currentStrength: 2,
    origin: "North Atlantic Drift",
    destination: "South of Iceland / Denmark Strait",
    climateEffects: ["Moderates Icelandic climate", "Influences deep-water formation", "Affects Arctic sea ice"],
    connectedEcosystems: ["Iceland marine fisheries", "Irminger Sea biodiversity", "Denmark Strait ecosystem"],
    description: "The Irminger Current branches from the North Atlantic Drift and flows westward south of Iceland. It plays a key role in the thermohaline circulation and deep-water formation in the North Atlantic.",
    itemCategory: "Warm",
    coords: [[-15, 58], [-20, 60], [-25, 62], [-28, 63], [-30, 64], [-33, 64]],
  },
  {
    code: "north-equatorial-atlantic",
    name: "North Equatorial Current (Atlantic)",
    currentType: "Warm",
    speedRange: "0.2–0.5 m/s",
    currentStrength: 3,
    origin: "West Africa / Cape Verde",
    destination: "Caribbean Sea / Lesser Antilles",
    climateEffects: ["Drives tropical Atlantic circulation", "Transports Saharan dust westward", "Influences tropical cyclone formation"],
    connectedEcosystems: ["Tropical Atlantic pelagic zone", "Cape Verde marine habitats", "Caribbean reef systems"],
    description: "The Atlantic North Equatorial Current flows westward from the African coast to the Caribbean, driven by the northeast trade winds. It is a major component of the North Atlantic subtropical gyre.",
    itemCategory: "Warm",
    coords: [[-20, 15], [-28, 14], [-35, 13], [-42, 12], [-50, 12], [-55, 12], [-60, 13]],
  },
  {
    code: "north-equatorial-pacific",
    name: "North Equatorial Current (Pacific)",
    currentType: "Warm",
    speedRange: "0.2–0.5 m/s",
    currentStrength: 3,
    origin: "Central American coast",
    destination: "Philippine Sea",
    climateEffects: ["Drives Pacific tropical circulation", "Influences ENSO (El Nino)", "Transports warm water westward"],
    connectedEcosystems: ["Pacific tropical fisheries", "Micronesian reef systems", "Philippine Sea biodiversity"],
    description: "The Pacific North Equatorial Current flows westward across the tropical Pacific, driven by trade winds. It feeds the Kuroshio Current system and plays a role in El Nino/La Nina oscillations.",
    itemCategory: "Warm",
    coords: [[-110, 15], [-120, 14], [-135, 13], [-150, 12], [-165, 12], [180, 12], [165, 13], [150, 14], [135, 15]],
  },
  {
    code: "south-equatorial-atlantic",
    name: "South Equatorial Current (Atlantic)",
    currentType: "Warm",
    speedRange: "0.3–0.6 m/s",
    currentStrength: 3,
    origin: "Gulf of Guinea",
    destination: "Brazil coast (splits north/south)",
    climateEffects: ["Feeds both North and South Atlantic gyres", "Influences Amazon discharge mixing", "Drives equatorial upwelling"],
    connectedEcosystems: ["Gulf of Guinea fisheries", "Brazilian coastal ecosystems", "Fernando de Noronha marine life"],
    description: "The Atlantic South Equatorial Current flows westward across the tropical Atlantic from the African coast to Brazil, where it bifurcates into the northward North Brazil Current and southward Brazil Current.",
    itemCategory: "Warm",
    coords: [[5, -3], [-5, -4], [-15, -5], [-25, -6], [-32, -7], [-35, -5]],
  },
  {
    code: "south-equatorial-pacific",
    name: "South Equatorial Current (Pacific)",
    currentType: "Warm",
    speedRange: "0.2–0.5 m/s",
    currentStrength: 3,
    origin: "Eastern tropical Pacific",
    destination: "Western Pacific / Coral Sea",
    climateEffects: ["Key component of ENSO system", "Drives Pacific warm pool", "Influences Melanesian climate"],
    connectedEcosystems: ["Pacific Island reefs", "Coral Sea biodiversity", "Galapagos marine ecosystem"],
    description: "The Pacific South Equatorial Current flows westward across the tropical Pacific, feeding warm water into the western Pacific warm pool and the East Australian Current system.",
    itemCategory: "Warm",
    coords: [[-90, -5], [-105, -6], [-120, -7], [-140, -8], [-160, -9], [-175, -10], [170, -11], [158, -12], [150, -14]],
  },
  {
    code: "south-equatorial-indian",
    name: "South Equatorial Current (Indian Ocean)",
    currentType: "Warm",
    speedRange: "0.3–0.6 m/s",
    currentStrength: 3,
    origin: "Eastern Indian Ocean / Indonesia",
    destination: "Madagascar / East Africa",
    climateEffects: ["Drives Indian Ocean gyre", "Influences East African monsoon", "Feeds Agulhas Current"],
    connectedEcosystems: ["Mascarene Islands reefs", "Seychelles marine habitats", "Madagascar reef systems"],
    description: "The Indian Ocean South Equatorial Current flows westward from Indonesia across the Indian Ocean, carrying warm water toward Madagascar and the East African coast, where it splits into the Mozambique and East Madagascar currents.",
    itemCategory: "Warm",
    coords: [[100, -10], [90, -11], [80, -12], [70, -13], [60, -13], [50, -12], [45, -11]],
  },
  {
    code: "florida",
    name: "Florida Current",
    currentType: "Warm",
    speedRange: "1.0–1.8 m/s",
    currentStrength: 5,
    origin: "Florida Strait",
    destination: "Cape Hatteras (becomes Gulf Stream)",
    climateEffects: ["Warms southeastern US", "Influences Florida weather", "Major Atlantic heat transport"],
    connectedEcosystems: ["Florida Keys reefs", "Bahamas marine habitats", "Southeast US continental shelf"],
    description: "The Florida Current is the intense, narrow warm current that flows through the Florida Strait between Florida and Cuba/Bahamas. It is the initial segment of the Gulf Stream system.",
    itemCategory: "Warm",
    coords: [[-82, 24], [-81, 25], [-80, 26], [-79.5, 28], [-79, 30], [-78, 32], [-76, 34]],
  },
  {
    code: "guinea",
    name: "Guinea Current",
    currentType: "Warm",
    speedRange: "0.2–0.5 m/s",
    currentStrength: 2,
    origin: "North Equatorial Counter Current",
    destination: "Gulf of Guinea",
    climateEffects: ["Warms West African coast", "Influences tropical rainfall", "Drives Gulf of Guinea upwelling"],
    connectedEcosystems: ["Gulf of Guinea fisheries", "West African mangroves", "Niger Delta ecosystem"],
    description: "The Guinea Current flows eastward along the coast of West Africa into the Gulf of Guinea. It carries warm water and influences the climate and ecosystems of the tropical West African coast.",
    itemCategory: "Warm",
    coords: [[-20, 5], [-15, 4], [-10, 4], [-5, 4], [0, 3], [5, 3], [8, 4]],
  },
  {
    code: "leeuwin",
    name: "Leeuwin Current",
    currentType: "Warm",
    speedRange: "0.2–0.5 m/s",
    currentStrength: 2,
    origin: "Northwest Australia / Indonesian Throughflow",
    destination: "Southwest Australia",
    climateEffects: ["Warms Western Australian coast", "Anomalous warm eastern boundary current", "Influences Australian rainfall"],
    connectedEcosystems: ["Ningaloo Reef", "Shark Bay", "Southwest Australian marine habitats"],
    description: "The Leeuwin Current is unusual as it flows poleward along a continent's western coast — opposite to most eastern boundary currents. It carries warm tropical water southward along Western Australia, supporting unique marine ecosystems including Ningaloo Reef.",
    itemCategory: "Warm",
    coords: [[115, -20], [114, -23], [113, -27], [114, -30], [115, -33], [117, -35]],
  },
  {
    code: "antilles",
    name: "Antilles Current",
    currentType: "Warm",
    speedRange: "0.2–0.5 m/s",
    currentStrength: 2,
    origin: "North Equatorial Current",
    destination: "Sargasso Sea / Gulf Stream",
    climateEffects: ["Transports warm water northward", "Feeds Gulf Stream system", "Influences Bermuda climate"],
    connectedEcosystems: ["Sargasso Sea", "Lesser Antilles reef systems", "Bermuda marine habitats"],
    description: "The Antilles Current flows northwestward along the eastern side of the Antilles island chain, carrying warm tropical water toward the Sargasso Sea where it joins the Gulf Stream.",
    itemCategory: "Warm",
    coords: [[-60, 15], [-62, 18], [-64, 21], [-66, 24], [-68, 27], [-70, 30]],
  },

  // === COLD CURRENTS ===
  {
    code: "labrador",
    name: "Labrador Current",
    currentType: "Cold",
    speedRange: "0.3–0.5 m/s",
    currentStrength: 3,
    origin: "Arctic Ocean / Baffin Bay",
    destination: "Grand Banks / Northwest Atlantic",
    climateEffects: ["Cools Northeastern North America", "Brings icebergs south", "Creates fog on Grand Banks"],
    connectedEcosystems: ["Grand Banks fisheries", "Arctic marine species range", "Newfoundland coastal habitats"],
    description: "The Labrador Current carries cold, low-salinity Arctic water southward along the coast of Labrador and Newfoundland. It is responsible for bringing icebergs into North Atlantic shipping lanes and creating the Grand Banks' famous fog banks.",
    itemCategory: "Cold",
    coords: [[-60, 65], [-58, 60], [-55, 55], [-52, 50], [-50, 47], [-48, 45], [-45, 42]],
  },
  {
    code: "canary",
    name: "Canary Current",
    currentType: "Cold",
    speedRange: "0.2–0.4 m/s",
    currentStrength: 2,
    origin: "North Atlantic Drift",
    destination: "North Equatorial Current",
    climateEffects: ["Cools Northwest African coast", "Drives upwelling (rich fisheries)", "Creates coastal desert conditions"],
    connectedEcosystems: ["Canary Islands marine habitats", "Northwest African upwelling zone", "Mauritanian fisheries"],
    description: "The Canary Current is a cold, southward-flowing eastern boundary current in the North Atlantic. It drives one of the world's most productive upwelling systems off the coast of northwest Africa.",
    itemCategory: "Cold",
    coords: [[-15, 42], [-16, 38], [-17, 34], [-18, 30], [-18, 26], [-19, 22], [-20, 18]],
  },
  {
    code: "benguela",
    name: "Benguela Current",
    currentType: "Cold",
    speedRange: "0.2–0.5 m/s",
    currentStrength: 3,
    origin: "Southern Ocean / Antarctic Circumpolar",
    destination: "South Equatorial Current (Atlantic)",
    climateEffects: ["Cools Southwest African coast", "Creates Namib Desert conditions", "Drives major upwelling system"],
    connectedEcosystems: ["Benguela upwelling ecosystem", "Namibian fisheries", "South African marine habitats"],
    description: "The Benguela Current flows northward along the southwest coast of Africa. Its associated upwelling system is one of the most productive marine ecosystems on Earth, supporting massive fisheries and seabird colonies.",
    itemCategory: "Cold",
    coords: [[18, -35], [16, -32], [14, -28], [13, -24], [12, -20], [11, -16], [10, -12]],
  },
  {
    code: "california",
    name: "California Current",
    currentType: "Cold",
    speedRange: "0.1–0.3 m/s",
    currentStrength: 2,
    origin: "North Pacific Current",
    destination: "North Equatorial Current (Pacific)",
    climateEffects: ["Cools US West Coast", "Creates San Francisco fog", "Drives productive upwelling"],
    connectedEcosystems: ["California upwelling ecosystem", "Monterey Bay habitats", "Pacific kelp forests"],
    description: "The California Current is a cold, southward-flowing eastern boundary current in the North Pacific. It cools the US West Coast, creates coastal fog, and supports one of the most productive marine ecosystems in the world.",
    itemCategory: "Cold",
    coords: [[-128, 48], [-126, 44], [-124, 40], [-122, 36], [-120, 32], [-118, 28], [-115, 24]],
  },
  {
    code: "humboldt",
    name: "Humboldt Current (Peru Current)",
    currentType: "Cold",
    speedRange: "0.2–0.5 m/s",
    currentStrength: 4,
    origin: "Southern Ocean / Antarctic Circumpolar",
    destination: "South Equatorial Current (Pacific)",
    climateEffects: ["Creates Atacama Desert conditions", "Drives world's most productive fishery", "Key factor in El Nino/La Nina"],
    connectedEcosystems: ["Peru-Chile upwelling system", "Galapagos marine ecosystem", "South American seabird colonies"],
    description: "The Humboldt Current (Peru Current) flows northward along the west coast of South America. Its powerful upwelling creates the world's most productive marine ecosystem, but it is periodically disrupted by El Nino events.",
    itemCategory: "Cold",
    coords: [[-75, -45], [-74, -40], [-73, -35], [-72, -30], [-73, -25], [-75, -20], [-78, -15], [-80, -10], [-82, -5]],
  },
  {
    code: "oyashio",
    name: "Oyashio Current",
    currentType: "Cold",
    speedRange: "0.3–0.5 m/s",
    currentStrength: 3,
    origin: "Arctic Ocean / Bering Sea",
    destination: "North Pacific (meets Kuroshio)",
    climateEffects: ["Cools Northern Japan", "Creates rich mixing zone with Kuroshio", "Brings nutrient-rich Arctic water south"],
    connectedEcosystems: ["Hokkaido fisheries", "North Pacific mixing zone", "Sea of Okhotsk ecosystem"],
    description: "The Oyashio Current is the cold, nutrient-rich western boundary current of the North Pacific, flowing southward from the Arctic past the Kuril Islands and Hokkaido. Where it meets the warm Kuroshio, it creates one of the richest fishing grounds in the world.",
    itemCategory: "Cold",
    coords: [[165, 55], [160, 52], [155, 48], [150, 44], [147, 41], [145, 38]],
  },
  {
    code: "east-greenland",
    name: "East Greenland Current",
    currentType: "Cold",
    speedRange: "0.2–0.4 m/s",
    currentStrength: 3,
    origin: "Arctic Ocean (Fram Strait)",
    destination: "Denmark Strait / Labrador Sea",
    climateEffects: ["Exports Arctic sea ice southward", "Cools eastern Greenland", "Influences North Atlantic deep water formation"],
    connectedEcosystems: ["Arctic marine ecosystem", "Greenland fjord habitats", "Denmark Strait marine life"],
    description: "The East Greenland Current carries cold Arctic water and sea ice southward along the eastern coast of Greenland. It is a major pathway for Arctic Ocean water export and plays a critical role in global thermohaline circulation.",
    itemCategory: "Cold",
    coords: [[-5, 80], [-10, 76], [-18, 72], [-24, 68], [-30, 65], [-35, 62], [-40, 60]],
  },
  {
    code: "west-australian",
    name: "West Australian Current",
    currentType: "Cold",
    speedRange: "0.1–0.2 m/s",
    currentStrength: 1,
    origin: "Southern Ocean",
    destination: "South Equatorial Current (Indian Ocean)",
    climateEffects: ["Mildly cools Western Australia", "Weak compared to Leeuwin Current", "Seasonal variation in strength"],
    connectedEcosystems: ["Western Australian shelf", "Abrolhos Islands marine habitats"],
    description: "The West Australian Current is a weak, cold, northward-flowing current off the west coast of Australia. Unusually for an eastern boundary current, it is often overpowered by the warm southward-flowing Leeuwin Current.",
    itemCategory: "Cold",
    coords: [[110, -38], [109, -34], [108, -30], [107, -26], [106, -22], [105, -18]],
  },
  {
    code: "falkland",
    name: "Falkland Current (Malvinas Current)",
    currentType: "Cold",
    speedRange: "0.3–0.5 m/s",
    currentStrength: 3,
    origin: "Antarctic Circumpolar Current",
    destination: "Brazil-Falkland Confluence",
    climateEffects: ["Cools Argentine coast", "Creates productive confluence zone", "Influences Patagonian climate"],
    connectedEcosystems: ["Patagonian shelf ecosystem", "Falkland Islands marine habitats", "Argentine fisheries"],
    description: "The Falkland (Malvinas) Current branches from the Antarctic Circumpolar Current and flows northward along the coast of Patagonia. Its collision with the warm Brazil Current creates one of the most energetic confluence zones in the world ocean.",
    itemCategory: "Cold",
    coords: [[-60, -55], [-58, -50], [-55, -45], [-52, -42], [-50, -38]],
  },
  {
    code: "somali",
    name: "Somali Current",
    currentType: "Cold",
    speedRange: "0.5–2.0 m/s",
    currentStrength: 4,
    origin: "Southern Indian Ocean",
    destination: "Arabian Sea",
    climateEffects: ["Reverses direction seasonally (monsoon)", "Drives intense upwelling (summer)", "Cools Horn of Africa coast"],
    connectedEcosystems: ["Somali upwelling ecosystem", "Gulf of Aden marine habitats", "East African pelagic zone"],
    description: "The Somali Current is unique among major currents in that it completely reverses direction between seasons. During the Southwest Monsoon (summer), it flows northeastward with extreme velocity, driving one of the strongest upwelling systems in the world.",
    itemCategory: "Cold",
    coords: [[42, -5], [44, 0], [46, 5], [48, 8], [50, 11], [52, 13], [55, 15]],
  },
  {
    code: "kamchatka",
    name: "Kamchatka Current",
    currentType: "Cold",
    speedRange: "0.2–0.4 m/s",
    currentStrength: 2,
    origin: "Bering Sea",
    destination: "Oyashio Current",
    climateEffects: ["Transports cold Bering water south", "Cools Kamchatka Peninsula", "Feeds nutrient-rich Oyashio"],
    connectedEcosystems: ["Bering Sea fisheries", "Kamchatka marine habitats", "Kuril Islands ecosystem"],
    description: "The Kamchatka Current flows southwestward along the coast of the Kamchatka Peninsula, carrying cold, nutrient-rich water from the Bering Sea. It is the northern feeder of the Oyashio Current.",
    itemCategory: "Cold",
    coords: [[170, 60], [167, 58], [163, 56], [160, 54], [158, 52], [156, 50]],
  },

  // === DEEP/CIRCUMPOLAR CURRENTS ===
  {
    code: "antarctic-circumpolar",
    name: "Antarctic Circumpolar Current",
    currentType: "Deep",
    speedRange: "0.1–0.2 m/s (but immense volume)",
    currentStrength: 5,
    origin: "Southern Ocean (circles Antarctica)",
    destination: "Southern Ocean (continuous loop)",
    climateEffects: ["Isolates Antarctica thermally", "Largest current by volume (150+ Sv)", "Drives global thermohaline circulation"],
    connectedEcosystems: ["Antarctic krill ecosystem", "Southern Ocean fisheries", "Sub-Antarctic islands biodiversity"],
    description: "The Antarctic Circumpolar Current (ACC) is the world's largest ocean current by volume, transporting over 150 million cubic meters per second as it circles Antarctica. It connects the Atlantic, Pacific, and Indian Oceans and thermally isolates Antarctica.",
    itemCategory: "Deep",
    coords: [[-70, -55], [-50, -57], [-30, -56], [-10, -55], [10, -54], [30, -53], [50, -52], [70, -53], [90, -54], [110, -55], [130, -56], [150, -57], [170, -58], [-170, -58], [-150, -57], [-130, -56], [-110, -56], [-90, -56], [-70, -55]],
  },
  {
    code: "antarctic-coastal",
    name: "Antarctic Coastal Current (East Wind Drift)",
    currentType: "Deep",
    speedRange: "0.05–0.15 m/s",
    currentStrength: 2,
    origin: "Antarctic coast",
    destination: "Antarctic coast (westward loop)",
    climateEffects: ["Drives coastal ice formation", "Creates Antarctic polynyas", "Contributes to bottom water formation"],
    connectedEcosystems: ["Antarctic ice shelf ecosystem", "Ross Sea marine habitats", "Weddell Sea biodiversity"],
    description: "The Antarctic Coastal Current (East Wind Drift) flows westward close to the Antarctic continent, driven by polar easterly winds. It is the counterpart to the eastward Antarctic Circumpolar Current and plays a role in Antarctic Bottom Water formation.",
    itemCategory: "Deep",
    coords: [[-70, -68], [-90, -70], [-110, -71], [-130, -72], [-150, -73], [-170, -74], [170, -74], [150, -73], [130, -71], [110, -70], [90, -69], [70, -68], [50, -67], [30, -68], [10, -69], [-10, -70], [-30, -70], [-50, -69], [-70, -68]],
  },
  {
    code: "equatorial-counter-atlantic",
    name: "Atlantic Equatorial Countercurrent",
    currentType: "Warm",
    speedRange: "0.3–0.6 m/s",
    currentStrength: 2,
    origin: "Western tropical Atlantic",
    destination: "Gulf of Guinea",
    climateEffects: ["Returns warm water eastward", "Influences tropical Atlantic variability", "Modulates equatorial upwelling"],
    connectedEcosystems: ["Tropical Atlantic pelagic zone", "Gulf of Guinea ecosystem", "Equatorial Atlantic fisheries"],
    description: "The Atlantic Equatorial Countercurrent flows eastward between the North and South Equatorial Currents, returning warm surface water back toward Africa. It is strongest from July to September.",
    itemCategory: "Warm",
    coords: [[-45, 6], [-35, 6], [-25, 5], [-15, 5], [-5, 4], [5, 3]],
  },
  {
    code: "equatorial-counter-pacific",
    name: "Pacific Equatorial Countercurrent",
    currentType: "Warm",
    speedRange: "0.3–0.5 m/s",
    currentStrength: 2,
    origin: "Western Pacific warm pool",
    destination: "Eastern Pacific",
    climateEffects: ["Returns warm water eastward", "Strengthens during El Nino", "Key ENSO indicator"],
    connectedEcosystems: ["Pacific equatorial ecosystem", "Kiribati marine habitats", "Line Islands reef systems"],
    description: "The Pacific Equatorial Countercurrent flows eastward between the North and South Equatorial Currents. It strengthens dramatically during El Nino events, transporting warm water from the western Pacific warm pool toward South America.",
    itemCategory: "Warm",
    coords: [[140, 6], [155, 6], [170, 6], [-175, 6], [-160, 6], [-145, 6], [-130, 6], [-115, 6], [-100, 6]],
  },
  {
    code: "indonesian-throughflow",
    name: "Indonesian Throughflow",
    currentType: "Warm",
    speedRange: "0.2–0.5 m/s",
    currentStrength: 3,
    origin: "Western Pacific",
    destination: "Indian Ocean",
    climateEffects: ["Transfers Pacific heat to Indian Ocean", "Influences Indian Ocean Dipole", "Modulates regional monsoons"],
    connectedEcosystems: ["Coral Triangle", "Indonesian reef systems", "Java Sea biodiversity"],
    description: "The Indonesian Throughflow carries warm, low-salinity Pacific Ocean water through the Indonesian archipelago into the Indian Ocean. It is the only low-latitude connection between ocean basins and plays a critical role in global heat transport.",
    itemCategory: "Warm",
    coords: [[130, 2], [127, 0], [124, -2], [120, -5], [117, -7], [114, -9], [110, -10]],
  },
  {
    code: "cromwell",
    name: "Cromwell Current (Equatorial Undercurrent)",
    currentType: "Deep",
    speedRange: "0.5–1.5 m/s",
    currentStrength: 4,
    origin: "Western Pacific (subsurface)",
    destination: "Galapagos Islands (upwells)",
    climateEffects: ["Drives Galapagos upwelling", "Transports cold subsurface water eastward", "Influences equatorial Pacific productivity"],
    connectedEcosystems: ["Galapagos marine ecosystem", "Equatorial Pacific fisheries", "Eastern Pacific pelagic zone"],
    description: "The Cromwell Current (Pacific Equatorial Undercurrent) flows eastward beneath the surface along the equator, opposite to the westward surface current. It upwells cold, nutrient-rich water at the Galapagos Islands, sustaining unique marine ecosystems.",
    itemCategory: "Deep",
    coords: [[140, 0], [155, 0], [170, 0], [-175, 0], [-160, 0], [-145, 0], [-130, 0], [-115, 0], [-100, 0], [-92, 0]],
  },
  {
    code: "north-atlantic-deep-water",
    name: "North Atlantic Deep Water",
    currentType: "Deep",
    speedRange: "0.01–0.05 m/s",
    currentStrength: 3,
    origin: "Nordic Seas / Labrador Sea",
    destination: "Southern Ocean (global deep circulation)",
    climateEffects: ["Drives global thermohaline circulation", "Transports carbon to deep ocean", "Key indicator of climate change"],
    connectedEcosystems: ["Deep Atlantic ecosystem", "Abyssal plains biodiversity", "Global deep-sea habitats"],
    description: "North Atlantic Deep Water (NADW) forms when cold, dense water sinks in the Nordic and Labrador seas and flows southward at depth through the Atlantic. It is a critical component of the global thermohaline conveyor belt that redistributes heat worldwide.",
    itemCategory: "Deep",
    coords: [[-30, 65], [-35, 55], [-40, 45], [-42, 35], [-40, 25], [-38, 15], [-35, 5], [-30, -5], [-25, -15], [-20, -25], [-15, -35], [-10, -45], [-5, -55]],
  },
];

// Write data and geo files
for (const current of currents) {
  const { coords, ...metadata } = current;

  // Write data file
  const dataObj = {
    code: metadata.code,
    name: metadata.name,
    currentType: metadata.currentType,
    speedRange: metadata.speedRange,
    origin: metadata.origin,
    destination: metadata.destination,
    climateEffects: metadata.climateEffects,
    connectedEcosystems: metadata.connectedEcosystems,
    itemCategory: metadata.itemCategory,
    description: metadata.description,
    geojson: `${metadata.code}.geojson`,
  };
  writeFileSync(
    join(DATA_DIR, `${metadata.code}.json`),
    JSON.stringify(dataObj, null, 2) + "\n"
  );

  // Write GeoJSON file with line + arrow features
  const lineFeature = {
    type: "Feature",
    properties: {
      code: metadata.code,
      name: metadata.name,
      currentType: metadata.currentType,
      currentStrength: metadata.currentStrength,
    },
    geometry: {
      type: "LineString",
      coordinates: coords,
    },
  };

  const arrowCount = coords.length >= 10 ? 4 : coords.length >= 6 ? 3 : 2;
  const arrows = generateArrows(
    coords,
    metadata.code,
    metadata.name,
    arrowCount
  );

  const geojson = {
    type: "FeatureCollection",
    features: [lineFeature, ...arrows],
  };
  writeFileSync(
    join(GEO_DIR, `${metadata.code}.geojson`),
    JSON.stringify(geojson) + "\n"
  );
}

console.log(`Generated ${currents.length} ocean currents (data + geojson)`);
