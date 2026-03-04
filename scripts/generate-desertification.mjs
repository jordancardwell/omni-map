import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

const PLUGIN_DIR = join(import.meta.dirname, "..", "plugins", "desertification");
const DATA_DIR = join(PLUGIN_DIR, "data");
const GEO_DIR = join(PLUGIN_DIR, "geo");

mkdirSync(DATA_DIR, { recursive: true });
mkdirSync(GEO_DIR, { recursive: true });

// Zones based on UNCCD/CGIAR aridity index data and UN World Atlas of Desertification
const zones = [
  // ===== HYPER-ARID ZONES (AI < 0.05) =====
  {
    code: "sahara-desert",
    name: "Sahara Desert",
    region: "North Africa",
    aridityGroup: "1. Hyper-Arid",
    aridityClassification: "Hyper-Arid",
    aridityIndex: "< 0.05 — virtually no rainfall",
    area: "9,200,000 km²",
    degradationTrend: "Severe — Expanding",
    populationAffected: 2500000,
    affectedCountries: ["Algeria", "Chad", "Egypt", "Libya", "Mali", "Mauritania", "Morocco", "Niger", "Sudan", "Tunisia"],
    desertificationDrivers: ["Climate change", "Wind erosion", "Overgrazing at margins", "Aquifer depletion"],
    desertFrontier: "Southern margin expanding ~48 km/decade into the Sahel",
    description: "The Sahara is the world's largest hot desert, spanning 9.2 million km². Its southern boundary, the Sahel transition zone, has shifted southward significantly since the 1970s. The desert's expansion is driven by declining rainfall, rising temperatures, and degradation of marginal lands. The Sahara has expanded by roughly 10% since 1920.",
    coords: [[[-17,35],[-17,30],[-17,25],[-15,20],[-12,17],[-8,16],[-4,16],[0,16],[4,16],[8,14],[12,14],[16,14],[20,16],[24,18],[25,22],[30,22],[33,22],[35,28],[33,31],[30,33],[25,35],[20,35],[15,35],[10,35],[5,36],[0,36],[-5,36],[-10,36],[-13,35],[-17,35]]]
  },
  {
    code: "arabian-desert",
    name: "Arabian Desert",
    region: "Middle East",
    aridityGroup: "1. Hyper-Arid",
    aridityClassification: "Hyper-Arid",
    aridityIndex: "< 0.05 — extreme aridity",
    area: "2,330,000 km²",
    degradationTrend: "Severe — Expanding",
    populationAffected: 5000000,
    affectedCountries: ["Saudi Arabia", "Yemen", "Oman", "UAE", "Qatar", "Kuwait", "Iraq", "Jordan"],
    desertificationDrivers: ["Extreme heat", "Aquifer depletion", "Overgrazing", "Urbanization pressure"],
    desertFrontier: "Expanding into northern Arabian steppe zones",
    description: "The Arabian Desert encompasses the Rub' al Khali (Empty Quarter), the largest contiguous sand desert on Earth, and the An Nafud desert. Temperatures exceed 50°C in summer. Ancient aquifers are being depleted at unsustainable rates for agriculture and urban use, with Saudi Arabia having exhausted most of its fossil water reserves.",
    coords: [[[35,32],[38,30],[42,28],[45,26],[48,25],[51,24],[54,22],[56,20],[55,17],[52,15],[48,13],[44,13],[42,15],[40,18],[38,22],[36,26],[35,32]]]
  },
  {
    code: "atacama-desert",
    name: "Atacama Desert",
    region: "South America",
    aridityGroup: "1. Hyper-Arid",
    aridityClassification: "Hyper-Arid",
    aridityIndex: "< 0.03 — driest non-polar desert",
    area: "105,000 km²",
    degradationTrend: "Stable",
    populationAffected: 1000000,
    affectedCountries: ["Chile", "Peru"],
    desertificationDrivers: ["Rain shadow effect", "Cold ocean currents", "Mining water extraction"],
    desertFrontier: "Relatively stable boundaries due to Andes rain shadow",
    description: "The Atacama is the driest non-polar desert on Earth. Some weather stations have never recorded rainfall. The extreme aridity is caused by the rain shadow of the Andes and the cold Humboldt Current. Despite the harsh conditions, lithium and copper mining operations extract significant groundwater resources.",
    coords: [[[-71,-18],[-70,-20],[-70,-22],[-70,-24],[-70,-26],[-71,-28],[-72,-27],[-72,-25],[-72,-23],[-71,-21],[-71,-18]]]
  },
  {
    code: "lut-desert",
    name: "Lut Desert (Dasht-e Lut)",
    region: "Central Asia",
    aridityGroup: "1. Hyper-Arid",
    aridityClassification: "Hyper-Arid",
    aridityIndex: "< 0.05 — extreme thermal desert",
    area: "51,800 km²",
    degradationTrend: "Worsening",
    populationAffected: 500000,
    affectedCountries: ["Iran"],
    desertificationDrivers: ["Extreme heat", "Wind erosion", "Qanat system decline", "Water diversion"],
    desertFrontier: "Margins expanding into surrounding semi-arid basins",
    description: "The Lut Desert holds the record for the highest land surface temperature ever recorded by satellite: 70.7°C (159.3°F). The Gandom Beryan plateau is one of the most thermally extreme places on Earth. Traditional qanat water systems that sustained surrounding communities for millennia are declining.",
    coords: [[[56,32],[58,32],[60,31],[60,29],[59,27],[57,27],[56,28],[55,30],[56,32]]]
  },
  {
    code: "namib-desert",
    name: "Namib Desert",
    region: "Southern Africa",
    aridityGroup: "1. Hyper-Arid",
    aridityClassification: "Hyper-Arid",
    aridityIndex: "< 0.05 — coastal fog desert",
    area: "81,000 km²",
    degradationTrend: "Stable",
    populationAffected: 100000,
    affectedCountries: ["Namibia", "Angola"],
    desertificationDrivers: ["Cold Benguela Current", "Limited precipitation", "Uranium mining"],
    desertFrontier: "Stable coastal boundaries; interior margin shifting slightly east",
    description: "The Namib is one of the oldest deserts in the world, having been arid for at least 55 million years. Despite hyper-arid conditions, unique fog-basking beetles and welwitschia plants survive on coastal fog from the cold Benguela Current. The Sossusvlei dunes reach over 300m in height.",
    coords: [[[12,-17],[12,-19],[12,-21],[13,-23],[14,-25],[15,-27],[16,-28],[17,-27],[16,-25],[15,-23],[14,-21],[13,-19],[12,-17]]]
  },

  // ===== ARID ZONES (AI 0.05–0.20) =====
  {
    code: "sahel-zone",
    name: "Sahel Transition Zone",
    region: "West & Central Africa",
    aridityGroup: "2. Arid",
    aridityClassification: "Arid",
    aridityIndex: "0.05–0.20 — transition zone under pressure",
    area: "3,053,200 km²",
    degradationTrend: "Severe — Expanding",
    populationAffected: 135000000,
    affectedCountries: ["Senegal", "Mauritania", "Mali", "Burkina Faso", "Niger", "Nigeria", "Chad", "Sudan", "Eritrea"],
    desertificationDrivers: ["Sahara expansion", "Overgrazing", "Deforestation", "Population growth", "Erratic rainfall"],
    desertFrontier: "Sahara frontier moving south at ~48 km/decade; Great Green Wall project underway",
    description: "The Sahel is the critical transition zone between the Sahara and the humid savannas to the south. It faces the most acute desertification crisis globally, with 80% of farmland degraded. The African Union's Great Green Wall initiative aims to restore 100 million hectares across the 8,000 km band from Senegal to Djibouti. Over 135 million people depend on this fragile ecosystem.",
    coords: [[[-17,17],[-12,14],[-8,13],[-4,12],[0,12],[4,12],[8,11],[12,11],[16,11],[20,12],[24,14],[28,14],[32,15],[36,15],[40,14],[42,12],[42,14],[38,17],[34,18],[30,19],[26,18],[22,18],[18,17],[14,17],[10,17],[6,18],[2,18],[-2,18],[-6,18],[-10,18],[-14,18],[-17,17]]]
  },
  {
    code: "gobi-desert",
    name: "Gobi Desert",
    region: "East Asia",
    aridityGroup: "2. Arid",
    aridityClassification: "Arid",
    aridityIndex: "0.05–0.20 — cold continental desert",
    area: "1,295,000 km²",
    degradationTrend: "Severe — Expanding",
    populationAffected: 3000000,
    affectedCountries: ["Mongolia", "China"],
    desertificationDrivers: ["Overgrazing", "Climate change", "Wind erosion", "Mining", "Loss of grassland cover"],
    desertFrontier: "Expanding southward into Chinese grasslands at ~3,600 km²/year",
    description: "The Gobi is Asia's largest desert and one of the fastest-expanding. It grows by approximately 3,600 km² annually, driven by overgrazing from nomadic herders and climate change. Dust storms from the Gobi affect Beijing, Seoul, and even reach North America. China's 'Three-North Shelter Forest Program' (Great Green Wall of China) attempts to halt the advance.",
    coords: [[[88,46],[92,47],[96,48],[100,48],[105,47],[110,45],[114,44],[116,43],[118,42],[116,40],[112,39],[108,38],[104,38],[100,39],[96,40],[92,42],[88,44],[88,46]]]
  },
  {
    code: "karakum-desert",
    name: "Karakum Desert",
    region: "Central Asia",
    aridityGroup: "2. Arid",
    aridityClassification: "Arid",
    aridityIndex: "0.05–0.15 — arid continental desert",
    area: "350,000 km²",
    degradationTrend: "Worsening",
    populationAffected: 5000000,
    affectedCountries: ["Turkmenistan", "Uzbekistan"],
    desertificationDrivers: ["Aral Sea desiccation", "Irrigation diversion", "Salinization", "Overgrazing"],
    desertFrontier: "Expanding toward former Aral Sea basin; new Aralkum Desert forming",
    description: "The Karakum covers ~70% of Turkmenistan. The catastrophic shrinkage of the Aral Sea — caused by Soviet-era irrigation diversions from the Amu Darya and Syr Darya rivers — has created the new 'Aralkum' desert on the former seabed, spreading toxic salt and dust across the region. Salinization affects millions of hectares of irrigated farmland.",
    coords: [[[53,42],[56,42],[59,42],[62,41],[64,40],[65,38],[64,36],[62,36],[60,37],[58,38],[56,38],[54,39],[53,40],[53,42]]]
  },
  {
    code: "thar-desert",
    name: "Thar Desert (Great Indian Desert)",
    region: "South Asia",
    aridityGroup: "2. Arid",
    aridityClassification: "Arid",
    aridityIndex: "0.05–0.20 — subtropical desert",
    area: "200,000 km²",
    degradationTrend: "Worsening",
    populationAffected: 28000000,
    affectedCountries: ["India", "Pakistan"],
    desertificationDrivers: ["Overgrazing", "Deforestation", "Groundwater depletion", "Wind erosion", "Population pressure"],
    desertFrontier: "Eastern margin advancing into Rajasthan and Gujarat farmlands",
    description: "The Thar is the world's most densely populated desert, home to 28 million people. It is expanding eastward into agricultural Rajasthan. The Indira Gandhi Canal has brought irrigation to parts of the western Thar but has also raised water tables, causing waterlogging and salinization in some areas. Groundwater depletion from tube wells threatens long-term sustainability.",
    coords: [[[68,28],[70,28],[72,27],[72,25],[71,23],[70,24],[68,25],[67,26],[68,28]]]
  },
  {
    code: "patagonian-steppe",
    name: "Patagonian Steppe",
    region: "South America",
    aridityGroup: "2. Arid",
    aridityClassification: "Arid",
    aridityIndex: "0.10–0.20 — cold arid steppe",
    area: "673,000 km²",
    degradationTrend: "Worsening",
    populationAffected: 2000000,
    affectedCountries: ["Argentina"],
    desertificationDrivers: ["Sheep overgrazing", "Wind erosion", "Climate change", "Oil extraction"],
    desertFrontier: "Desertification advancing from west and central zones",
    description: "Patagonia experiences severe wind erosion and desertification driven by over a century of intensive sheep ranching. An estimated 30% of the region is severely desertified. The strong westerly winds strip away topsoil once vegetative cover is lost. Climate models predict further drying and warming of the region through the 21st century.",
    coords: [[[-72,-40],[-70,-40],[-68,-42],[-66,-44],[-66,-46],[-68,-48],[-70,-50],[-72,-52],[-74,-50],[-74,-48],[-73,-46],[-72,-44],[-72,-40]]]
  },
  {
    code: "australian-arid-zone",
    name: "Australian Arid Zone",
    region: "Oceania",
    aridityGroup: "2. Arid",
    aridityClassification: "Arid",
    aridityIndex: "0.05–0.20 — vast interior aridity",
    area: "3,400,000 km²",
    degradationTrend: "Worsening",
    populationAffected: 600000,
    affectedCountries: ["Australia"],
    desertificationDrivers: ["Drought intensification", "Overgrazing", "Invasive species", "Fire regime changes"],
    desertFrontier: "Arid zone expanding into semi-arid margins during prolonged droughts",
    description: "Australia's arid zone covers ~44% of the continent, including the Gibson, Great Sandy, Great Victoria, Simpson, and Tanami deserts. The region experiences extreme drought variability linked to El Niño cycles. Invasive species like feral camels, rabbits, and buffel grass have dramatically altered ecosystems. Aboriginal Australians managed these landscapes with fire for over 60,000 years.",
    coords: [[[118,-20],[122,-18],[126,-18],[130,-18],[134,-20],[138,-22],[140,-26],[140,-30],[138,-32],[136,-34],[134,-32],[130,-30],[126,-28],[122,-26],[120,-24],[118,-22],[118,-20]]]
  },
  {
    code: "sonoran-desert",
    name: "Sonoran Desert",
    region: "North America",
    aridityGroup: "2. Arid",
    aridityClassification: "Arid",
    aridityIndex: "0.05–0.20 — subtropical hot desert",
    area: "260,000 km²",
    degradationTrend: "Worsening",
    populationAffected: 3000000,
    affectedCountries: ["United States", "Mexico"],
    desertificationDrivers: ["Groundwater depletion", "Urban expansion", "Colorado River diversion", "Heat intensification"],
    desertFrontier: "Margins shifting northward with climate warming",
    description: "The Sonoran Desert spans the US-Mexico border across Arizona, California, and Sonora/Baja California. It is the hottest desert in North America, with temperatures exceeding 50°C. The Colorado River, once the lifeline of the region, no longer reaches the sea due to upstream diversions. Phoenix and Tucson face severe long-term water sustainability challenges.",
    coords: [[[-115,34],[-113,34],[-111,33],[-110,32],[-110,30],[-112,28],[-114,28],[-116,30],[-116,32],[-115,34]]]
  },

  // ===== SEMI-ARID ZONES (AI 0.20–0.50) =====
  {
    code: "horn-of-africa",
    name: "Horn of Africa Drylands",
    region: "East Africa",
    aridityGroup: "3. Semi-Arid",
    aridityClassification: "Semi-Arid",
    aridityIndex: "0.20–0.50 — seasonal rainfall zone",
    area: "1,882,000 km²",
    degradationTrend: "Severe — Expanding",
    populationAffected: 70000000,
    affectedCountries: ["Ethiopia", "Somalia", "Kenya", "Djibouti"],
    desertificationDrivers: ["Recurrent drought", "Overgrazing", "Deforestation", "Conflict displacement", "Population growth"],
    desertFrontier: "Arid zone expanding southward; 5 consecutive failed rainy seasons (2020–2023)",
    description: "The Horn of Africa drylands face recurring devastating droughts with increasing frequency. Between 2020 and 2023, the region experienced five consecutive failed rainy seasons — unprecedented in 40 years of records. Over 20 million people faced acute food insecurity. Pastoral communities are losing rangelands to desertification, forcing migration to urban areas.",
    coords: [[[36,12],[38,12],[40,10],[42,10],[44,8],[46,6],[48,4],[50,2],[48,0],[46,-2],[44,-2],[42,0],[40,2],[38,4],[36,6],[36,8],[36,12]]]
  },
  {
    code: "central-asian-steppe",
    name: "Central Asian Steppe",
    region: "Central Asia",
    aridityGroup: "3. Semi-Arid",
    aridityClassification: "Semi-Arid",
    aridityIndex: "0.20–0.50 — continental semi-arid grassland",
    area: "2,500,000 km²",
    degradationTrend: "Worsening",
    populationAffected: 25000000,
    affectedCountries: ["Kazakhstan", "Uzbekistan", "Kyrgyzstan", "Tajikistan"],
    desertificationDrivers: ["Soviet-era irrigation damage", "Salinization", "Overgrazing", "Wind erosion", "Climate warming"],
    desertFrontier: "Desert margins advancing northward into Kazakhstan steppe",
    description: "The Central Asian steppe, once the world's largest continuous grassland, faces widespread degradation from Soviet-era agricultural policies. The Virgin Lands Campaign plowed millions of hectares of grassland, leading to massive dust storms. The Aral Sea disaster continues to spread salt and toxic chemicals across the region. An estimated 60% of pastureland is degraded.",
    coords: [[[50,50],[55,50],[60,48],[65,46],[70,44],[75,42],[78,40],[75,38],[70,38],[65,39],[60,40],[55,42],[52,44],[50,46],[50,50]]]
  },
  {
    code: "mediterranean-basin",
    name: "Mediterranean Dryland Basin",
    region: "Southern Europe & North Africa",
    aridityGroup: "3. Semi-Arid",
    aridityClassification: "Semi-Arid",
    aridityIndex: "0.20–0.50 — semi-arid Mediterranean climate",
    area: "1,500,000 km²",
    degradationTrend: "Worsening",
    populationAffected: 45000000,
    affectedCountries: ["Spain", "Italy", "Greece", "Turkey", "Tunisia", "Morocco", "Algeria"],
    desertificationDrivers: ["Climate change", "Wildfire intensification", "Soil erosion", "Water overextraction", "Tourism pressure"],
    desertFrontier: "Arid zone expanding northward into southern Spain, Sicily, and southern Greece",
    description: "The Mediterranean basin is one of the most climate-vulnerable regions in Europe. Southern Spain (Almería, Murcia) is experiencing active desertification, with some areas receiving less than 200mm annual rainfall. Greece and southern Italy face similar pressures. The 2023 IPCC report projects that the Mediterranean will warm 20% faster than the global average, with rainfall declining 4–22% by 2100.",
    coords: [[[-6,38],[-2,38],[2,38],[6,40],[10,40],[14,38],[18,38],[22,38],[26,38],[30,36],[34,36],[36,34],[34,32],[30,32],[26,34],[22,36],[18,36],[14,36],[10,37],[6,37],[2,36],[-2,36],[-6,36],[-6,38]]]
  },
  {
    code: "great-plains-drylands",
    name: "Great Plains Drylands",
    region: "North America",
    aridityGroup: "3. Semi-Arid",
    aridityClassification: "Semi-Arid",
    aridityIndex: "0.20–0.50 — semi-arid continental grassland",
    area: "1,300,000 km²",
    degradationTrend: "Worsening",
    populationAffected: 10000000,
    affectedCountries: ["United States"],
    desertificationDrivers: ["Ogallala Aquifer depletion", "Intensive agriculture", "Drought cycles", "Wind erosion"],
    desertFrontier: "High Plains transitioning from semi-arid to arid conditions in western Kansas and Texas Panhandle",
    description: "The western Great Plains sit atop the Ogallala Aquifer, one of the world's largest underground freshwater reserves. Decades of center-pivot irrigation have depleted the aquifer by over 30% in some areas — it would take 6,000 years to naturally refill. Parts of western Kansas and the Texas Panhandle are returning to dryland farming as wells run dry. The Dust Bowl of the 1930s demonstrated the catastrophic consequences of land degradation in this region.",
    coords: [[[-105,48],[-102,48],[-100,46],[-98,44],[-98,40],[-100,36],[-102,34],[-104,32],[-106,34],[-106,38],[-106,42],[-106,46],[-105,48]]]
  },
  {
    code: "northeast-brazil",
    name: "Northeast Brazil (Sertão)",
    region: "South America",
    aridityGroup: "3. Semi-Arid",
    aridityClassification: "Semi-Arid",
    aridityIndex: "0.20–0.50 — tropical semi-arid",
    area: "982,000 km²",
    degradationTrend: "Worsening",
    populationAffected: 27000000,
    affectedCountries: ["Brazil"],
    desertificationDrivers: ["Deforestation of Caatinga", "Overgrazing", "Soil salinization", "Irregular rainfall", "Poverty"],
    desertFrontier: "Desertification nuclei expanding in Gilbués, Irauçuba, Seridó, and Cabrobó regions",
    description: "The Brazilian Sertão is the most densely populated semi-arid region in the world. Four 'desertification nuclei' have been identified by the Brazilian government where land degradation is most severe. The unique Caatinga biome — found nowhere else on Earth — has lost over 50% of its original cover. Recurrent droughts drive mass migration to coastal cities.",
    coords: [[[-42,-3],[-40,-3],[-38,-4],[-36,-6],[-35,-8],[-36,-10],[-37,-12],[-38,-14],[-40,-14],[-42,-12],[-43,-10],[-43,-8],[-43,-6],[-42,-3]]]
  },
  {
    code: "southern-africa-drylands",
    name: "Southern Africa Drylands",
    region: "Southern Africa",
    aridityGroup: "3. Semi-Arid",
    aridityClassification: "Semi-Arid",
    aridityIndex: "0.20–0.50 — subtropical semi-arid",
    area: "1,200,000 km²",
    degradationTrend: "Worsening",
    populationAffected: 35000000,
    affectedCountries: ["South Africa", "Botswana", "Zimbabwe", "Mozambique"],
    desertificationDrivers: ["Drought intensification", "Overgrazing", "Bush encroachment", "Land inequality"],
    desertFrontier: "Kalahari margins expanding; Karoo region increasingly arid",
    description: "Southern Africa's drylands face accelerating desertification driven by extreme drought events and land management challenges. The Karoo region in South Africa is expanding northward. Bush encroachment — where woody plants invade grasslands — affects over 30 million hectares. Climate projections show the region warming at twice the global average, with western areas becoming significantly drier.",
    coords: [[[18,-20],[22,-20],[26,-20],[28,-22],[30,-24],[30,-28],[28,-30],[26,-32],[24,-32],[22,-30],[20,-28],[18,-26],[17,-24],[18,-22],[18,-20]]]
  },
  {
    code: "middle-east-fertile-crescent",
    name: "Fertile Crescent Degradation Zone",
    region: "Middle East",
    aridityGroup: "3. Semi-Arid",
    aridityClassification: "Semi-Arid",
    aridityIndex: "0.20–0.50 — degraded semi-arid zone",
    area: "500,000 km²",
    degradationTrend: "Severe — Expanding",
    populationAffected: 40000000,
    affectedCountries: ["Iraq", "Syria", "Turkey", "Iran"],
    desertificationDrivers: ["Conflict", "Dam construction", "Irrigation mismanagement", "Soil salinization", "Drought"],
    desertFrontier: "Tigris-Euphrates marshlands collapsing; Iraqi breadbasket turning to dust",
    description: "The Fertile Crescent, birthplace of agriculture 10,000 years ago, is experiencing devastating desertification. Iraq has lost 40% of its agricultural land. The 2007–2010 drought was the worst in 900 years, displacing 1.5 million Iraqi farmers. Turkey's GAP dam project has reduced Euphrates flow to Iraq and Syria. Salinization affects 70% of irrigated land in central and southern Iraq.",
    coords: [[[36,38],[38,38],[40,37],[42,36],[44,36],[46,34],[48,32],[47,30],[44,30],[42,32],[40,34],[38,36],[36,38]]]
  },

  // ===== DRY SUB-HUMID ZONES (AI 0.50–0.65) =====
  {
    code: "south-asian-monsoon-margin",
    name: "South Asian Monsoon Margin",
    region: "South Asia",
    aridityGroup: "4. Dry Sub-Humid",
    aridityClassification: "Dry Sub-Humid",
    aridityIndex: "0.50–0.65 — variable monsoon rainfall",
    area: "800,000 km²",
    degradationTrend: "Worsening",
    populationAffected: 200000000,
    affectedCountries: ["India", "Pakistan", "Afghanistan"],
    desertificationDrivers: ["Groundwater depletion", "Erratic monsoon", "Intensive agriculture", "Soil exhaustion", "Urbanization"],
    desertFrontier: "Thar Desert expanding into Punjab and Haryana; Indo-Gangetic soil degradation",
    description: "The dry sub-humid zone along India's monsoon margin supports some of the most intensive agriculture in the world. Over 70% of India's land area is degrading, according to ISRO. Punjab, once India's breadbasket, faces severe groundwater depletion — water tables dropping 1 meter per year. The monsoon is becoming increasingly erratic, with longer dry spells between intense rainfall events.",
    coords: [[[66,34],[70,34],[74,32],[76,30],[78,28],[80,26],[78,24],[76,22],[74,22],[72,24],[70,26],[68,28],[66,30],[66,34]]]
  },
  {
    code: "west-african-savanna",
    name: "West African Savanna Belt",
    region: "West Africa",
    aridityGroup: "4. Dry Sub-Humid",
    aridityClassification: "Dry Sub-Humid",
    aridityIndex: "0.50–0.65 — dry savanna with seasonal rains",
    area: "1,600,000 km²",
    degradationTrend: "Worsening",
    populationAffected: 150000000,
    affectedCountries: ["Nigeria", "Ghana", "Burkina Faso", "Senegal", "Guinea", "Cameroon", "Benin", "Togo"],
    desertificationDrivers: ["Deforestation", "Charcoal production", "Slash-and-burn agriculture", "Population growth", "Soil nutrient depletion"],
    desertFrontier: "Sahel aridity pushing southward into the Guinea savanna zone",
    description: "The West African dry savanna supports 150 million people between the Sahel to the north and the humid forests to the south. Rapid population growth (3%/year in some areas) drives land clearing for subsistence agriculture. Charcoal production for cooking fuel strips tree cover. Nigeria alone loses 400,000 hectares of forest and woodland annually. The southern boundary of the degradation zone is moving southward.",
    coords: [[[-17,14],[-14,12],[-10,10],[-6,9],[-2,8],[2,8],[6,8],[10,8],[14,8],[16,10],[14,12],[10,14],[6,14],[2,14],[-2,14],[-6,15],[-10,15],[-14,15],[-17,14]]]
  },
  {
    code: "north-china-plain",
    name: "North China Plain Degradation Zone",
    region: "East Asia",
    aridityGroup: "4. Dry Sub-Humid",
    aridityClassification: "Dry Sub-Humid",
    aridityIndex: "0.50–0.65 — monsoon-continental transition",
    area: "400,000 km²",
    degradationTrend: "Worsening",
    populationAffected: 300000000,
    affectedCountries: ["China"],
    desertificationDrivers: ["Groundwater overdraft", "Intensive agriculture", "Industrial pollution", "Gobi dust storms", "Soil compaction"],
    desertFrontier: "Degradation advancing from Gobi margin toward Beijing; desertification within 70 km of capital",
    description: "The North China Plain, China's agricultural heartland, faces a converging water and land degradation crisis. The water table under Beijing has dropped 300 meters since the 1970s. China's $62 billion South-to-North Water Transfer Project was built to address the crisis. Dust storms from the expanding Gobi regularly blanket Beijing and northern cities. Over 27% of China's total land area is classified as desertified.",
    coords: [[[110,40],[114,40],[118,39],[120,38],[118,36],[116,34],[114,33],[112,34],[110,36],[110,40]]]
  },
  {
    code: "east-african-highlands-margin",
    name: "East African Highlands Margin",
    region: "East Africa",
    aridityGroup: "4. Dry Sub-Humid",
    aridityClassification: "Dry Sub-Humid",
    aridityIndex: "0.50–0.65 — highland-dryland transition",
    area: "600,000 km²",
    degradationTrend: "Worsening",
    populationAffected: 60000000,
    affectedCountries: ["Ethiopia", "Kenya", "Tanzania", "Uganda"],
    desertificationDrivers: ["Deforestation", "Soil erosion", "Overgrazing", "Charcoal production", "Climate variability"],
    desertFrontier: "Lowland arid zones creeping upslope into Ethiopian and Kenyan highlands",
    description: "The transition zone between East Africa's productive highlands and arid lowlands supports some of the continent's densest rural populations. Ethiopia has lost over 95% of its original highland forest. Severe soil erosion removes an estimated 1.5 billion tonnes of topsoil annually. Lake Turkana in Kenya is shrinking as the Omo River is dammed upstream. Climate change is pushing the dry zone upward in elevation.",
    coords: [[[32,4],[34,4],[36,2],[38,0],[38,-2],[37,-4],[36,-6],[35,-8],[34,-6],[33,-4],[32,-2],[32,0],[32,4]]]
  },
  {
    code: "cerrado-degradation",
    name: "Brazilian Cerrado Degradation Front",
    region: "South America",
    aridityGroup: "4. Dry Sub-Humid",
    aridityClassification: "Dry Sub-Humid",
    aridityIndex: "0.50–0.65 — tropical dry savanna",
    area: "2,040,000 km²",
    degradationTrend: "Worsening",
    populationAffected: 25000000,
    affectedCountries: ["Brazil"],
    desertificationDrivers: ["Soybean expansion", "Cattle ranching", "Deforestation", "Fire regime alteration", "Aquifer pressure"],
    desertFrontier: "Agricultural frontier advancing into remaining native Cerrado; 50% already converted",
    description: "The Cerrado, the world's most biodiverse savanna, is being destroyed faster than the Amazon. Over 50% has been converted to soybean fields and cattle ranches. The Cerrado acts as a 'water tower' for Brazil — its deep-rooted vegetation feeds the aquifers that supply major rivers including tributaries of the Amazon, Paraná, and São Francisco. Its destruction threatens Brazil's entire water and agricultural system.",
    coords: [[[-52,-6],[-48,-6],[-46,-8],[-44,-10],[-44,-14],[-46,-16],[-48,-18],[-50,-20],[-52,-18],[-54,-16],[-54,-12],[-54,-10],[-52,-8],[-52,-6]]]
  }
];

// Write data and geo files
for (const zone of zones) {
  const { coords, ...metadata } = zone;
  metadata.geojson = `${zone.code}.geojson`;

  // Write data JSON
  writeFileSync(
    join(DATA_DIR, `${zone.code}.json`),
    JSON.stringify(metadata, null, 2) + "\n"
  );

  // Write GeoJSON
  const geojson = {
    type: "FeatureCollection",
    features: [{
      type: "Feature",
      properties: {
        code: zone.code,
        name: zone.name,
        region: zone.region
      },
      geometry: {
        type: "Polygon",
        coordinates: coords
      }
    }]
  };

  writeFileSync(
    join(GEO_DIR, `${zone.code}.geojson`),
    JSON.stringify(geojson) + "\n"
  );
}

console.log(`Generated ${zones.length} desertification zone data + geo files`);
