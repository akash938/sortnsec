/**
 * Application Use Case: Delete specific photos from in-memory state.
 * Optionally retains Object URLs temporarily so an Undo action can restore them cleanly.
 */
export function deletePhotosFromMemory(photos, photoIdsToDelete, options = { revokeUrls: false }) {
  const idSet =
    photoIdsToDelete instanceof Set ? photoIdsToDelete : new Set(photoIdsToDelete);

  const remainingPhotos = [];
  const deletedPhotos = [];
  const deletedNames = [];

  for (let index = 0; index < photos.length; index++) {
    const photo = photos[index];
    if (idSet.has(photo.id)) {
      if (options.revokeUrls) {
        try {
          URL.revokeObjectURL(photo.objectUrl);
        } catch (e) {}
      }
      deletedPhotos.push({ photo, index });
      deletedNames.push(photo.name);
    } else {
      remainingPhotos.push(photo);
    }
  }

  return {
    remainingPhotos,
    deletedPhotos,
    deletedNames,
    deletedCount: deletedNames.length,
  };
}
