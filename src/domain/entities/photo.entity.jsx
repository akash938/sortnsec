export const PHOTO_STATUS = {
  PENDING: "pending",
  PROCESSING: "processing",
  CLASSIFIED: "classified",
  ERROR: "error",
};

export function createPhotoEntity({
  id,
  file,
  objectUrl,
  width = 800,
  height = 600,
  status = PHOTO_STATUS.PENDING,
}) {
  return {
    id,
    file,
    objectUrl,
    name: file.name,
    size: file.size,
    width,
    height,
    aspectRatio: width / height,
    status,
    timestamp: Date.now(),
  };
}
