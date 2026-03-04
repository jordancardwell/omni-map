import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

const PLUGIN_DIR = join(import.meta.dirname, "..", "plugins", "cuisine-regions");
const DATA_DIR = join(PLUGIN_DIR, "data");
const GEO_DIR = join(PLUGIN_DIR, "geo");

mkdirSync(DATA_DIR, { recursive: true });
mkdirSync(GEO_DIR, { recursive: true });

// Each cuisine: code, name, cuisineFamily, description, signatureDishes, keyIngredients,
// cookingTechniques, unescoRecognition, keyRegions, geojson polygons [{region, country, coords}]
const cuisines = [
  {
    code: "french",
    name: "French Cuisine",
    cuisineFamily: "Western European",
    description: "French cuisine is renowned for its refined techniques, rich sauces, and emphasis on fresh, high-quality ingredients. It has profoundly influenced Western culinary traditions and is considered one of the world's great cuisines. Regional diversity ranges from the butter-heavy dishes of Normandy to the olive oil-based fare of Provence.",
    signatureDishes: ["Coq au Vin", "Bouillabaisse", "Ratatouille", "Crème Brûlée", "Croissant", "Soufflé"],
    keyIngredients: ["Butter", "Wine", "Cream", "Herbs de Provence", "Shallots", "Dijon Mustard"],
    cookingTechniques: ["Sautéing", "Braising", "Flambéing", "Sous vide", "Julienne", "Mise en place"],
    unescoRecognition: "French gastronomic meal inscribed on UNESCO Intangible Cultural Heritage list (2010)",
    keyRegions: ["Île-de-France", "Provence", "Burgundy", "Normandy", "Alsace"],
    polygons: [{ region: "France", country: "FR", coords: [[-5.1, 42.3], [-5.1, 51.1], [9.6, 51.1], [9.6, 42.3], [-5.1, 42.3]] }]
  },
  {
    code: "italian",
    name: "Italian Cuisine",
    cuisineFamily: "Western European",
    description: "Italian cuisine celebrates simplicity, using few high-quality ingredients to create bold flavors. Each of Italy's twenty regions boasts distinct culinary traditions, from the rich ragùs of Bologna to the seafood of Sicily. Pasta, olive oil, and fresh produce form the backbone of this beloved culinary tradition.",
    signatureDishes: ["Pizza Margherita", "Risotto alla Milanese", "Ossobuco", "Tiramisu", "Carbonara", "Gelato"],
    keyIngredients: ["Olive Oil", "Tomatoes", "Parmesan", "Basil", "Garlic", "Prosciutto"],
    cookingTechniques: ["Al dente pasta cooking", "Wood-fired baking", "Slow braising", "Curing", "Fresh pasta making"],
    unescoRecognition: "Neapolitan pizza-making (Pizzaiuolo) inscribed on UNESCO list (2017)",
    keyRegions: ["Tuscany", "Emilia-Romagna", "Sicily", "Campania", "Lombardy"],
    polygons: [{ region: "Italy", country: "IT", coords: [[6.6, 36.6], [6.6, 47.1], [18.5, 47.1], [18.5, 36.6], [6.6, 36.6]] }]
  },
  {
    code: "japanese",
    name: "Japanese Cuisine",
    cuisineFamily: "East Asian",
    description: "Japanese cuisine (washoku) emphasizes seasonality, presentation, and umami-rich flavors. It reflects a deep respect for ingredients and a philosophy of balance among the five tastes. From the precision of sushi to the comfort of ramen, Japanese food culture is both an art form and a daily practice.",
    signatureDishes: ["Sushi", "Ramen", "Tempura", "Miso Soup", "Tonkatsu", "Kaiseki"],
    keyIngredients: ["Rice", "Soy Sauce", "Dashi", "Mirin", "Wasabi", "Nori"],
    cookingTechniques: ["Raw preparation (sashimi)", "Deep frying (tempura)", "Grilling (yakitori)", "Fermentation", "Steaming"],
    unescoRecognition: "Washoku inscribed on UNESCO Intangible Cultural Heritage list (2013)",
    keyRegions: ["Kanto", "Kansai", "Hokkaido", "Kyushu", "Okinawa"],
    polygons: [{ region: "Japan", country: "JP", coords: [[129.4, 30], [129.4, 45.5], [145.8, 45.5], [145.8, 30], [129.4, 30]] }]
  },
  {
    code: "chinese-shandong",
    name: "Shandong Cuisine (Lu)",
    cuisineFamily: "Chinese (Eight Great)",
    description: "Shandong (Lu) cuisine is considered the most influential of China's Eight Great Cuisines, forming the foundation of northern Chinese cooking. Known for its fresh seafood preparations, crispy textures, and mastery of broth-based dishes. Quick-frying and deep-frying techniques produce signature crispy textures.",
    signatureDishes: ["Braised Sea Cucumber", "Sweet and Sour Carp", "Dezhou Braised Chicken", "Jiuzhuan Dachang"],
    keyIngredients: ["Seafood", "Vinegar", "Scallions", "Garlic", "Peanuts", "Corn"],
    cookingTechniques: ["Bao (quick-frying)", "Pa (braising)", "Decocting broths", "Deep frying"],
    unescoRecognition: "None specific; Chinese culinary arts widely recognized",
    keyRegions: ["Shandong Province", "Jinan", "Qingdao"],
    polygons: [{ region: "Shandong", country: "CN", coords: [[114.8, 34.4], [114.8, 38.4], [122.7, 38.4], [122.7, 34.4], [114.8, 34.4]] }]
  },
  {
    code: "chinese-sichuan",
    name: "Sichuan Cuisine (Chuan)",
    cuisineFamily: "Chinese (Eight Great)",
    description: "Sichuan cuisine is famous worldwide for its bold, pungent flavors and liberal use of Sichuan peppercorn, which produces the distinctive numbing sensation called 'málà'. This cuisine features complex layering of flavors including spicy, sweet, sour, and savory in single dishes.",
    signatureDishes: ["Mapo Tofu", "Kung Pao Chicken", "Twice-Cooked Pork", "Dan Dan Noodles", "Hot Pot"],
    keyIngredients: ["Sichuan Peppercorn", "Chili Peppers", "Doubanjiang", "Garlic", "Ginger", "Fermented Black Beans"],
    cookingTechniques: ["Dry-frying", "Smoking", "Pickling", "Braising in chili oil", "Wok hei"],
    unescoRecognition: "Chengdu designated UNESCO City of Gastronomy (2010)",
    keyRegions: ["Sichuan Province", "Chengdu", "Chongqing"],
    polygons: [{ region: "Sichuan", country: "CN", coords: [[97.3, 26.0], [97.3, 34.3], [108.5, 34.3], [108.5, 26.0], [97.3, 26.0]] }]
  },
  {
    code: "chinese-cantonese",
    name: "Cantonese Cuisine (Yue)",
    cuisineFamily: "Chinese (Eight Great)",
    description: "Cantonese cuisine is prized for preserving the natural flavors of ingredients through light cooking techniques. It features the world-famous dim sum tradition and an extraordinary range of ingredients. Guangdong's proximity to the sea and tropical climate yields abundant seafood and produce.",
    signatureDishes: ["Dim Sum", "Char Siu", "Wonton Noodle Soup", "Roast Goose", "Steamed Fish"],
    keyIngredients: ["Oyster Sauce", "Soy Sauce", "Ginger", "Scallions", "Rice Wine", "Fresh Seafood"],
    cookingTechniques: ["Steaming", "Stir-frying", "Roasting", "Double-boiling", "Poaching"],
    unescoRecognition: "Shunde designated UNESCO City of Gastronomy (2014)",
    keyRegions: ["Guangdong Province", "Guangzhou", "Hong Kong", "Macau"],
    polygons: [{ region: "Guangdong", country: "CN", coords: [[109.5, 20.2], [109.5, 25.5], [117.2, 25.5], [117.2, 20.2], [109.5, 20.2]] }]
  },
  {
    code: "chinese-jiangsu",
    name: "Jiangsu Cuisine (Su)",
    cuisineFamily: "Chinese (Eight Great)",
    description: "Jiangsu cuisine is known for its soft textures, careful presentation, and moderate seasoning. It emphasizes maintaining the original flavor of ingredients through meticulous cooking techniques. The cuisine reflects the refined culture of the Yangtze River Delta.",
    signatureDishes: ["Sweet and Sour Mandarin Fish", "Lion's Head Meatballs", "Yangzhou Fried Rice", "Nanjing Salted Duck"],
    keyIngredients: ["Freshwater Fish", "Rice", "Sugar", "Vinegar", "Bamboo Shoots", "Tofu"],
    cookingTechniques: ["Stewing", "Braising", "Steaming", "Precise knife work", "Slow simmering"],
    unescoRecognition: "Yangzhou designated UNESCO City of Gastronomy (2019)",
    keyRegions: ["Jiangsu Province", "Nanjing", "Suzhou", "Yangzhou"],
    polygons: [{ region: "Jiangsu", country: "CN", coords: [[116.4, 30.8], [116.4, 35.1], [121.9, 35.1], [121.9, 30.8], [116.4, 30.8]] }]
  },
  {
    code: "chinese-hunan",
    name: "Hunan Cuisine (Xiang)",
    cuisineFamily: "Chinese (Eight Great)",
    description: "Hunan cuisine is characterized by its pure, intense heat from fresh chili peppers, distinguishing it from the numbing spice of Sichuan cooking. The cuisine also features smoked and cured meats, reflecting the province's humid climate and preservation traditions.",
    signatureDishes: ["Chairman Mao's Red-Braised Pork", "Steamed Fish Head with Chopped Chili", "Orange Beef", "Smoked Pork with Dried Vegetables"],
    keyIngredients: ["Fresh Chili Peppers", "Smoked Meats", "Pickled Vegetables", "Shallots", "Garlic", "Fermented Black Beans"],
    cookingTechniques: ["Smoking", "Curing", "Stir-frying", "Steaming", "Pot-roasting"],
    unescoRecognition: "None specific",
    keyRegions: ["Hunan Province", "Changsha", "Dongting Lake region"],
    polygons: [{ region: "Hunan", country: "CN", coords: [[108.8, 24.6], [108.8, 30.1], [114.3, 30.1], [114.3, 24.6], [108.8, 24.6]] }]
  },
  {
    code: "chinese-fujian",
    name: "Fujian Cuisine (Min)",
    cuisineFamily: "Chinese (Eight Great)",
    description: "Fujian cuisine excels in soups and broths, using umami-rich ingredients from both land and sea. The coastal province's culinary tradition combines delicate seasoning with complex layered flavors, particularly in its renowned 'Buddha Jumps Over the Wall' soup.",
    signatureDishes: ["Buddha Jumps Over the Wall", "Oyster Omelette", "Fujian Red Wine Chicken", "Bian Rou"],
    keyIngredients: ["Seafood", "Mushrooms", "Red Rice Wine", "Fish Sauce", "Bamboo Shoots", "Taro"],
    cookingTechniques: ["Slow-simmering broths", "Red wine lees cooking", "Braising", "Pickling"],
    unescoRecognition: "None specific",
    keyRegions: ["Fujian Province", "Fuzhou", "Xiamen", "Quanzhou"],
    polygons: [{ region: "Fujian", country: "CN", coords: [[115.8, 23.5], [115.8, 28.3], [120.7, 28.3], [120.7, 23.5], [115.8, 23.5]] }]
  },
  {
    code: "chinese-zhejiang",
    name: "Zhejiang Cuisine (Zhe)",
    cuisineFamily: "Chinese (Eight Great)",
    description: "Zhejiang cuisine is noted for its fresh, tender flavors and elegant presentation. Using seasonal ingredients from the fertile region around West Lake, it features mellow, non-greasy dishes that highlight the natural taste of premium ingredients.",
    signatureDishes: ["Dongpo Pork", "West Lake Fish in Vinegar", "Longjing Shrimp", "Beggar's Chicken"],
    keyIngredients: ["Shaoxing Wine", "Longjing Tea", "Freshwater Fish", "Bamboo Shoots", "Light Soy Sauce"],
    cookingTechniques: ["Quick-frying", "Braising", "Steaming", "Stewing", "Tea-infusing"],
    unescoRecognition: "Hangzhou designated UNESCO City of Gastronomy (2017)",
    keyRegions: ["Zhejiang Province", "Hangzhou", "Ningbo", "Shaoxing"],
    polygons: [{ region: "Zhejiang", country: "CN", coords: [[118.0, 27.1], [118.0, 31.2], [122.4, 31.2], [122.4, 27.1], [118.0, 27.1]] }]
  },
  {
    code: "chinese-anhui",
    name: "Anhui Cuisine (Hui)",
    cuisineFamily: "Chinese (Eight Great)",
    description: "Anhui cuisine draws heavily from wild ingredients foraged from the Huangshan mountain region. It features rustic, hearty dishes with a focus on stewing and the use of wild herbs, game, and mountain vegetables, reflecting the province's rugged geography.",
    signatureDishes: ["Li Hongzhang Hodgepodge", "Stewed Soft-Shell Turtle", "Bamboo Shoots Cooked in Soy Sauce", "Egg Dumplings"],
    keyIngredients: ["Wild Herbs", "Bamboo Shoots", "Mushrooms", "Ham", "Freshwater Fish", "Tea Leaves"],
    cookingTechniques: ["Stewing", "Braising", "Steaming", "Oil-blanching"],
    unescoRecognition: "None specific",
    keyRegions: ["Anhui Province", "Huangshan", "Hefei"],
    polygons: [{ region: "Anhui", country: "CN", coords: [[114.9, 29.4], [114.9, 34.7], [119.6, 34.7], [119.6, 29.4], [114.9, 29.4]] }]
  },
  {
    code: "north-indian",
    name: "North Indian Cuisine",
    cuisineFamily: "South Asian",
    description: "North Indian cuisine is characterized by its rich, creamy curries, extensive use of dairy, and tandoor-cooked breads and meats. Influenced by Mughal cooking traditions, it features aromatic spice blends (masalas) and slow-cooked dishes. The region's wheat-growing plains make breads like naan and roti staples.",
    signatureDishes: ["Butter Chicken", "Biryani", "Naan", "Tandoori Chicken", "Dal Makhani", "Samosa"],
    keyIngredients: ["Ghee", "Garam Masala", "Yogurt", "Paneer", "Basmati Rice", "Cardamom"],
    cookingTechniques: ["Tandoor cooking", "Dum (slow cooking)", "Tempering (tadka)", "Grinding spice pastes"],
    unescoRecognition: "None specific; several Indian food traditions under consideration",
    keyRegions: ["Punjab", "Delhi", "Uttar Pradesh", "Rajasthan", "Kashmir"],
    polygons: [{ region: "North India", country: "IN", coords: [[68.7, 23.0], [68.7, 37.0], [88.0, 37.0], [88.0, 23.0], [68.7, 23.0]] }]
  },
  {
    code: "south-indian",
    name: "South Indian Cuisine",
    cuisineFamily: "South Asian",
    description: "South Indian cuisine relies on rice, lentils, coconut, and tamarind as its foundation. It is generally lighter and more rice-centric than the North, with a greater emphasis on vegetarian dishes. Fermented batters for dosas and idlis are a hallmark, along with complex sambar and rasam soups.",
    signatureDishes: ["Dosa", "Idli", "Sambar", "Rasam", "Hyderabadi Biryani", "Appam"],
    keyIngredients: ["Coconut", "Curry Leaves", "Tamarind", "Mustard Seeds", "Rice", "Lentils"],
    cookingTechniques: ["Fermentation", "Tempering (tadka)", "Steaming", "Coconut grinding", "Slow-cooking stews"],
    unescoRecognition: "None specific",
    keyRegions: ["Kerala", "Tamil Nadu", "Karnataka", "Andhra Pradesh", "Telangana"],
    polygons: [{ region: "South India", country: "IN", coords: [[73.0, 8.0], [73.0, 23.0], [87.0, 23.0], [87.0, 8.0], [73.0, 8.0]] }]
  },
  {
    code: "thai",
    name: "Thai Cuisine",
    cuisineFamily: "Southeast Asian",
    description: "Thai cuisine is celebrated for its harmonious balance of sweet, sour, salty, bitter, and spicy flavors in each dish. It emphasizes fresh herbs, aromatics, and the interplay of textures. Regional variations range from the fiery curries of the south to the milder, herbal dishes of the north.",
    signatureDishes: ["Pad Thai", "Green Curry", "Tom Yum Goong", "Som Tum", "Massaman Curry", "Mango Sticky Rice"],
    keyIngredients: ["Lemongrass", "Galangal", "Fish Sauce", "Thai Basil", "Coconut Milk", "Chili Peppers"],
    cookingTechniques: ["Wok stir-frying", "Mortar and pestle pounding", "Curry paste making", "Charcoal grilling"],
    unescoRecognition: "None specific; Thai cuisine widely recognized internationally",
    keyRegions: ["Central Thailand", "Northern Thailand", "Southern Thailand", "Isan (Northeast)"],
    polygons: [{ region: "Thailand", country: "TH", coords: [[97.4, 5.6], [97.4, 20.5], [105.6, 20.5], [105.6, 5.6], [97.4, 5.6]] }]
  },
  {
    code: "mexican",
    name: "Mexican Cuisine",
    cuisineFamily: "Latin American",
    description: "Mexican cuisine is a vibrant fusion of indigenous Mesoamerican and Spanish colonial cooking traditions. Built on the foundation of corn, beans, and chili peppers, it features complex moles, diverse salsas, and ancient techniques like nixtamalization. Each region offers distinctive specialties reflecting local ingredients and cultural heritage.",
    signatureDishes: ["Tacos al Pastor", "Mole Poblano", "Tamales", "Chiles en Nogada", "Pozole", "Guacamole"],
    keyIngredients: ["Corn", "Chili Peppers", "Beans", "Avocado", "Lime", "Cilantro"],
    cookingTechniques: ["Nixtamalization", "Slow-roasting", "Stone grinding (molcajete)", "Open-flame charring"],
    unescoRecognition: "Traditional Mexican cuisine inscribed on UNESCO Intangible Cultural Heritage list (2010)",
    keyRegions: ["Oaxaca", "Puebla", "Yucatán", "Mexico City", "Jalisco"],
    polygons: [{ region: "Mexico", country: "MX", coords: [[-117.1, 14.5], [-117.1, 32.7], [-86.7, 32.7], [-86.7, 14.5], [-117.1, 14.5]] }]
  },
  {
    code: "ethiopian",
    name: "Ethiopian Cuisine",
    cuisineFamily: "African",
    description: "Ethiopian cuisine is unique in Africa for its distinctive injera flatbread, complex spice blends, and communal eating traditions. Berbere spice mix and niter kibbeh (spiced butter) form the flavor foundation. The cuisine reflects Ethiopia's ancient culinary heritage and diverse ethnic traditions.",
    signatureDishes: ["Doro Wat", "Injera", "Kitfo", "Tibs", "Shiro", "Misir Wat"],
    keyIngredients: ["Teff", "Berbere Spice", "Niter Kibbeh", "Lentils", "Chickpeas", "Fenugreek"],
    cookingTechniques: ["Slow stewing (wat)", "Injera fermentation", "Spice roasting and blending", "Tartare preparation"],
    unescoRecognition: "None specific",
    keyRegions: ["Addis Ababa", "Amhara", "Tigray", "Oromia", "Gurage"],
    polygons: [{ region: "Ethiopia", country: "ET", coords: [[33.0, 3.4], [33.0, 15.0], [48.0, 15.0], [48.0, 3.4], [33.0, 3.4]] }]
  },
  {
    code: "levantine",
    name: "Levantine Cuisine",
    cuisineFamily: "Middle Eastern",
    description: "Levantine cuisine encompasses the culinary traditions of the Eastern Mediterranean, including Lebanese, Syrian, Palestinian, and Jordanian cooking. It emphasizes mezze culture, olive oil, fresh herbs, and grains. The cuisine celebrates communal dining and features some of the world's most widely adopted dishes.",
    signatureDishes: ["Hummus", "Falafel", "Tabbouleh", "Shawarma", "Kibbeh", "Fattoush"],
    keyIngredients: ["Olive Oil", "Tahini", "Chickpeas", "Sumac", "Za'atar", "Pomegranate"],
    cookingTechniques: ["Charcoal grilling", "Slow roasting", "Mezze preparation", "Pickling and preserving"],
    unescoRecognition: "None specific; multiple Levantine food elements under consideration",
    keyRegions: ["Lebanon", "Syria", "Palestine", "Jordan"],
    polygons: [
      { region: "Lebanon", country: "LB", coords: [[35.1, 33.1], [35.1, 34.7], [36.6, 34.7], [36.6, 33.1], [35.1, 33.1]] },
      { region: "Syria", country: "SY", coords: [[35.7, 32.3], [35.7, 37.3], [42.4, 37.3], [42.4, 32.3], [35.7, 32.3]] },
      { region: "Jordan", country: "JO", coords: [[34.9, 29.2], [34.9, 33.4], [39.3, 33.4], [39.3, 29.2], [34.9, 29.2]] }
    ]
  },
  {
    code: "korean",
    name: "Korean Cuisine",
    cuisineFamily: "East Asian",
    description: "Korean cuisine is built around fermentation, balance, and communal banchan (side dishes). Kimchi, the iconic fermented vegetable dish, is central to every meal. Korean cooking emphasizes the harmony of colors, textures, and the five flavors, with a strong tradition of preserving and fermenting foods.",
    signatureDishes: ["Kimchi", "Bibimbap", "Bulgogi", "Korean BBQ", "Japchae", "Tteokbokki"],
    keyIngredients: ["Gochujang", "Gochugaru", "Sesame Oil", "Doenjang", "Garlic", "Napa Cabbage"],
    cookingTechniques: ["Fermentation (kimchi)", "Tabletop grilling", "Braising (jjigae)", "Pickling"],
    unescoRecognition: "Kimjang (kimchi-making) inscribed on UNESCO Intangible Cultural Heritage list (2013)",
    keyRegions: ["Seoul", "Jeolla Province", "Gyeongsang", "Jeju Island"],
    polygons: [{ region: "South Korea", country: "KR", coords: [[126.0, 34.0], [126.0, 38.6], [129.6, 38.6], [129.6, 34.0], [126.0, 34.0]] }]
  },
  {
    code: "peruvian",
    name: "Peruvian Cuisine",
    cuisineFamily: "Latin American",
    description: "Peruvian cuisine is one of the world's most diverse, blending indigenous Andean traditions with Spanish, African, Chinese (chifa), and Japanese (nikkei) influences. Peru's extraordinary biodiversity—thousands of potato varieties, Amazonian fruits, Pacific seafood—creates unparalleled culinary richness.",
    signatureDishes: ["Ceviche", "Lomo Saltado", "Aji de Gallina", "Causa", "Anticuchos", "Pisco Sour"],
    keyIngredients: ["Aji Peppers", "Potato (4000+ varieties)", "Corn", "Quinoa", "Lime", "Huacatay"],
    cookingTechniques: ["Citrus curing (ceviche)", "Stir-frying (chifa)", "Pachamanca (earth oven)", "Anticucho grilling"],
    unescoRecognition: "None specific; Lima designated as gastronomic capital of Latin America",
    keyRegions: ["Lima", "Cusco", "Arequipa", "Amazon Basin", "Coast"],
    polygons: [{ region: "Peru", country: "PE", coords: [[-81.3, -18.4], [-81.3, -0.04], [-68.7, -0.04], [-68.7, -18.4], [-81.3, -18.4]] }]
  },
  {
    code: "moroccan",
    name: "Moroccan Cuisine",
    cuisineFamily: "North African",
    description: "Moroccan cuisine is a sensory journey of aromatic spices, slow-cooked tagines, and sweet-savory flavor combinations. Influenced by Berber, Arab, Andalusian, and French traditions, it masterfully balances warm spices like cinnamon and cumin with dried fruits and preserved lemons.",
    signatureDishes: ["Tagine", "Couscous", "Pastilla", "Harira", "Mechoui", "Moroccan Mint Tea"],
    keyIngredients: ["Ras el Hanout", "Preserved Lemons", "Saffron", "Cumin", "Argan Oil", "Dates"],
    cookingTechniques: ["Tagine slow-cooking", "Couscous steaming", "Spice blending", "Pastry layering"],
    unescoRecognition: "None specific; Moroccan culinary traditions widely celebrated",
    keyRegions: ["Fez", "Marrakech", "Casablanca", "Essaouira", "Atlas Mountains"],
    polygons: [{ region: "Morocco", country: "MA", coords: [[-13.2, 27.7], [-13.2, 35.9], [-1.0, 35.9], [-1.0, 27.7], [-13.2, 27.7]] }]
  },
  {
    code: "turkish",
    name: "Turkish Cuisine",
    cuisineFamily: "Middle Eastern",
    description: "Turkish cuisine is a rich tapestry woven from Ottoman imperial kitchens, Central Asian nomadic traditions, and Mediterranean influences. It bridges East and West with an emphasis on grilled meats, stuffed vegetables, rich pastries, and an elaborate breakfast culture unmatched worldwide.",
    signatureDishes: ["Kebab", "Baklava", "Lahmacun", "Manti", "İskender", "Pide"],
    keyIngredients: ["Yogurt", "Lamb", "Eggplant", "Bulgur", "Pomegranate Molasses", "Sumac"],
    cookingTechniques: ["Charcoal grilling", "Clay oven baking", "Phyllo dough layering", "Yogurt-based sauces"],
    unescoRecognition: "Turkish coffee culture inscribed on UNESCO list (2013); Gaziantep UNESCO City of Gastronomy (2015)",
    keyRegions: ["Istanbul", "Gaziantep", "Anatolia", "Aegean Coast", "Black Sea Region"],
    polygons: [{ region: "Turkey", country: "TR", coords: [[25.7, 36.0], [25.7, 42.1], [44.8, 42.1], [44.8, 36.0], [25.7, 36.0]] }]
  },
  {
    code: "vietnamese",
    name: "Vietnamese Cuisine",
    cuisineFamily: "Southeast Asian",
    description: "Vietnamese cuisine is celebrated for its fresh herbs, light flavors, and the balance of salty, sweet, sour, and spicy elements. Each dish typically features contrasting textures and temperatures. Regional variations from north to south reflect different climates and cultural influences.",
    signatureDishes: ["Phở", "Bánh Mì", "Gỏi Cuốn", "Bún Chả", "Cà Phê Sữa Đá", "Bánh Xèo"],
    keyIngredients: ["Fish Sauce", "Fresh Herbs", "Rice Noodles", "Lime", "Lemongrass", "Chili"],
    cookingTechniques: ["Broth simmering (phở)", "Fresh rolling", "Charcoal grilling", "Wok stir-frying"],
    unescoRecognition: "None specific; Vietnamese street food culture internationally acclaimed",
    keyRegions: ["Hanoi", "Ho Chi Minh City", "Hue", "Da Nang", "Mekong Delta"],
    polygons: [{ region: "Vietnam", country: "VN", coords: [[102.1, 8.4], [102.1, 23.4], [109.5, 23.4], [109.5, 8.4], [102.1, 8.4]] }]
  },
  {
    code: "greek",
    name: "Greek Cuisine",
    cuisineFamily: "Mediterranean",
    description: "Greek cuisine embodies the Mediterranean diet with its emphasis on olive oil, fresh vegetables, grains, fish, and moderate wine consumption. Rooted in ancient traditions, it celebrates simplicity, communal dining, and seasonal ingredients. Mezze culture and outdoor grilling are central to the Greek food experience.",
    signatureDishes: ["Moussaka", "Souvlaki", "Spanakopita", "Greek Salad", "Gyros", "Baklava"],
    keyIngredients: ["Olive Oil", "Feta Cheese", "Oregano", "Lemon", "Honey", "Phyllo Dough"],
    cookingTechniques: ["Charcoal grilling", "Phyllo pastry baking", "Slow roasting", "Marinating", "Olive oil poaching"],
    unescoRecognition: "Mediterranean diet inscribed on UNESCO list (2013, shared with other Mediterranean countries)",
    keyRegions: ["Athens", "Crete", "Peloponnese", "Thessaloniki", "Greek Islands"],
    polygons: [{ region: "Greece", country: "GR", coords: [[19.4, 34.8], [19.4, 41.8], [29.6, 41.8], [29.6, 34.8], [19.4, 34.8]] }]
  },
  {
    code: "spanish",
    name: "Spanish Cuisine",
    cuisineFamily: "Mediterranean",
    description: "Spanish cuisine is defined by its tapas culture, regional diversity, and celebration of high-quality ingredients prepared simply. From the paellas of Valencia to the pintxos of the Basque Country, each region contributes unique dishes. Spain's culinary scene has also pioneered molecular gastronomy.",
    signatureDishes: ["Paella", "Tapas", "Gazpacho", "Jamón Ibérico", "Tortilla Española", "Churros"],
    keyIngredients: ["Olive Oil", "Saffron", "Pimentón", "Garlic", "Tomatoes", "Ibérico Pork"],
    cookingTechniques: ["Open-fire rice cooking", "Curing (jamón)", "Cold soup preparation", "Plancha grilling"],
    unescoRecognition: "Mediterranean diet inscribed on UNESCO list (2013); multiple Cities of Gastronomy",
    keyRegions: ["Basque Country", "Valencia", "Andalusia", "Catalonia", "Galicia"],
    polygons: [{ region: "Spain", country: "ES", coords: [[-9.3, 36.0], [-9.3, 43.8], [4.3, 43.8], [4.3, 36.0], [-9.3, 36.0]] }]
  },
  {
    code: "brazilian",
    name: "Brazilian Cuisine",
    cuisineFamily: "Latin American",
    description: "Brazilian cuisine is a vibrant fusion of Portuguese, African, and indigenous Tupi influences, producing one of the world's most diverse food cultures. From the churrasco tradition of the south to the dendê oil-based dishes of Bahia, Brazil's continental size ensures remarkable regional variety.",
    signatureDishes: ["Feijoada", "Churrasco", "Moqueca", "Pão de Queijo", "Acarajé", "Coxinha"],
    keyIngredients: ["Black Beans", "Cassava", "Dendê Oil", "Coconut Milk", "Açaí", "Guaraná"],
    cookingTechniques: ["Churrasco (rotisserie grilling)", "Slow bean stewing", "Deep frying", "Moqueca clay pot cooking"],
    unescoRecognition: "None specific; Belém designated UNESCO City of Gastronomy (2015)",
    keyRegions: ["Bahia", "São Paulo", "Rio Grande do Sul", "Minas Gerais", "Pará"],
    polygons: [{ region: "Brazil", country: "BR", coords: [[-73.9, -33.7], [-73.9, 5.3], [-34.8, 5.3], [-34.8, -33.7], [-73.9, -33.7]] }]
  },
  {
    code: "west-african",
    name: "West African Cuisine",
    cuisineFamily: "African",
    description: "West African cuisine features bold, hearty flavors built on starchy staples, rich stews, and complex spice combinations. Shared across nations like Nigeria, Ghana, Senegal, and Mali, the cuisine relies on ingredients like yam, cassava, plantain, and groundnuts. One-pot stews and soups served over fufu or rice are the cornerstone.",
    signatureDishes: ["Jollof Rice", "Fufu and Light Soup", "Suya", "Thiéboudienne", "Egusi Soup", "Waakye"],
    keyIngredients: ["Palm Oil", "Scotch Bonnet Peppers", "Yam", "Cassava", "Groundnuts", "Okra"],
    cookingTechniques: ["Pounding (fufu)", "One-pot stewing", "Suya spice grilling", "Smoking and drying"],
    unescoRecognition: "None specific",
    keyRegions: ["Nigeria", "Ghana", "Senegal", "Mali", "Cameroon"],
    polygons: [
      { region: "Nigeria", country: "NG", coords: [[2.7, 4.3], [2.7, 13.9], [14.7, 13.9], [14.7, 4.3], [2.7, 4.3]] },
      { region: "Ghana", country: "GH", coords: [[-3.3, 4.7], [-3.3, 11.2], [1.2, 11.2], [1.2, 4.7], [-3.3, 4.7]] },
      { region: "Senegal", country: "SN", coords: [[-17.5, 12.3], [-17.5, 16.7], [-11.4, 16.7], [-11.4, 12.3], [-17.5, 12.3]] }
    ]
  },
  {
    code: "caribbean",
    name: "Caribbean Cuisine",
    cuisineFamily: "Latin American",
    description: "Caribbean cuisine is a vibrant melting pot of African, European, South Asian, and indigenous Taíno and Arawak influences. Each island has developed distinctive dishes, but common threads include jerk seasoning, tropical fruits, seafood, and rice-and-bean combinations. The cuisine celebrates bold spices and communal cooking.",
    signatureDishes: ["Jerk Chicken", "Rice and Peas", "Roti", "Ackee and Saltfish", "Callaloo", "Doubles"],
    keyIngredients: ["Scotch Bonnet Peppers", "Allspice", "Coconut", "Plantain", "Rum", "Thyme"],
    cookingTechniques: ["Jerk smoking/grilling", "Curry making", "Slow stewing", "Frying"],
    unescoRecognition: "None specific",
    keyRegions: ["Jamaica", "Trinidad", "Cuba", "Barbados", "Haiti"],
    polygons: [
      { region: "Cuba", country: "CU", coords: [[-85.0, 19.8], [-85.0, 23.3], [-74.1, 23.3], [-74.1, 19.8], [-85.0, 19.8]] },
      { region: "Jamaica", country: "JM", coords: [[-78.4, 17.7], [-78.4, 18.5], [-76.2, 18.5], [-76.2, 17.7], [-78.4, 17.7]] },
      { region: "Trinidad", country: "TT", coords: [[-61.9, 10.0], [-61.9, 10.8], [-60.5, 10.8], [-60.5, 10.0], [-61.9, 10.0]] },
      { region: "Hispaniola", country: "HT", coords: [[-74.5, 17.6], [-74.5, 20.0], [-68.3, 20.0], [-68.3, 17.6], [-74.5, 17.6]] }
    ]
  },
  {
    code: "scandinavian",
    name: "Scandinavian Cuisine",
    cuisineFamily: "Northern European",
    description: "Scandinavian cuisine emphasizes simplicity, purity, and sustainability, drawing from the region's cold-water fish, foraged ingredients, and preserved foods. The New Nordic movement has revitalized ancient techniques like smoking, curing, and fermenting. The cuisine celebrates seasonality and the concept of 'hygge' (coziness) in dining.",
    signatureDishes: ["Smørrebrød", "Gravlax", "Swedish Meatballs", "Smörgåsbord", "Æbleskiver", "Pickled Herring"],
    keyIngredients: ["Salmon", "Dill", "Rye Bread", "Lingonberries", "Cream", "Root Vegetables"],
    cookingTechniques: ["Curing (gravlax)", "Smoking", "Pickling", "Fermenting", "Foraging"],
    unescoRecognition: "None specific; New Nordic Cuisine movement internationally recognized",
    keyRegions: ["Denmark", "Sweden", "Norway", "Finland", "Iceland"],
    polygons: [
      { region: "Denmark", country: "DK", coords: [[8.1, 54.6], [8.1, 57.8], [12.7, 57.8], [12.7, 54.6], [8.1, 54.6]] },
      { region: "Sweden", country: "SE", coords: [[11.1, 55.3], [11.1, 69.1], [24.2, 69.1], [24.2, 55.3], [11.1, 55.3]] },
      { region: "Norway", country: "NO", coords: [[4.6, 58.0], [4.6, 71.2], [31.1, 71.2], [31.1, 58.0], [4.6, 58.0]] }
    ]
  }
];

// Write data/*.json files
for (const c of cuisines) {
  const data = {
    code: c.code,
    name: c.name,
    cuisineFamily: c.cuisineFamily,
    description: c.description,
    signatureDishes: c.signatureDishes,
    keyIngredients: c.keyIngredients,
    cookingTechniques: c.cookingTechniques,
    unescoRecognition: c.unescoRecognition,
    keyRegions: c.keyRegions,
    geojson: `${c.code}.geojson`,
  };
  writeFileSync(join(DATA_DIR, `${c.code}.json`), JSON.stringify(data, null, 2) + "\n");
}

// Write geo/*.geojson files
for (const c of cuisines) {
  const features = c.polygons.map((p) => ({
    type: "Feature",
    properties: {
      code: c.code,
      name: c.name,
      region: p.region,
      country: p.country,
    },
    geometry: {
      type: "Polygon",
      coordinates: [p.coords],
    },
  }));
  const geojson = { type: "FeatureCollection", features };
  writeFileSync(join(GEO_DIR, `${c.code}.geojson`), JSON.stringify(geojson) + "\n");
}

console.log(`Generated ${cuisines.length} cuisine regions (data + geo)`);
