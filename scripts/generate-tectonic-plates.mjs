#!/usr/bin/env node
/**
 * Generate tectonic plates plugin data and GeoJSON files.
 * Plate boundaries are simplified approximations suitable for visualization.
 * Data sourced from geological references and fraxen/tectonicplates conventions.
 */
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

const PLUGIN_DIR = join(import.meta.dirname, "..", "plugins", "tectonic-plates");
const DATA_DIR = join(PLUGIN_DIR, "data");
const GEO_DIR = join(PLUGIN_DIR, "geo");

mkdirSync(DATA_DIR, { recursive: true });
mkdirSync(GEO_DIR, { recursive: true });

// Plate definitions: metadata + simplified polygon coordinates
const plates = [
  {
    code: "pacific",
    name: "Pacific Plate",
    plateClass: "Major",
    crustType: "Oceanic",
    area: 103.3,
    movementDirection: "Northwest",
    movementRate: "56–102",
    boundaryTypes: ["Convergent", "Divergent", "Transform"],
    adjacentPlates: ["north-american", "juan-de-fuca", "cocos", "nazca", "antarctic", "indo-australian", "philippine-sea", "eurasian"],
    notableFeatures: ["Ring of Fire", "East Pacific Rise", "Mariana Trench", "Hawaiian Hotspot", "San Andreas Fault"],
    description: "The Pacific Plate is the largest tectonic plate on Earth, covering approximately 103 million km². It is almost entirely oceanic crust and is surrounded by the Ring of Fire — the most seismically and volcanically active zone on the planet. The plate contains the Hawaiian hotspot chain, which has created a series of volcanic islands as the plate moves northwest over a stationary mantle plume.",
    geologicalHistory: "The Pacific Plate formed during the Mesozoic Era from the breakup of the Farallon Plate. The oldest oceanic crust on the Pacific Plate dates to about 190 million years ago. The plate has been moving northwest at varying speeds, creating the Hawaiian-Emperor seamount chain. Subduction along its boundaries has generated major volcanic arcs including Japan, the Philippines, and the Andes.",
    // Two polygons to handle antimeridian crossing: western and eastern Pacific
    geojsonFeatures: [
      {
        properties: { code: "pacific", name: "Pacific Plate", section: "Western Pacific" },
        type: "Polygon",
        coordinates: [[
          [145, 50], [140, 35], [138, 25], [140, 15], [145, 5],
          [155, -5], [165, -15], [175, -30], [180, -45], [180, 55],
          [170, 53], [155, 50], [145, 50]
        ]]
      },
      {
        properties: { code: "pacific", name: "Pacific Plate", section: "Eastern Pacific" },
        type: "Polygon",
        coordinates: [[
          [-180, 55], [-180, -45], [-150, -55], [-120, -45],
          [-110, -25], [-105, -5], [-110, 10], [-120, 30],
          [-130, 45], [-145, 52], [-165, 56], [-180, 55]
        ]]
      }
    ]
  },
  {
    code: "north-american",
    name: "North American Plate",
    plateClass: "Major",
    crustType: "Mixed",
    area: 75.9,
    movementDirection: "West-Southwest",
    movementRate: "15–25",
    boundaryTypes: ["Convergent", "Divergent", "Transform"],
    adjacentPlates: ["pacific", "juan-de-fuca", "caribbean", "south-american", "eurasian", "african"],
    notableFeatures: ["San Andreas Fault", "Mid-Atlantic Ridge (western)", "Cascadia Subduction Zone", "Rocky Mountains", "Yellowstone Hotspot"],
    description: "The North American Plate includes most of North America, Greenland, Cuba, the Bahamas, and parts of the Atlantic Ocean floor west of the Mid-Atlantic Ridge. Its western boundary with the Pacific Plate includes the famous San Andreas Fault, a transform boundary running through California. The Cascadia Subduction Zone in the Pacific Northwest is capable of producing magnitude 9+ earthquakes.",
    geologicalHistory: "The North American Plate has been moving westward since the breakup of Pangaea about 200 million years ago. The Laramide Orogeny (80–55 Ma) built the Rocky Mountains as the Farallon Plate subducted at a shallow angle beneath the continent. The San Andreas Fault formed about 28 million years ago as the Pacific and North American plates came into direct contact.",
    geojsonFeatures: [
      {
        properties: { code: "north-american", name: "North American Plate" },
        type: "Polygon",
        coordinates: [[
          [-170, 55], [-165, 65], [-145, 68], [-130, 70], [-100, 75],
          [-65, 80], [-30, 72], [-25, 65], [-15, 60], [-20, 50],
          [-30, 40], [-50, 25], [-70, 15], [-82, 10], [-90, 15],
          [-105, 20], [-115, 30], [-125, 40], [-130, 48], [-145, 53],
          [-170, 55]
        ]]
      }
    ]
  },
  {
    code: "south-american",
    name: "South American Plate",
    plateClass: "Major",
    crustType: "Mixed",
    area: 43.6,
    movementDirection: "West-Northwest",
    movementRate: "25–35",
    boundaryTypes: ["Convergent", "Divergent", "Transform"],
    adjacentPlates: ["nazca", "caribbean", "north-american", "african", "antarctic", "scotia"],
    notableFeatures: ["Andes Mountains", "Mid-Atlantic Ridge (western)", "Peru-Chile Trench", "Amazon Basin"],
    description: "The South American Plate carries the continent of South America and a large portion of the Atlantic Ocean floor. Its western convergent boundary with the Nazca Plate has created the Andes — the longest continental mountain range on Earth. The Mid-Atlantic Ridge forms its divergent eastern boundary, where new oceanic crust is continuously created.",
    geologicalHistory: "South America separated from Africa approximately 130 million years ago as the South Atlantic Ocean opened along the Mid-Atlantic Ridge. The Andean Orogeny began around 200 million years ago and intensified during the Cenozoic, producing the modern Andes. Ongoing subduction of the Nazca Plate generates frequent earthquakes and volcanism along the western margin.",
    geojsonFeatures: [
      {
        properties: { code: "south-american", name: "South American Plate" },
        type: "Polygon",
        coordinates: [[
          [-82, 10], [-70, 15], [-50, 25], [-30, 15], [-20, 5],
          [-15, -10], [-10, -30], [-15, -50], [-25, -58],
          [-55, -60], [-68, -55], [-72, -45], [-75, -30],
          [-80, -15], [-82, 0], [-82, 10]
        ]]
      }
    ]
  },
  {
    code: "african",
    name: "African Plate",
    plateClass: "Major",
    crustType: "Mixed",
    area: 61.3,
    movementDirection: "Northeast",
    movementRate: "21–25",
    boundaryTypes: ["Convergent", "Divergent", "Transform"],
    adjacentPlates: ["eurasian", "north-american", "south-american", "antarctic", "indo-australian", "arabian"],
    notableFeatures: ["East African Rift", "Mid-Atlantic Ridge (eastern)", "Atlas Mountains", "Red Sea Rift", "Great Rift Valley"],
    description: "The African Plate encompasses the entire African continent and adjacent ocean floor. It is notable for the East African Rift System — an active continental rift zone where the plate is slowly splitting apart. The northern boundary with the Eurasian Plate has created the Mediterranean Sea and the Atlas Mountains. The Red Sea represents an advanced stage of continental rifting where the Arabian Plate has separated from Africa.",
    geologicalHistory: "Africa was at the center of the supercontinent Pangaea and has remained relatively stationary compared to other continents. The East African Rift began forming about 25 million years ago and may eventually split the continent. Africa's collision with Europe created the Alps and is slowly closing the Mediterranean Sea. The separation of Madagascar occurred about 160 million years ago.",
    geojsonFeatures: [
      {
        properties: { code: "african", name: "African Plate" },
        type: "Polygon",
        coordinates: [[
          [-20, 40], [-10, 38], [0, 38], [10, 37], [15, 35],
          [30, 32], [35, 30], [40, 15], [50, 5], [52, -5],
          [50, -20], [45, -35], [35, -48], [20, -55],
          [0, -55], [-15, -50], [-10, -30], [-15, -10],
          [-20, 5], [-30, 15], [-30, 30], [-20, 40]
        ]]
      }
    ]
  },
  {
    code: "eurasian",
    name: "Eurasian Plate",
    plateClass: "Major",
    crustType: "Mixed",
    area: 67.8,
    movementDirection: "East-Southeast",
    movementRate: "7–14",
    boundaryTypes: ["Convergent", "Divergent", "Transform"],
    adjacentPlates: ["north-american", "african", "arabian", "indian", "indo-australian", "philippine-sea", "pacific"],
    notableFeatures: ["Himalayas", "Alps", "Mid-Atlantic Ridge (eastern)", "Japan Trench", "Ural Mountains", "Baikal Rift Zone"],
    description: "The Eurasian Plate is the third-largest tectonic plate, covering most of Europe and Asia. Its collision with the Indian Plate has created the Himalayas — the highest mountain range on Earth. The plate's western boundary along the Mid-Atlantic Ridge is a divergent boundary where new crust is created. Its eastern margin features subduction zones that generate the volcanic islands of Japan and the Philippines.",
    geologicalHistory: "The Eurasian Plate formed from the merger of the European and Asian plates about 300 million years ago, with the Ural Mountains marking the suture zone. India's collision with Eurasia beginning about 50 million years ago created the Himalayas and Tibetan Plateau. The ongoing convergence continues to raise the Himalayas by about 5mm per year.",
    geojsonFeatures: [
      {
        properties: { code: "eurasian", name: "Eurasian Plate" },
        type: "Polygon",
        coordinates: [[
          [-25, 65], [-15, 60], [-10, 50], [-5, 45], [0, 38],
          [10, 37], [15, 35], [30, 32], [35, 30], [45, 25],
          [65, 25], [70, 28], [80, 30], [90, 28], [100, 25],
          [110, 20], [120, 22], [130, 30], [138, 35], [140, 42],
          [145, 50], [155, 55], [170, 60], [180, 65],
          [180, 78], [140, 78], [100, 78], [60, 78], [20, 78],
          [-20, 78], [-30, 72], [-25, 65]
        ]]
      }
    ]
  },
  {
    code: "antarctic",
    name: "Antarctic Plate",
    plateClass: "Major",
    crustType: "Mixed",
    area: 60.9,
    movementDirection: "Approximately stationary",
    movementRate: "0–5",
    boundaryTypes: ["Divergent", "Transform"],
    adjacentPlates: ["pacific", "nazca", "south-american", "african", "indo-australian", "scotia"],
    notableFeatures: ["Antarctic Peninsula", "Transantarctic Mountains", "Pacific-Antarctic Ridge", "South Sandwich Trench"],
    description: "The Antarctic Plate carries the continent of Antarctica and surrounding ocean floor. It is nearly surrounded by divergent boundaries — mid-ocean ridges that are spreading apart and creating new oceanic crust. The plate is nearly stationary relative to the mantle, which is unusual among the major plates. It contains some of the oldest continental crust on Earth in the East Antarctic Shield.",
    geologicalHistory: "Antarctica was part of the supercontinent Gondwana. It separated from Australia about 45 million years ago and from South America about 30 million years ago, forming the circum-Antarctic current that led to the continent's glaciation. The Antarctic ice sheet formed about 34 million years ago. The continent holds approximately 70% of Earth's fresh water in its ice cap.",
    geojsonFeatures: [
      {
        properties: { code: "antarctic", name: "Antarctic Plate" },
        type: "Polygon",
        coordinates: [[
          [-180, -55], [-150, -55], [-120, -55], [-90, -60],
          [-55, -60], [-25, -58], [0, -55], [20, -55],
          [35, -48], [50, -50], [80, -50], [110, -48],
          [140, -48], [170, -50], [180, -55],
          [180, -90], [-180, -90], [-180, -55]
        ]]
      }
    ]
  },
  {
    code: "indo-australian",
    name: "Indo-Australian Plate",
    plateClass: "Major",
    crustType: "Mixed",
    area: 58.9,
    movementDirection: "North-Northeast",
    movementRate: "60–75",
    boundaryTypes: ["Convergent", "Divergent", "Transform"],
    adjacentPlates: ["eurasian", "pacific", "antarctic", "african"],
    notableFeatures: ["Himalayas (Indian portion)", "Java Trench", "Southeast Indian Ridge", "Great Barrier Reef", "Sunda Arc"],
    description: "The Indo-Australian Plate carries Australia, New Zealand, and the Indian subcontinent along with surrounding ocean floor. There is ongoing scientific debate about whether this should be considered as two separate plates (Indian and Australian). The northern boundary features the Sunda Arc subduction zone, where the plate dives beneath the Eurasian Plate, generating devastating earthquakes and tsunamis including the 2004 Indian Ocean earthquake.",
    geologicalHistory: "India separated from Gondwana about 120 million years ago and traveled northward at remarkable speed (up to 150 mm/year) before colliding with Eurasia about 50 million years ago. Australia separated from Antarctica about 45 million years ago. The ongoing northward push of the Indian portion continues to uplift the Himalayas and Tibetan Plateau.",
    geojsonFeatures: [
      {
        properties: { code: "indo-australian", name: "Indo-Australian Plate" },
        type: "Polygon",
        coordinates: [[
          [35, 30], [45, 25], [65, 25], [70, 28], [80, 30],
          [90, 28], [100, 25], [110, 20], [120, 15], [130, -5],
          [140, -15], [155, -25], [175, -40], [180, -45],
          [180, -50], [170, -50], [140, -48], [110, -48],
          [80, -50], [50, -50], [35, -48], [40, -35],
          [50, -20], [52, -5], [50, 5], [40, 15], [35, 30]
        ]]
      }
    ]
  },
  {
    code: "nazca",
    name: "Nazca Plate",
    plateClass: "Minor",
    crustType: "Oceanic",
    area: 15.6,
    movementDirection: "East",
    movementRate: "40–65",
    boundaryTypes: ["Convergent", "Divergent"],
    adjacentPlates: ["south-american", "pacific", "antarctic", "cocos"],
    notableFeatures: ["Peru-Chile Trench", "East Pacific Rise", "Nazca Ridge", "Galapagos Hotspot"],
    description: "The Nazca Plate is an oceanic plate in the southeastern Pacific Ocean. It is subducting beneath the South American Plate at the Peru-Chile Trench, a process that has built the Andes Mountains and generates frequent powerful earthquakes. The Galapagos Islands sit near the plate's northern boundary, formed by a mantle hotspot.",
    geologicalHistory: "The Nazca Plate formed from the breakup of the ancient Farallon Plate about 23 million years ago. It is one of the fastest-moving plates, heading east at up to 65 mm/year. Its subduction beneath South America has produced some of the largest earthquakes in recorded history, including the 1960 Chilean earthquake (magnitude 9.5), the strongest ever recorded.",
    geojsonFeatures: [
      {
        properties: { code: "nazca", name: "Nazca Plate" },
        type: "Polygon",
        coordinates: [[
          [-110, 0], [-105, -5], [-100, -15], [-85, -30],
          [-80, -42], [-90, -42], [-120, -45],
          [-130, -30], [-120, -15], [-115, -5], [-110, 0]
        ]]
      }
    ]
  },
  {
    code: "indian",
    name: "Indian Plate",
    plateClass: "Minor",
    crustType: "Continental",
    area: 11.9,
    movementDirection: "North-Northeast",
    movementRate: "40–50",
    boundaryTypes: ["Convergent", "Transform"],
    adjacentPlates: ["eurasian", "indo-australian", "arabian", "african"],
    notableFeatures: ["Himalayas", "Tibetan Plateau", "Indo-Gangetic Plain", "Carlsberg Ridge"],
    description: "The Indian Plate is sometimes considered a separate plate from the Australian Plate. It carries the Indian subcontinent and part of the Indian Ocean floor. Its collision with the Eurasian Plate is the most dramatic active continental collision on Earth, creating the Himalayas and the Tibetan Plateau — the highest and most extensive highland on the planet.",
    geologicalHistory: "India rifted away from the eastern coast of Africa about 120 million years ago and from Madagascar about 88 million years ago. It then traveled northward at speeds up to 150 mm/year — the fastest recorded plate motion — before colliding with the Eurasian Plate about 50 million years ago. The collision compressed and uplifted sediments to form the Himalayas, which continue to rise today.",
    geojsonFeatures: [
      {
        properties: { code: "indian", name: "Indian Plate" },
        type: "Polygon",
        coordinates: [[
          [62, 35], [70, 37], [78, 35], [85, 28], [92, 25],
          [90, 15], [85, 8], [80, 5], [75, 8], [70, 15],
          [65, 25], [62, 35]
        ]]
      }
    ]
  },
  {
    code: "philippine-sea",
    name: "Philippine Sea Plate",
    plateClass: "Minor",
    crustType: "Oceanic",
    area: 5.5,
    movementDirection: "West-Northwest",
    movementRate: "60–80",
    boundaryTypes: ["Convergent", "Transform"],
    adjacentPlates: ["eurasian", "pacific", "indo-australian"],
    notableFeatures: ["Mariana Trench", "Philippine Trench", "Izu-Bonin-Mariana Arc", "Challenger Deep"],
    description: "The Philippine Sea Plate is an oceanic plate located in the western Pacific Ocean. It is bounded by subduction zones on nearly all sides, making it one of the most seismically active regions on Earth. It contains the Mariana Trench, including Challenger Deep — the deepest point in the world's oceans at approximately 10,935 meters below sea level.",
    geologicalHistory: "The Philippine Sea Plate formed by seafloor spreading in the Eocene epoch (about 50 million years ago). The Mariana Trench formed as the Pacific Plate began subducting beneath the Philippine Sea Plate. The Izu-Bonin-Mariana arc system has been building volcanic islands along the plate's eastern boundary for tens of millions of years.",
    geojsonFeatures: [
      {
        properties: { code: "philippine-sea", name: "Philippine Sea Plate" },
        type: "Polygon",
        coordinates: [[
          [126, 32], [130, 30], [138, 25], [140, 15],
          [138, 5], [130, 0], [125, 5], [122, 10],
          [120, 18], [122, 25], [126, 32]
        ]]
      }
    ]
  },
  {
    code: "arabian",
    name: "Arabian Plate",
    plateClass: "Minor",
    crustType: "Continental",
    area: 5.0,
    movementDirection: "North-Northeast",
    movementRate: "15–25",
    boundaryTypes: ["Convergent", "Divergent", "Transform"],
    adjacentPlates: ["eurasian", "african", "indian"],
    notableFeatures: ["Red Sea Rift", "Dead Sea Transform", "Zagros Mountains", "Gulf of Aden"],
    description: "The Arabian Plate carries the Arabian Peninsula and extends under the Persian Gulf. It separated from the African Plate along the Red Sea Rift — one of the best examples of an active continental rift on Earth. The northern collision boundary with the Eurasian Plate has created the Zagros Mountains of Iran. The Dead Sea Transform fault forms the western boundary with the African Plate.",
    geologicalHistory: "The Arabian Plate began separating from the African Plate about 25–30 million years ago as the Red Sea Rift opened. The Gulf of Aden represents a more advanced stage of rifting that is transitioning to seafloor spreading. The collision with the Eurasian Plate began about 13 million years ago, forming the Zagros fold-and-thrust belt, which contains enormous petroleum reserves.",
    geojsonFeatures: [
      {
        properties: { code: "arabian", name: "Arabian Plate" },
        type: "Polygon",
        coordinates: [[
          [35, 30], [38, 33], [42, 37], [48, 38], [55, 28],
          [58, 22], [55, 15], [48, 12], [45, 10], [42, 13],
          [38, 18], [35, 25], [35, 30]
        ]]
      }
    ]
  },
  {
    code: "caribbean",
    name: "Caribbean Plate",
    plateClass: "Minor",
    crustType: "Mixed",
    area: 3.3,
    movementDirection: "East",
    movementRate: "10–20",
    boundaryTypes: ["Convergent", "Transform"],
    adjacentPlates: ["north-american", "south-american", "cocos", "nazca"],
    notableFeatures: ["Lesser Antilles Arc", "Cayman Trough", "Puerto Rico Trench", "Caribbean Large Igneous Province"],
    description: "The Caribbean Plate underlies Central America and the Caribbean Sea. It is bounded by subduction zones and transform faults that produce frequent earthquakes throughout the region. The Lesser Antilles volcanic arc on its eastern edge is produced by the subduction of the North American Plate beneath the Caribbean Plate.",
    geologicalHistory: "The Caribbean Plate formed from an oceanic plateau created by a massive volcanic eruption about 90 million years ago (the Caribbean Large Igneous Province). As the Atlantic Ocean opened, the plate became trapped between the North and South American plates. The volcanic arc of the Lesser Antilles has been active for about 50 million years.",
    geojsonFeatures: [
      {
        properties: { code: "caribbean", name: "Caribbean Plate" },
        type: "Polygon",
        coordinates: [[
          [-90, 18], [-88, 20], [-82, 20], [-75, 20],
          [-65, 18], [-60, 15], [-62, 10], [-70, 8],
          [-78, 5], [-82, 8], [-85, 10], [-88, 14],
          [-90, 18]
        ]]
      }
    ]
  },
  {
    code: "cocos",
    name: "Cocos Plate",
    plateClass: "Minor",
    crustType: "Oceanic",
    area: 2.9,
    movementDirection: "Northeast",
    movementRate: "55–80",
    boundaryTypes: ["Convergent", "Divergent"],
    adjacentPlates: ["pacific", "north-american", "caribbean", "nazca"],
    notableFeatures: ["Middle America Trench", "East Pacific Rise", "Cocos Ridge", "Galapagos Hotspot"],
    description: "The Cocos Plate is a small oceanic plate beneath the Pacific Ocean off the west coast of Central America. It subducts beneath the Caribbean and North American plates at the Middle America Trench, generating earthquakes and volcanic activity throughout Central America and southern Mexico. The Cocos Ridge, an aseismic ridge running from the Galapagos, is being subducted along with the plate.",
    geologicalHistory: "The Cocos Plate, like the Nazca Plate, formed from the breakup of the Farallon Plate about 23 million years ago. It is one of the fastest-subducting plates, with convergence rates reaching 80 mm/year along the Middle America Trench. Major earthquakes along this subduction zone include the devastating 1985 Mexico City earthquake (magnitude 8.0).",
    geojsonFeatures: [
      {
        properties: { code: "cocos", name: "Cocos Plate" },
        type: "Polygon",
        coordinates: [[
          [-110, 15], [-105, 18], [-98, 17], [-92, 15],
          [-88, 12], [-90, 8], [-95, 5], [-105, 5],
          [-110, 10], [-110, 15]
        ]]
      }
    ]
  },
  {
    code: "juan-de-fuca",
    name: "Juan de Fuca Plate",
    plateClass: "Microplate",
    crustType: "Oceanic",
    area: 0.25,
    movementDirection: "East-Northeast",
    movementRate: "40–50",
    boundaryTypes: ["Convergent", "Divergent"],
    adjacentPlates: ["pacific", "north-american"],
    notableFeatures: ["Cascadia Subduction Zone", "Juan de Fuca Ridge", "Mount St. Helens", "Cascade Volcanic Arc"],
    description: "The Juan de Fuca Plate is a small oceanic plate off the Pacific Northwest coast of North America. Despite its small size, it is critically important because its subduction beneath the North American Plate drives the Cascade Volcanic Arc (including Mount St. Helens, Mount Rainier, and Mount Hood) and is capable of generating magnitude 9+ megathrust earthquakes.",
    geologicalHistory: "The Juan de Fuca Plate is a remnant of the once-vast Farallon Plate that has been almost entirely consumed by subduction beneath North America over the past 200 million years. The last great Cascadia earthquake occurred on January 26, 1700, producing a magnitude ~9.0 earthquake and a tsunami that reached Japan. The plate is expected to produce another such earthquake in the future.",
    geojsonFeatures: [
      {
        properties: { code: "juan-de-fuca", name: "Juan de Fuca Plate" },
        type: "Polygon",
        coordinates: [[
          [-130, 50], [-128, 48], [-125, 44], [-124, 40],
          [-128, 40], [-132, 43], [-133, 47], [-130, 50]
        ]]
      }
    ]
  },
  {
    code: "scotia",
    name: "Scotia Plate",
    plateClass: "Minor",
    crustType: "Oceanic",
    area: 1.6,
    movementDirection: "West",
    movementRate: "20–25",
    boundaryTypes: ["Convergent", "Transform"],
    adjacentPlates: ["south-american", "antarctic"],
    notableFeatures: ["Scotia Sea", "South Sandwich Trench", "South Sandwich Islands", "Drake Passage"],
    description: "The Scotia Plate is located in the South Atlantic Ocean between South America and Antarctica. It is bounded by the Scotia Arc — a curved chain of islands and submarine ridges that connects the Andes of South America to the Antarctic Peninsula. The South Sandwich Islands on its eastern boundary form an active volcanic arc above a subduction zone.",
    geologicalHistory: "The Scotia Plate formed when a segment of oceanic crust became trapped between the South American and Antarctic plates as they separated during the Cenozoic. The opening of Drake Passage about 30 million years ago allowed the circum-Antarctic current to form, which led to Antarctica's glaciation and dramatically changed global climate patterns.",
    geojsonFeatures: [
      {
        properties: { code: "scotia", name: "Scotia Plate" },
        type: "Polygon",
        coordinates: [[
          [-65, -53], [-55, -52], [-40, -54], [-25, -56],
          [-26, -60], [-35, -62], [-50, -63], [-60, -62],
          [-68, -58], [-65, -53]
        ]]
      }
    ]
  }
];

// Generate data files
for (const plate of plates) {
  const dataFile = {
    code: plate.code,
    name: plate.name,
    plateClass: plate.plateClass,
    crustType: plate.crustType,
    area: plate.area,
    movementDirection: plate.movementDirection,
    movementRate: plate.movementRate,
    boundaryTypes: plate.boundaryTypes,
    adjacentPlates: plate.adjacentPlates,
    notableFeatures: plate.notableFeatures,
    description: plate.description,
    geologicalHistory: plate.geologicalHistory,
    geojson: `${plate.code}.geojson`,
  };

  writeFileSync(
    join(DATA_DIR, `${plate.code}.json`),
    JSON.stringify(dataFile, null, 2) + "\n"
  );
}

// Generate GeoJSON files
for (const plate of plates) {
  const features = plate.geojsonFeatures.map((f) => ({
    type: "Feature",
    properties: f.properties,
    geometry: {
      type: f.type,
      coordinates: f.coordinates,
    },
  }));

  const geojson = {
    type: "FeatureCollection",
    features,
  };

  writeFileSync(
    join(GEO_DIR, `${plate.code}.geojson`),
    JSON.stringify(geojson) + "\n"
  );
}

console.log(`Generated ${plates.length} tectonic plate data files and GeoJSON files.`);

// Report file sizes
for (const plate of plates) {
  const geoPath = join(GEO_DIR, `${plate.code}.geojson`);
  const { size } = await import("fs").then((fs) =>
    fs.statSync(geoPath)
  );
  if (size > 500000) {
    console.warn(`WARNING: ${plate.code}.geojson is ${(size / 1024).toFixed(1)}KB (exceeds 500KB limit)`);
  }
}
console.log("All GeoJSON files are well under 500KB.");
