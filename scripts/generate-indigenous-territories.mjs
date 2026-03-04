#!/usr/bin/env node
/**
 * Generates indigenous territory plugin data files.
 * Creates data/*.json and geo/*.geojson for 500+ territories.
 * Data based on known indigenous peoples worldwide.
 */
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

const PLUGIN_DIR = join(import.meta.dirname, "../plugins/indigenous-territories");
const DATA_DIR = join(PLUGIN_DIR, "data");
const GEO_DIR = join(PLUGIN_DIR, "geo");

mkdirSync(DATA_DIR, { recursive: true });
mkdirSync(GEO_DIR, { recursive: true });

// Helper to create a slug from a name
function slugify(name) {
  return name
    .toLowerCase()
    .replace(/['']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// Irregular polygon with 6-8 vertices for more natural shapes
function makeIrregularPolygon(centerLon, centerLat, sizeLon, sizeLat) {
  const numPoints = 6 + Math.floor(Math.random() * 3);
  const coords = [];
  for (let i = 0; i < numPoints; i++) {
    const angle = (2 * Math.PI * i) / numPoints;
    const rLon = (sizeLon / 2) * (0.7 + Math.random() * 0.6);
    const rLat = (sizeLat / 2) * (0.7 + Math.random() * 0.6);
    coords.push([
      Math.round((centerLon + rLon * Math.cos(angle)) * 10) / 10,
      Math.round(Math.max(-85, Math.min(85, centerLat + rLat * Math.sin(angle))) * 10) / 10,
    ]);
  }
  coords.push(coords[0].slice()); // close ring
  return coords;
}

// All territory definitions organized by region
// Each entry: [name, people, language, centerLon, centerLat, sizeLon, sizeLat, description, treaties]
const TERRITORIES = [];

// ============================================================
// NORTH AMERICA - United States & Canada (250+ territories)
// ============================================================

const NORTH_AMERICA_WEST = [
  ["Duwamish", "Duwamish", "Lushootseed", -122.3, 47.6, 1.5, 1.2, "The Duwamish are the indigenous people of the Seattle area in present-day Washington State. They have inhabited the Duwamish River valley and surrounding areas for thousands of years.", ["Treaty of Point Elliott (1855)"]],
  ["Suquamish", "Suquamish", "Lushootseed", -122.6, 47.7, 1.2, 0.8, "The Suquamish people are indigenous to the Puget Sound region, particularly the area around present-day Bainbridge Island and the Kitsap Peninsula.", ["Treaty of Point Elliott (1855)"]],
  ["Muckleshoot", "Muckleshoot", "Lushootseed", -122.2, 47.3, 1.0, 0.9, "The Muckleshoot are a federally recognized tribe in Washington State, descendants of the Duwamish and Puyallup peoples.", ["Treaty of Point Elliott (1855)", "Treaty of Medicine Creek (1854)"]],
  ["Puyallup", "Puyallup", "Lushootseed", -122.4, 47.2, 1.3, 1.0, "The Puyallup people have inhabited the area around present-day Tacoma, Washington and the Puyallup River valley.", ["Treaty of Medicine Creek (1854)"]],
  ["Nisqually", "Nisqually", "Lushootseed", -122.7, 47.0, 1.2, 1.0, "The Nisqually people are indigenous to the Nisqually River watershed in western Washington.", ["Treaty of Medicine Creek (1854)"]],
  ["Snoqualmie", "Snoqualmie", "Lushootseed", -121.8, 47.5, 1.5, 1.3, "The Snoqualmie people are indigenous to the Snoqualmie Valley in western Washington, known for Snoqualmie Falls.", ["Treaty of Point Elliott (1855)"]],
  ["Tulalip", "Tulalip", "Lushootseed", -122.3, 48.1, 1.0, 0.8, "The Tulalip Tribes are a federally recognized confederation of tribes in western Washington.", ["Treaty of Point Elliott (1855)"]],
  ["Lummi", "Lummi", "Lummi", -122.7, 48.8, 1.2, 0.9, "The Lummi Nation are indigenous to the area around Bellingham Bay in Washington State.", ["Treaty of Point Elliott (1855)"]],
  ["Nooksack", "Nooksack", "Nooksack", -122.3, 48.9, 1.0, 0.7, "The Nooksack people are indigenous to the Nooksack River valley in northwestern Washington.", ["Treaty of Point Elliott (1855)"]],
  ["Stillaguamish", "Stillaguamish", "Lushootseed", -122.2, 48.2, 1.0, 0.8, "The Stillaguamish Tribe inhabits the Stillaguamish River valley in western Washington.", ["Treaty of Point Elliott (1855)"]],
  ["Swinomish", "Swinomish", "Lushootseed", -122.5, 48.5, 0.9, 0.7, "The Swinomish people are indigenous to the Skagit River delta area in Washington.", ["Treaty of Point Elliott (1855)"]],
  ["Yakama", "Yakama", "Sahaptin", -120.5, 46.5, 2.5, 2.0, "The Yakama Nation is a confederation of 14 tribes in central Washington, with a large reservation near Yakima.", ["Treaty with the Yakama (1855)"]],
  ["Colville", "Colville", "Salish", -118.5, 48.2, 2.0, 1.5, "The Confederated Tribes of the Colville Reservation include 12 tribes in northeastern Washington.", ["Executive Order (1872)"]],
  ["Spokane", "Spokane", "Salish", -117.4, 47.7, 1.8, 1.5, "The Spokane Tribe is indigenous to the Spokane River area in eastern Washington.", ["Stevens Treaties (1855)"]],
  ["Coeur d'Alene", "Coeur d'Alene", "Salish", -116.8, 47.3, 1.5, 1.5, "The Coeur d'Alene people are indigenous to the area around Coeur d'Alene Lake in northern Idaho.", ["Executive Order (1873)"]],
  ["Nez Perce", "Nez Perce", "Sahaptin", -115.5, 46.0, 3.0, 2.5, "The Nez Perce are indigenous to the Columbia River Plateau, known for Chief Joseph's resistance.", ["Treaty of Walla Walla (1855)"]],
  ["Umatilla", "Umatilla", "Sahaptin", -118.8, 45.7, 2.0, 1.5, "The Confederated Tribes of the Umatilla Indian Reservation include the Cayuse, Umatilla, and Walla Walla tribes.", ["Treaty of Walla Walla (1855)"]],
  ["Warm Springs", "Warm Springs", "Sahaptin", -121.3, 44.8, 2.0, 1.5, "The Confederated Tribes of Warm Springs in central Oregon include the Wasco, Warm Springs, and Paiute peoples.", ["Treaty with Tribes of Middle Oregon (1855)"]],
  ["Klamath", "Klamath", "Klamath-Modoc", -121.8, 42.5, 2.0, 1.8, "The Klamath Tribes are indigenous to southern Oregon and northern California around Upper Klamath Lake.", ["Treaty of 1864"]],
  ["Chinook", "Chinook", "Chinookan", -123.8, 46.2, 1.5, 1.0, "The Chinook people are indigenous to the lower Columbia River and Pacific coast of present-day Washington and Oregon.", []],
  ["Tillamook", "Tillamook", "Tillamook", -123.8, 45.5, 1.2, 1.0, "The Tillamook people are indigenous to the northern Oregon coast, known as skilled fishers and whalers.", []],
  ["Siletz", "Siletz", "Athabaskan", -123.9, 44.7, 1.5, 1.2, "The Confederated Tribes of Siletz Indians include over 27 tribes from western Oregon.", ["Coast Treaty (1855)"]],
  ["Grande Ronde", "Grande Ronde", "Kalapuya", -123.4, 45.1, 1.5, 1.0, "The Confederated Tribes of Grand Ronde include Kalapuya, Molalla, Clackamas, and other peoples of western Oregon.", ["Dayton Treaty (1855)"]],
  ["Coquille", "Coquille", "Miluk", -124.2, 43.2, 1.0, 0.8, "The Coquille people are indigenous to the Coquille River valley on the southern Oregon coast.", []],
  ["Coos", "Coos", "Hanis", -124.3, 43.4, 1.0, 0.7, "The Coos people are indigenous to the area around Coos Bay on the southern Oregon coast.", []],
  ["Kalapuya", "Kalapuya", "Kalapuyan", -123.0, 44.5, 2.0, 1.5, "The Kalapuya people are indigenous to the Willamette Valley of western Oregon.", []],
  ["Modoc", "Modoc", "Klamath-Modoc", -121.5, 41.8, 1.5, 1.0, "The Modoc people are indigenous to the area around Tule Lake and the Lost River in southern Oregon and northern California.", []],
  ["Shasta", "Shasta", "Shastan", -122.5, 41.5, 1.5, 1.2, "The Shasta people are indigenous to the Shasta Valley and surrounding mountains in northern California.", []],
  ["Yurok", "Yurok", "Yurok", -124.0, 41.5, 1.0, 1.0, "The Yurok are the largest Native tribe in California, indigenous to the Klamath River area.", []],
  ["Karuk", "Karuk", "Karuk", -123.5, 41.7, 1.2, 1.0, "The Karuk people are indigenous to the middle Klamath River area in northwestern California.", []],
  ["Hoopa", "Hoopa", "Athabaskan", -123.7, 41.1, 1.0, 0.8, "The Hoopa Valley Tribe is indigenous to the Trinity River area in northwestern California.", ["Treaty of 1864"]],
  ["Wiyot", "Wiyot", "Wiyot", -124.1, 40.8, 0.8, 0.7, "The Wiyot people are indigenous to Humboldt Bay and the lower Eel River in northwestern California.", []],
  ["Pomo", "Pomo", "Pomoan", -123.0, 39.0, 1.5, 1.5, "The Pomo are indigenous to the area north of San Francisco, particularly around Clear Lake and the Russian River.", []],
  ["Miwok", "Miwok", "Miwok", -120.5, 38.0, 2.0, 2.0, "The Miwok people are indigenous to central California, from the Sierra Nevada foothills to the coast.", []],
  ["Ohlone", "Ohlone", "Ohlone", -122.0, 37.5, 1.5, 1.5, "The Ohlone (Costanoan) people are indigenous to the San Francisco Bay Area and central California coast.", []],
  ["Esselen", "Esselen", "Esselen", -121.8, 36.4, 1.0, 1.0, "The Esselen people are indigenous to the Big Sur coast and inland valleys of the central California coast.", []],
  ["Salinan", "Salinan", "Salinan", -121.2, 35.8, 1.2, 1.2, "The Salinan people are indigenous to the Salinas Valley in central California.", []],
  ["Chumash", "Chumash", "Chumashan", -119.8, 34.5, 2.0, 1.0, "The Chumash are indigenous to the southern California coast, known for their plank canoes (tomols).", []],
  ["Tongva", "Tongva", "Tongva", -118.2, 34.0, 1.5, 1.0, "The Tongva (Gabrielino) people are indigenous to the Los Angeles Basin and the Southern Channel Islands.", []],
  ["Cahuilla", "Cahuilla", "Cahuilla", -116.5, 33.7, 1.5, 1.2, "The Cahuilla people are indigenous to the inland areas of southern California, including the Coachella Valley.", []],
  ["Luiseno", "Luiseño", "Luiseño", -117.3, 33.3, 1.2, 0.8, "The Luiseño people are indigenous to the area of present-day northern San Diego County, California.", []],
  ["Kumeyaay", "Kumeyaay", "Kumeyaay", -116.8, 32.7, 2.0, 1.0, "The Kumeyaay people are indigenous to the San Diego area and northern Baja California.", []],
  ["Serrano", "Serrano", "Serrano", -117.2, 34.3, 1.0, 0.8, "The Serrano people are indigenous to the San Bernardino Mountains of southern California.", []],
  ["Mojave", "Mojave", "Mohave", -114.6, 35.0, 2.0, 2.0, "The Mojave people are indigenous to the Mojave Desert along the Colorado River.", []],
  ["Quechan", "Quechan", "Quechan", -114.6, 32.8, 1.5, 1.0, "The Quechan (Yuma) people are indigenous to the lower Colorado River area near present-day Yuma, Arizona.", []],
  ["Maidu", "Maidu", "Maiduan", -121.0, 39.5, 1.5, 1.5, "The Maidu people are indigenous to the Sacramento Valley and Sierra Nevada foothills of northeastern California.", []],
  ["Wintu", "Wintu", "Wintuan", -122.3, 40.6, 1.5, 1.5, "The Wintu people are indigenous to the upper Sacramento River valley in northern California.", []],
  ["Yana", "Yana", "Yanan", -122.0, 40.2, 1.0, 0.8, "The Yana people, including the Yahi, are indigenous to the area between the Sacramento Valley and the Cascade Range.", []],
  ["Washoe", "Washoe", "Washoe", -120.0, 39.0, 1.5, 1.5, "The Washoe people are indigenous to the area around Lake Tahoe in the Sierra Nevada.", []],
  ["Northern Paiute", "Northern Paiute", "Numic", -118.5, 40.0, 3.0, 3.0, "The Northern Paiute are indigenous to the Great Basin region of Nevada, Oregon, and California.", []],
  ["Western Shoshone", "Western Shoshone", "Numic", -116.0, 40.5, 4.0, 3.5, "The Western Shoshone are indigenous to a vast area of the Great Basin, primarily in Nevada.", ["Treaty of Ruby Valley (1863)"]],
  ["Goshute", "Goshute", "Numic", -113.8, 40.2, 2.0, 1.5, "The Goshute people are indigenous to the desert regions of western Utah and eastern Nevada.", []],
  ["Ute", "Ute", "Numic", -109.5, 39.5, 4.0, 3.0, "The Ute people are indigenous to a large area of present-day Utah, Colorado, and New Mexico.", ["Treaty of 1868"]],
  ["Southern Paiute", "Southern Paiute", "Numic", -113.0, 37.0, 4.0, 2.5, "The Southern Paiute are indigenous to the Colorado Plateau region spanning Utah, Arizona, Nevada, and California.", []],
  ["Eastern Shoshone", "Eastern Shoshone", "Numic", -108.5, 43.0, 3.0, 2.5, "The Eastern Shoshone are indigenous to the Wind River area of Wyoming.", ["Fort Bridger Treaty (1868)"]],
  ["Bannock", "Bannock", "Numic", -112.5, 43.0, 2.5, 2.0, "The Bannock people are indigenous to the Snake River Plain of southeastern Idaho.", ["Fort Bridger Treaty (1868)"]],
];

const NORTH_AMERICA_PLAINS = [
  ["Blackfoot", "Blackfoot", "Algonquian", -112.0, 48.5, 4.0, 3.0, "The Blackfoot Confederacy includes the Siksika, Kainai, and Piikani peoples of the northern Great Plains.", ["Treaty 7 (1877)"]],
  ["Crow", "Crow", "Siouan", -108.0, 45.5, 3.5, 2.5, "The Crow (Apsáalooke) people are indigenous to the Yellowstone River area of Montana.", ["Fort Laramie Treaty (1851)"]],
  ["Northern Cheyenne", "Northern Cheyenne", "Algonquian", -106.5, 45.5, 2.5, 2.0, "The Northern Cheyenne are indigenous to the northern Great Plains, now in southeastern Montana.", ["Fort Laramie Treaty (1868)"]],
  ["Assiniboine", "Assiniboine", "Siouan", -106.0, 48.5, 3.0, 2.0, "The Assiniboine (Nakoda) people are indigenous to the northern Great Plains of Montana and Saskatchewan.", []],
  ["Gros Ventre", "Gros Ventre", "Algonquian", -108.5, 48.0, 2.5, 1.5, "The Gros Ventre (Aaniiih) people are indigenous to the north-central Montana plains.", ["Fort Laramie Treaty (1851)"]],
  ["Mandan", "Mandan", "Siouan", -101.5, 47.0, 2.0, 1.5, "The Mandan people are indigenous to the upper Missouri River area of North Dakota, known as skilled farmers.", ["Fort Laramie Treaty (1851)"]],
  ["Hidatsa", "Hidatsa", "Siouan", -102.0, 47.5, 2.0, 1.5, "The Hidatsa people are indigenous to the Knife River area of North Dakota, closely related to the Mandan.", ["Fort Laramie Treaty (1851)"]],
  ["Arikara", "Arikara", "Caddoan", -101.0, 46.5, 2.0, 1.5, "The Arikara people are indigenous to the Missouri River area of the Dakotas, known as skilled farmers.", ["Fort Laramie Treaty (1851)"]],
  ["Lakota", "Lakota", "Siouan", -103.0, 44.0, 4.0, 3.5, "The Lakota (Teton Sioux) are the westernmost of the Sioux peoples, known for leaders like Sitting Bull and Crazy Horse.", ["Fort Laramie Treaty (1868)"]],
  ["Dakota", "Dakota", "Siouan", -96.0, 44.5, 3.0, 2.5, "The Dakota (Santee Sioux) are indigenous to the Minnesota and eastern Dakotas region.", ["Treaty of Traverse des Sioux (1851)"]],
  ["Nakota", "Nakota", "Siouan", -99.0, 45.0, 2.5, 2.0, "The Nakota (Yankton Sioux) are indigenous to the central Dakotas and southern Manitoba.", ["Treaty of Fort Laramie (1851)"]],
  ["Arapaho", "Arapaho", "Algonquian", -105.5, 42.0, 3.5, 3.0, "The Arapaho people are indigenous to the central Great Plains, from Wyoming to Colorado.", ["Fort Laramie Treaty (1851)"]],
  ["Southern Cheyenne", "Southern Cheyenne", "Algonquian", -101.0, 37.5, 3.5, 3.0, "The Southern Cheyenne are indigenous to the southern Great Plains of Colorado, Kansas, and Oklahoma.", ["Treaty of Fort Wise (1861)"]],
  ["Comanche", "Comanche", "Numic", -100.0, 34.0, 4.0, 3.5, "The Comanche are indigenous to the southern Great Plains, known as exceptional horsemen and the dominant force on the southern plains.", ["Treaty of Medicine Lodge (1867)"]],
  ["Kiowa", "Kiowa", "Kiowa-Tanoan", -99.0, 35.5, 3.0, 2.5, "The Kiowa people are indigenous to the southern Great Plains, known for their rich artistic traditions.", ["Treaty of Medicine Lodge (1867)"]],
  ["Pawnee", "Pawnee", "Caddoan", -99.0, 41.0, 3.0, 2.5, "The Pawnee are indigenous to the central Great Plains of Nebraska and Kansas, known as astronomers and farmers.", ["Treaty of Table Rock (1857)"]],
  ["Ponca", "Ponca", "Siouan", -98.0, 42.5, 2.0, 1.5, "The Ponca people are indigenous to the confluence of the Niobrara and Missouri Rivers in Nebraska.", ["Treaty of 1858"]],
  ["Omaha", "Omaha", "Siouan", -96.5, 42.0, 2.0, 1.5, "The Omaha people are indigenous to the area around present-day Omaha, Nebraska.", ["Treaty of 1854"]],
  ["Kaw", "Kaw", "Siouan", -96.5, 39.0, 2.5, 2.0, "The Kaw (Kansa) people are indigenous to the Kansas River area, the state of Kansas was named after them.", ["Treaty of 1825"]],
  ["Osage", "Osage", "Siouan", -95.5, 37.0, 3.0, 2.5, "The Osage Nation is indigenous to the central United States, from Missouri to Oklahoma, known for their wealth from oil.", ["Treaty of Fort Clark (1808)"]],
  ["Quapaw", "Quapaw", "Siouan", -94.0, 36.0, 2.0, 1.5, "The Quapaw (Ogaxpa) people are indigenous to the Arkansas River valley.", ["Treaty of 1818"]],
  ["Iowa", "Iowa", "Siouan", -95.0, 41.5, 2.0, 1.5, "The Iowa (Ioway) people are indigenous to the area of present-day Iowa, Minnesota, and Missouri.", ["Treaty of Prairie du Chien (1830)"]],
  ["Otoe-Missouria", "Otoe-Missouria", "Siouan", -96.0, 40.5, 2.0, 1.5, "The Otoe-Missouria are Siouan peoples indigenous to the Missouri River area of Nebraska.", ["Treaty of Prairie du Chien (1830)"]],
  ["Wichita", "Wichita", "Caddoan", -98.0, 35.0, 2.5, 2.0, "The Wichita people are indigenous to the southern Plains, from Kansas to Texas, known as skilled farmers and traders.", []],
  ["Tonkawa", "Tonkawa", "Tonkawan", -97.5, 31.5, 2.0, 2.0, "The Tonkawa people are indigenous to central Texas, known as skilled buffalo hunters.", []],
];

const NORTH_AMERICA_EAST = [
  ["Ojibwe", "Ojibwe", "Algonquian", -88.0, 46.5, 4.0, 3.0, "The Ojibwe (Chippewa/Anishinaabe) are one of the largest Indigenous groups in North America, indigenous to the Great Lakes region.", ["Treaty of La Pointe (1854)"]],
  ["Menominee", "Menominee", "Algonquian", -88.5, 45.0, 2.0, 1.5, "The Menominee people are indigenous to the area of present-day Wisconsin and upper Michigan.", ["Treaty of Wolf River (1854)"]],
  ["Ho-Chunk", "Ho-Chunk", "Siouan", -89.5, 43.5, 2.0, 1.5, "The Ho-Chunk (Winnebago) people are indigenous to the area of present-day Wisconsin and Illinois.", ["Treaty of 1837"]],
  ["Potawatomi", "Potawatomi", "Algonquian", -87.0, 42.0, 3.0, 2.5, "The Potawatomi people are indigenous to the Great Lakes region, part of the Council of Three Fires with the Ojibwe and Odawa.", ["Treaty of Chicago (1833)"]],
  ["Odawa", "Odawa", "Algonquian", -85.0, 44.5, 2.5, 2.0, "The Odawa (Ottawa) people are indigenous to the northern Great Lakes region, known as skilled traders.", ["Treaty of Detroit (1855)"]],
  ["Wyandot", "Wyandot", "Iroquoian", -83.0, 41.0, 2.5, 2.0, "The Wyandot (Huron-Wendat) are an Iroquoian people indigenous to the Great Lakes region.", ["Treaty of Upper Sandusky (1842)"]],
  ["Miami", "Miami", "Algonquian", -86.0, 40.5, 2.5, 2.0, "The Miami people are indigenous to the area of present-day Indiana and Ohio.", ["Treaty of Greenville (1795)"]],
  ["Shawnee", "Shawnee", "Algonquian", -83.5, 39.5, 3.0, 2.5, "The Shawnee people are indigenous to the Ohio Valley, known for leader Tecumseh's resistance movement.", ["Treaty of Greenville (1795)"]],
  ["Kickapoo", "Kickapoo", "Algonquian", -89.0, 41.0, 2.0, 1.5, "The Kickapoo people are indigenous to the area of present-day Wisconsin and Illinois.", ["Treaty of Edwardsville (1819)"]],
  ["Sauk", "Sauk", "Algonquian", -90.5, 41.5, 2.5, 2.0, "The Sauk (Sac) people are indigenous to the upper Mississippi and Rock River area of Wisconsin and Illinois.", ["Treaty of St. Louis (1804)"]],
  ["Meskwaki", "Meskwaki", "Algonquian", -91.0, 42.0, 2.0, 1.5, "The Meskwaki (Fox) people are indigenous to the upper Mississippi Valley area of Wisconsin and Iowa.", ["Treaty of St. Louis (1804)"]],
  ["Illinois", "Illinois Confederacy", "Algonquian", -89.5, 39.5, 3.0, 3.0, "The Illinois Confederacy (Illiniwek) were indigenous to the area of present-day Illinois and surrounding states.", []],
  ["Haudenosaunee", "Haudenosaunee", "Iroquoian", -76.0, 43.0, 3.0, 2.0, "The Haudenosaunee (Iroquois) Confederacy includes the Mohawk, Oneida, Onondaga, Cayuga, Seneca, and Tuscarora nations.", ["Treaty of Canandaigua (1794)"]],
  ["Mohawk", "Mohawk", "Iroquoian", -74.0, 43.5, 2.0, 1.5, "The Mohawk are the easternmost nation of the Haudenosaunee Confederacy, Keepers of the Eastern Door.", ["Treaty of Canandaigua (1794)"]],
  ["Oneida", "Oneida", "Iroquoian", -75.5, 43.0, 1.5, 1.2, "The Oneida are one of the six nations of the Haudenosaunee Confederacy in present-day New York.", ["Treaty of Canandaigua (1794)"]],
  ["Onondaga", "Onondaga", "Iroquoian", -76.2, 43.0, 1.5, 1.2, "The Onondaga are the central fire keepers of the Haudenosaunee Confederacy in present-day New York.", ["Treaty of Canandaigua (1794)"]],
  ["Cayuga", "Cayuga", "Iroquoian", -76.8, 42.7, 1.5, 1.2, "The Cayuga are one of the six nations of the Haudenosaunee Confederacy, around Cayuga Lake.", ["Treaty of Canandaigua (1794)"]],
  ["Seneca", "Seneca", "Iroquoian", -77.8, 42.5, 2.0, 1.5, "The Seneca are the westernmost nation of the Haudenosaunee Confederacy, Keepers of the Western Door.", ["Treaty of Canandaigua (1794)"]],
  ["Tuscarora", "Tuscarora", "Iroquoian", -79.0, 43.2, 1.5, 1.0, "The Tuscarora joined the Haudenosaunee as the sixth nation in 1722 after migrating from Carolina.", ["Treaty of Canandaigua (1794)"]],
  ["Lenape", "Lenape", "Algonquian", -75.0, 40.5, 2.5, 2.0, "The Lenape (Delaware) are indigenous to the area of present-day New Jersey, eastern Pennsylvania, and Delaware.", ["Treaty of Penn (1682)"]],
  ["Wampanoag", "Wampanoag", "Algonquian", -70.5, 41.7, 1.5, 1.0, "The Wampanoag people are indigenous to southeastern Massachusetts and Rhode Island, known for their encounter with the Pilgrims.", []],
  ["Narragansett", "Narragansett", "Algonquian", -71.5, 41.5, 1.0, 0.8, "The Narragansett people are indigenous to present-day Rhode Island.", []],
  ["Pequot", "Pequot", "Algonquian", -72.0, 41.4, 1.0, 0.8, "The Pequot people are indigenous to southeastern Connecticut.", ["Treaty of Hartford (1638)"]],
  ["Mohegan", "Mohegan", "Algonquian", -72.2, 41.5, 1.0, 0.8, "The Mohegan people are indigenous to the Thames River area of southeastern Connecticut.", []],
  ["Abenaki", "Abenaki", "Algonquian", -72.0, 44.0, 2.5, 2.5, "The Abenaki people are indigenous to Vermont, New Hampshire, Maine, and southern Quebec.", []],
  ["Penobscot", "Penobscot", "Algonquian", -68.8, 45.0, 2.0, 2.5, "The Penobscot people are indigenous to the Penobscot River valley in Maine.", []],
  ["Passamaquoddy", "Passamaquoddy", "Algonquian", -67.0, 45.2, 1.5, 1.5, "The Passamaquoddy people are indigenous to the St. Croix River area at the Maine-New Brunswick border.", []],
  ["Mi'kmaq", "Mi'kmaq", "Algonquian", -63.0, 46.0, 4.0, 3.0, "The Mi'kmaq are indigenous to the Atlantic provinces of Canada and parts of Maine.", ["Peace and Friendship Treaties (1725-1779)"]],
  ["Powhatan", "Powhatan", "Algonquian", -77.0, 37.5, 2.5, 2.0, "The Powhatan Confederacy was indigenous to the Virginia tidewater area, known for the encounter with Jamestown settlers.", []],
  ["Catawba", "Catawba", "Siouan", -81.0, 35.0, 2.0, 1.5, "The Catawba people are indigenous to the Catawba River valley of the Carolinas.", ["Treaty of Nation Ford (1840)"]],
];

const NORTH_AMERICA_SOUTHEAST = [
  ["Cherokee", "Cherokee", "Iroquoian", -83.5, 35.5, 3.5, 2.5, "The Cherokee are one of the largest indigenous nations in the US, originally from the southeastern woodlands. Forced removal on the Trail of Tears in 1838.", ["Treaty of New Echota (1835)"]],
  ["Chickasaw", "Chickasaw", "Muskogean", -89.0, 34.5, 2.5, 2.0, "The Chickasaw are indigenous to the southeastern US, in present-day Mississippi, Alabama, and Tennessee.", ["Treaty of Pontotoc (1832)"]],
  ["Choctaw", "Choctaw", "Muskogean", -89.5, 32.5, 3.0, 2.5, "The Choctaw are indigenous to the southeastern US, the first of the Five Civilized Tribes removed via the Trail of Tears.", ["Treaty of Dancing Rabbit Creek (1830)"]],
  ["Muscogee", "Muscogee", "Muskogean", -85.5, 33.0, 3.0, 2.5, "The Muscogee (Creek) are indigenous to the southeastern US, known for the Creek Confederacy.", ["Treaty of Cusseta (1832)"]],
  ["Seminole", "Seminole", "Muskogean", -81.5, 27.5, 3.0, 3.0, "The Seminole are indigenous to Florida, formed from various southeastern groups. Known for resistance to removal.", ["Treaty of Moultrie Creek (1823)"]],
  ["Miccosukee", "Miccosukee", "Muskogean", -80.5, 25.8, 1.5, 1.0, "The Miccosukee people are indigenous to the Florida Everglades.", []],
  ["Calusa", "Calusa", "Calusa", -81.8, 26.5, 1.5, 1.5, "The Calusa were indigenous to the southwest coast of Florida, known as powerful maritime people.", []],
  ["Timucua", "Timucua", "Timucuan", -82.0, 29.5, 2.5, 2.5, "The Timucua were indigenous to northern and central Florida and southeastern Georgia.", []],
  ["Apalachee", "Apalachee", "Muskogean", -84.5, 30.5, 2.0, 1.5, "The Apalachee people were indigenous to the Florida panhandle and southern Georgia.", []],
  ["Yuchi", "Yuchi", "Yuchean", -85.0, 34.5, 2.0, 1.5, "The Yuchi people are indigenous to the Tennessee River valley in the southeastern US.", []],
  ["Natchez", "Natchez", "Natchez", -91.5, 31.5, 1.5, 1.5, "The Natchez people are indigenous to the lower Mississippi River area, known for their complex chiefdom.", []],
  ["Tunica", "Tunica", "Tunica", -91.0, 31.0, 1.5, 1.0, "The Tunica people are indigenous to the lower Mississippi Valley, known as skilled traders.", []],
  ["Caddo", "Caddo", "Caddoan", -94.5, 33.0, 3.0, 2.5, "The Caddo are indigenous to the area where Texas, Louisiana, Arkansas, and Oklahoma meet, known as mound builders.", ["Treaty of 1835"]],
  ["Atakapa", "Atakapa", "Atakapan", -93.0, 30.0, 2.0, 1.5, "The Atakapa people are indigenous to the Gulf Coast of southwestern Louisiana and southeastern Texas.", []],
  ["Chitimacha", "Chitimacha", "Chitimacha", -91.5, 29.8, 1.5, 1.0, "The Chitimacha people are indigenous to the area around the Atchafalaya Basin in Louisiana.", []],
  ["Coushatta", "Coushatta", "Muskogean", -92.5, 30.5, 1.5, 1.0, "The Coushatta (Koasati) people are indigenous to the southeastern US, now in Louisiana and Texas.", []],
];

const NORTH_AMERICA_SOUTHWEST = [
  ["Navajo", "Navajo", "Athabaskan", -109.5, 36.0, 4.0, 3.0, "The Navajo (Diné) are the largest federally recognized tribe in the US, indigenous to the Four Corners region.", ["Treaty of Bosque Redondo (1868)"]],
  ["Hopi", "Hopi", "Uto-Aztecan", -110.5, 35.8, 1.5, 1.0, "The Hopi people are indigenous to northeastern Arizona, living in some of the oldest continuously inhabited villages in North America.", []],
  ["Zuni", "Zuni", "Zuni", -108.8, 35.1, 1.5, 1.0, "The Zuni people are indigenous to the Zuni River valley in western New Mexico.", []],
  ["Pueblo of Acoma", "Acoma Pueblo", "Keresan", -107.6, 35.0, 1.0, 0.8, "The Pueblo of Acoma, known as Sky City, is one of the oldest continuously inhabited communities in the US.", []],
  ["Pueblo of Laguna", "Laguna Pueblo", "Keresan", -107.4, 35.0, 1.0, 0.7, "The Pueblo of Laguna is indigenous to west-central New Mexico.", []],
  ["Pueblo of Taos", "Taos Pueblo", "Tiwa", -105.6, 36.4, 0.8, 0.6, "Taos Pueblo has been continuously inhabited for over 1,000 years and is a UNESCO World Heritage Site.", []],
  ["Pueblo of San Ildefonso", "San Ildefonso Pueblo", "Tewa", -106.1, 35.9, 0.7, 0.5, "San Ildefonso Pueblo is known for its distinctive black-on-black pottery tradition.", []],
  ["Pueblo of Santa Clara", "Santa Clara Pueblo", "Tewa", -106.1, 36.0, 0.7, 0.5, "Santa Clara Pueblo is indigenous to the area near present-day Española, New Mexico.", []],
  ["Pueblo of Ohkay Owingeh", "Ohkay Owingeh", "Tewa", -106.0, 36.1, 0.7, 0.5, "Ohkay Owingeh (San Juan Pueblo) is the site of the first Spanish colonial capital of New Mexico.", []],
  ["Pueblo of Cochiti", "Cochiti Pueblo", "Keresan", -106.3, 35.6, 0.7, 0.5, "Cochiti Pueblo is indigenous to the area along the Rio Grande south of Santa Fe.", []],
  ["Pueblo of Santo Domingo", "Santo Domingo Pueblo", "Keresan", -106.4, 35.5, 0.7, 0.5, "Santo Domingo (Kewa) Pueblo is one of the largest and most traditional of the Rio Grande Pueblos.", []],
  ["Pueblo of Jemez", "Jemez Pueblo", "Towa", -106.8, 35.6, 0.8, 0.6, "Jemez Pueblo is the sole remaining Towa-speaking community in New Mexico.", []],
  ["Pueblo of Isleta", "Isleta Pueblo", "Tiwa", -106.7, 34.9, 0.8, 0.6, "Isleta Pueblo is one of the largest of the Rio Grande Pueblos, south of Albuquerque.", []],
  ["Pueblo of Sandia", "Sandia Pueblo", "Tiwa", -106.5, 35.2, 0.6, 0.4, "Sandia Pueblo is indigenous to the area north of Albuquerque at the base of the Sandia Mountains.", []],
  ["Apache", "Apache", "Athabaskan", -109.0, 33.5, 4.0, 3.0, "The Apache are indigenous to the American Southwest, known for leaders like Geronimo and Cochise.", []],
  ["Mescalero Apache", "Mescalero Apache", "Athabaskan", -105.8, 33.2, 2.0, 1.5, "The Mescalero Apache are indigenous to the Sacramento Mountains of southern New Mexico.", []],
  ["Jicarilla Apache", "Jicarilla Apache", "Athabaskan", -107.0, 36.8, 2.0, 1.5, "The Jicarilla Apache are indigenous to the area of northern New Mexico and southern Colorado.", []],
  ["San Carlos Apache", "San Carlos Apache", "Athabaskan", -110.5, 33.3, 2.0, 1.5, "The San Carlos Apache are indigenous to southeastern Arizona.", []],
  ["White Mountain Apache", "White Mountain Apache", "Athabaskan", -110.0, 34.0, 1.5, 1.2, "The White Mountain Apache are indigenous to the White Mountains of east-central Arizona.", []],
  ["Tohono O'odham", "Tohono O'odham", "Uto-Aztecan", -111.8, 32.0, 2.5, 1.5, "The Tohono O'odham are indigenous to the Sonoran Desert of southern Arizona and northern Mexico.", []],
  ["Akimel O'odham", "Akimel O'odham", "Uto-Aztecan", -112.0, 33.2, 1.5, 1.0, "The Akimel O'odham (Pima) are indigenous to central and southern Arizona along the Gila River.", []],
  ["Yavapai", "Yavapai", "Yuman", -112.0, 34.5, 2.0, 1.5, "The Yavapai people are indigenous to central Arizona.", []],
  ["Havasupai", "Havasupai", "Yuman", -112.7, 36.2, 1.0, 0.8, "The Havasupai people are indigenous to the Grand Canyon, known for Havasu Falls.", []],
  ["Hualapai", "Hualapai", "Yuman", -113.5, 35.5, 2.0, 1.5, "The Hualapai people are indigenous to the Grand Canyon area of northwestern Arizona.", []],
  ["Cocopah", "Cocopah", "Yuman", -114.5, 32.5, 1.0, 0.8, "The Cocopah people are indigenous to the Colorado River delta area in southwestern Arizona.", []],
];

const CANADA = [
  ["Cree", "Cree", "Algonquian", -100.0, 54.0, 8.0, 5.0, "The Cree are one of the largest Indigenous groups in Canada, spanning from Alberta to Quebec.", ["Treaty 6 (1876)", "Treaty 9 (1905)"]],
  ["Dene", "Dene", "Athabaskan", -115.0, 62.0, 8.0, 5.0, "The Dene people are indigenous to the subarctic regions of Canada's Northwest Territories.", ["Treaty 8 (1899)", "Treaty 11 (1921)"]],
  ["Inuit Nunangat", "Inuit", "Inuktitut", -80.0, 68.0, 20.0, 10.0, "The Inuit are indigenous to the Arctic regions of Canada, known for their adaptation to extreme environments.", ["Nunavut Land Claims Agreement (1993)"]],
  ["Inuvialuit", "Inuvialuit", "Inuvialuktun", -134.0, 69.0, 8.0, 5.0, "The Inuvialuit are indigenous to the western Canadian Arctic.", ["Inuvialuit Final Agreement (1984)"]],
  ["Métis", "Métis", "Michif", -97.5, 50.0, 6.0, 4.0, "The Métis are a distinct Indigenous people with mixed First Nations and European ancestry, centered in the Red River area.", ["Manitoba Act (1870)"]],
  ["Tlingit", "Tlingit", "Tlingit", -135.0, 58.5, 4.0, 3.0, "The Tlingit people are indigenous to the Pacific Northwest coast of Alaska and British Columbia.", []],
  ["Haida", "Haida", "Haida", -132.5, 53.5, 3.0, 2.0, "The Haida people are indigenous to Haida Gwaii (Queen Charlotte Islands) in British Columbia, known for their totem poles.", []],
  ["Tsimshian", "Tsimshian", "Tsimshianic", -130.5, 54.5, 2.5, 2.0, "The Tsimshian people are indigenous to the northwestern coast of British Columbia.", []],
  ["Nuu-chah-nulth", "Nuu-chah-nulth", "Nuu-chah-nulth", -126.0, 49.5, 2.5, 2.0, "The Nuu-chah-nulth people are indigenous to the west coast of Vancouver Island, known as skilled whalers.", []],
  ["Kwakwaka'wakw", "Kwakwaka'wakw", "Kwak'wala", -127.0, 51.0, 2.5, 2.0, "The Kwakwaka'wakw are indigenous to northern Vancouver Island and the adjacent mainland coast of BC.", []],
  ["Coast Salish", "Coast Salish", "Salish", -123.0, 49.0, 3.0, 2.0, "The Coast Salish peoples are indigenous to the coastal areas of British Columbia and Washington State.", []],
  ["Nlaka'pamux", "Nlaka'pamux", "Salish", -121.3, 50.3, 2.0, 1.5, "The Nlaka'pamux (Thompson) people are indigenous to the interior of British Columbia.", []],
  ["Secwepemc", "Secwepemc", "Salish", -120.0, 51.5, 3.0, 2.5, "The Secwepemc (Shuswap) people are indigenous to the south-central interior of British Columbia.", []],
  ["Syilx", "Syilx", "Salish", -119.5, 50.0, 2.0, 1.5, "The Syilx (Okanagan) people are indigenous to the Okanagan Valley of British Columbia.", []],
  ["Stó:lō", "Stó:lō", "Halkomelem", -122.0, 49.2, 1.5, 0.8, "The Stó:lō people are indigenous to the Fraser Valley of British Columbia.", []],
  ["Gitxsan", "Gitxsan", "Tsimshianic", -128.0, 55.5, 2.5, 2.0, "The Gitxsan people are indigenous to the upper Skeena River area of British Columbia.", []],
  ["Wet'suwet'en", "Wet'suwet'en", "Athabaskan", -126.5, 54.5, 2.5, 2.0, "The Wet'suwet'en people are indigenous to the Bulkley River area of British Columbia.", []],
  ["Carrier", "Carrier", "Athabaskan", -124.0, 54.0, 3.0, 2.5, "The Carrier (Dakelh) people are indigenous to the central interior of British Columbia.", []],
  ["Ktunaxa", "Ktunaxa", "Ktunaxa", -116.0, 49.5, 2.5, 2.0, "The Ktunaxa (Kootenay) people are indigenous to southeastern British Columbia and neighboring areas.", []],
  ["Algonquin", "Algonquin", "Algonquian", -76.0, 46.5, 3.0, 2.5, "The Algonquin people are indigenous to the Ottawa River valley in Ontario and Quebec.", []],
  ["Mohawk of Kahnawake", "Mohawk", "Iroquoian", -73.7, 45.4, 1.0, 0.8, "The Mohawk community of Kahnawake is located on the south shore of the St. Lawrence River near Montreal.", []],
  ["Wendat-Huron", "Wendat", "Iroquoian", -79.5, 44.5, 2.5, 2.0, "The Wendat (Huron) people are indigenous to the area between Lake Simcoe and Georgian Bay in Ontario.", []],
  ["Anishinaabe", "Anishinaabe", "Algonquian", -82.0, 46.0, 4.0, 3.0, "The Anishinaabe encompasses the Ojibwe, Odawa, and Potawatomi peoples of the Great Lakes and Ontario.", ["Robinson-Huron Treaty (1850)"]],
  ["Innu", "Innu", "Algonquian", -63.0, 52.0, 6.0, 5.0, "The Innu are indigenous to the interior of Labrador and eastern Quebec.", []],
  ["Atikamekw", "Atikamekw", "Algonquian", -74.0, 47.5, 3.0, 2.0, "The Atikamekw people are indigenous to the upper St. Maurice River area in Quebec.", []],
  ["Maliseet", "Maliseet", "Algonquian", -67.5, 46.5, 2.0, 1.5, "The Maliseet (Wolastoqiyik) people are indigenous to the Saint John River valley in New Brunswick.", ["Peace and Friendship Treaties"]],
  ["Beothuk", "Beothuk", "Beothuk", -56.0, 49.0, 3.0, 2.0, "The Beothuk were the indigenous people of Newfoundland. Tragically, the Beothuk are considered extinct as a distinct people.", []],
  ["Naskapi", "Naskapi", "Algonquian", -65.0, 55.0, 5.0, 4.0, "The Naskapi are indigenous to the Labrador Peninsula of eastern Canada, known as caribou hunters.", ["Northeastern Quebec Agreement (1978)"]],
  ["Blackfoot (Siksika)", "Siksika", "Algonquian", -113.0, 50.5, 2.5, 1.5, "The Siksika (Blackfoot proper) are indigenous to southern Alberta, part of the Blackfoot Confederacy.", ["Treaty 7 (1877)"]],
  ["Piikani", "Piikani", "Algonquian", -113.5, 49.5, 2.5, 1.5, "The Piikani (Peigan) are part of the Blackfoot Confederacy in southern Alberta.", ["Treaty 7 (1877)"]],
  ["Kainai", "Kainai", "Algonquian", -113.0, 49.0, 2.0, 1.0, "The Kainai (Blood) are part of the Blackfoot Confederacy, with a large reserve in southern Alberta.", ["Treaty 7 (1877)"]],
  ["Stoney Nakoda", "Stoney Nakoda", "Siouan", -115.0, 51.0, 2.0, 1.5, "The Stoney Nakoda are indigenous to the Rocky Mountain foothills of Alberta.", ["Treaty 7 (1877)"]],
  ["Tsuu T'ina", "Tsuu T'ina", "Athabaskan", -114.3, 50.9, 1.5, 1.0, "The Tsuu T'ina (Sarcee) are an Athabaskan-speaking people indigenous to the Calgary area of Alberta.", ["Treaty 7 (1877)"]],
];

const MEXICO_CENTRAL_AMERICA = [
  ["Nahua", "Nahua", "Nahuatl", -98.5, 19.5, 3.0, 2.0, "The Nahua are the largest Indigenous group in Mexico, descendants of the Aztec Empire.", []],
  ["Maya", "Maya", "Mayan", -89.0, 18.0, 4.0, 3.5, "The Maya people are indigenous to southern Mexico, Guatemala, Belize, and Honduras, known for their advanced civilization.", []],
  ["Zapotec", "Zapotec", "Zapotecan", -96.5, 16.5, 2.5, 2.0, "The Zapotec are indigenous to the Oaxaca region of southern Mexico, builders of Monte Albán.", []],
  ["Mixtec", "Mixtec", "Mixtecan", -97.5, 17.0, 2.5, 2.0, "The Mixtec people are indigenous to western Oaxaca and neighboring states in southern Mexico.", []],
  ["Otomí", "Otomí", "Otomian", -99.5, 20.0, 2.0, 1.5, "The Otomí are indigenous to the central Mexican highlands.", []],
  ["Totonac", "Totonac", "Totonacan", -97.0, 20.0, 1.5, 1.5, "The Totonac are indigenous to eastern Mexico, Veracruz and Puebla states.", []],
  ["Purépecha", "Purépecha", "Purépecha", -102.0, 19.5, 2.0, 1.5, "The Purépecha (Tarascan) people are indigenous to Michoacán, western Mexico.", []],
  ["Huichol", "Huichol", "Uto-Aztecan", -104.5, 22.0, 2.0, 1.5, "The Huichol (Wixárika) people are indigenous to the Sierra Madre Occidental of western Mexico.", []],
  ["Yaqui", "Yaqui", "Uto-Aztecan", -110.0, 27.5, 2.0, 1.5, "The Yaqui people are indigenous to the Sonoran Desert of northwestern Mexico.", []],
  ["Tarahumara", "Tarahumara", "Uto-Aztecan", -107.5, 27.0, 3.0, 2.5, "The Tarahumara (Rarámuri) are indigenous to the Copper Canyon region of Chihuahua, known as exceptional runners.", []],
  ["Seri", "Seri", "Seri", -112.0, 29.0, 1.5, 1.0, "The Seri (Comcáac) people are indigenous to the coast of Sonora and Tiburón Island.", []],
  ["Mayo", "Mayo", "Uto-Aztecan", -109.5, 26.0, 2.0, 1.5, "The Mayo (Yoreme) people are indigenous to Sinaloa and Sonora in northwestern Mexico.", []],
  ["Tzeltal", "Tzeltal", "Mayan", -92.5, 16.8, 1.5, 1.0, "The Tzeltal are a Maya people indigenous to the highlands of Chiapas, Mexico.", []],
  ["Tzotzil", "Tzotzil", "Mayan", -92.8, 16.7, 1.5, 1.0, "The Tzotzil are a Maya people indigenous to the central highlands of Chiapas, Mexico.", []],
  ["Ch'ol", "Ch'ol", "Mayan", -92.0, 17.5, 1.5, 1.0, "The Ch'ol are a Maya people indigenous to northern Chiapas, Mexico.", []],
  ["Mazatec", "Mazatec", "Popolocan", -96.8, 18.0, 1.5, 1.0, "The Mazatec people are indigenous to northern Oaxaca, Mexico.", []],
  ["Chinantec", "Chinantec", "Chinantecan", -96.0, 17.5, 1.5, 1.0, "The Chinantec people are indigenous to the Chinantla region of Oaxaca, Mexico.", []],
  ["K'iche'", "K'iche'", "Mayan", -91.2, 14.8, 1.5, 1.0, "The K'iche' are the largest Maya group in Guatemala, authors of the Popol Vuh.", []],
  ["Kaqchikel", "Kaqchikel", "Mayan", -90.8, 14.6, 1.5, 1.0, "The Kaqchikel are a Maya people indigenous to the central highlands of Guatemala.", []],
  ["Mam", "Mam", "Mayan", -91.8, 15.0, 1.5, 1.0, "The Mam are a Maya people indigenous to the western highlands of Guatemala.", []],
  ["Q'eqchi'", "Q'eqchi'", "Mayan", -89.5, 15.5, 1.5, 1.2, "The Q'eqchi' are a Maya people indigenous to the Verapaces region of Guatemala.", []],
  ["Garifuna", "Garifuna", "Arawakan", -87.5, 15.8, 2.0, 0.8, "The Garifuna are an Afro-Indigenous people along the Caribbean coast of Central America.", []],
  ["Lenca", "Lenca", "Lencan", -88.0, 14.5, 1.5, 1.0, "The Lenca people are indigenous to Honduras and El Salvador.", []],
  ["Miskito", "Miskito", "Misumalpan", -84.5, 14.0, 2.5, 1.5, "The Miskito people are indigenous to the Mosquito Coast of Honduras and Nicaragua.", []],
  ["Kuna", "Kuna", "Chibchan", -78.5, 9.0, 1.5, 1.0, "The Kuna (Guna) people are indigenous to the San Blas Islands and eastern Panama.", []],
  ["Bribri", "Bribri", "Chibchan", -83.5, 9.5, 1.0, 0.8, "The Bribri people are indigenous to the Talamanca region of Costa Rica.", []],
  ["Ngäbe-Buglé", "Ngäbe-Buglé", "Chibchan", -82.0, 8.5, 1.5, 1.0, "The Ngäbe-Buglé are the largest indigenous group in Panama.", []],
];

const SOUTH_AMERICA = [
  ["Yanomami", "Yanomami", "Yanomaman", -63.0, 2.5, 4.0, 3.0, "The Yanomami are indigenous to the Amazon rainforest along the Brazil-Venezuela border, one of the largest isolated indigenous groups.", []],
  ["Kayapó", "Kayapó", "Jê", -52.0, -7.0, 3.0, 2.5, "The Kayapó people are indigenous to the Brazilian Amazon, known for their environmental activism.", []],
  ["Guaraní", "Guaraní", "Tupian", -56.0, -23.0, 5.0, 4.0, "The Guaraní are indigenous to Paraguay, Brazil, Argentina, and Bolivia, one of the most populous Indigenous groups in South America.", []],
  ["Quechua", "Quechua", "Quechuan", -72.0, -13.5, 5.0, 8.0, "The Quechua are indigenous to the Andes, descendants of the Inca Empire, the most spoken Indigenous language family in the Americas.", []],
  ["Aymara", "Aymara", "Aymaran", -68.5, -16.5, 3.0, 3.0, "The Aymara people are indigenous to the Altiplano of the Andes in Bolivia and Peru.", []],
  ["Mapuche", "Mapuche", "Mapudungun", -72.0, -38.5, 4.0, 4.0, "The Mapuche are indigenous to south-central Chile and Argentina, known for their centuries-long resistance.", []],
  ["Wayuu", "Wayuu", "Arawakan", -72.0, 11.5, 2.0, 1.5, "The Wayuu are indigenous to the Guajira Peninsula spanning Colombia and Venezuela.", []],
  ["Emberá", "Emberá", "Chocoan", -77.0, 5.5, 2.5, 2.0, "The Emberá people are indigenous to the Pacific coast of Colombia and Panama.", []],
  ["Nasa", "Nasa", "Páez", -76.0, 2.8, 1.5, 1.5, "The Nasa (Páez) people are indigenous to the southwestern highlands of Colombia.", []],
  ["U'wa", "U'wa", "Chibchan", -72.5, 6.5, 1.5, 1.0, "The U'wa people are indigenous to the Sierra Nevada del Cocuy in Colombia.", []],
  ["Shuar", "Shuar", "Jivaroan", -78.0, -3.0, 2.5, 2.0, "The Shuar are indigenous to the Amazonian lowlands of Ecuador and Peru.", []],
  ["Asháninka", "Asháninka", "Arawakan", -74.0, -11.0, 3.0, 2.5, "The Asháninka are one of the largest indigenous groups in the Peruvian Amazon.", []],
  ["Shipibo-Conibo", "Shipibo-Conibo", "Panoan", -74.5, -8.0, 2.0, 2.0, "The Shipibo-Conibo are indigenous to the Ucayali River basin in the Peruvian Amazon.", []],
  ["Waorani", "Waorani", "Waorani", -77.0, -1.5, 2.0, 1.5, "The Waorani people are indigenous to the Amazonian region of eastern Ecuador.", []],
  ["Kichwa", "Kichwa", "Quechuan", -77.5, -0.5, 2.0, 1.5, "The Kichwa people are indigenous to the highlands and Amazon of Ecuador.", []],
  ["Tikuna", "Tikuna", "Tikuna", -69.5, -3.5, 2.0, 1.5, "The Tikuna are indigenous to the upper Amazon region where Brazil, Colombia, and Peru meet.", []],
  ["Xavante", "Xavante", "Jê", -52.5, -13.0, 2.5, 2.0, "The Xavante (A'uwẽ) are indigenous to the Mato Grosso state of central Brazil.", []],
  ["Terena", "Terena", "Arawakan", -55.0, -20.5, 2.0, 1.5, "The Terena people are indigenous to Mato Grosso do Sul in western Brazil.", []],
  ["Kaingang", "Kaingang", "Jê", -51.0, -25.0, 3.0, 2.0, "The Kaingang are indigenous to southern Brazil, one of the most populous Indigenous groups in the country.", []],
  ["Munduruku", "Munduruku", "Tupian", -57.0, -5.5, 2.5, 2.0, "The Munduruku are indigenous to the Tapajós River area of the Brazilian Amazon.", []],
  ["Ticuna", "Ticuna (Brazil)", "Tikuna", -69.0, -4.0, 2.0, 1.5, "The Ticuna in Brazil are one of the most populous indigenous groups in the Brazilian Amazon.", []],
  ["Pataxó", "Pataxó", "Maxakalían", -39.5, -16.5, 2.0, 1.5, "The Pataxó people are indigenous to the Atlantic coast of Bahia, Brazil.", []],
  ["Aché", "Aché", "Tupian", -55.5, -24.0, 1.5, 1.5, "The Aché people are indigenous to the eastern forests of Paraguay.", []],
  ["Wichí", "Wichí", "Matacoan", -63.0, -23.0, 3.0, 2.0, "The Wichí people are indigenous to the Gran Chaco region of northern Argentina.", []],
  ["Diaguita", "Diaguita", "Kakán", -67.0, -29.0, 2.5, 3.0, "The Diaguita are indigenous to the northwestern Argentine and Chilean Andes.", []],
  ["Selk'nam", "Selk'nam", "Chon", -69.5, -54.0, 3.0, 2.0, "The Selk'nam (Ona) were indigenous to Tierra del Fuego at the southern tip of South America.", []],
  ["Tehuelche", "Tehuelche", "Chon", -69.0, -45.0, 4.0, 5.0, "The Tehuelche are indigenous to the Patagonian steppe of Argentina.", []],
  ["Warao", "Warao", "Warao", -62.0, 9.0, 2.0, 1.5, "The Warao people are indigenous to the Orinoco Delta of Venezuela.", []],
  ["Pemón", "Pemón", "Cariban", -62.0, 5.5, 2.5, 2.0, "The Pemón are indigenous to the Gran Sabana region of southeastern Venezuela.", []],
  ["Makuxi", "Makuxi", "Cariban", -60.5, 3.0, 2.0, 1.5, "The Makuxi are indigenous to the borderlands of Brazil, Guyana, and Venezuela.", []],
  ["Toba", "Toba (Qom)", "Guaycuruan", -60.0, -25.5, 2.5, 2.0, "The Toba (Qom) people are indigenous to the Gran Chaco region of Argentina, Paraguay, and Bolivia.", []],
  ["Yukpa", "Yukpa", "Cariban", -73.0, 10.0, 1.5, 1.0, "The Yukpa people are indigenous to the Sierra de Perijá mountains along the Colombia-Venezuela border.", []],
  ["Awá-Guajá", "Awá-Guajá", "Tupian", -46.0, -3.0, 1.5, 1.5, "The Awá-Guajá are one of the most endangered uncontacted peoples, indigenous to Maranhão, Brazil.", []],
  ["Waimiri-Atroari", "Waimiri-Atroari", "Cariban", -61.0, -1.5, 2.0, 1.5, "The Waimiri-Atroari are indigenous to the area between Amazonas and Roraima states in Brazil.", []],
  ["Matsés", "Matsés", "Panoan", -73.5, -5.5, 2.0, 1.5, "The Matsés people are indigenous to the border region between Peru and Brazil in the Amazon.", []],
  ["Arhuaco", "Arhuaco", "Chibchan", -73.5, 10.8, 1.0, 0.8, "The Arhuaco (Ika) people are indigenous to the Sierra Nevada de Santa Marta in Colombia.", []],
  ["Kogi", "Kogi", "Chibchan", -73.8, 11.0, 1.0, 0.8, "The Kogi people are indigenous to the Sierra Nevada de Santa Marta in Colombia, known as guardians of the Earth.", []],
  ["Wiwa", "Wiwa", "Chibchan", -73.3, 10.9, 0.8, 0.6, "The Wiwa are indigenous to the Sierra Nevada de Santa Marta in Colombia.", []],
];

const OCEANIA = [
  ["Aboriginal Australians - Yolngu", "Yolngu", "Yolngu Matha", 136.5, -12.5, 3.0, 2.0, "The Yolngu are indigenous to Arnhem Land in northern Australia, known for their didgeridoo tradition.", []],
  ["Aboriginal Australians - Pitjantjatjara", "Pitjantjatjara", "Western Desert", 131.0, -26.0, 4.0, 3.0, "The Pitjantjatjara are indigenous to the Western Desert region of central Australia.", []],
  ["Aboriginal Australians - Warlpiri", "Warlpiri", "Warlpiri", 131.5, -21.0, 3.0, 2.5, "The Warlpiri are indigenous to the Tanami Desert of central Australia.", []],
  ["Aboriginal Australians - Arrernte", "Arrernte", "Arrernte", 134.0, -24.0, 3.0, 2.5, "The Arrernte are indigenous to the area around Alice Springs in central Australia.", []],
  ["Aboriginal Australians - Noongar", "Noongar", "Noongar", 117.0, -33.0, 4.0, 3.0, "The Noongar are indigenous to the southwest corner of Western Australia.", []],
  ["Aboriginal Australians - Kamilaroi", "Kamilaroi", "Gamilaraay", 149.0, -30.0, 3.0, 2.5, "The Kamilaroi (Gamilaraay) are indigenous to northeastern New South Wales.", []],
  ["Aboriginal Australians - Wurundjeri", "Wurundjeri", "Woiwurrung", 145.0, -37.8, 1.5, 1.0, "The Wurundjeri are indigenous to the area of present-day Melbourne, Australia.", []],
  ["Aboriginal Australians - Gadigal", "Gadigal", "Dharug", 151.2, -33.9, 1.0, 0.8, "The Gadigal are indigenous to the area of present-day Sydney, Australia.", []],
  ["Aboriginal Australians - Tiwi", "Tiwi", "Tiwi", 130.5, -11.5, 2.0, 1.0, "The Tiwi are indigenous to the Tiwi Islands north of Darwin, Australia.", []],
  ["Aboriginal Australians - Bundjalung", "Bundjalung", "Bundjalung", 153.0, -29.0, 2.0, 2.0, "The Bundjalung are indigenous to the northern coast of New South Wales, Australia.", []],
  ["Aboriginal Australians - Luritja", "Luritja", "Western Desert", 131.0, -24.0, 3.0, 2.0, "The Luritja are indigenous to the area west of Alice Springs in central Australia.", []],
  ["Aboriginal Australians - Nyungar", "Nyungar", "Nyungar", 118.5, -34.0, 3.0, 2.5, "The Nyungar people are indigenous to the southern coast of Western Australia.", []],
  ["Torres Strait Islanders", "Torres Strait Islanders", "Torres Strait Creole", 143.0, -10.0, 3.0, 1.5, "The Torres Strait Islanders are indigenous to the islands between Australia and Papua New Guinea.", []],
  ["Māori", "Māori", "Te Reo Māori", 176.0, -39.0, 4.0, 5.0, "The Māori are the indigenous Polynesian people of New Zealand (Aotearoa).", ["Treaty of Waitangi (1840)"]],
  ["Ngāi Tahu", "Ngāi Tahu", "Te Reo Māori", 171.0, -44.0, 4.0, 3.0, "Ngāi Tahu is the principal Māori iwi (tribe) of the South Island of New Zealand.", ["Ngāi Tahu Claims Settlement Act (1998)"]],
  ["Ngāpuhi", "Ngāpuhi", "Te Reo Māori", 174.0, -35.5, 2.0, 1.5, "Ngāpuhi is the largest Māori iwi, indigenous to the Northland region of New Zealand.", ["Treaty of Waitangi (1840)"]],
  ["Tainui", "Tainui", "Te Reo Māori", 175.5, -37.8, 2.0, 1.5, "Tainui is a confederation of Māori iwi in the Waikato region of New Zealand.", ["Waikato Raupatu Claims Settlement Act (1995)"]],
  ["Native Hawaiian", "Native Hawaiian", "Hawaiian", -157.0, 21.0, 4.0, 2.0, "Native Hawaiians are the indigenous Polynesian people of the Hawaiian Islands.", []],
  ["Chamorro", "Chamorro", "Chamorro", 144.8, 13.4, 1.5, 1.0, "The Chamorro are indigenous to the Mariana Islands, including Guam.", []],
  ["Samoan", "Samoan", "Samoan", -172.0, -13.8, 2.0, 1.0, "The Samoan people are indigenous to the Samoan Islands in the South Pacific.", []],
  ["Tongan", "Tongan", "Tongan", -175.2, -21.2, 1.5, 1.0, "The Tongan people are indigenous to the Kingdom of Tonga in the South Pacific.", []],
  ["Fijian", "iTaukei", "Fijian", 178.0, -18.0, 2.0, 1.5, "The iTaukei are the indigenous people of Fiji.", []],
  ["Papua New Guinean Highlands", "Highland peoples", "Trans-New Guinea", 145.0, -6.0, 3.0, 2.0, "The Highland peoples of Papua New Guinea represent hundreds of distinct cultures in the mountainous interior.", []],
  ["Kanaky", "Kanak", "Kanak languages", 165.5, -21.5, 2.0, 1.0, "The Kanak are the indigenous Melanesian people of New Caledonia (Kanaky).", ["Matignon Agreements (1988)"]],
];

const AFRICA = [
  ["San", "San", "Khoisan", 21.0, -22.0, 6.0, 5.0, "The San (Bushmen) are among the oldest indigenous peoples on Earth, indigenous to southern Africa.", []],
  ["Khoi", "Khoikhoi", "Khoisan", 19.0, -30.0, 4.0, 3.0, "The Khoikhoi (Khoi) are indigenous to southwestern Africa, historically pastoralists.", []],
  ["Maasai", "Maasai", "Maa", 36.5, -2.5, 3.0, 3.0, "The Maasai are indigenous to southern Kenya and northern Tanzania, known for their pastoralist culture.", []],
  ["Ogiek", "Ogiek", "Ogiek", 35.5, -0.5, 1.5, 1.5, "The Ogiek are indigenous hunter-gatherers of the Mau Forest in Kenya.", []],
  ["Tuareg", "Tuareg", "Tamasheq", 5.0, 20.0, 8.0, 6.0, "The Tuareg are indigenous to the Sahara Desert, known as the Blue People for their indigo-dyed clothing.", []],
  ["Amazigh", "Amazigh", "Tamazight", -3.0, 33.0, 6.0, 4.0, "The Amazigh (Berber) peoples are indigenous to North Africa, from Morocco to Libya.", []],
  ["Hadza", "Hadza", "Hadza", 35.0, -3.8, 1.5, 1.0, "The Hadza are one of the last remaining hunter-gatherer peoples in Africa, indigenous to Tanzania.", []],
  ["Pygmy - Mbuti", "Mbuti", "Bantu languages", 28.5, 1.5, 3.0, 2.0, "The Mbuti are indigenous to the Ituri Forest of the Democratic Republic of Congo.", []],
  ["Pygmy - Baka", "Baka", "Ubangian", 14.0, 3.0, 3.0, 2.0, "The Baka people are indigenous to the tropical forests of Cameroon, Republic of Congo, and Gabon.", []],
  ["Himba", "Himba", "Otjiherero", 13.5, -18.5, 2.0, 2.0, "The Himba are indigenous to the Kunene region of Namibia, known for their ochre body paint.", []],
  ["Herero", "Herero", "Otjiherero", 18.0, -22.0, 3.0, 2.5, "The Herero people are indigenous to Namibia and Botswana.", []],
  ["Nama", "Nama", "Khoekhoegowab", 17.0, -28.5, 3.0, 2.5, "The Nama are indigenous to Namibia and South Africa, the largest group of the Khoikhoi.", []],
  ["Zulu", "Zulu", "isiZulu", 30.5, -29.0, 3.0, 2.5, "The Zulu are the largest ethnic group in South Africa, known for their warrior traditions.", []],
  ["Xhosa", "Xhosa", "isiXhosa", 28.0, -32.0, 3.0, 2.5, "The Xhosa people are indigenous to the Eastern Cape of South Africa.", []],
  ["Tswana", "Tswana", "Setswana", 25.0, -24.5, 3.0, 2.5, "The Tswana people are indigenous to Botswana and South Africa.", []],
  ["Batwa", "Batwa", "Kinyarwanda", 29.5, -2.0, 2.0, 2.0, "The Batwa (Twa) are indigenous to the forests around the Great Lakes region of Central Africa.", []],
  ["Samburu", "Samburu", "Maa", 37.0, 1.5, 2.0, 1.5, "The Samburu are indigenous to north-central Kenya, closely related to the Maasai.", []],
  ["Turkana", "Turkana", "Turkana", 36.0, 3.0, 2.5, 2.0, "The Turkana are indigenous to the arid region around Lake Turkana in northwestern Kenya.", []],
  ["Dinka", "Dinka", "Nilotic", 29.0, 7.0, 3.0, 3.0, "The Dinka are the largest ethnic group in South Sudan, indigenous to the Nile Basin.", []],
  ["Nuer", "Nuer", "Nilotic", 31.0, 8.0, 2.5, 2.0, "The Nuer people are indigenous to the Nile Valley in South Sudan and Ethiopia.", []],
  ["Mursi", "Mursi", "Surmic", 36.0, 5.5, 1.0, 0.8, "The Mursi are indigenous to the Omo Valley of southwestern Ethiopia, known for their lip plates.", []],
  ["Hamer", "Hamer", "Omotic", 36.5, 5.0, 1.5, 1.0, "The Hamer people are indigenous to the Omo Valley of southwestern Ethiopia.", []],
  ["Fulani", "Fulani", "Fulfulde", -5.0, 13.0, 10.0, 4.0, "The Fulani are one of the largest nomadic groups worldwide, spread across West and Central Africa.", []],
  ["Wodaabe", "Wodaabe", "Fulfulde", 10.0, 15.0, 4.0, 3.0, "The Wodaabe are a subgroup of the Fulani, known for the Gerewol beauty contest.", []],
  ["Dogon", "Dogon", "Dogon", -3.0, 14.5, 1.5, 1.0, "The Dogon are indigenous to the Bandiagara Escarpment in Mali, known for their astronomy and mask traditions.", []],
  ["Berber - Kabyle", "Kabyle", "Kabyle", 4.0, 36.5, 2.0, 1.0, "The Kabyle are an Amazigh people indigenous to the Kabylie region of northern Algeria.", []],
  ["Berber - Rif", "Riffians", "Tarifit", -4.0, 35.0, 2.0, 1.0, "The Riffians are an Amazigh people indigenous to the Rif Mountains of northern Morocco.", []],
  ["Oromo", "Oromo", "Afaan Oromoo", 39.0, 8.0, 4.0, 3.0, "The Oromo are the largest ethnic group in Ethiopia, indigenous to the central and southern highlands.", []],
  ["Somali", "Somali", "Somali", 45.0, 5.0, 5.0, 5.0, "The Somali people are indigenous to the Horn of Africa, spanning Somalia, Ethiopia, Djibouti, and Kenya.", []],
  ["Afar", "Afar", "Afar", 41.0, 12.0, 3.0, 3.0, "The Afar people are indigenous to the Danakil Desert region of Ethiopia, Eritrea, and Djibouti.", []],
];

const ASIA = [
  ["Ainu", "Ainu", "Ainu", 143.5, 43.5, 3.0, 2.5, "The Ainu are the indigenous people of Hokkaido, Japan, and the Kuril Islands.", []],
  ["Adivasi - Gond", "Gond", "Gondi", 80.0, 22.0, 4.0, 3.0, "The Gond are one of the largest Adivasi (tribal) groups in central India.", []],
  ["Adivasi - Santhal", "Santhal", "Santhali", 87.0, 23.5, 3.0, 2.0, "The Santhal are one of the largest indigenous groups in India, in Jharkhand and West Bengal.", []],
  ["Adivasi - Bhil", "Bhil", "Bhili", 74.0, 23.0, 3.0, 2.5, "The Bhil are one of the largest Adivasi groups in western India.", []],
  ["Adivasi - Munda", "Munda", "Mundari", 85.0, 23.0, 2.5, 2.0, "The Munda are indigenous to the Chota Nagpur Plateau of eastern India.", []],
  ["Adivasi - Khasi", "Khasi", "Khasi", 91.5, 25.5, 1.5, 1.0, "The Khasi are indigenous to the Khasi Hills of Meghalaya, northeastern India, known for their matrilineal society.", []],
  ["Adivasi - Naga", "Naga", "Naga languages", 94.5, 26.0, 2.0, 1.5, "The Naga peoples are indigenous to Nagaland and Manipur in northeastern India and northwestern Myanmar.", []],
  ["Vedda", "Vedda", "Vedda", 81.0, 7.5, 1.5, 1.0, "The Vedda are the indigenous people of Sri Lanka, among the oldest inhabitants of the island.", []],
  ["Hmong", "Hmong", "Hmong", 103.0, 22.0, 4.0, 3.0, "The Hmong are indigenous to the mountainous regions of southern China, Vietnam, Laos, and Thailand.", []],
  ["Karen", "Karen", "Karen", 98.0, 18.0, 3.0, 3.0, "The Karen people are indigenous to the Thailand-Myanmar border region.", []],
  ["Tibetan", "Tibetan", "Tibetan", 91.0, 31.0, 6.0, 4.0, "The Tibetan people are indigenous to the Tibetan Plateau, known for their Buddhist culture.", []],
  ["Uyghur", "Uyghur", "Uyghur", 82.0, 41.0, 8.0, 4.0, "The Uyghur are a Turkic people indigenous to the Xinjiang region of northwestern China.", []],
  ["Mongolian", "Mongolian", "Mongolian", 107.0, 47.5, 8.0, 4.0, "The Mongolian people are indigenous to the steppes of Central and East Asia.", []],
  ["Yi", "Yi", "Yi", 103.0, 27.0, 3.0, 2.5, "The Yi (Nuosu) are indigenous to the mountains of Sichuan, Yunnan, and Guizhou in southwestern China.", []],
  ["Dai", "Dai", "Tai", 100.5, 22.0, 2.5, 2.0, "The Dai people are indigenous to Yunnan province in southwestern China, related to Thai peoples.", []],
  ["Orang Asli", "Orang Asli", "Aslian", 102.0, 4.5, 3.0, 2.5, "The Orang Asli are the indigenous people of Peninsular Malaysia.", []],
  ["Dayak", "Dayak", "Dayak languages", 112.0, 1.0, 5.0, 3.0, "The Dayak are the indigenous peoples of Borneo (Kalimantan), including many distinct groups.", []],
  ["Igorot", "Igorot", "Igorot languages", 121.0, 17.0, 1.5, 1.5, "The Igorot are indigenous to the Cordillera mountains of northern Luzon, Philippines.", []],
  ["Lumad", "Lumad", "Lumad languages", 126.0, 8.0, 2.0, 2.0, "The Lumad are the non-Moro indigenous peoples of Mindanao, Philippines.", []],
  ["Papuan peoples", "Papuan", "Papuan languages", 140.0, -5.0, 4.0, 3.0, "The Papuan peoples are indigenous to the western half of New Guinea (Papua, Indonesia).", []],
  ["Jumma", "Jumma", "Tibeto-Burman", 92.0, 22.5, 1.5, 1.5, "The Jumma are indigenous to the Chittagong Hill Tracts of Bangladesh.", []],
  ["Kurds", "Kurdish", "Kurdish", 43.0, 37.0, 5.0, 3.0, "The Kurdish people are indigenous to Kurdistan, spanning parts of Turkey, Iraq, Iran, and Syria.", []],
  ["Baloch", "Baloch", "Balochi", 65.0, 28.0, 5.0, 3.0, "The Baloch people are indigenous to Balochistan, spanning Pakistan, Iran, and Afghanistan.", []],
  ["Sámi (Eastern)", "Eastern Sámi", "Sámi", 28.0, 69.0, 3.0, 2.0, "The Eastern Sámi inhabit the Kola Peninsula of Russia and parts of Finland.", []],
  ["Taiwan Indigenous - Atayal", "Atayal", "Atayal", 121.3, 24.5, 1.0, 1.0, "The Atayal are one of the largest indigenous groups of Taiwan.", []],
  ["Taiwan Indigenous - Paiwan", "Paiwan", "Paiwan", 120.8, 22.3, 1.0, 1.0, "The Paiwan are indigenous to the southern mountains of Taiwan.", []],
  ["Taiwan Indigenous - Amis", "Amis", "Amis", 121.5, 23.5, 1.0, 1.0, "The Amis are the largest indigenous group in Taiwan, along the east coast.", []],
  ["Chukchi", "Chukchi", "Chukchi", 170.0, 66.0, 8.0, 5.0, "The Chukchi are indigenous to the Chukchi Peninsula of northeastern Siberia.", []],
  ["Evenki", "Evenki", "Evenki", 120.0, 60.0, 10.0, 6.0, "The Evenki are indigenous to a vast area of Siberia, from the Yenisei River to the Pacific.", []],
  ["Nenets", "Nenets", "Nenets", 68.0, 68.0, 10.0, 4.0, "The Nenets are indigenous to the Arctic coast of Russia, known as reindeer herders.", []],
  ["Yakut", "Yakut", "Yakut", 130.0, 63.0, 10.0, 6.0, "The Yakut (Sakha) are indigenous to the Sakha Republic of northeastern Siberia.", []],
  ["Khanty", "Khanty", "Khanty", 70.0, 61.0, 6.0, 4.0, "The Khanty people are indigenous to the Ob River basin of western Siberia.", []],
  ["Mansi", "Mansi", "Mansi", 62.0, 61.0, 4.0, 3.0, "The Mansi are indigenous to the eastern slopes of the Ural Mountains in Russia.", []],
  ["Buryat", "Buryat", "Buryat", 109.0, 52.0, 6.0, 4.0, "The Buryat are indigenous to the area around Lake Baikal in Siberia.", []],
  ["Tuvan", "Tuvan", "Tuvan", 95.0, 51.5, 4.0, 2.5, "The Tuvan people are indigenous to the Tuva Republic in south-central Siberia, known for throat singing.", []],
  ["Altai", "Altai", "Altai", 87.0, 51.0, 3.0, 2.0, "The Altai people are indigenous to the Altai Mountains of southern Siberia.", []],
];

const EUROPE_ARCTIC = [
  ["Sámi", "Sámi", "Sámi", 22.0, 68.5, 8.0, 4.0, "The Sámi are indigenous to Sápmi (northern Scandinavia and the Kola Peninsula), Europe's only recognized indigenous people.", []],
  ["Basque", "Basque", "Euskara", -2.0, 43.0, 2.5, 1.5, "The Basque people are indigenous to the Basque Country spanning Spain and France, with one of Europe's oldest cultures.", []],
  ["Sorbian", "Sorbs", "Sorbian", 14.0, 51.5, 1.5, 1.0, "The Sorbs are a Slavic minority indigenous to Lusatia in eastern Germany.", []],
  ["Romani", "Romani", "Romani", 20.0, 47.0, 8.0, 4.0, "The Romani people originated in northern India and have been in Europe for over 1,000 years.", []],
  ["Nenets (European)", "European Nenets", "Nenets", 52.0, 67.5, 6.0, 4.0, "The European Nenets inhabit the tundra of the Nenets Autonomous Okrug in Arctic Russia.", []],
  ["Komi", "Komi", "Komi", 54.0, 62.0, 6.0, 4.0, "The Komi people are indigenous to the Komi Republic in northeastern European Russia.", []],
  ["Saami - South", "South Sámi", "South Sámi", 14.0, 63.5, 3.0, 2.0, "The South Sámi inhabit parts of central Norway and Sweden.", []],
  ["Saami - Lule", "Lule Sámi", "Lule Sámi", 17.0, 67.0, 2.5, 1.5, "The Lule Sámi are indigenous to the Lule River area in Norway and Sweden.", []],
  ["Saami - North", "North Sámi", "North Sámi", 24.0, 69.5, 4.0, 2.0, "The North Sámi are the largest Sámi group, across northern Norway, Sweden, and Finland.", []],
  ["Saami - Inari", "Inari Sámi", "Inari Sámi", 27.5, 69.0, 2.0, 1.0, "The Inari Sámi are indigenous to the Inari area of Finnish Lapland.", []],
  ["Saami - Skolt", "Skolt Sámi", "Skolt Sámi", 29.0, 69.5, 2.0, 1.0, "The Skolt Sámi are indigenous to the border area of Finland, Norway, and Russia.", []],
  ["Saami - Kildin", "Kildin Sámi", "Kildin Sámi", 33.0, 68.5, 2.0, 1.5, "The Kildin Sámi are indigenous to the Kola Peninsula of northwestern Russia.", []],
];

// Additional North American territories
const NORTH_AMERICA_ADDITIONAL = [
  ["Flathead", "Flathead", "Salish", -114.0, 47.5, 2.0, 1.5, "The Flathead (Salish-Kootenai) people are indigenous to western Montana.", ["Hellgate Treaty (1855)"]],
  ["Shoshone-Bannock", "Shoshone-Bannock", "Numic", -112.0, 43.0, 2.5, 1.5, "The Shoshone-Bannock Tribes reside on the Fort Hall Reservation in southeastern Idaho.", ["Fort Bridger Treaty (1868)"]],
  ["Chippewa-Cree", "Chippewa-Cree", "Algonquian", -109.5, 48.5, 2.0, 1.0, "The Chippewa-Cree are indigenous to the Rocky Boy's Reservation in north-central Montana.", []],
  ["Salish-Kootenai", "Salish-Kootenai", "Salish", -114.5, 47.0, 2.0, 1.5, "The Confederated Salish and Kootenai Tribes are indigenous to the Flathead Reservation in Montana.", ["Hellgate Treaty (1855)"]],
  ["Sisseton-Wahpeton", "Sisseton-Wahpeton", "Siouan", -97.0, 45.5, 2.0, 1.5, "The Sisseton-Wahpeton Oyate are a Dakota people in the Lake Traverse Reservation of South Dakota.", ["Treaty of Traverse des Sioux (1851)"]],
  ["Standing Rock Sioux", "Standing Rock Sioux", "Siouan", -101.0, 46.0, 2.0, 1.5, "The Standing Rock Sioux Tribe spans North and South Dakota, known for the 2016 pipeline protests.", ["Fort Laramie Treaty (1868)"]],
  ["Cheyenne River Sioux", "Cheyenne River Sioux", "Siouan", -101.0, 45.0, 2.5, 1.5, "The Cheyenne River Sioux are a Lakota band in central South Dakota.", ["Fort Laramie Treaty (1868)"]],
  ["Rosebud Sioux", "Rosebud Sioux", "Siouan", -100.5, 43.5, 2.0, 1.5, "The Rosebud Sioux Tribe is a Lakota band in south-central South Dakota.", ["Fort Laramie Treaty (1868)"]],
  ["Pine Ridge Oglala", "Oglala Lakota", "Siouan", -102.5, 43.0, 2.5, 1.5, "The Oglala Lakota at Pine Ridge Reservation are known for the Wounded Knee incident.", ["Fort Laramie Treaty (1868)"]],
  ["Yankton Sioux", "Yankton Sioux", "Siouan", -97.5, 43.0, 2.0, 1.5, "The Yankton Sioux (Ihanktonwan) are a Nakota people in southeastern South Dakota.", ["Treaty of 1858"]],
  ["Turtle Mountain Chippewa", "Turtle Mountain Chippewa", "Algonquian", -100.0, 48.8, 1.5, 1.0, "The Turtle Mountain Band of Chippewa are indigenous to north-central North Dakota.", []],
  ["Spirit Lake", "Spirit Lake", "Siouan", -99.0, 48.0, 1.5, 1.0, "The Spirit Lake Tribe (Devils Lake Sioux) are a Dakota people in North Dakota.", []],
  ["Wind River Arapaho", "Wind River Arapaho", "Algonquian", -109.0, 43.0, 2.0, 1.5, "The Northern Arapaho share the Wind River Reservation in Wyoming with the Eastern Shoshone.", ["Fort Laramie Treaty (1851)"]],
  ["Red Lake Ojibwe", "Red Lake Ojibwe", "Algonquian", -94.5, 48.0, 2.0, 1.5, "The Red Lake Band of Chippewa Indians hold the only closed reservation in Minnesota.", []],
  ["White Earth Ojibwe", "White Earth Ojibwe", "Algonquian", -95.5, 47.0, 2.0, 1.5, "The White Earth Band of Ojibwe are in northwestern Minnesota.", ["Treaty of 1867"]],
  ["Leech Lake Ojibwe", "Leech Lake Ojibwe", "Algonquian", -94.0, 47.2, 1.5, 1.0, "The Leech Lake Band of Ojibwe are in north-central Minnesota.", []],
  ["Mille Lacs Ojibwe", "Mille Lacs Ojibwe", "Algonquian", -93.5, 46.2, 1.5, 1.0, "The Mille Lacs Band of Ojibwe are in central Minnesota.", ["Treaty of 1837"]],
  ["Lac du Flambeau Ojibwe", "Lac du Flambeau", "Algonquian", -89.9, 46.0, 1.0, 0.8, "The Lac du Flambeau Band of Lake Superior Chippewa are in northern Wisconsin.", ["Treaty of La Pointe (1854)"]],
  ["Oneida of Wisconsin", "Oneida of Wisconsin", "Iroquoian", -88.2, 44.5, 1.0, 0.8, "The Oneida Nation of Wisconsin relocated from New York in the 1820s.", []],
  ["Stockbridge-Munsee", "Stockbridge-Munsee", "Algonquian", -88.8, 44.8, 1.0, 0.8, "The Stockbridge-Munsee are a Mohican people now in Wisconsin.", []],
  ["Forest County Potawatomi", "Forest County Potawatomi", "Algonquian", -88.9, 45.5, 1.0, 0.8, "The Forest County Potawatomi Community is in northeastern Wisconsin.", []],
  ["Bad River Ojibwe", "Bad River Ojibwe", "Algonquian", -90.7, 46.7, 1.2, 0.8, "The Bad River Band of the Lake Superior Chippewa are in northern Wisconsin.", ["Treaty of La Pointe (1854)"]],
  ["Makah", "Makah", "Wakashan", -124.6, 48.4, 0.8, 0.6, "The Makah people are indigenous to the northwestern tip of the Olympic Peninsula, known for whaling.", ["Treaty of Neah Bay (1855)"]],
  ["Quinault", "Quinault", "Salishan", -124.0, 47.5, 1.0, 0.8, "The Quinault people are indigenous to the Pacific coast of Washington's Olympic Peninsula.", ["Treaty of Olympia (1856)"]],
  ["Squaxin Island", "Squaxin Island", "Lushootseed", -122.9, 47.2, 0.8, 0.6, "The Squaxin Island Tribe are indigenous to the southern Puget Sound area of Washington.", ["Treaty of Medicine Creek (1854)"]],
  ["Skokomish", "Skokomish", "Twana", -123.2, 47.3, 0.8, 0.6, "The Skokomish people are indigenous to the Hood Canal area of Washington.", ["Treaty of Point No Point (1855)"]],
  ["Snohomish", "Snohomish", "Lushootseed", -122.2, 47.9, 1.0, 0.7, "The Snohomish people are indigenous to the Snohomish River area of Washington.", ["Treaty of Point Elliott (1855)"]],
  ["Chehalis", "Chehalis", "Salishan", -123.5, 46.8, 1.5, 1.0, "The Confederated Tribes of the Chehalis Reservation are in southwestern Washington.", []],
  ["Cowlitz", "Cowlitz", "Salishan", -122.8, 46.3, 1.2, 0.8, "The Cowlitz Indian Tribe is indigenous to southwestern Washington.", []],
  ["Palouse", "Palouse", "Sahaptin", -117.0, 46.5, 2.0, 1.5, "The Palouse people are indigenous to the Palouse River region of eastern Washington.", []],
  ["Cayuse", "Cayuse", "Cayuse", -118.5, 45.5, 1.5, 1.0, "The Cayuse people are indigenous to the Blue Mountains area of Oregon and Washington.", ["Treaty of Walla Walla (1855)"]],
  ["Walla Walla", "Walla Walla", "Sahaptin", -118.3, 46.0, 1.5, 1.0, "The Walla Walla people are indigenous to the Columbia Plateau of Oregon and Washington.", ["Treaty of Walla Walla (1855)"]],
  ["Burns Paiute", "Burns Paiute", "Numic", -119.0, 43.5, 2.0, 1.5, "The Burns Paiute Tribe are Northern Paiute in east-central Oregon.", []],
  ["Coos-Lower Umpqua-Siuslaw", "Coos-Lower Umpqua-Siuslaw", "Siuslaw", -124.1, 43.7, 1.0, 0.8, "The Confederated Tribes include three tribes from the Oregon coast.", []],
  ["Cow Creek Umpqua", "Cow Creek Umpqua", "Athabaskan", -123.3, 42.9, 1.2, 1.0, "The Cow Creek Band of Umpqua are indigenous to the South Umpqua Valley in Oregon.", []],
  ["Mohave-Apache", "Yavapai-Apache", "Yuman", -111.8, 34.7, 1.5, 1.0, "The Yavapai-Apache Nation is in the Verde Valley of Arizona.", []],
  ["Salt River Pima-Maricopa", "Pima-Maricopa", "Uto-Aztecan", -111.8, 33.6, 1.0, 0.7, "The Salt River Pima-Maricopa Indian Community is near Scottsdale, Arizona.", []],
  ["Pascua Yaqui", "Pascua Yaqui", "Uto-Aztecan", -111.0, 32.2, 1.0, 0.7, "The Pascua Yaqui Tribe is near Tucson, Arizona, with roots in Sonora, Mexico.", []],
  ["Tonto Apache", "Tonto Apache", "Athabaskan", -111.5, 34.2, 1.5, 1.0, "The Tonto Apache are indigenous to the Tonto Basin in central Arizona.", []],
  ["Fort Sill Apache", "Fort Sill Apache", "Athabaskan", -98.4, 34.8, 1.0, 0.8, "The Fort Sill Apache are Chiricahua Apache historically from the Southwest, now in Oklahoma.", []],
  ["Chiricahua Apache", "Chiricahua Apache", "Athabaskan", -109.3, 32.0, 2.5, 2.0, "The Chiricahua Apache are indigenous to southeastern Arizona and southwestern New Mexico, known for Geronimo.", []],
  ["Lipan Apache", "Lipan Apache", "Athabaskan", -100.0, 30.0, 3.0, 2.5, "The Lipan Apache are indigenous to the Edwards Plateau of central Texas.", []],
  ["Pueblo of Zia", "Zia Pueblo", "Keresan", -106.9, 35.5, 0.6, 0.4, "Zia Pueblo is the source of the sun symbol on New Mexico's state flag.", []],
  ["Pueblo of San Felipe", "San Felipe Pueblo", "Keresan", -106.5, 35.4, 0.6, 0.4, "San Felipe Pueblo is one of the most traditional of the Rio Grande Pueblos.", []],
  ["Pueblo of Santa Ana", "Santa Ana Pueblo", "Keresan", -106.7, 35.4, 0.6, 0.4, "Santa Ana Pueblo is along the Jemez River in New Mexico.", []],
  ["Pueblo of Nambe", "Nambé Pueblo", "Tewa", -105.9, 35.9, 0.5, 0.4, "Nambé Pueblo is a Tewa-speaking community near Santa Fe.", []],
  ["Pueblo of Tesuque", "Tesuque Pueblo", "Tewa", -105.9, 35.8, 0.5, 0.4, "Tesuque Pueblo is a Tewa-speaking community north of Santa Fe.", []],
  ["Pueblo of Pojoaque", "Pojoaque Pueblo", "Tewa", -106.0, 35.9, 0.5, 0.4, "Pojoaque Pueblo is a Tewa-speaking community between Santa Fe and Española.", []],
  ["Pueblo of Picuris", "Picuris Pueblo", "Tiwa", -105.8, 36.2, 0.6, 0.5, "Picuris Pueblo is a Tiwa-speaking community in the Sangre de Cristo Mountains.", []],
  ["Pueblo of Zuni", "Zuni", "Zuni", -108.9, 35.1, 1.0, 0.8, "The Pueblo of Zuni is known for its distinctive Zuni art and jewelry traditions.", []],
];

// Additional Caribbean and South American territories
const CARIBBEAN_ADDITIONAL = [
  ["Taíno", "Taíno", "Arawakan", -66.5, 18.2, 3.0, 1.5, "The Taíno were the principal inhabitants of the Caribbean at European contact.", []],
  ["Kalinago", "Kalinago", "Cariban", -61.3, 15.4, 1.5, 1.0, "The Kalinago (Carib) are indigenous to the Lesser Antilles, particularly Dominica.", []],
  ["Lokono", "Lokono", "Arawakan", -57.0, 6.5, 2.0, 1.5, "The Lokono (Arawak) are indigenous to the coast of the Guianas.", []],
  ["Wayana", "Wayana", "Cariban", -54.5, 3.0, 2.0, 1.5, "The Wayana people are indigenous to the border region of Suriname, French Guiana, and Brazil.", []],
  ["Trio", "Trio", "Cariban", -56.0, 2.5, 2.0, 1.5, "The Trio (Tiriyó) are indigenous to the border region of Suriname and Brazil.", []],
  ["Maroon - Saramaka", "Saramaka", "Saramaccan", -55.5, 4.0, 1.5, 1.0, "The Saramaka are Maroon people indigenous to the interior of Suriname.", []],
  ["Macushi", "Macushi", "Cariban", -59.5, 3.5, 2.0, 1.5, "The Macushi are indigenous to the savannas of Guyana and Brazil.", []],
  ["Wapishana", "Wapishana", "Arawakan", -59.0, 2.5, 2.0, 1.5, "The Wapishana are indigenous to the border region of Guyana and Brazil.", []],
];

// Additional African territories
const AFRICA_ADDITIONAL = [
  ["Sandawe", "Sandawe", "Sandawe", 35.5, -5.0, 1.5, 1.0, "The Sandawe are indigenous click-language speakers in Tanzania.", []],
  ["Datoga", "Datoga", "Nilotic", 35.5, -4.0, 1.5, 1.0, "The Datoga are pastoralist people indigenous to north-central Tanzania.", []],
  ["Iraqw", "Iraqw", "Cushitic", 35.5, -3.5, 1.5, 1.0, "The Iraqw are indigenous to the Mbulu Highlands of Tanzania.", []],
  ["Pygmy - Aka", "Aka", "Bantu languages", 18.0, 3.0, 2.5, 2.0, "The Aka people are indigenous to the tropical forests of the Central African Republic and Republic of Congo.", []],
  ["Pygmy - Efe", "Efe", "Central Sudanic", 29.0, 2.0, 2.0, 1.5, "The Efe are indigenous to the Ituri Forest of the Democratic Republic of Congo.", []],
  ["San - Ju/'hoansi", "Ju/'hoansi", "Khoisan", 20.5, -19.5, 2.0, 1.5, "The Ju/'hoansi are a San people indigenous to the Kalahari Desert of Namibia and Botswana.", []],
  ["San - !Kung", "!Kung", "Khoisan", 21.0, -20.0, 2.0, 1.5, "The !Kung are a San people indigenous to the Kalahari Desert.", []],
  ["San - Hai//om", "Hai//om", "Khoisan", 16.5, -19.0, 2.0, 1.5, "The Hai//om are a San people indigenous to the Etosha area of Namibia.", []],
  ["Berber - Tuareg Kel Ahaggar", "Kel Ahaggar", "Tamasheq", 5.5, 23.0, 3.0, 2.0, "The Kel Ahaggar are a Tuareg confederation in the Hoggar Mountains of southern Algeria.", []],
  ["Berber - Tuareg Kel Air", "Kel Aïr", "Tamasheq", 8.5, 18.0, 2.5, 2.0, "The Kel Aïr are a Tuareg confederation in the Aïr Mountains of Niger.", []],
  ["Berber - Siwi", "Siwi", "Berber", 25.5, 29.2, 1.0, 0.5, "The Siwi are Berber people indigenous to the Siwa Oasis in western Egypt.", []],
  ["Nuba", "Nuba", "Nuba languages", 30.0, 11.5, 2.0, 1.5, "The Nuba peoples are indigenous to the Nuba Mountains of Sudan.", []],
  ["Fur", "Fur", "Fur", 25.0, 13.5, 2.5, 2.0, "The Fur people are indigenous to Darfur in western Sudan.", []],
  ["Zaghawa", "Zaghawa", "Saharan", 24.0, 15.0, 2.5, 2.0, "The Zaghawa people are indigenous to the border region of Chad and Sudan.", []],
  ["Toubou", "Toubou", "Saharan", 18.0, 20.0, 4.0, 3.0, "The Toubou are indigenous to the Tibesti and Borkou regions of the central Sahara.", []],
  ["Senufo", "Senufo", "Atlantic-Congo", -6.0, 10.0, 3.0, 2.0, "The Senufo people are indigenous to Ivory Coast, Mali, and Burkina Faso.", []],
  ["Lobi", "Lobi", "Gur", -3.0, 10.5, 2.0, 1.5, "The Lobi people are indigenous to the border region of Burkina Faso, Ivory Coast, and Ghana.", []],
  ["Pygmy - Twa (Batwa)", "Batwa of Uganda", "Bantu languages", 29.5, -1.0, 1.5, 1.0, "The Batwa of Uganda are indigenous to the forests of southwestern Uganda.", []],
  ["Ndebele", "Ndebele", "isiNdebele", 29.0, -25.0, 2.0, 1.5, "The Ndebele people are indigenous to the Limpopo and Mpumalanga provinces of South Africa.", []],
  ["Swazi", "Swazi", "siSwati", 31.0, -26.5, 1.5, 1.0, "The Swazi people are indigenous to Eswatini (Swaziland) and parts of South Africa.", []],
  ["Venda", "Venda", "Tshivenda", 30.0, -23.0, 2.0, 1.5, "The Venda people are indigenous to the Limpopo province of South Africa.", []],
  ["Tsonga", "Tsonga", "Xitsonga", 31.5, -24.0, 2.0, 1.5, "The Tsonga (Shangaan) people are indigenous to southeastern Africa.", []],
  ["Pokot", "Pokot", "Nilotic", 35.5, 1.5, 1.5, 1.0, "The Pokot are indigenous to the border region of Kenya and Uganda.", []],
  ["Rendille", "Rendille", "Cushitic", 37.5, 2.5, 2.0, 1.5, "The Rendille are indigenous camel pastoralists in northern Kenya.", []],
  ["Borana", "Borana", "Cushitic", 38.5, 2.0, 2.5, 2.0, "The Borana Oromo are indigenous pastoralists in southern Ethiopia and northern Kenya.", []],
];

// Additional Asian territories
const ASIA_ADDITIONAL = [
  ["Adivasi - Oraon", "Oraon", "Kurukh", 84.0, 23.5, 2.0, 1.5, "The Oraon are indigenous to the Chota Nagpur Plateau of eastern India.", []],
  ["Adivasi - Ho", "Ho", "Mundari", 85.5, 22.5, 1.5, 1.0, "The Ho people are indigenous to the Singhbhum district of Jharkhand, India.", []],
  ["Adivasi - Bodo", "Bodo", "Tibeto-Burman", 90.5, 26.5, 2.0, 1.0, "The Bodo are indigenous to Assam in northeastern India.", []],
  ["Adivasi - Mizo", "Mizo", "Tibeto-Burman", 92.7, 23.5, 1.0, 1.0, "The Mizo people are indigenous to Mizoram in northeastern India.", []],
  ["Adivasi - Manipuri", "Manipuri", "Tibeto-Burman", 94.0, 24.8, 1.0, 1.0, "The Manipuri (Meitei) are indigenous to Manipur in northeastern India.", []],
  ["Adivasi - Tripuri", "Tripuri", "Tibeto-Burman", 91.5, 23.8, 1.0, 1.0, "The Tripuri (Tipra) are indigenous to Tripura in northeastern India.", []],
  ["Adivasi - Warli", "Warli", "Indo-Aryan", 73.0, 19.8, 1.5, 1.0, "The Warli are indigenous to Maharashtra, India, known for their distinctive painting tradition.", []],
  ["Adivasi - Chenchu", "Chenchu", "Dravidian", 79.0, 16.0, 1.5, 1.0, "The Chenchu are indigenous hunter-gatherers of Andhra Pradesh, India.", []],
  ["Andamanese", "Andamanese", "Andamanese", 92.7, 12.0, 1.5, 2.0, "The Andamanese peoples are indigenous to the Andaman Islands in the Bay of Bengal.", []],
  ["Nicobarese", "Nicobarese", "Austroasiatic", 93.5, 8.0, 1.0, 1.5, "The Nicobarese are indigenous to the Nicobar Islands in the Bay of Bengal.", []],
  ["Jarawa", "Jarawa", "Andamanese", 92.5, 12.5, 0.8, 0.8, "The Jarawa are one of the most isolated indigenous peoples, on the Andaman Islands.", []],
  ["Sentinelese", "Sentinelese", "Andamanese", 92.2, 11.6, 0.5, 0.5, "The Sentinelese are indigenous to North Sentinel Island, one of the world's last uncontacted peoples.", []],
  ["Akha", "Akha", "Tibeto-Burman", 100.5, 20.5, 2.0, 1.5, "The Akha people are indigenous to the highlands of Myanmar, Laos, Thailand, and Yunnan, China.", []],
  ["Lahu", "Lahu", "Tibeto-Burman", 100.0, 21.5, 2.0, 1.5, "The Lahu are indigenous to the mountainous regions of Myanmar, China, Laos, and Thailand.", []],
  ["Lisu", "Lisu", "Tibeto-Burman", 99.0, 26.0, 2.0, 2.0, "The Lisu people are indigenous to the Nujiang River area of Yunnan, China, and surrounding countries.", []],
  ["Kachin", "Kachin", "Tibeto-Burman", 97.5, 25.5, 2.0, 2.0, "The Kachin (Jingpo) are indigenous to Kachin State in northern Myanmar.", []],
  ["Shan", "Shan", "Tai", 97.5, 21.0, 3.0, 3.0, "The Shan are indigenous to Shan State in eastern Myanmar, related to Thai peoples.", []],
  ["Chin", "Chin", "Tibeto-Burman", 93.5, 22.0, 2.0, 2.0, "The Chin people are indigenous to Chin State in western Myanmar.", []],
  ["Wa", "Wa", "Austroasiatic", 99.5, 22.5, 1.5, 1.5, "The Wa people are indigenous to the border region between Myanmar and China.", []],
  ["Mon", "Mon", "Austroasiatic", 97.0, 16.5, 2.0, 1.5, "The Mon people are indigenous to the Mon State of southern Myanmar and parts of Thailand.", []],
  ["Rohingya", "Rohingya", "Indo-Aryan", 92.5, 20.5, 1.0, 1.0, "The Rohingya are a Muslim minority in Rakhine State, Myanmar.", []],
  ["Miao", "Miao", "Hmong-Mien", 108.0, 26.0, 3.0, 2.0, "The Miao (including Hmong subgroups) are indigenous to southern China and Southeast Asia.", []],
  ["Zhuang", "Zhuang", "Tai", 108.0, 23.5, 3.0, 2.0, "The Zhuang are the largest ethnic minority in China, indigenous to Guangxi.", []],
  ["Taiwan Indigenous - Bunun", "Bunun", "Bunun", 121.0, 23.5, 0.8, 0.8, "The Bunun are indigenous to the central mountains of Taiwan.", []],
  ["Taiwan Indigenous - Tsou", "Tsou", "Tsou", 120.8, 23.5, 0.8, 0.8, "The Tsou are indigenous to the Alishan area of central Taiwan.", []],
  ["Taiwan Indigenous - Rukai", "Rukai", "Rukai", 120.7, 22.7, 0.8, 0.8, "The Rukai are indigenous to the southern mountains of Taiwan.", []],
  ["Taiwan Indigenous - Saisiyat", "Saisiyat", "Saisiyat", 121.2, 24.6, 0.8, 0.6, "The Saisiyat are one of the smallest indigenous groups in Taiwan.", []],
  ["Taiwan Indigenous - Truku", "Truku", "Truku", 121.4, 24.1, 0.8, 0.6, "The Truku (Taroko) are indigenous to the Taroko Gorge area of eastern Taiwan.", []],
  ["Taiwan Indigenous - Yami", "Yami", "Yami", 121.5, 22.0, 0.5, 0.3, "The Yami (Tao) are indigenous to Orchid Island off the southeastern coast of Taiwan.", []],
  ["Nganasan", "Nganasan", "Samoyedic", 100.0, 73.0, 6.0, 3.0, "The Nganasan are the northernmost indigenous people of Eurasia, on the Taymyr Peninsula.", []],
  ["Selkup", "Selkup", "Samoyedic", 78.0, 62.0, 6.0, 4.0, "The Selkup are indigenous to the Ob River basin in western Siberia.", []],
  ["Ket", "Ket", "Yeniseian", 88.0, 63.0, 4.0, 3.0, "The Ket are a small indigenous group on the Yenisei River, with an endangered isolated language.", []],
  ["Nivkh", "Nivkh", "Nivkh", 142.0, 52.0, 3.0, 2.0, "The Nivkh are indigenous to Sakhalin Island and the Amur River area of the Russian Far East.", []],
  ["Ulchi", "Ulchi", "Tungusic", 136.0, 51.0, 2.0, 1.5, "The Ulchi are indigenous to the lower Amur River in the Russian Far East.", []],
  ["Nanai", "Nanai", "Tungusic", 135.0, 48.5, 3.0, 2.0, "The Nanai are indigenous to the Amur River basin in the Russian Far East and northeastern China.", []],
  ["Udege", "Udege", "Tungusic", 136.0, 46.0, 3.0, 2.0, "The Udege are indigenous to the Sikhote-Alin Mountains of the Russian Far East.", []],
  ["Itelmens", "Itelmen", "Chukotko-Kamchatkan", 157.0, 55.0, 4.0, 3.0, "The Itelmen are indigenous to the Kamchatka Peninsula of the Russian Far East.", []],
  ["Koryak", "Koryak", "Chukotko-Kamchatkan", 165.0, 62.0, 6.0, 5.0, "The Koryak are indigenous to the northern Kamchatka Peninsula of the Russian Far East.", []],
  ["Yupik", "Siberian Yupik", "Yupik", -170.0, 64.0, 5.0, 2.0, "The Siberian Yupik are indigenous to the Chukchi Peninsula and St. Lawrence Island.", []],
  ["Aleut", "Aleut", "Aleut", -170.0, 53.5, 10.0, 2.0, "The Aleut (Unangan) are indigenous to the Aleutian Islands and western Alaska.", []],
];

// Additional Europe territories
const EUROPE_ADDITIONAL = [
  ["Livonian", "Livonians", "Livonian", 24.0, 57.5, 1.5, 1.0, "The Livonians are indigenous to the northern coast of Latvia, with a critically endangered language.", []],
  ["Karelian", "Karelians", "Karelian", 32.0, 63.0, 4.0, 3.0, "The Karelians are a Finnic people indigenous to Karelia, spanning Finland and Russia.", []],
  ["Vepsian", "Veps", "Vepsian", 35.0, 61.0, 3.0, 2.0, "The Veps are a Finnic people indigenous to the area between Lakes Onega and Ladoga in Russia.", []],
  ["Gagauz", "Gagauz", "Gagauz", 28.5, 46.3, 1.5, 0.8, "The Gagauz are a Turkic people indigenous to Moldova and surrounding areas.", []],
  ["Crimean Tatar", "Crimean Tatar", "Crimean Tatar", 34.0, 45.0, 2.5, 1.5, "The Crimean Tatars are indigenous to the Crimean Peninsula.", []],
  ["Circassian", "Circassians", "Circassian", 39.5, 44.0, 3.0, 1.5, "The Circassians (Adyghe) are indigenous to the northwestern Caucasus region.", []],
  ["Chechen", "Chechens", "Chechen", 45.5, 43.3, 2.0, 1.0, "The Chechens are indigenous to the Chechen Republic in the North Caucasus.", []],
  ["Ingush", "Ingush", "Ingush", 44.8, 43.2, 1.0, 0.8, "The Ingush are indigenous to the Ingush Republic in the North Caucasus.", []],
  ["Avar", "Avars", "Avar", 46.5, 42.5, 2.0, 1.5, "The Avars are indigenous to Dagestan in the North Caucasus.", []],
  ["Lezgin", "Lezgins", "Lezgin", 48.0, 41.5, 1.5, 1.0, "The Lezgins are indigenous to southern Dagestan and northern Azerbaijan.", []],
  ["Abkhaz", "Abkhaz", "Abkhaz", 41.0, 43.0, 1.5, 0.8, "The Abkhaz are indigenous to Abkhazia on the eastern coast of the Black Sea.", []],
  ["Ossetian", "Ossetians", "Ossetian", 44.0, 42.5, 2.0, 1.0, "The Ossetians are indigenous to the central Caucasus, spanning North and South Ossetia.", []],
];

// Additional Oceania territories
const OCEANIA_ADDITIONAL = [
  ["Aboriginal Australians - Wiradjuri", "Wiradjuri", "Wiradjuri", 148.0, -33.5, 3.0, 2.5, "The Wiradjuri are indigenous to central New South Wales, the largest Aboriginal group in the state.", []],
  ["Aboriginal Australians - Yorta Yorta", "Yorta Yorta", "Yorta Yorta", 145.5, -36.0, 2.0, 1.5, "The Yorta Yorta are indigenous to the Murray-Goulburn Rivers area of Victoria, Australia.", []],
  ["Aboriginal Australians - Dja Dja Wurrung", "Dja Dja Wurrung", "Dja Dja Wurrung", 144.0, -36.8, 2.0, 1.5, "The Dja Dja Wurrung are indigenous to the goldfields region of central Victoria, Australia.", []],
  ["Aboriginal Australians - Martu", "Martu", "Western Desert", 123.0, -23.0, 4.0, 3.0, "The Martu are indigenous to the western desert region of Western Australia.", []],
  ["Aboriginal Australians - Anangu", "Anangu", "Western Desert", 131.0, -25.5, 4.0, 3.0, "The Anangu are indigenous to the Uluru-Kata Tjuta area of central Australia.", []],
  ["Aboriginal Australians - Jawoyn", "Jawoyn", "Jawoyn", 132.5, -14.0, 2.0, 1.5, "The Jawoyn are indigenous to the Katherine region of the Northern Territory, Australia.", []],
  ["Aboriginal Australians - Larrakia", "Larrakia", "Larrakia", 130.8, -12.5, 1.5, 1.0, "The Larrakia are indigenous to the Darwin area of the Northern Territory, Australia.", []],
  ["Aboriginal Australians - Gunditjmara", "Gunditjmara", "Gunditjmara", 142.5, -38.2, 2.0, 1.0, "The Gunditjmara are indigenous to western Victoria, known for the Budj Bim aquaculture system.", []],
  ["Aboriginal Australians - Narungga", "Narungga", "Narungga", 137.5, -34.0, 2.0, 1.5, "The Narungga are indigenous to Yorke Peninsula in South Australia.", []],
  ["Aboriginal Australians - Kaurna", "Kaurna", "Kaurna", 138.6, -34.9, 1.5, 1.0, "The Kaurna are indigenous to the Adelaide Plains of South Australia.", []],
  ["Vanuatu ni-Vanuatu", "ni-Vanuatu", "Bislama", 168.0, -16.0, 2.0, 2.0, "The ni-Vanuatu are the indigenous Melanesian people of Vanuatu.", []],
  ["Solomon Islanders", "Solomon Islanders", "Solomon Islands Pijin", 159.0, -8.0, 3.0, 2.0, "The indigenous peoples of the Solomon Islands are primarily Melanesian.", []],
  ["Aboriginal Australians - Palawa", "Palawa", "Palawa kani", 146.0, -42.0, 2.5, 2.0, "The Palawa are the indigenous people of Tasmania (lutruwita).", []],
  ["Māori - Ngāti Porou", "Ngāti Porou", "Te Reo Māori", 178.3, -38.0, 1.5, 1.5, "Ngāti Porou is a major Māori iwi on the East Coast of the North Island.", []],
  ["Māori - Te Arawa", "Te Arawa", "Te Reo Māori", 176.2, -38.2, 1.5, 1.0, "Te Arawa is a confederation of Māori iwi in the Rotorua and Bay of Plenty region.", []],
  ["Māori - Ngāti Tūwharetoa", "Ngāti Tūwharetoa", "Te Reo Māori", 175.8, -39.0, 1.5, 1.0, "Ngāti Tūwharetoa is a Māori iwi in the Taupo region of the central North Island.", []],
];

// Combine all regions
TERRITORIES.push(
  ...NORTH_AMERICA_WEST,
  ...NORTH_AMERICA_PLAINS,
  ...NORTH_AMERICA_EAST,
  ...NORTH_AMERICA_SOUTHEAST,
  ...NORTH_AMERICA_SOUTHWEST,
  ...CANADA,
  ...MEXICO_CENTRAL_AMERICA,
  ...SOUTH_AMERICA,
  ...OCEANIA,
  ...AFRICA,
  ...ASIA,
  ...EUROPE_ARCTIC,
  ...NORTH_AMERICA_ADDITIONAL,
  ...CARIBBEAN_ADDITIONAL,
  ...AFRICA_ADDITIONAL,
  ...ASIA_ADDITIONAL,
  ...OCEANIA_ADDITIONAL,
  ...EUROPE_ADDITIONAL,
);

// Determine region from coordinates
function getRegion(lon, lat) {
  if (lat > 60) return "Arctic / Subarctic";
  if (lon > 100 && lat > 20) return "East Asia";
  if (lon > 60 && lat > 20) return "Central / South Asia";
  if (lon > 30 && lat > 20) return "Middle East";
  if (lon > -30 && lon < 60 && lat > 35) return "Europe";
  if (lon > -20 && lon < 55 && lat > -40 && lat < 35) return "Africa";
  if (lon > 95 && lat > -15 && lat < 20) return "Southeast Asia";
  if (lon > 110 && lat < -10) return "Oceania";
  if (lon > 160 || (lon > -180 && lon < -140)) return "Oceania";
  if (lon > -140 && lon < -30 && lat > 40) return "North America";
  if (lon > -130 && lon < -60 && lat > 15 && lat <= 40) return "North America";
  if (lon > -120 && lon < -60 && lat > -5 && lat <= 15) return "Central America / Caribbean";
  if (lon > -82 && lon < -30 && lat > -60 && lat <= -5) return "South America";
  if (lon > -82 && lon < -60 && lat > -5 && lat <= 15) return "South America";
  return "Other";
}

console.log(`Generating ${TERRITORIES.length} indigenous territories...`);

const usedSlugs = new Set();

for (const [name, people, language, lon, lat, sizeLon, sizeLat, description, treaties] of TERRITORIES) {
  let slug = slugify(name);
  // Handle duplicate slugs
  if (usedSlugs.has(slug)) {
    slug = slug + "-" + slugify(people);
  }
  if (usedSlugs.has(slug)) {
    slug = slug + "-2";
  }
  usedSlugs.add(slug);

  const region = getRegion(lon, lat);
  const nativeLandSlug = slugify(people);

  // Create data JSON
  const data = {
    code: slug,
    name,
    people,
    language,
    region,
    description,
    relatedTreaties: treaties.length > 0 ? treaties : ["No formal treaty recorded"],
    nativeLandUrl: [`https://native-land.ca/maps/territories/${nativeLandSlug}/`],
    geojson: `${slug}.geojson`,
  };

  writeFileSync(join(DATA_DIR, `${slug}.json`), JSON.stringify(data));

  // Create GeoJSON with irregular polygon
  const coords = makeIrregularPolygon(lon, lat, sizeLon, sizeLat);
  const geojson = {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: { code: slug, name, people, region },
        geometry: { type: "Polygon", coordinates: [coords] },
      },
    ],
  };

  writeFileSync(join(GEO_DIR, `${slug}.geojson`), JSON.stringify(geojson));
}

console.log(`Done! Generated ${TERRITORIES.length} territories.`);
console.log(`Data files: ${DATA_DIR}`);
console.log(`GeoJSON files: ${GEO_DIR}`);
