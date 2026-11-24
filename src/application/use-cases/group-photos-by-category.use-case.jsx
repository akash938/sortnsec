export function groupPhotosByCategory(photos) {
    const map = {};
    for (const photo of photos) {
        const category = photo.manualCategory || photo.primaryCategory || "Uncategorized";
        if (!map[category]) {
            map[category] = [];
        }
        map[category].push(photo);
    }
    return Object.keys(map)
        .sort((a, b) => {
        const diff = map[b].length - map[a].length;
        return diff !== 0 ? diff : a.localeCompare(b);
    })
        .map((category) => ({
        category,
        photos: map[category],
    }));
}
