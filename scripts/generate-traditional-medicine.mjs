import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

const pluginDir = join(import.meta.dirname, "..", "plugins", "traditional-medicine");
const dataDir = join(pluginDir, "data");
const geoDir = join(pluginDir, "geo");

mkdirSync(dataDir, { recursive: true });
mkdirSync(geoDir, { recursive: true });

// Country bounding boxes (approximate)
const countryBounds = {
  IN: [68.2, 8.1, 97.4, 35.5],
  LK: [79.7, 5.9, 81.9, 9.8],
  NP: [80.1, 26.3, 88.2, 30.4],
  CN: [73.5, 18.2, 134.8, 53.6],
  TW: [120.0, 21.9, 122.0, 25.3],
  SG: [103.6, 1.2, 104.0, 1.5],
  MY: [100.1, 1.0, 119.3, 7.4],
  VN: [102.1, 8.4, 109.5, 23.4],
  JP: [129.4, 31.0, 145.5, 45.6],
  KR: [126.0, 33.1, 129.6, 38.6],
  PK: [60.9, 23.7, 77.8, 37.1],
  BD: [88.0, 20.7, 92.7, 26.6],
  IR: [44.0, 25.1, 63.3, 39.8],
  AF: [60.5, 29.4, 74.9, 38.5],
  SA: [34.5, 16.4, 55.7, 32.2],
  NG: [2.7, 4.3, 14.7, 13.9],
  GH: [-3.3, 4.7, 1.2, 11.2],
  KE: [33.9, -4.7, 41.9, 5.5],
  ZA: [16.3, -34.8, 32.9, -22.1],
  TZ: [29.3, -11.7, 40.4, -1.0],
  ET: [33.0, 3.4, 48.0, 14.9],
  CM: [8.5, 1.7, 16.2, 13.1],
  SN: [-17.5, 12.3, -11.4, 16.7],
  MX: [-117.1, 14.5, -86.7, 32.7],
  GT: [-92.2, 13.7, -88.2, 17.8],
  PE: [-81.3, -18.4, -68.7, -0.04],
  CO: [-79.0, -4.2, -67.0, 12.5],
  EC: [-81.0, -5.0, -75.2, 1.7],
  US: [-125.0, 24.5, -66.9, 49.4],
  CA: [-141.0, 41.7, -52.6, 83.1],
  DE: [5.9, 47.3, 15.0, 55.1],
  GB: [-8.2, 49.9, 1.8, 60.9],
  AU: [113.2, -43.6, 153.6, -10.7],
  FR: [-5.1, 42.3, 9.6, 51.1],
  BT: [88.7, 26.7, 92.1, 28.3],
  MM: [92.2, 9.8, 101.2, 28.5],
  TH: [97.3, 5.6, 105.6, 20.5],
  KH: [102.3, 10.4, 107.6, 14.7],
  MN: [87.7, 41.6, 119.9, 52.1],
  RU: [27.0, 41.2, 180.0, 81.9],
  ID: [95.0, -11.0, 141.0, 6.0],
  PH: [116.9, 4.6, 126.6, 21.1],
};

function makeBBox(code) {
  const b = countryBounds[code];
  if (!b) return null;
  return [
    [b[0], b[1]],
    [b[0], b[3]],
    [b[2], b[3]],
    [b[2], b[1]],
    [b[0], b[1]],
  ];
}

function makeFeature(code, name, country, countryCode, percentage) {
  const coords = makeBBox(countryCode);
  if (!coords) return null;
  return {
    type: "Feature",
    properties: { code, name, region: country, country: countryCode, percentage },
    geometry: { type: "Polygon", coordinates: [coords] },
  };
}

const systems = [
  {
    code: "ayurveda",
    name: "Ayurveda",
    tradition: "South Asian",
    originRegion: "Indian subcontinent",
    estimatedPractitioners: 400000,
    whoRecognition: "Recognized — WHO Traditional Medicine Strategy 2014–2023; included in ICD-11 supplementary chapter",
    keyPractices: ["Herbal medicine", "Panchakarma detox", "Dietary therapy", "Yoga therapy", "Meditation", "Oil massage (Abhyanga)", "Pulse diagnosis"],
    regionsOfPractice: ["India", "Nepal", "Sri Lanka", "Bangladesh", "Southeast Asia", "Western countries"],
    description: "Ayurveda ('science of life') is one of the world's oldest holistic healing systems, originating in India over 3,000 years ago. It is based on the belief that health depends on a balance among three fundamental bodily humors (doshas): Vata, Pitta, and Kapha. Treatment involves herbal remedies, dietary changes, yoga, meditation, massage, and detoxification therapies (Panchakarma). India has over 400,000 registered Ayurvedic practitioners and a national regulatory framework under the Ministry of AYUSH.",
    historicalNotes: "Rooted in the Vedas (c. 1500 BCE), Ayurveda was systematized in classical texts: the Charaka Samhita (internal medicine), Sushruta Samhita (surgery), and Ashtanga Hridaya. Sushruta is credited with pioneering surgical techniques including rhinoplasty. Ayurveda spread along trade routes to Southeast Asia and was integrated into local healing traditions. During British colonial rule it was marginalized, but post-independence India revived it as a national medical system alongside modern medicine.",
    countries: [
      { name: "India", code: "IN", pct: 70 },
      { name: "Nepal", code: "NP", pct: 60 },
      { name: "Sri Lanka", code: "LK", pct: 50 },
      { name: "Bangladesh", code: "BD", pct: 20 },
      { name: "Myanmar", code: "MM", pct: 10 },
      { name: "Thailand", code: "TH", pct: 5 },
    ],
  },
  {
    code: "tcm",
    name: "Traditional Chinese Medicine",
    tradition: "East Asian",
    originRegion: "China",
    estimatedPractitioners: 1200000,
    whoRecognition: "Recognized — Included in ICD-11 Chapter 26; WHO supports integration into national health systems",
    keyPractices: ["Acupuncture", "Herbal medicine", "Moxibustion", "Cupping", "Tui Na massage", "Qigong", "Tai Chi", "Dietary therapy"],
    regionsOfPractice: ["China", "Taiwan", "Singapore", "Malaysia", "Vietnam", "Worldwide (diaspora communities)"],
    description: "Traditional Chinese Medicine (TCM) is a comprehensive medical system developed over more than 2,000 years in China. It is grounded in the concepts of Qi (vital energy), Yin-Yang balance, and the Five Elements (Wu Xing). Diagnosis involves pulse reading, tongue examination, and patient observation. TCM encompasses acupuncture, herbal formulas (often combining 5–15 herbs), moxibustion, cupping, Tui Na bodywork, and movement practices like Qigong and Tai Chi. China has over 4,000 TCM hospitals and more than 1.2 million licensed practitioners.",
    historicalNotes: "TCM's foundational text, the Huangdi Neijing (Yellow Emperor's Classic), dates to approximately 200 BCE. The Shennong Bencaojing catalogued 365 medicinal substances. Zhang Zhongjing's Shanghan Lun (c. 220 CE) established systematic diagnosis and herbal treatment protocols still used today. Li Shizhen's Bencao Gangmu (1578) documented 1,892 substances. In 2015, pharmacologist Tu Youyou received the Nobel Prize for discovering artemisinin from the herb Artemisia annua, guided by a 4th-century TCM text.",
    countries: [
      { name: "China", code: "CN", pct: 85 },
      { name: "Taiwan", code: "TW", pct: 60 },
      { name: "Singapore", code: "SG", pct: 40 },
      { name: "Malaysia", code: "MY", pct: 30 },
      { name: "Vietnam", code: "VN", pct: 25 },
      { name: "Thailand", code: "TH", pct: 15 },
    ],
  },
  {
    code: "kampo",
    name: "Kampo",
    tradition: "East Asian",
    originRegion: "Japan",
    estimatedPractitioners: 150000,
    whoRecognition: "Partially recognized — Integrated into Japan's national health insurance; referenced in WHO traditional medicine strategies",
    keyPractices: ["Herbal formulas (standardized)", "Abdominal diagnosis (Fukushin)", "Pattern-based prescribing", "Acupuncture (adapted)", "Moxibustion"],
    regionsOfPractice: ["Japan"],
    description: "Kampo is Japan's adaptation of traditional Chinese medical practices, refined over 1,500 years into a distinct system. Unlike TCM, Kampo uses standardized herbal formulas (about 148 approved by Japan's health ministry) that are prescribed based on a patient's overall pattern (sho) rather than disease name. Abdominal palpation (Fukushin) is a key diagnostic technique unique to Kampo. Over 80% of Japanese physicians prescribe Kampo medicines, which are covered by national health insurance.",
    historicalNotes: "Chinese medicine arrived in Japan in the 5th–6th centuries via Korea. During the Edo period (1603–1868), Japanese physicians like Todo Yoshimasu developed distinct diagnostic methods emphasizing empirical observation over theoretical frameworks. The Meiji Restoration (1868) initially suppressed Kampo in favor of Western medicine, but it revived in the 20th century. In 1976, Japan's health insurance began covering Kampo extracts, leading to widespread integration with modern medicine.",
    countries: [
      { name: "Japan", code: "JP", pct: 80 },
    ],
  },
  {
    code: "korean-medicine",
    name: "Korean Medicine",
    tradition: "East Asian",
    originRegion: "Korean Peninsula",
    estimatedPractitioners: 25000,
    whoRecognition: "Recognized — Regulated under South Korea's national health system; WHO TM classification includes Korean medicine",
    keyPractices: ["Herbal medicine", "Acupuncture", "Sasang constitutional medicine", "Moxibustion", "Cupping", "Chuna manual therapy"],
    regionsOfPractice: ["South Korea", "North Korea"],
    description: "Korean Medicine (Hanbang/Hanguk Uihak) evolved from Chinese medical traditions but developed unique characteristics, especially Sasang Constitutional Medicine, which classifies patients into four body types (Tae-Yang, Tae-Eum, So-Yang, So-Eum) and tailors treatment accordingly. South Korea maintains a dual healthcare system where Korean medicine doctors train for 6 years at dedicated medical schools and practice alongside Western physicians. There are approximately 25,000 licensed Korean medicine doctors in South Korea.",
    historicalNotes: "Korean medicine's defining text is the Dongui Bogam (1613) by Heo Jun, now a UNESCO Memory of the World document. It synthesized Chinese and Korean medical knowledge into a practical clinical manual organized by body systems. The Sasang Constitutional Medicine framework was developed by Lee Je-ma in 1894 and remains uniquely Korean. Modern South Korea established the Korean Medicine licensing system in 1951 and maintains 12 Korean Medicine universities.",
    countries: [
      { name: "South Korea", code: "KR", pct: 75 },
    ],
  },
  {
    code: "unani",
    name: "Unani Medicine",
    tradition: "South Asian / Greco-Arabic",
    originRegion: "Greece / Arab world / South Asia",
    estimatedPractitioners: 60000,
    whoRecognition: "Recognized — Included in WHO Traditional Medicine Strategy; regulated in India under AYUSH ministry",
    keyPractices: ["Herbal medicine (Ilaj bil-Dawa)", "Dietary therapy (Ilaj bil-Ghiza)", "Regimental therapy (Ilaj bil-Tadbeer)", "Surgery (Ilaj bil-Yad)", "Cupping (Hijama)", "Pulse diagnosis"],
    regionsOfPractice: ["India", "Pakistan", "Bangladesh", "Iran", "Afghanistan", "Central Asia", "Middle East"],
    description: "Unani medicine ('Greek medicine') is a Greco-Arabic medical system based on the teachings of Hippocrates and Galen, later developed by Arab and Persian physicians. It rests on the theory of four humors (blood, phlegm, yellow bile, black bile) and four temperaments. Treatment aims to restore humoral balance through diet, herbal medicines, physical therapies, and lifestyle modifications. India is the primary center of Unani practice today, with over 50,000 registered practitioners and government-recognized universities teaching the system.",
    historicalNotes: "Originating with Hippocrates (460–370 BCE), the system was systematized by Galen (130–200 CE) and greatly expanded by Arab-Persian scholars: Al-Razi (Rhazes), Ibn Sina (Avicenna, whose Canon of Medicine was a European medical standard for centuries), and Ibn al-Nafis (who discovered pulmonary circulation). The system was brought to South Asia by Arab traders and the Delhi Sultanate. India's Unani tradition has been continuously practiced for over 800 years and was officially recognized alongside Ayurveda after independence.",
    countries: [
      { name: "India", code: "IN", pct: 30 },
      { name: "Pakistan", code: "PK", pct: 35 },
      { name: "Bangladesh", code: "BD", pct: 20 },
      { name: "Iran", code: "IR", pct: 15 },
      { name: "Afghanistan", code: "AF", pct: 10 },
      { name: "Saudi Arabia", code: "SA", pct: 5 },
    ],
  },
  {
    code: "siddha",
    name: "Siddha Medicine",
    tradition: "South Asian",
    originRegion: "Tamil Nadu, South India",
    estimatedPractitioners: 25000,
    whoRecognition: "Recognized — Regulated in India under AYUSH ministry; WHO acknowledges as traditional medical system",
    keyPractices: ["Herbal medicine", "Metal/mineral preparations (Chenduram)", "Pulse diagnosis (Naadi)", "Yoga therapy", "Varma therapy (pressure points)", "Dietary therapy"],
    regionsOfPractice: ["India (Tamil Nadu)", "Sri Lanka", "Malaysia (Tamil diaspora)"],
    description: "Siddha medicine is one of India's oldest medical systems, originating in Tamil Nadu and closely associated with Tamil culture. The system is attributed to the Siddhars — ancient sages believed to have attained spiritual perfection. Siddha is unique in its extensive use of metals and minerals (especially mercury, sulfur, and gold) in medicinal preparations alongside plant-based remedies. It shares some theoretical foundations with Ayurveda but has distinct diagnostic methods, particularly Naadi (pulse) diagnosis at specific wrist points and Varma therapy targeting vital energy points.",
    historicalNotes: "Siddha tradition attributes its founding to 18 Siddhars, with Agastya considered the primary authority. The system is documented in ancient Tamil texts dating to the Sangam period (300 BCE–300 CE). Siddha medicine developed sophisticated alchemical practices for preparing metallic medicines (Rasa Shastra) centuries before European alchemy. It remains primarily practiced in Tamil-speaking regions. India's Central Council of Indian Medicine regulates Siddha education and practice, with approximately 25,000 registered practitioners.",
    countries: [
      { name: "India", code: "IN", pct: 15 },
      { name: "Sri Lanka", code: "LK", pct: 10 },
      { name: "Malaysia", code: "MY", pct: 3 },
    ],
  },
  {
    code: "african-traditional",
    name: "African Traditional Medicine",
    tradition: "African",
    originRegion: "Sub-Saharan Africa",
    estimatedPractitioners: 500000,
    whoRecognition: "Recognized — WHO Africa Regional Strategy for Traditional Medicine; WHO supports integration into primary healthcare",
    keyPractices: ["Herbal medicine", "Spiritual healing", "Divination", "Bone-setting", "Midwifery", "Steam baths", "Scarification therapy"],
    regionsOfPractice: ["Nigeria", "Ghana", "Kenya", "South Africa", "Tanzania", "Ethiopia", "Cameroon", "Senegal", "Sub-Saharan Africa broadly"],
    description: "African Traditional Medicine encompasses diverse healing practices across the continent, used by an estimated 80% of Africa's population for primary healthcare according to the WHO. It integrates herbal medicine, spiritual healing, divination, and community-based health practices. Traditional healers (known by various names — Sangoma, Nganga, Babalawo, Herbalist) serve as physicians, counselors, and spiritual intermediaries. The African pharmacopoeia includes thousands of medicinal plants, many of which have been validated by modern pharmacological research. Several African countries are now formalizing traditional medicine practice and integrating it into national health systems.",
    historicalNotes: "African healing traditions are among the oldest in human history, with archaeological evidence of medicinal plant use dating back tens of thousands of years. Knowledge was traditionally transmitted orally from healer to apprentice across generations. The Egyptian medical papyri (c. 1550 BCE) document sophisticated herbal treatments that influenced Greek and Arabic medicine. Colonial-era suppression disrupted many traditions, but they persisted through community practice. Post-independence, the Alma-Ata Declaration (1978) and subsequent WHO initiatives recognized traditional medicine's role in achieving health for all. South Africa's Traditional Health Practitioners Act (2007) and Nigeria's Traditional Medicine Board represent modern regulatory frameworks.",
    countries: [
      { name: "Nigeria", code: "NG", pct: 75 },
      { name: "Ghana", code: "GH", pct: 70 },
      { name: "Kenya", code: "KE", pct: 65 },
      { name: "South Africa", code: "ZA", pct: 60 },
      { name: "Tanzania", code: "TZ", pct: 70 },
      { name: "Ethiopia", code: "ET", pct: 80 },
      { name: "Cameroon", code: "CM", pct: 70 },
      { name: "Senegal", code: "SN", pct: 65 },
    ],
  },
  {
    code: "curanderismo",
    name: "Curanderismo",
    tradition: "Latin American",
    originRegion: "Mesoamerica / Latin America",
    estimatedPractitioners: 100000,
    whoRecognition: "Partially recognized — Some Latin American countries include in national health policies; WHO acknowledges Indigenous medicine traditions",
    keyPractices: ["Herbal medicine (Yerbería)", "Spiritual cleansing (Limpia)", "Massage (Sobada)", "Ritual healing ceremonies", "Prayer and invocation", "Sweat lodge (Temazcal)", "Cupping"],
    regionsOfPractice: ["Mexico", "Guatemala", "Peru", "Colombia", "Ecuador", "US Southwest (Latino communities)"],
    description: "Curanderismo is a traditional healing system practiced across Latin America and Latino communities in the United States. It blends Indigenous Mesoamerican medicine with Spanish colonial folk healing and Catholic spiritual traditions. Curanderos/curanderas (healers) treat both physical and spiritual ailments using herbal remedies, ritual cleansings (limpias), massage, prayer, and ceremony. The system recognizes culture-bound syndromes such as susto (soul fright), empacho (digestive blockage), and mal de ojo (evil eye). Traditional markets (mercados) serve as important sources of medicinal herbs and healing supplies.",
    historicalNotes: "Curanderismo's roots lie in the sophisticated medical traditions of the Aztec, Maya, and Inca civilizations, which had extensive pharmacopoeias and specialized healers. The Aztec herbal text Badianus Manuscript (1552) documented Indigenous medicinal plants. Spanish colonization blended these traditions with European humoral medicine and Catholic healing practices. The resulting syncretic system adapted to local ecosystems throughout Latin America. Today, Mexico's IMSS-Bienestar program and Peru's National Institute of Traditional Medicine represent efforts to integrate curanderismo into public health frameworks.",
    countries: [
      { name: "Mexico", code: "MX", pct: 50 },
      { name: "Guatemala", code: "GT", pct: 55 },
      { name: "Peru", code: "PE", pct: 45 },
      { name: "Colombia", code: "CO", pct: 30 },
      { name: "Ecuador", code: "EC", pct: 40 },
    ],
  },
  {
    code: "naturopathy",
    name: "Naturopathy / Western Herbalism",
    tradition: "Western",
    originRegion: "Europe / North America",
    estimatedPractitioners: 90000,
    whoRecognition: "Partially recognized — WHO benchmarks for naturopathy training published 2010; regulated in several countries",
    keyPractices: ["Western herbal medicine", "Nutrition therapy", "Hydrotherapy", "Physical manipulation", "Homeopathy", "Lifestyle counseling", "Detoxification"],
    regionsOfPractice: ["United States", "Canada", "Germany", "United Kingdom", "Australia", "India"],
    description: "Naturopathy is a system of medicine based on the healing power of nature (vis medicatrix naturae). It emphasizes prevention and uses natural therapies including botanical medicine, nutrition, hydrotherapy, physical manipulation, and lifestyle counseling. Western Herbalism, closely related, focuses specifically on plant-based remedies drawn from European, Native American, and eclectic medical traditions. Naturopathic doctors (NDs) in regulated jurisdictions complete four-year graduate medical programs. The system is licensed or regulated in over 20 countries, with formal education and professional standards established in North America, Europe, and Australasia.",
    historicalNotes: "Naturopathy emerged from European natural healing movements of the 19th century, drawing on Sebastian Kneipp's hydrotherapy, the Eclectic medical movement in the US, and traditional European herbalism. Benedict Lust, a German immigrant, founded the American School of Naturopathy in 1901. The movement declined mid-20th century with the rise of pharmaceutical medicine but experienced a significant revival from the 1970s onward. Germany's Heilpraktiker tradition and the UK's herbal medicine heritage represent longstanding Western practices. The WHO published benchmark documents for naturopathy training in 2010.",
    countries: [
      { name: "United States", code: "US", pct: 15 },
      { name: "Canada", code: "CA", pct: 12 },
      { name: "Germany", code: "DE", pct: 25 },
      { name: "United Kingdom", code: "GB", pct: 10 },
      { name: "Australia", code: "AU", pct: 12 },
      { name: "India", code: "IN", pct: 8 },
    ],
  },
  {
    code: "tibetan-medicine",
    name: "Tibetan Medicine (Sowa Rigpa)",
    tradition: "Central Asian",
    originRegion: "Tibet / Himalayan region",
    estimatedPractitioners: 20000,
    whoRecognition: "Recognized — Classified under WHO ICD-11 traditional medicine module; regulated in India under AYUSH ministry as Sowa Rigpa",
    keyPractices: ["Herbal medicine (multi-compound formulas)", "Pulse diagnosis", "Urine analysis", "Moxibustion (Metsa)", "Golden needle therapy (Serkhab)", "Cupping (Mebum)", "Dietary and behavioral advice"],
    regionsOfPractice: ["Tibet (China)", "India (Ladakh, Sikkim, Himachal Pradesh)", "Nepal", "Bhutan", "Mongolia", "Russia (Buryatia)"],
    description: "Tibetan Medicine (Sowa Rigpa, 'science of healing') is a centuries-old medical system rooted in Buddhist philosophy and influenced by Indian Ayurveda, Chinese medicine, and Central Asian healing traditions. It is based on the theory of three nyepas (humors): rLung (wind), mKhris-pa (bile), and Bad-kan (phlegm). Diagnosis primarily relies on pulse reading at specific wrist points and detailed urine analysis. Treatment includes complex multi-ingredient herbal formulas (often 20–30 herbs), dietary modification, behavioral changes, and external therapies. The Men-Tsee-Khang (Tibetan Medical and Astrological Institute) in Dharamsala, India, is a leading center for preservation and practice.",
    historicalNotes: "The foundational text, the rGyud-bzhi (Four Tantras), was compiled in the 12th century, synthesizing earlier oral traditions attributed to the physician Yuthok Yonten Gonpo. The Chakpori Medical College, founded in Lhasa in 1696, was one of the world's first medical schools. Tibetan medicine was severely disrupted during the Cultural Revolution but has since been revived in Tibet, China's broader Tibetan regions, and the exile community in India. India formally recognized Sowa Rigpa as a national medical system in 2010 under the AYUSH ministry. Mongolia and Buryatia (Russia) also maintain active traditions.",
    countries: [
      { name: "China", code: "CN", pct: 10 },
      { name: "India", code: "IN", pct: 5 },
      { name: "Nepal", code: "NP", pct: 10 },
      { name: "Bhutan", code: "BT", pct: 30 },
      { name: "Mongolia", code: "MN", pct: 15 },
    ],
  },
];

// Write data files and GeoJSON files
for (const sys of systems) {
  const { countries, ...dataFields } = sys;

  // Write data JSON
  const dataObj = {
    ...dataFields,
    geojson: `${sys.code}.geojson`,
  };
  writeFileSync(join(dataDir, `${sys.code}.json`), JSON.stringify(dataObj, null, 2) + "\n");

  // Write GeoJSON
  const features = countries
    .map((c) => makeFeature(sys.code, sys.name, c.name, c.code, c.pct))
    .filter(Boolean);

  const geojson = {
    type: "FeatureCollection",
    features,
  };
  writeFileSync(join(geoDir, `${sys.code}.geojson`), JSON.stringify(geojson) + "\n");
}

console.log(`Generated ${systems.length} traditional medicine data + GeoJSON files.`);
