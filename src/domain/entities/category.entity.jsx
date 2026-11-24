export const AESTHETIC_CATEGORIES = [
    { id: "minimalist", label: "Minimalist", type: "aesthetic", prompt: "a photo in a minimalist aesthetic, clean empty space, simple lines and minimal composition" },
    { id: "dark-academia", label: "Dark Academia", type: "aesthetic", prompt: "a photo in a dark academia aesthetic, moody scholarly vintage books and antique atmosphere" },
    { id: "cinematic", label: "Cinematic", type: "aesthetic", prompt: "a photo in a cinematic aesthetic, dramatic movie lighting, theatrical anamorphic composition" },
    { id: "vintage-film", label: "Vintage Film", type: "aesthetic", prompt: "a photo in a vintage film aesthetic, grainy 35mm retro analog film look with muted tones" },
    { id: "cyberpunk", label: "Cyberpunk", type: "aesthetic", prompt: "a photo in a cyberpunk aesthetic, vibrant neon night lights and futuristic high-tech tone" },
    { id: "streetwear", label: "Streetwear", type: "aesthetic", prompt: "a photo in a streetwear aesthetic, contemporary urban fashion and youthful street culture" },
    { id: "luxury", label: "Luxury", type: "aesthetic", prompt: "a photo in a luxury aesthetic, opulent premium design, elegant marble and high-end elegance" },
    { id: "nature", label: "Nature", type: "aesthetic", prompt: "a photo in a lush organic nature aesthetic, outdoor wilderness flora, forest and green plants" },
    { id: "pastel", label: "Pastel", type: "aesthetic", prompt: "a photo in a soft pastel aesthetic, gentle muted creamy light and soft desaturated colors" },
    { id: "brutalist", label: "Brutalist", type: "aesthetic", prompt: "a photo in a brutalist aesthetic, raw geometric concrete, massive monolithic urban structures" },
    { id: "cottagecore", label: "Cottagecore", type: "aesthetic", prompt: "a photo in a cottagecore aesthetic, rustic idyllic rural countryside charm and wooden crafts" },
    { id: "y2k", label: "Y2K", type: "aesthetic", prompt: "a photo in a Y2K aesthetic, early 2000s glossy chrome, bubblegum pop and metallic futuristic look" },
];
export const SUBJECT_CATEGORIES = [
    { id: "portrait", label: "Portrait", type: "subject", prompt: "a portrait photo of a person, human face close-up, headshot or facial expression" },
    { id: "food", label: "Food", type: "subject", prompt: "a photo of food, a culinary dish, meal on a plate, edible cuisine, snacks, groceries or drinks" },
    { id: "cars", label: "Cars", type: "subject", prompt: "a photo of cars, automobiles, sports motor vehicles, highway road traffic or roundabout transport" },
    { id: "architecture", label: "Architecture", type: "subject", prompt: "a photo of architecture, buildings, bridges, road roundabouts, civil engineering or urban structure" },
    { id: "animals", label: "Animals", type: "subject", prompt: "a photo of animals, domestic pets, cats, dogs, birds or wild creatures" },
    { id: "fashion", label: "Fashion", type: "subject", prompt: "a photo of clothing fashion styling, model apparel garments, shoes and designer outfit" },
    { id: "travel", label: "Travel", type: "subject", prompt: "a photo of travel vacation destinations, aerial landscape views, scenic tourist landmarks and roads" },
    { id: "interior", label: "Interior", type: "subject", prompt: "a photo of indoor interior design, room furniture, indoor living spaces and home decor" },
    { id: "product", label: "Product", type: "subject", prompt: "a photo of a commercial studio product, merchandise packaging, bottle or manufactured item" },
    { id: "sunset-sky", label: "Sunset/Sky", type: "subject", prompt: "a photo of sunset or sunrise sky, colorful clouds, golden hour horizon and atmosphere" },
];
export const ALL_CATEGORIES = [
    ...AESTHETIC_CATEGORIES,
    ...SUBJECT_CATEGORIES,
];
export const CATEGORY_MAP = new Map(ALL_CATEGORIES.map((c) => [c.label.toLowerCase(), c]));
export function getCategoryByLabel(label) {
    return CATEGORY_MAP.get(label.toLowerCase()) || ALL_CATEGORIES.find((c) => c.id === label.toLowerCase());
}
