const EXTENDED_ONLINE_POOL = [
    { id: "photo-1544636331-e26879cd4d9b", name: "bugatti_veyron_track.jpg", category: "Cars", w: 600, h: 400 },
    { id: "photo-1555215695-3004980ad54e", name: "bmw_m8_competition.jpg", category: "Cars", w: 600, h: 400 },
    { id: "photo-1619767886558-efdc259b6e09", name: "f1_monaco_grand_prix.jpg", category: "Cars", w: 600, h: 400 },
    { id: "photo-1568605117036-5fe5e7bab0b7", name: "nissan_gtr_nismo.jpg", category: "Cars", w: 600, h: 400 },
    { id: "photo-1565299624946-b28f40a0ae38", name: "truffle_artisan_pasta.jpg", category: "Food", w: 600, h: 450 },
    { id: "photo-1551024601-bec78aea704b", name: "belgian_gold_waffles.jpg", category: "Food", w: 600, h: 450 },
    { id: "photo-1546069901-ba9599a7e63c", name: "organic_harvest_bowl.jpg", category: "Food", w: 600, h: 450 },
    { id: "photo-1549517045-bc93de630367", name: "nordic_concrete_pavilion.jpg", category: "Architecture", w: 600, h: 450 },
    { id: "photo-1600596542815-ffad4c1539a9", name: "malibu_glass_mansion.jpg", category: "Architecture", w: 600, h: 450 },
    { id: "photo-1527576539890-dfa815648363", name: "parametric_steel_atrium.jpg", category: "Architecture", w: 600, h: 450 },
    { id: "photo-1585110396000-c9ffd4e4b308", name: "scarlet_macaw_rainforest.jpg", category: "Animals", w: 600, h: 450 },
    { id: "photo-1559715541-5daf8a0296d0", name: "oceanic_bottlenose_dolphins.jpg", category: "Animals", w: 600, h: 450 },
    { id: "photo-1557862921-37829c790f19", name: "editorial_monochrome_portrait.jpg", category: "Portrait", w: 500, h: 600 },
    { id: "photo-1544005313-94ddf0286df2", name: "golden_hour_studio_gaze.jpg", category: "Portrait", w: 500, h: 600 },
    { id: "photo-1500534314209-a25ddb2bd429", name: "iceland_skogarfoss_falls.jpg", category: "Nature", w: 600, h: 400 },
    { id: "photo-1506905925346-21bda4d32df4", name: "swiss_matterhorn_alps.jpg", category: "Nature", w: 600, h: 400 },
    { id: "photo-1444703686981-a3abbc4d4fe3", name: "deep_space_milky_way.jpg", category: "Sunset/Sky", w: 600, h: 400 },
    { id: "photo-1555169062-013468b47731", name: "cyberpunk_seoul_alley.jpg", category: "Cyberpunk", w: 600, h: 450 },
    { id: "photo-1558769132-cb1aea458c5e", name: "milan_couture_atelier.jpg", category: "Fashion", w: 500, h: 600 },
    { id: "photo-1481627834876-b7833e8f5570", name: "trinity_college_old_library.jpg", category: "Dark Academia", w: 600, h: 450 },
];
function seededShuffle(arr, seed) {
    const result = [...arr];
    let s = seed;
    const rand = () => {
        s += 0x6d2b79f5;
        let z = s;
        z = Math.imul(z ^ (z >>> 15), z | 1);
        z ^= z + Math.imul(z ^ (z >>> 7), z | 61);
        return ((z ^ (z >>> 14)) >>> 0) / 4294967296;
    };
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(rand() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
}
export class CanvasSampleGeneratorAdapter {
    usedNames = new Set();
    reset() {
        this.usedNames.clear();
    }
    releaseNames(names = []) {
        names.forEach((n) => this.usedNames.delete(n));
    }
    /**
     * Loads a fresh, non-repeating batch of ultra-high-aesthetic real photos
     * (Koenigsegg Jesko, Koenigsegg Agera RS, Bugatti Chiron, Michelin Gastronomy,
     * Zaha Hadid Architecture, Black Panther, Blade Runner Cyberpunk, etc.)
     * ensuring every category is represented and zero duplicate images are ever added.
     */
    async generate(count = 16, excludeNames = []) {
        excludeNames.forEach((n) => this.usedNames.add(n));
        let manifest = [];
        try {
            const res = await fetch("/samples/manifest.json", { cache: "no-store" });
            if (res.ok) {
                manifest = await res.json();
            }
        }
        catch (e) {
            console.warn("[SampleGenerator] Manifest load warning:", e);
        }
        const seed = Date.now() + Math.floor(Math.random() * 100000);
        // Filter out any photo that has already been loaded in this session
        let availableLocal = manifest.filter((entry) => !this.usedNames.has(entry.name));
        // If all 71 local photos were already added, reset local filter only if excludeNames is empty
        if (availableLocal.length === 0 && excludeNames.length === 0) {
            this.usedNames.clear();
            availableLocal = [...manifest];
        }
        // Group available local photos by category so every click shows diverse categories
        const byCategory = new Map();
        for (const item of seededShuffle(availableLocal, seed)) {
            const list = byCategory.get(item.category) || [];
            // Prioritize signature tier (Koenigsegg Jesko/Agera, Michelin, Zaha Hadid, etc.)
            if (item.tier === "signature") {
                list.unshift(item);
            }
            else {
                list.push(item);
            }
            byCategory.set(item.category, list);
        }
        const selectedLocal = [];
        const categories = seededShuffle(Array.from(byCategory.keys()), seed + 7);
        // Round-robin pick across categories so every category gets represented without duplicates
        let addedInPass = true;
        while (selectedLocal.length < count && addedInPass) {
            addedInPass = false;
            for (const cat of categories) {
                if (selectedLocal.length >= count)
                    break;
                const queue = byCategory.get(cat);
                if (queue && queue.length > 0) {
                    const picked = queue.shift();
                    selectedLocal.push(picked);
                    this.usedNames.add(picked.name);
                    addedInPass = true;
                }
            }
        }
        const files = [];
        const CHUNK = 6;
        // 1. Fetch selected local high-aesthetic images
        for (let i = 0; i < selectedLocal.length; i += CHUNK) {
            const slice = selectedLocal.slice(i, i + CHUNK);
            const batchFiles = await Promise.all(slice.map(async (entry, idx) => {
                try {
                    const response = await fetch(entry.path);
                    if (!response.ok)
                        throw new Error(`HTTP ${response.status}`);
                    const blob = await response.blob();
                    return new File([blob], entry.name, {
                        type: "image/jpeg",
                        lastModified: Date.now() - (i + idx) * 500,
                    });
                }
                catch (err) {
                    return null;
                }
            }));
            for (const f of batchFiles) {
                if (f)
                    files.push(f);
            }
        }
        // 2. If more images are needed beyond the 71 local ones, pull unseen from extended online pool
        if (files.length < count) {
            const remaining = count - files.length;
            const availableOnline = seededShuffle(EXTENDED_ONLINE_POOL.filter((p) => !this.usedNames.has(p.name)), seed + 99).slice(0, remaining);
            const onlineFiles = await Promise.all(availableOnline.map(async (entry, idx) => {
                this.usedNames.add(entry.name);
                const url = `https://images.unsplash.com/${entry.id}?w=${entry.w}&h=${entry.h}&q=82&fit=crop&auto=format`;
                try {
                    const res = await fetch(url);
                    if (!res.ok)
                        throw new Error(`HTTP ${res.status}`);
                    const blob = await res.blob();
                    return new File([blob], entry.name, {
                        type: "image/jpeg",
                        lastModified: Date.now() - idx * 500,
                    });
                }
                catch {
                    return null;
                }
            }));
            for (const f of onlineFiles) {
                if (f)
                    files.push(f);
            }
        }
        return files;
    }
}
