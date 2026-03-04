import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

const PLUGIN_DIR = join(import.meta.dirname, "..", "plugins", "music-regions");
const DATA_DIR = join(PLUGIN_DIR, "data");
const GEO_DIR = join(PLUGIN_DIR, "geo");

mkdirSync(DATA_DIR, { recursive: true });
mkdirSync(GEO_DIR, { recursive: true });

// 50 musical traditions with region polygons
const traditions = [
  {
    code: "blues",
    name: "Blues",
    region: "Mississippi Delta, United States",
    traditionFamily: "African-American",
    unescoICHStatus: "Not Listed",
    instruments: ["Guitar", "Harmonica", "Piano", "Double Bass", "Vocals"],
    keyArtists: ["Robert Johnson", "B.B. King", "Muddy Waters", "Howlin' Wolf", "Bessie Smith"],
    description: "Blues originated in the Deep South of the United States around the end of the 19th century from African-American spirituals, work songs, and chants. Characterized by call-and-response patterns, the blues scale, and specific chord progressions (especially the twelve-bar blues), it became a foundation for jazz, rhythm and blues, and rock and roll.",
    resources: [
      { title: "Alan Lomax Archive – Blues", url: "https://archive.culturalequity.org/explore-tag/genre/blues" },
      { title: "Smithsonian Folkways – Blues", url: "https://folkways.si.edu/genre/blues" }
    ],
    polygon: [[-91.5, 35.0], [-91.5, 31.0], [-89.0, 31.0], [-89.0, 35.0], [-91.5, 35.0]]
  },
  {
    code: "samba",
    name: "Samba",
    region: "Rio de Janeiro, Brazil",
    traditionFamily: "Latin American",
    unescoICHStatus: "Inscribed",
    instruments: ["Surdo", "Tamborim", "Pandeiro", "Cavaquinho", "Agogô"],
    keyArtists: ["Cartola", "Beth Carvalho", "Zeca Pagodinho", "Clara Nunes", "Martinho da Vila"],
    description: "Samba is a Brazilian music genre and dance style rooted in African rhythmic traditions brought by enslaved peoples. Originating in the Afro-Brazilian communities of Rio de Janeiro's favelas, it became the heartbeat of Carnival. Samba de Roda of the Recôncavo of Bahia was inscribed on the UNESCO Intangible Cultural Heritage list in 2008.",
    resources: [
      { title: "UNESCO ICH – Samba de Roda", url: "https://ich.unesco.org/en/RL/samba-de-roda-of-the-reconcavo-of-bahia-00101" }
    ],
    polygon: [[-44.0, -22.0], [-44.0, -23.5], [-42.5, -23.5], [-42.5, -22.0], [-44.0, -22.0]]
  },
  {
    code: "bossa-nova",
    name: "Bossa Nova",
    region: "Rio de Janeiro, Brazil",
    traditionFamily: "Latin American",
    unescoICHStatus: "Not Listed",
    instruments: ["Nylon Guitar", "Piano", "Vocals", "Double Bass", "Light Percussion"],
    keyArtists: ["João Gilberto", "Tom Jobim", "Astrud Gilberto", "Vinícius de Moraes", "Stan Getz"],
    description: "Bossa nova emerged in the late 1950s and early 1960s in the Copacabana and Ipanema neighborhoods of Rio de Janeiro. It fused samba rhythms with jazz harmonies, creating an intimate, sophisticated sound. The genre gained international fame through songs like 'The Girl from Ipanema' and 'Desafinado.'",
    resources: [
      { title: "Smithsonian Folkways – Brazilian Music", url: "https://folkways.si.edu/search?query=bossa+nova" }
    ],
    polygon: [[-43.8, -22.85], [-43.8, -23.1], [-43.1, -23.1], [-43.1, -22.85], [-43.8, -22.85]]
  },
  {
    code: "flamenco",
    name: "Flamenco",
    region: "Andalusia, Spain",
    traditionFamily: "European",
    unescoICHStatus: "Inscribed",
    instruments: ["Spanish Guitar", "Cajón", "Palmas (Handclaps)", "Castanets", "Vocals"],
    keyArtists: ["Paco de Lucía", "Camarón de la Isla", "Carmen Amaya", "Manolo Sanlúcar", "Estrella Morente"],
    description: "Flamenco is an expressive art form from Andalusia, Spain, encompassing cante (singing), toque (guitar playing), and baile (dance). It draws from Romani, Moorish, Andalusian, and Jewish cultural traditions. Inscribed on the UNESCO Representative List of the Intangible Cultural Heritage in 2010, flamenco is renowned for its emotional intensity and complex rhythmic patterns (compás).",
    resources: [
      { title: "UNESCO ICH – Flamenco", url: "https://ich.unesco.org/en/RL/flamenco-00363" }
    ],
    polygon: [[-7.5, 38.5], [-7.5, 36.0], [-1.5, 36.0], [-1.5, 38.5], [-7.5, 38.5]]
  },
  {
    code: "reggae",
    name: "Reggae",
    region: "Jamaica",
    traditionFamily: "Caribbean",
    unescoICHStatus: "Inscribed",
    instruments: ["Bass Guitar", "Drums", "Rhythm Guitar", "Organ", "Horns"],
    keyArtists: ["Bob Marley", "Peter Tosh", "Jimmy Cliff", "Burning Spear", "Toots Hibbert"],
    description: "Reggae music originated in Jamaica in the late 1960s, evolving from earlier genres like ska and rocksteady. Characterized by its offbeat rhythm, heavy bass lines, and socially conscious lyrics often linked to Rastafari, reggae became a global symbol of resistance and unity. It was inscribed on the UNESCO Intangible Cultural Heritage list in 2018.",
    resources: [
      { title: "UNESCO ICH – Reggae Music of Jamaica", url: "https://ich.unesco.org/en/RL/reggae-music-of-jamaica-01398" }
    ],
    polygon: [[-78.5, 18.6], [-78.5, 17.7], [-76.2, 17.7], [-76.2, 18.6], [-78.5, 18.6]]
  },
  {
    code: "fado",
    name: "Fado",
    region: "Lisbon, Portugal",
    traditionFamily: "European",
    unescoICHStatus: "Inscribed",
    instruments: ["Portuguese Guitar", "Classical Guitar", "Vocals", "Viola Baixo"],
    keyArtists: ["Amália Rodrigues", "Mariza", "Carlos do Carmo", "Mísia", "Ana Moura"],
    description: "Fado is a genre of Portuguese music characterized by mournful tunes and lyrics about the sea, longing (saudade), and fate. Originating in the working-class neighborhoods of Lisbon in the early 19th century, it is traditionally performed in fado houses (casas de fado). UNESCO inscribed fado on the Intangible Cultural Heritage list in 2011.",
    resources: [
      { title: "UNESCO ICH – Fado", url: "https://ich.unesco.org/en/RL/fado-urban-popular-song-of-portugal-00563" }
    ],
    polygon: [[-9.5, 39.0], [-9.5, 38.6], [-8.8, 38.6], [-8.8, 39.0], [-9.5, 39.0]]
  },
  {
    code: "kpop",
    name: "K-pop",
    region: "South Korea",
    traditionFamily: "East Asian Pop",
    unescoICHStatus: "Not Listed",
    instruments: ["Synthesizer", "Electronic Drums", "Sampler", "Vocals", "Dance"],
    keyArtists: ["BTS", "BLACKPINK", "EXO", "Girls' Generation", "Seo Taiji"],
    description: "K-pop (Korean pop) is a genre of popular music originating in South Korea, characterized by a wide variety of audiovisual elements including catchy melodies, synchronized choreography, and polished production. While modern K-pop emerged in the 1990s with Seo Taiji and Boys, it has become a global cultural phenomenon known as the Korean Wave (Hallyu).",
    resources: [
      { title: "Korean Cultural Center – K-pop", url: "https://www.koreanculture.org/" }
    ],
    polygon: [[126.0, 38.5], [126.0, 33.5], [130.0, 33.5], [130.0, 38.5], [126.0, 38.5]]
  },
  {
    code: "raga",
    name: "Raga (Hindustani Classical)",
    region: "Northern India",
    traditionFamily: "South Asian",
    unescoICHStatus: "Not Listed",
    instruments: ["Sitar", "Tabla", "Sarangi", "Tanpura", "Bansuri"],
    keyArtists: ["Ravi Shankar", "Zakir Hussain", "Hariprasad Chaurasia", "Ali Akbar Khan", "Bismillah Khan"],
    description: "Hindustani classical music is the North Indian tradition of Indian classical music based on the raga (melodic framework) and tala (rhythmic cycle) system. Ragas are associated with specific times of day, seasons, and emotions. Performances feature elaborate improvisations (alap, jor, jhala) followed by rhythmic compositions (gat). The tradition traces back to Vedic chanting and the treatise Natyashastra.",
    resources: [
      { title: "Smithsonian Folkways – Indian Classical", url: "https://folkways.si.edu/search?query=raga" }
    ],
    polygon: [[72.0, 32.0], [72.0, 22.0], [88.0, 22.0], [88.0, 32.0], [72.0, 32.0]]
  },
  {
    code: "carnatic",
    name: "Carnatic Music",
    region: "Southern India",
    traditionFamily: "South Asian",
    unescoICHStatus: "Not Listed",
    instruments: ["Veena", "Mridangam", "Violin", "Ghatam", "Kanjira"],
    keyArtists: ["M.S. Subbulakshmi", "Lalgudi Jayaraman", "T.N. Seshagopalan", "Mandolin U. Srinivas", "Balamuralikrishna"],
    description: "Carnatic music is the classical music tradition of South India, rooted in ancient texts and the compositions of the Trinity of Carnatic music: Tyagaraja, Muthuswami Dikshitar, and Syama Sastri. Unlike Hindustani music, Carnatic music emphasizes composed structures (kritis) alongside improvisation. The system uses 72 parent scales (melakartas) as a foundation for thousands of ragas.",
    resources: [
      { title: "Smithsonian Folkways – Carnatic Music", url: "https://folkways.si.edu/search?query=carnatic" }
    ],
    polygon: [[74.0, 22.0], [74.0, 8.0], [80.5, 8.0], [80.5, 22.0], [74.0, 22.0]]
  },
  {
    code: "gamelan",
    name: "Gamelan",
    region: "Java & Bali, Indonesia",
    traditionFamily: "Southeast Asian",
    unescoICHStatus: "Inscribed",
    instruments: ["Metallophones", "Xylophones", "Gongs", "Kendang Drum", "Bamboo Flute"],
    keyArtists: ["Ki Nartosabdo", "I Wayan Beratha", "Pak Cokro", "I Nyoman Windha", "Rahayu Supanggah"],
    description: "Gamelan is an ensemble music tradition from Java and Bali, Indonesia, featuring tuned percussion instruments made primarily of bronze. The interlocking rhythmic patterns create a shimmering, layered texture. Gamelan is integral to wayang (shadow puppet) performances, court ceremonies, and religious rituals. Indonesian Gamelan was inscribed on the UNESCO ICH list in 2021.",
    resources: [
      { title: "UNESCO ICH – Indonesian Gamelan", url: "https://ich.unesco.org/en/RL/gamelan-01607" }
    ],
    polygon: [[105.0, -5.5], [105.0, -8.8], [116.0, -8.8], [116.0, -5.5], [105.0, -5.5]]
  },
  {
    code: "griot",
    name: "Griot Tradition",
    region: "West Africa (Mande Region)",
    traditionFamily: "West African",
    unescoICHStatus: "Inscribed",
    instruments: ["Kora", "Balafon", "Djembe", "Ngoni", "Vocals"],
    keyArtists: ["Toumani Diabaté", "Salif Keita", "Ali Farka Touré", "Oumou Sangaré", "Youssou N'Dour"],
    description: "The Griot tradition is the hereditary oral history and music practice of the Mande peoples of West Africa. Griots (also known as jeli or djeli) serve as historians, storytellers, praise singers, and musicians. Their epic narratives, such as the Sundiata Keita epic, preserve centuries of history. The Manding musical tradition was inscribed on the UNESCO ICH list.",
    resources: [
      { title: "Alan Lomax Archive – West Africa", url: "https://archive.culturalequity.org/explore-tag/region/africa" }
    ],
    polygon: [[-17.0, 15.0], [-17.0, 8.0], [-4.0, 8.0], [-4.0, 15.0], [-17.0, 15.0]]
  },
  {
    code: "throat-singing",
    name: "Throat Singing (Khoomei)",
    region: "Tuva, Central Asia",
    traditionFamily: "Central Asian",
    unescoICHStatus: "Inscribed",
    instruments: ["Igil", "Doshpuluur", "Byzaanchy", "Khomus (Jaw Harp)", "Vocals"],
    keyArtists: ["Huun-Huur-Tu", "Kongar-ol Ondar", "Sainkho Namtchylak", "Chirgilchin", "Alash"],
    description: "Khoomei (throat singing) is a vocal art from Tuva and Mongolia where a single performer produces two or more pitches simultaneously through precise manipulation of the vocal tract. Styles include sygyt (whistling overtone), kargyraa (deep undertone), and khoomei (the foundational technique). The practice is deeply connected to nomadic pastoral life and the sounds of nature.",
    resources: [
      { title: "UNESCO ICH – Tuvan Throat Singing", url: "https://ich.unesco.org/en/RL/tuvan-throat-singing-00396" }
    ],
    polygon: [[89.0, 54.0], [89.0, 50.0], [99.0, 50.0], [99.0, 54.0], [89.0, 54.0]]
  },
  {
    code: "celtic",
    name: "Celtic Music",
    region: "Ireland, Scotland, Wales, Brittany",
    traditionFamily: "European",
    unescoICHStatus: "Not Listed",
    instruments: ["Fiddle", "Tin Whistle", "Uilleann Pipes", "Bodhrán", "Celtic Harp"],
    keyArtists: ["The Chieftains", "Planxty", "Clannad", "Lúnasa", "Altan"],
    description: "Celtic music encompasses the traditional music of the Celtic nations—primarily Ireland, Scotland, Wales, Brittany, Cornwall, and Galicia. Characterized by modal melodies, ornamented playing, and dance rhythms (reels, jigs, hornpipes), the tradition has been transmitted through sessions (informal gatherings) for centuries. Irish traditional music and dance remain central to Celtic cultural identity.",
    resources: [
      { title: "Comhaltas Ceoltóirí Éireann", url: "https://comhaltas.ie/" }
    ],
    polygon: [[-11.0, 56.0], [-11.0, 51.0], [-5.0, 51.0], [-5.0, 56.0], [-11.0, 56.0]]
  },
  {
    code: "tango",
    name: "Tango",
    region: "Buenos Aires, Argentina & Montevideo, Uruguay",
    traditionFamily: "Latin American",
    unescoICHStatus: "Inscribed",
    instruments: ["Bandoneón", "Violin", "Piano", "Double Bass", "Vocals"],
    keyArtists: ["Carlos Gardel", "Astor Piazzolla", "Aníbal Troilo", "Osvaldo Pugliese", "Gotan Project"],
    description: "Tango emerged in the working-class port neighborhoods of Buenos Aires and Montevideo in the late 19th century, blending influences from European immigrants, African-descended communities, and criollos. The music and dance are characterized by dramatic pauses, close embrace, and improvisational interplay. UNESCO inscribed tango on the Intangible Cultural Heritage list in 2009.",
    resources: [
      { title: "UNESCO ICH – Tango", url: "https://ich.unesco.org/en/RL/tango-00258" }
    ],
    polygon: [[-59.0, -34.0], [-59.0, -35.5], [-57.5, -35.5], [-57.5, -34.0], [-59.0, -34.0]]
  },
  {
    code: "mariachi",
    name: "Mariachi",
    region: "Jalisco, Mexico",
    traditionFamily: "Latin American",
    unescoICHStatus: "Inscribed",
    instruments: ["Trumpet", "Vihuela", "Guitarrón", "Violin", "Guitar"],
    keyArtists: ["Vicente Fernández", "Pedro Infante", "Jorge Negrete", "Mariachi Vargas de Tecalitlán", "Lila Downs"],
    description: "Mariachi is a musical expression of Mexico, originating in the state of Jalisco. The ensemble typically features trumpets, violins, vihuela, guitarrón, and guitar, performing a repertoire that includes sones, rancheras, boleros, and huapangos. Mariachi is a symbol of Mexican identity, performed at celebrations, serenades, and civic events. UNESCO inscribed it on the ICH list in 2011.",
    resources: [
      { title: "UNESCO ICH – Mariachi", url: "https://ich.unesco.org/en/RL/mariachi-string-music-song-and-trumpet-00575" }
    ],
    polygon: [[-105.5, 22.0], [-105.5, 19.5], [-102.0, 19.5], [-102.0, 22.0], [-105.5, 22.0]]
  },
  {
    code: "jazz",
    name: "Jazz",
    region: "New Orleans, United States",
    traditionFamily: "African-American",
    unescoICHStatus: "Not Listed",
    instruments: ["Trumpet", "Saxophone", "Piano", "Double Bass", "Drums"],
    keyArtists: ["Louis Armstrong", "Duke Ellington", "Miles Davis", "John Coltrane", "Thelonious Monk"],
    description: "Jazz originated in New Orleans in the late 19th and early 20th centuries from a confluence of African rhythmic traditions, blues, ragtime, and brass band marches. Known for improvisation, syncopation, swing feel, and blue notes, jazz evolved through many styles including Dixieland, bebop, cool jazz, hard bop, free jazz, and fusion. It is widely regarded as one of America's greatest cultural contributions.",
    resources: [
      { title: "Smithsonian Jazz", url: "https://jazz.si.edu/" }
    ],
    polygon: [[-90.5, 30.3], [-90.5, 29.7], [-89.5, 29.7], [-89.5, 30.3], [-90.5, 30.3]]
  },
  {
    code: "highlife",
    name: "Highlife",
    region: "Ghana & Nigeria",
    traditionFamily: "West African",
    unescoICHStatus: "Not Listed",
    instruments: ["Trumpet", "Guitar", "Percussion", "Saxophone", "Vocals"],
    keyArtists: ["E.T. Mensah", "King Sunny Adé", "Osibisa", "Pat Thomas", "Ebo Taylor"],
    description: "Highlife is a music genre that originated in Ghana and spread to Nigeria and other West African nations in the early 20th century. It fuses traditional Akan music with Western instruments and jazz influences, creating a danceable, brass-driven sound. Highlife was the dominant popular music of West Africa from the 1930s to 1970s and remains a foundational influence on Afrobeat and Afropop.",
    resources: [
      { title: "Smithsonian Folkways – West African Music", url: "https://folkways.si.edu/search?query=highlife" }
    ],
    polygon: [[-3.5, 11.5], [-3.5, 4.5], [4.0, 4.5], [4.0, 11.5], [-3.5, 11.5]]
  },
  {
    code: "afrobeat",
    name: "Afrobeat",
    region: "Lagos, Nigeria",
    traditionFamily: "West African",
    unescoICHStatus: "Not Listed",
    instruments: ["Drums", "Bass Guitar", "Horns", "Guitar", "Keyboards"],
    keyArtists: ["Fela Kuti", "Tony Allen", "Seun Kuti", "Antibalas", "Burna Boy"],
    description: "Afrobeat is a genre that combines West African musical styles such as highlife and Yoruba music with American funk, jazz, and soul. Pioneered by Fela Kuti and drummer Tony Allen in 1970s Lagos, Afrobeat features extended compositions with complex, interlocking rhythms, call-and-response vocals, and politically charged lyrics. It has experienced a global revival in the 21st century.",
    resources: [
      { title: "Fela Kuti Archive", url: "https://www.felakuti.com/" }
    ],
    polygon: [[2.5, 7.5], [2.5, 6.0], [4.5, 6.0], [4.5, 7.5], [2.5, 7.5]]
  },
  {
    code: "qawwali",
    name: "Qawwali",
    region: "Pakistan & Northern India",
    traditionFamily: "South Asian",
    unescoICHStatus: "Not Listed",
    instruments: ["Harmonium", "Tabla", "Dholak", "Handclaps", "Vocals"],
    keyArtists: ["Nusrat Fateh Ali Khan", "Sabri Brothers", "Abida Parveen", "Rahat Fateh Ali Khan", "Aziz Mian"],
    description: "Qawwali is a form of Sufi devotional music originating in the Indian subcontinent, developed in the 13th century by Amir Khusrau. Featuring powerful vocals with rhythmic handclaps and harmonium accompaniment, qawwali performances aim to induce a state of spiritual ecstasy (wajd). The genre gained international recognition through Nusrat Fateh Ali Khan's groundbreaking collaborations.",
    resources: [
      { title: "Smithsonian Folkways – Qawwali", url: "https://folkways.si.edu/search?query=qawwali" }
    ],
    polygon: [[67.0, 37.0], [67.0, 24.0], [78.0, 24.0], [78.0, 37.0], [67.0, 37.0]]
  },
  {
    code: "cumbia",
    name: "Cumbia",
    region: "Caribbean Coast, Colombia",
    traditionFamily: "Latin American",
    unescoICHStatus: "Not Listed",
    instruments: ["Gaita", "Tambor Alegre", "Llamador", "Maracas", "Guacharaca"],
    keyArtists: ["Lucho Bermúdez", "Totó la Momposina", "Andrés Landero", "Celso Piña", "Bomba Estéreo"],
    description: "Cumbia is a traditional Colombian music and dance genre that originated among the enslaved African, indigenous, and mestizo populations of the Caribbean coast. Its distinctive rhythm, driven by drums and gaita flutes, has spread throughout Latin America, spawning regional variants in Mexico, Argentina, Peru, and beyond. Cumbia is one of the most widely adapted musical forms in the Americas.",
    resources: [
      { title: "Smithsonian Folkways – Colombian Music", url: "https://folkways.si.edu/search?query=cumbia" }
    ],
    polygon: [[-76.5, 12.0], [-76.5, 8.0], [-73.0, 8.0], [-73.0, 12.0], [-76.5, 12.0]]
  },
  {
    code: "gnawa",
    name: "Gnawa Music",
    region: "Morocco",
    traditionFamily: "North African",
    unescoICHStatus: "Inscribed",
    instruments: ["Guembri", "Qraqeb (Metal Castanets)", "Drums", "Vocals"],
    keyArtists: ["Maalem Mahmoud Guinia", "Hassan Hakmoun", "Maalem Hamid El Kasri", "Gnawa Diffusion", "Majid Bekkas"],
    description: "Gnawa music is a body of Moroccan religious songs and rituals rooted in sub-Saharan African spiritual practices combined with Sufi Islam. Performances (called lilas or derdebas) use the guembri (bass lute), iron castanets (qraqeb), and chanting to induce trance states for spiritual healing. Gnawa was inscribed on the UNESCO ICH list in 2019.",
    resources: [
      { title: "UNESCO ICH – Gnawa", url: "https://ich.unesco.org/en/RL/gnawa-01170" }
    ],
    polygon: [[-10.0, 36.0], [-10.0, 29.0], [-1.0, 29.0], [-1.0, 36.0], [-10.0, 36.0]]
  },
  {
    code: "klezmer",
    name: "Klezmer",
    region: "Eastern Europe (Ashkenazi Diaspora)",
    traditionFamily: "European",
    unescoICHStatus: "Not Listed",
    instruments: ["Clarinet", "Violin", "Accordion", "Tsimbl (Hammered Dulcimer)", "Double Bass"],
    keyArtists: ["Giora Feidman", "The Klezmatics", "David Krakauer", "Naftule Brandwein", "Dave Tarras"],
    description: "Klezmer is the instrumental musical tradition of the Ashkenazi Jews of Eastern Europe. The word derives from the Hebrew 'kley zemer' (vessels of song). Characterized by expressive melodies that mimic laughter and crying, klezmer was traditionally played at weddings and celebrations. The genre was nearly lost during the Holocaust but experienced a revival in the 1970s and 1980s.",
    resources: [
      { title: "YIVO Encyclopedia – Klezmer", url: "https://yivoencyclopedia.org/article.aspx/Klezmer" }
    ],
    polygon: [[18.0, 54.0], [18.0, 48.0], [28.0, 48.0], [28.0, 54.0], [18.0, 54.0]]
  },
  {
    code: "calypso",
    name: "Calypso",
    region: "Trinidad & Tobago",
    traditionFamily: "Caribbean",
    unescoICHStatus: "Not Listed",
    instruments: ["Steel Pan", "Guitar", "Cuatro", "Bass", "Percussion"],
    keyArtists: ["Lord Kitchener", "Mighty Sparrow", "Lord Invader", "Calypso Rose", "Harry Belafonte"],
    description: "Calypso is a style of Afro-Caribbean music that originated in Trinidad & Tobago in the early 20th century. Growing from the kaiso tradition and African call-and-response, calypso features rhythmic, syncopated melodies with topical, often satirical lyrics commenting on social and political issues. The steel pan, Trinidad's national instrument, evolved alongside calypso.",
    resources: [
      { title: "Smithsonian Folkways – Calypso", url: "https://folkways.si.edu/search?query=calypso" }
    ],
    polygon: [[-62.0, 11.0], [-62.0, 10.0], [-60.5, 10.0], [-60.5, 11.0], [-62.0, 11.0]]
  },
  {
    code: "rebetiko",
    name: "Rebetiko",
    region: "Greece",
    traditionFamily: "European",
    unescoICHStatus: "Inscribed",
    instruments: ["Bouzouki", "Baglamas", "Guitar", "Vocals", "Accordion"],
    keyArtists: ["Markos Vamvakaris", "Vassilis Tsitsanis", "Marika Ninou", "Sotiria Bellou", "Giorgos Batis"],
    description: "Rebetiko is an urban Greek music genre that emerged in the port cities of Piraeus and Thessaloniki in the early 20th century, often called the 'Greek Blues.' Born from the music of refugees, immigrants, and the urban underclass, rebetiko songs deal with themes of love, loss, poverty, and social marginalization. UNESCO inscribed rebetiko in 2017.",
    resources: [
      { title: "UNESCO ICH – Rebetiko", url: "https://ich.unesco.org/en/RL/rebetiko-01291" }
    ],
    polygon: [[19.5, 42.0], [19.5, 35.0], [29.5, 35.0], [29.5, 42.0], [19.5, 42.0]]
  },
  {
    code: "mbira",
    name: "Mbira Music",
    region: "Zimbabwe",
    traditionFamily: "Southern African",
    unescoICHStatus: "Inscribed",
    instruments: ["Mbira Dzavadzimu", "Hosho (Shakers)", "Vocals", "Drums"],
    keyArtists: ["Stella Chiweshe", "Ephat Mujuru", "Thomas Mapfumo", "Chiwoniso Maraire", "Beauler Dyoko"],
    description: "Mbira music is a sacred tradition of the Shona people of Zimbabwe centered on the mbira dzavadzimu (thumb piano of the ancestors). Used in bira ceremonies to communicate with ancestral spirits, the mbira produces interlocking melodic patterns with rich overtones. The art of crafting and playing the mbira was inscribed on the UNESCO ICH list in 2020.",
    resources: [
      { title: "UNESCO ICH – Mbira/Sansi", url: "https://ich.unesco.org/en/RL/art-of-crafting-and-playing-mbira-sansi-01541" }
    ],
    polygon: [[25.0, -15.5], [25.0, -22.5], [33.0, -22.5], [33.0, -15.5], [25.0, -15.5]]
  },
  {
    code: "enka",
    name: "Enka",
    region: "Japan",
    traditionFamily: "East Asian Pop",
    unescoICHStatus: "Not Listed",
    instruments: ["Shamisen", "Shakuhachi", "Koto", "Orchestra", "Vocals"],
    keyArtists: ["Misora Hibari", "Miyako Harumi", "Hikawa Kiyoshi", "Sayuri Ishikawa", "Jero"],
    description: "Enka is a genre of Japanese popular music considered the modern successor to traditional Japanese music. Featuring pentatonic melodies, heavy vibrato (kobushi), and themes of lost love, loneliness, and nostalgia, enka draws from both Japanese traditional scales and Western ballad structures. It reached peak popularity in the 1960s-1980s and remains beloved by older generations.",
    resources: [
      { title: "Japan Foundation – Music", url: "https://www.jpf.go.jp/" }
    ],
    polygon: [[129.5, 45.5], [129.5, 31.0], [145.5, 31.0], [145.5, 45.5], [129.5, 45.5]]
  },
  {
    code: "son-cubano",
    name: "Son Cubano",
    region: "Eastern Cuba",
    traditionFamily: "Caribbean",
    unescoICHStatus: "Not Listed",
    instruments: ["Tres", "Bongos", "Maracas", "Clave", "Double Bass"],
    keyArtists: ["Compay Segundo", "Ibrahim Ferrer", "Arsenio Rodríguez", "Beny Moré", "Buena Vista Social Club"],
    description: "Son cubano is the most influential Cuban music genre, originating in the eastern provinces (Oriente) in the late 19th century. It combines Spanish verse and guitar traditions with African-derived rhythms and percussion. The son is the foundation of salsa, mambo, and cha-cha-chá. The clave rhythm pattern is its rhythmic cornerstone.",
    resources: [
      { title: "Smithsonian Folkways – Cuban Music", url: "https://folkways.si.edu/search?query=son+cubano" }
    ],
    polygon: [[-84.5, 23.5], [-84.5, 19.8], [-74.0, 19.8], [-74.0, 23.5], [-84.5, 23.5]]
  },
  {
    code: "maqam",
    name: "Maqam Music",
    region: "Middle East (Iraq, Syria, Egypt)",
    traditionFamily: "Middle Eastern",
    unescoICHStatus: "Inscribed",
    instruments: ["Oud", "Qanun", "Ney", "Riq", "Vocals"],
    keyArtists: ["Umm Kulthum", "Fairuz", "Munir Bashir", "Sabah Fakhri", "Marcel Khalife"],
    description: "Maqam is the modal system of Arabic music, providing the melodic framework for classical and folk traditions across the Middle East. Iraqi Maqam, inscribed on the UNESCO ICH list in 2003, features elaborate vocal improvisations over a modal structure. The system encompasses dozens of scales with quarter-tone intervals, creating the distinctive microtonal quality of Arabic music.",
    resources: [
      { title: "UNESCO ICH – Iraqi Maqam", url: "https://ich.unesco.org/en/RL/iraqi-maqam-00100" }
    ],
    polygon: [[35.0, 37.5], [35.0, 22.0], [48.0, 22.0], [48.0, 37.5], [35.0, 37.5]]
  },
  {
    code: "mugham",
    name: "Mugham",
    region: "Azerbaijan",
    traditionFamily: "Central Asian",
    unescoICHStatus: "Inscribed",
    instruments: ["Tar", "Kamancha", "Gaval", "Vocals"],
    keyArtists: ["Alim Qasimov", "Fargana Qasimova", "Vagif Mustafazade", "Shovkat Alakbarova", "Khan Shushinsky"],
    description: "Mugham is the classical improvised modal music of Azerbaijan, characterized by free-form vocal and instrumental improvisation within a framework of defined melodic modes and emotional states. Performed by a trio of singer, tar player, and kamancha player, mugham draws from Persian, Turkish, and Caucasian musical traditions. UNESCO inscribed it in 2008.",
    resources: [
      { title: "UNESCO ICH – Azerbaijani Mugham", url: "https://ich.unesco.org/en/RL/azerbaijani-mugham-00039" }
    ],
    polygon: [[44.8, 42.0], [44.8, 38.4], [50.4, 38.4], [50.4, 42.0], [44.8, 42.0]]
  },
  {
    code: "samba-reggae",
    name: "Samba-Reggae",
    region: "Salvador, Bahia, Brazil",
    traditionFamily: "Latin American",
    unescoICHStatus: "Not Listed",
    instruments: ["Surdo", "Repinique", "Timbau", "Shekere", "Vocals"],
    keyArtists: ["Olodum", "Ilê Aiyê", "Timbalada", "Daniela Mercury", "Carlinhos Brown"],
    description: "Samba-reggae is a percussive music genre that emerged in the Afro-Brazilian blocos afro (carnival groups) of Salvador, Bahia in the 1980s. Combining samba's polyrhythmic drumming with reggae's offbeat feel, it became a powerful expression of Black Brazilian identity and Afro-Brazilian cultural pride. The genre brought international attention through groups like Olodum, famously featured in Paul Simon's recordings.",
    resources: [
      { title: "Smithsonian Folkways – Bahia Music", url: "https://folkways.si.edu/search?query=bahia+brazil" }
    ],
    polygon: [[-39.5, -12.0], [-39.5, -13.5], [-38.0, -13.5], [-38.0, -12.0], [-39.5, -12.0]]
  },
  {
    code: "country",
    name: "Country Music",
    region: "Appalachia & Nashville, United States",
    traditionFamily: "North American",
    unescoICHStatus: "Not Listed",
    instruments: ["Acoustic Guitar", "Fiddle", "Banjo", "Pedal Steel Guitar", "Mandolin"],
    keyArtists: ["Hank Williams", "Johnny Cash", "Dolly Parton", "Patsy Cline", "Willie Nelson"],
    description: "Country music evolved in the rural Southern United States in the 1920s from a blend of Appalachian folk, Celtic immigrant music, African-American blues, and gospel. Nashville, Tennessee became its commercial center, earning the nickname 'Music City.' The genre's storytelling tradition, string-band instrumentation, and themes of heartbreak, faith, and rural life have made it one of America's most enduring musical forms.",
    resources: [
      { title: "Country Music Hall of Fame", url: "https://countrymusichalloffame.org/" }
    ],
    polygon: [[-88.0, 37.5], [-88.0, 35.0], [-82.0, 35.0], [-82.0, 37.5], [-88.0, 37.5]]
  },
  {
    code: "gagaku",
    name: "Gagaku",
    region: "Japan",
    traditionFamily: "East Asian Classical",
    unescoICHStatus: "Inscribed",
    instruments: ["Shō", "Hichiriki", "Ryūteki", "Kakko", "Biwa"],
    keyArtists: ["Imperial Household Agency Musicians", "Tōgi Hideki", "Shiba Sukehiro"],
    description: "Gagaku is the oldest surviving orchestral music tradition in the world, dating to the 7th century at the Japanese Imperial Court. It comprises instrumental ensemble music (kangen), dance music (bugaku), and vocal music (utaimono). The ethereal, slow-moving sound features the mouth organ (shō), oboe-like hichiriki, and transverse flute (ryūteki). UNESCO inscribed gagaku in 2009.",
    resources: [
      { title: "UNESCO ICH – Gagaku", url: "https://ich.unesco.org/en/RL/gagaku-00265" }
    ],
    polygon: [[134.0, 36.0], [134.0, 34.0], [140.0, 34.0], [140.0, 36.0], [134.0, 36.0]]
  },
  {
    code: "andean",
    name: "Andean Music",
    region: "Peru, Bolivia, Ecuador",
    traditionFamily: "Latin American",
    unescoICHStatus: "Not Listed",
    instruments: ["Charango", "Zampoña (Pan Flute)", "Quena", "Bombo", "Guitar"],
    keyArtists: ["Los Kjarkas", "Inti-Illimani", "Luzmila Carpio", "Yma Sumac", "Savia Andina"],
    description: "Andean music encompasses the indigenous and mestizo musical traditions of the Andes mountains spanning Peru, Bolivia, and Ecuador. Rooted in pre-Columbian Inca and Aymara cultures, it features pentatonic melodies played on wind instruments like the quena (flute) and zampoña (panpipes), along with the charango (small lute). The music is deeply tied to agricultural ceremonies, Pachamama worship, and highland festivals.",
    resources: [
      { title: "Smithsonian Folkways – Andean Music", url: "https://folkways.si.edu/search?query=andean" }
    ],
    polygon: [[-81.0, 2.0], [-81.0, -22.0], [-60.0, -22.0], [-60.0, 2.0], [-81.0, 2.0]]
  },
  {
    code: "aboriginal",
    name: "Aboriginal Australian Music",
    region: "Northern Australia",
    traditionFamily: "Oceanian",
    unescoICHStatus: "Not Listed",
    instruments: ["Didgeridoo", "Clapsticks", "Vocals", "Body Percussion"],
    keyArtists: ["Yothu Yindi", "Geoffrey Gurrumul Yunupingu", "David Hudson", "Archie Roach", "Baker Boy"],
    description: "Aboriginal Australian music is one of the oldest continuous musical traditions on Earth, dating back over 40,000 years. The didgeridoo (yidaki), one of the world's oldest wind instruments, produces a deep drone through circular breathing. Songlines (dreaming tracks) are oral maps encoded in song that describe ancestral creation journeys across the landscape, serving as both navigation and spiritual practice.",
    resources: [
      { title: "AIATSIS – Aboriginal Music", url: "https://aiatsis.gov.au/" }
    ],
    polygon: [[129.0, -11.0], [129.0, -20.0], [137.0, -20.0], [137.0, -11.0], [129.0, -11.0]]
  },
  {
    code: "polka",
    name: "Polka",
    region: "Bohemia, Czech Republic",
    traditionFamily: "European",
    unescoICHStatus: "Not Listed",
    instruments: ["Accordion", "Trumpet", "Clarinet", "Tuba", "Drums"],
    keyArtists: ["Frankie Yankovic", "Jimmy Sturr", "Eddie Blazonczyk", "Lojze Slak", "Brave Combo"],
    description: "Polka is a lively Central European dance and music genre originating in Bohemia in the 1830s. In 2/4 time with a characteristic oom-pah pattern, polka rapidly spread across Europe and to immigrant communities in the Americas. Regional variants include Czech, Polish, Slovenian, and Tex-Mex styles. The dance and music remain central to festivals and celebrations throughout Central Europe.",
    resources: [
      { title: "Smithsonian Folkways – Polka", url: "https://folkways.si.edu/search?query=polka" }
    ],
    polygon: [[12.0, 51.0], [12.0, 48.5], [19.0, 48.5], [19.0, 51.0], [12.0, 51.0]]
  },
  {
    code: "afro-cuban",
    name: "Afro-Cuban Sacred Music",
    region: "Cuba",
    traditionFamily: "Caribbean",
    unescoICHStatus: "Inscribed",
    instruments: ["Batá Drums", "Shekere", "Vocals", "Clave"],
    keyArtists: ["Lázaro Ros", "Merceditas Valdés", "Los Muñequitos de Matanzas", "AfroCuba de Matanzas"],
    description: "Afro-Cuban sacred music encompasses the Yoruba-derived religious traditions of Santería (Regla de Ocha), including the batá drum tradition and the Rumba complex. Batá drums, considered sacred, are played in specific rhythmic patterns (toques) to invoke Orishas. The Rumba (of which guaguancó, yambú, and columbia are forms) was inscribed by UNESCO in 2016 as an intangible cultural heritage.",
    resources: [
      { title: "UNESCO ICH – Rumba", url: "https://ich.unesco.org/en/RL/rumba-in-cuba-01185" }
    ],
    polygon: [[-84.0, 23.0], [-84.0, 20.0], [-76.0, 20.0], [-76.0, 23.0], [-84.0, 23.0]]
  },
  {
    code: "sufi-music",
    name: "Sufi Devotional Music",
    region: "Turkey & Iran",
    traditionFamily: "Middle Eastern",
    unescoICHStatus: "Inscribed",
    instruments: ["Ney", "Kudüm", "Rebab", "Tanbur", "Vocals"],
    keyArtists: ["Mercan Dede", "Kudsi Erguner", "Shahram Nazeri", "Mohammad Reza Shajarian", "Sami Yusuf"],
    description: "Sufi devotional music encompasses the musical practices of Islamic mysticism, particularly the Mevlevi Sema ceremony of whirling dervishes in Turkey and the rich vocal tradition of Iranian Sufism. The ney (reed flute) is considered the instrument of spiritual longing. The Mevlevi Sema was inscribed by UNESCO in 2008 as a masterpiece of oral and intangible heritage.",
    resources: [
      { title: "UNESCO ICH – Mevlevi Sema", url: "https://ich.unesco.org/en/RL/mevlevi-sema-ceremony-00100" }
    ],
    polygon: [[26.0, 42.0], [26.0, 27.0], [60.0, 27.0], [60.0, 42.0], [26.0, 42.0]]
  },
  {
    code: "gospel",
    name: "Gospel Music",
    region: "Southern United States",
    traditionFamily: "African-American",
    unescoICHStatus: "Not Listed",
    instruments: ["Organ", "Piano", "Choir Vocals", "Drums", "Bass Guitar"],
    keyArtists: ["Mahalia Jackson", "Thomas A. Dorsey", "Aretha Franklin", "Kirk Franklin", "The Staple Singers"],
    description: "Gospel music is a genre of Christian music rooted in African-American spirituals, hymns, and the Black church tradition of the American South. Developed in the early 20th century by Thomas A. Dorsey and others who blended sacred lyrics with blues and jazz elements, gospel is characterized by powerful vocals, emotional delivery, call-and-response patterns, and the use of the Hammond organ.",
    resources: [
      { title: "Smithsonian Folkways – Gospel", url: "https://folkways.si.edu/search?query=gospel" }
    ],
    polygon: [[-95.0, 37.0], [-95.0, 30.0], [-80.0, 30.0], [-80.0, 37.0], [-95.0, 37.0]]
  },
  {
    code: "dangdut",
    name: "Dangdut",
    region: "Indonesia",
    traditionFamily: "Southeast Asian",
    unescoICHStatus: "Not Listed",
    instruments: ["Tabla (Gendang)", "Mandolin", "Suling", "Keyboards", "Electric Guitar"],
    keyArtists: ["Rhoma Irama", "Elvy Sukaesih", "Mansyur S.", "Inul Daratista", "Via Vallen"],
    description: "Dangdut is the dominant popular music genre of Indonesia, blending Malay, Arabic, Indian (Bollywood), and Western rock influences. Named after the onomatopoeic sound of its tabla-like drums, dangdut emerged in the 1970s as the music of the common people. Its rhythmic, danceable sound and accessible lyrics about love and daily life have made it a staple of Indonesian cultural identity.",
    resources: [
      { title: "Smithsonian Folkways – Indonesian Music", url: "https://folkways.si.edu/search?query=indonesia" }
    ],
    polygon: [[95.0, 6.0], [95.0, -8.0], [141.0, -8.0], [141.0, 6.0], [95.0, 6.0]]
  },
  {
    code: "tuareg",
    name: "Tuareg Desert Blues",
    region: "Sahara (Mali, Niger, Algeria)",
    traditionFamily: "North African",
    unescoICHStatus: "Not Listed",
    instruments: ["Electric Guitar", "Bass Guitar", "Drums", "Tende", "Vocals"],
    keyArtists: ["Tinariwen", "Bombino", "Mdou Moctar", "Tamikrest", "Tartit"],
    description: "Tuareg desert blues (also called Tishoumaren or 'guitar music') emerged from the Tuareg nomadic communities of the Sahara. Combining traditional Tuareg rhythms and melodies with electric guitar, it was born in the refugee camps and rebellion movements of the 1980s-90s. The hypnotic, repetitive guitar patterns evoke the vastness of the desert and themes of exile, resistance, and nomadic identity.",
    resources: [
      { title: "Sahel Sounds", url: "https://sahelsounds.com/" }
    ],
    polygon: [[-5.0, 25.0], [-5.0, 15.0], [12.0, 15.0], [12.0, 25.0], [-5.0, 25.0]]
  },
  {
    code: "pansori",
    name: "Pansori",
    region: "South Korea",
    traditionFamily: "East Asian Classical",
    unescoICHStatus: "Inscribed",
    instruments: ["Buk (Barrel Drum)", "Fan", "Vocals"],
    keyArtists: ["Ahn Sook-sun", "Cho Sang-hyun", "Park Dong-jin", "Oh Jung-hae", "Jang Sa-ik"],
    description: "Pansori is a Korean genre of musical storytelling performed by a single vocalist (sorikkun) accompanied by a drummer (gosu). The singer uses dramatic vocal techniques, gestures, and a folding fan to narrate one of five surviving epic stories over several hours. Pansori requires extraordinary vocal stamina and emotional range. UNESCO inscribed it in 2008.",
    resources: [
      { title: "UNESCO ICH – Pansori", url: "https://ich.unesco.org/en/RL/pansori-epic-chant-00070" }
    ],
    polygon: [[126.5, 37.0], [126.5, 34.0], [129.5, 34.0], [129.5, 37.0], [126.5, 37.0]]
  },
  {
    code: "fandango",
    name: "Fandango",
    region: "Veracruz, Mexico",
    traditionFamily: "Latin American",
    unescoICHStatus: "Not Listed",
    instruments: ["Jarana Jarocha", "Requinto Jarocho", "Zapateado (Foot Percussion)", "Vocals", "Harp"],
    keyArtists: ["Son de Madera", "Los Cojolites", "Mono Blanco", "Graciana Silva", "Andrés Vega"],
    description: "Fandango jarocho is a communal music and dance tradition from the Veracruz region of Mexico. Centered around the tarima (wooden platform for zapateado dancing), son jarocho blends Spanish, African, and indigenous Mesoamerican elements. Performances are participatory—anyone can join the singing, playing, or dancing. The genre experienced a grassroots revival movement starting in the 1980s.",
    resources: [
      { title: "Smithsonian Folkways – Son Jarocho", url: "https://folkways.si.edu/search?query=son+jarocho" }
    ],
    polygon: [[-97.5, 21.0], [-97.5, 18.0], [-94.5, 18.0], [-94.5, 21.0], [-97.5, 21.0]]
  },
  {
    code: "bhangra",
    name: "Bhangra",
    region: "Punjab, India & Pakistan",
    traditionFamily: "South Asian",
    unescoICHStatus: "Not Listed",
    instruments: ["Dhol", "Tumbi", "Chimta", "Algoza", "Vocals"],
    keyArtists: ["Gurdas Maan", "Daler Mehndi", "Alam Lohar", "Jazzy B", "Panjabi MC"],
    description: "Bhangra is a lively music and dance form originating from the Punjab region of India and Pakistan. Originally performed during the Vaisakhi harvest festival, bhangra features the powerful dhol drum, energetic dance movements, and call-and-response singing. In the 1980s-90s, British Punjabi communities created a fusion of traditional bhangra with electronic music that gained global popularity.",
    resources: [
      { title: "Smithsonian Folkways – Punjabi Music", url: "https://folkways.si.edu/search?query=punjabi" }
    ],
    polygon: [[71.0, 34.0], [71.0, 29.0], [77.0, 29.0], [77.0, 34.0], [71.0, 34.0]]
  },
  {
    code: "morna",
    name: "Morna",
    region: "Cape Verde",
    traditionFamily: "West African",
    unescoICHStatus: "Inscribed",
    instruments: ["Violin", "Guitar", "Cavaquinho", "Piano", "Vocals"],
    keyArtists: ["Cesária Évora", "B. Leza", "Eugénio Tavares", "Ildo Lobo", "Mayra Andrade"],
    description: "Morna is the national music genre of Cape Verde, a melancholic song form expressing themes of longing (sodade), love, the sea, and emigration. Often compared to Portuguese fado and Brazilian modinha, morna features gentle melodies and poetic lyrics in Cape Verdean Creole. Cesária Évora brought morna to international audiences as the 'Barefoot Diva.' UNESCO inscribed morna in 2019.",
    resources: [
      { title: "UNESCO ICH – Morna", url: "https://ich.unesco.org/en/RL/morna-musical-practice-of-cabo-verde-01468" }
    ],
    polygon: [[-25.5, 17.5], [-25.5, 14.5], [-22.5, 14.5], [-22.5, 17.5], [-25.5, 17.5]]
  },
  {
    code: "persian-classical",
    name: "Persian Classical Music",
    region: "Iran",
    traditionFamily: "Middle Eastern",
    unescoICHStatus: "Inscribed",
    instruments: ["Tar", "Setar", "Santur", "Kamancheh", "Tombak"],
    keyArtists: ["Mohammad Reza Shajarian", "Hossein Alizadeh", "Shahram Nazeri", "Parviz Meshkatian", "Kayhan Kalhor"],
    description: "Persian classical music (musiqi-e assil) is based on the radif, a collection of melodic models organized into twelve dastgahs (modal systems). The tradition emphasizes vocal mastery and improvisation within modal frameworks, with deep connections to Persian poetry by Hafez and Rumi. The radif was inscribed on the UNESCO ICH list in 2009.",
    resources: [
      { title: "UNESCO ICH – Radif of Iranian Music", url: "https://ich.unesco.org/en/RL/radif-of-iranian-music-00279" }
    ],
    polygon: [[44.0, 40.0], [44.0, 25.0], [63.5, 25.0], [63.5, 40.0], [44.0, 40.0]]
  },
  {
    code: "juju",
    name: "Jùjú Music",
    region: "Yorubaland, Nigeria",
    traditionFamily: "West African",
    unescoICHStatus: "Not Listed",
    instruments: ["Talking Drum", "Guitar", "Keyboards", "Shekere", "Vocals"],
    keyArtists: ["King Sunny Adé", "Ebenezer Obey", "I.K. Dairo", "Shina Peters", "Dele Ojo"],
    description: "Jùjú is a popular music genre from the Yoruba-speaking regions of Nigeria. Emerging in the 1920s from a fusion of Yoruba percussion with Western instruments, it features the dùndún (talking drum), layered guitars, call-and-response vocals, and praise singing. King Sunny Adé brought jùjú to international audiences in the 1980s with his innovative use of the pedal steel guitar.",
    resources: [
      { title: "Smithsonian Folkways – Jùjú", url: "https://folkways.si.edu/search?query=juju+nigeria" }
    ],
    polygon: [[2.5, 10.0], [2.5, 6.0], [6.0, 6.0], [6.0, 10.0], [2.5, 10.0]]
  },
  {
    code: "taiko",
    name: "Taiko Drumming",
    region: "Japan",
    traditionFamily: "East Asian Classical",
    unescoICHStatus: "Not Listed",
    instruments: ["Nagado-daiko", "Shime-daiko", "Ō-daiko", "Kane (Gong)", "Fue (Flute)"],
    keyArtists: ["Kodo", "Ondekoza", "Oedo Taiko", "TAO", "Leonard Eto"],
    description: "Taiko (literally 'great drum') encompasses the tradition of ensemble drumming in Japan. While individual drums have been used in Japanese music for over 1,500 years in shrine festivals, court music, and theater, the modern kumidaiko (ensemble) tradition was developed in the 1950s by Daihachi Oguchi. Taiko performances combine powerful drumming with choreographed movement and theatrical presentation.",
    resources: [
      { title: "Kodo – Taiko", url: "https://www.kodo.or.jp/en/" }
    ],
    polygon: [[136.0, 40.0], [136.0, 33.0], [142.0, 33.0], [142.0, 40.0], [136.0, 40.0]]
  },
  {
    code: "mongolian-long-song",
    name: "Mongolian Long Song (Urtiin Duu)",
    region: "Mongolia",
    traditionFamily: "Central Asian",
    unescoICHStatus: "Inscribed",
    instruments: ["Morin Khuur (Horse-head Fiddle)", "Vocals", "Yatga (Zither)"],
    keyArtists: ["Norovbanzad", "Namjil Norov", "Tserendavaa", "Ganbold", "Altai Khairkhan"],
    description: "Urtiin duu (long song) is one of the two major forms of Mongolian traditional singing, characterized by extremely long, drawn-out phrases, wide vocal range, and free-flowing rhythms that evoke the vast Mongolian steppe. Each syllable of text is extended with elaborate melismatic ornaments. UNESCO jointly inscribed the Mongolian Long Song tradition (shared with China) in 2005.",
    resources: [
      { title: "UNESCO ICH – Urtiin Duu", url: "https://ich.unesco.org/en/RL/urtiin-duu-traditional-folk-long-song-00066" }
    ],
    polygon: [[87.5, 52.0], [87.5, 41.5], [120.0, 41.5], [120.0, 52.0], [87.5, 52.0]]
  },
  {
    code: "zouk",
    name: "Zouk",
    region: "French Antilles (Guadeloupe & Martinique)",
    traditionFamily: "Caribbean",
    unescoICHStatus: "Not Listed",
    instruments: ["Synthesizer", "Bass Guitar", "Drums", "Ti Bwa (Sticks)", "Vocals"],
    keyArtists: ["Kassav'", "Zouk Machine", "Tanya Saint-Val", "Jean-Philippe Marthely", "Jacob Desvarieux"],
    description: "Zouk is a fast, carnival-style rhythmic music originating from the French Caribbean islands of Guadeloupe and Martinique. Created in the 1980s by the band Kassav', zouk fuses traditional gwo ka and biguine rhythms with modern electronic production, funk, and Caribbean cadence. The word 'zouk' means 'party' in Antillean Creole. Zouk has spread widely to Brazil, Cape Verde, and Lusophone Africa.",
    resources: [
      { title: "Smithsonian Folkways – Caribbean", url: "https://folkways.si.edu/search?query=zouk" }
    ],
    polygon: [[-62.0, 16.5], [-62.0, 14.0], [-60.5, 14.0], [-60.5, 16.5], [-62.0, 16.5]]
  },
  {
    code: "hawaiian-slack-key",
    name: "Hawaiian Slack-Key Guitar",
    region: "Hawaii, United States",
    traditionFamily: "Oceanian",
    unescoICHStatus: "Not Listed",
    instruments: ["Slack-Key Guitar", "Steel Guitar", "Ukulele", "Vocals", "Bass"],
    keyArtists: ["Gabby Pahinui", "Raymond Kane", "Keola Beamer", "Ledward Kaapana", "Cyril Pahinui"],
    description: "Ki ho'alu (slack-key guitar) is a Hawaiian fingerstyle guitar tradition where the strings are 'slacked' (tuned down) to create open tunings. Developed in the 19th century by Hawaiian cowboys (paniolo) who adapted Spanish and Mexican guitar styles, each family guarded their own tunings. The technique produces a warm, reverberant sound that evokes the Hawaiian landscape.",
    resources: [
      { title: "Smithsonian Folkways – Hawaiian Music", url: "https://folkways.si.edu/search?query=hawaiian+slack+key" }
    ],
    polygon: [[-160.5, 22.5], [-160.5, 18.5], [-154.5, 18.5], [-154.5, 22.5], [-160.5, 22.5]]
  },
  {
    code: "baul",
    name: "Baul Songs",
    region: "Bengal (India & Bangladesh)",
    traditionFamily: "South Asian",
    unescoICHStatus: "Inscribed",
    instruments: ["Ektara", "Dotara", "Dubki", "Khamak", "Vocals"],
    keyArtists: ["Lalon Shah", "Purna Das Baul", "Parvathy Baul", "Bapi Das Baul", "Farida Parveen"],
    description: "Baul is a mystical music tradition of Bengal (spanning India and Bangladesh), practiced by wandering minstrels who reject caste and organized religion. Baul songs express a philosophy of divine love, the search for the 'Man of the Heart' (Moner Manush), and spiritual liberation. The tradition blends elements of Sufism, Vaishnavism, and Buddhism. UNESCO inscribed Baul songs in 2008.",
    resources: [
      { title: "UNESCO ICH – Baul Songs", url: "https://ich.unesco.org/en/RL/baul-songs-00107" }
    ],
    polygon: [[85.5, 27.0], [85.5, 21.5], [92.5, 21.5], [92.5, 27.0], [85.5, 27.0]]
  },
  {
    code: "joik",
    name: "Joik (Sami Singing)",
    region: "Sápmi (Northern Scandinavia)",
    traditionFamily: "European",
    unescoICHStatus: "Not Listed",
    instruments: ["Vocals", "Fávdna (Frame Drum)", "Goavddis"],
    keyArtists: ["Mari Boine", "Nils-Aslak Valkeapää", "Sofia Jannok", "Wimme Saari", "Jon Henrik Fjällgren"],
    description: "Joik (luohti/vuolle) is the traditional vocal expression of the Sami people of Northern Scandinavia and the Kola Peninsula. Unlike Western songs 'about' something, a joik is said to 'be' the person, animal, or place it represents—a direct sonic evocation rather than a description. One of the oldest living music traditions in Europe, joik was suppressed for centuries by Christian missionaries but is experiencing a cultural revival.",
    resources: [
      { title: "Sami Cultural Centre", url: "https://www.samikulturguovddas.fi/" }
    ],
    polygon: [[15.0, 70.0], [15.0, 66.0], [30.0, 66.0], [30.0, 70.0], [15.0, 70.0]]
  },
  {
    code: "isicathamiya",
    name: "Isicathamiya",
    region: "KwaZulu-Natal, South Africa",
    traditionFamily: "Southern African",
    unescoICHStatus: "Not Listed",
    instruments: ["A Cappella Vocals", "Body Movement"],
    keyArtists: ["Ladysmith Black Mambazo", "Solomon Linda", "King Star Brothers", "Nqo Brothers"],
    description: "Isicathamiya is an a cappella vocal tradition of the Zulu people of South Africa, made famous internationally by Ladysmith Black Mambazo through their collaboration with Paul Simon on the album 'Graceland.' Meaning 'walking softly,' isicathamiya features tight harmonies, gentle choreography, and competitive performances (ingoma ebusuku or 'night music') held in Durban's migrant worker hostels on Saturday nights.",
    resources: [
      { title: "Smithsonian Folkways – South African A Cappella", url: "https://folkways.si.edu/search?query=isicathamiya" }
    ],
    polygon: [[29.0, -27.0], [29.0, -31.0], [33.0, -31.0], [33.0, -27.0], [29.0, -27.0]]
  },
  {
    code: "beijing-opera",
    name: "Peking Opera (Jingju)",
    region: "Beijing, China",
    traditionFamily: "East Asian Classical",
    unescoICHStatus: "Inscribed",
    instruments: ["Jinghu (Beijing Fiddle)", "Yueqin (Moon Guitar)", "Percussion Ensemble", "Vocals"],
    keyArtists: ["Mei Lanfang", "Cheng Yanqiu", "Zhou Xinfang", "Ma Lianliang", "Zhang Junqiu"],
    description: "Peking opera (jingju) is the preeminent form of Chinese opera, combining singing, dialogue, acrobatics, and martial arts into a highly stylized theatrical art. Originating in Beijing in the late 18th century from a fusion of regional opera styles, it features elaborate costumes, face painting, and codified performance techniques. UNESCO inscribed Peking opera in 2010.",
    resources: [
      { title: "UNESCO ICH – Peking Opera", url: "https://ich.unesco.org/en/RL/peking-opera-00418" }
    ],
    polygon: [[115.5, 41.0], [115.5, 39.0], [117.5, 39.0], [117.5, 41.0], [115.5, 41.0]]
  },
  {
    code: "overtone-singing-mongolia",
    name: "Mongolian Overtone Singing",
    region: "Western Mongolia",
    traditionFamily: "Central Asian",
    unescoICHStatus: "Inscribed",
    instruments: ["Morin Khuur", "Vocals", "Tobshuur"],
    keyArtists: ["Batzorig Vaanchig", "Hosoo", "Khusugtun", "Anda Union", "Epi"],
    description: "Mongolian Khöömii (overtone singing) is a vocal technique where a single singer simultaneously produces two distinct pitches—a fundamental drone and a high-pitched melody of harmonics. Practiced primarily by herders of western Mongolia, the technique imitates the sounds of wind, water, and animals on the steppe. UNESCO inscribed Mongolian Khöömii in 2010, distinct from Tuvan khoomei.",
    resources: [
      { title: "UNESCO ICH – Mongolian Khöömii", url: "https://ich.unesco.org/en/RL/mongolian-art-of-singing-khoomei-00396" }
    ],
    polygon: [[88.0, 50.0], [88.0, 45.0], [97.0, 45.0], [97.0, 50.0], [88.0, 50.0]]
  },
];

// Write data and geo files
for (const t of traditions) {
  const { polygon, ...data } = t;
  data.geojson = `${t.code}.geojson`;

  // Write data file
  writeFileSync(
    join(DATA_DIR, `${t.code}.json`),
    JSON.stringify(data, null, 2) + "\n"
  );

  // Write GeoJSON file
  const geojson = {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: {
          code: t.code,
          name: t.name,
          region: t.region,
          traditionFamily: t.traditionFamily,
        },
        geometry: {
          type: "Polygon",
          coordinates: [polygon],
        },
      },
    ],
  };
  writeFileSync(
    join(GEO_DIR, `${t.code}.geojson`),
    JSON.stringify(geojson) + "\n"
  );
}

console.log(`Generated ${traditions.length} music region files`);
