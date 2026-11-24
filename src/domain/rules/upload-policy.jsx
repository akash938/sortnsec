export const UPLOAD_POLICY = {
    MAX_PHOTOS_PER_BATCH: 100,
    BATCH_SIZE: 4,
    MAX_IMAGE_DIMENSION: 512,
    ACCEPTED_EXTENSIONS: [".jpg", ".jpeg", ".png", ".webp"],
    ACCEPTED_MIME_TYPES: ["image/jpeg", "image/png", "image/webp"],
};
export function isSupportedImage(filename) {
    const lower = filename.toLowerCase();
    return UPLOAD_POLICY.ACCEPTED_EXTENSIONS.some((ext) => lower.endsWith(ext));
}
