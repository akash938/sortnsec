export function updatePhotoCategory(photos, photoId, newCategory) {
    return photos.map((photo) => {
        if (photo.id === photoId) {
            return {
                ...photo,
                manualCategory: newCategory,
            };
        }
        return photo;
    });
}
