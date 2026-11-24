import { UPLOAD_POLICY } from "../../domain/rules/upload-policy";
export class CanvasPreprocessorAdapter {
    async preprocess(file, maxDimension = UPLOAD_POLICY.MAX_IMAGE_DIMENSION) {
        return new Promise((resolve, reject) => {
            const objectUrl = URL.createObjectURL(file);
            const img = new Image();
            img.onload = () => {
                try {
                    const { naturalWidth, naturalHeight } = img;
                    const width = naturalWidth || maxDimension;
                    const height = naturalHeight || maxDimension;
                    const aspectRatio = width / height;
                    let targetWidth = width;
                    let targetHeight = height;
                    if (width > maxDimension || height > maxDimension) {
                        if (width > height) {
                            targetWidth = maxDimension;
                            targetHeight = Math.round(maxDimension / aspectRatio);
                        }
                        else {
                            targetHeight = maxDimension;
                            targetWidth = Math.round(maxDimension * aspectRatio);
                        }
                    }
                    const canvas = document.createElement("canvas");
                    canvas.width = targetWidth;
                    canvas.height = targetHeight;
                    const ctx = canvas.getContext("2d");
                    if (!ctx) {
                        throw new Error("Could not initialize canvas context");
                    }
                    ctx.imageSmoothingEnabled = true;
                    ctx.imageSmoothingQuality = "high";
                    ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
                    const downscaledDataUrl = canvas.toDataURL("image/jpeg", 0.85);
                    URL.revokeObjectURL(objectUrl);
                    resolve({
                        width,
                        height,
                        aspectRatio,
                        downscaledDataUrl,
                    });
                }
                catch (err) {
                    URL.revokeObjectURL(objectUrl);
                    reject(err);
                }
            };
            img.onerror = () => {
                URL.revokeObjectURL(objectUrl);
                reject(new Error(`Failed to load image: ${file.name}`));
            };
            img.src = objectUrl;
        });
    }
}
