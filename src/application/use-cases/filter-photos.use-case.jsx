export function filterPhotosByCategory(photos, filter) {
    if (filter === "all")
        return photos;
    const target = filter.toLowerCase();
    return photos.filter((p) => {
        const effective = (p.manualCategory || p.primaryCategory || "").toLowerCase();
        return effective === target;
    });
}
export function computeCategoryCounts(photos) {
    const counts = {};
    for (const photo of photos) {
        const category = photo.manualCategory || photo.primaryCategory;
        if (category) {
            counts[category] = (counts[category] || 0) + 1;
        }
    }
    return Object.entries(counts)
        .map(([label, count]) => ({ label, count }))
        .sort((a, b) => b.count - a.count);
}
