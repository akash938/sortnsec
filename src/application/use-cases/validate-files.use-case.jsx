import { UPLOAD_POLICY, isSupportedImage } from "../../domain/rules/upload-policy";
export function validateUploadFiles(rawFiles) {
    const supported = [];
    let rejectedCount = 0;
    for (const file of rawFiles) {
        if (isSupportedImage(file.name)) {
            supported.push(file);
        }
        else {
            rejectedCount++;
        }
    }
    const limitExceeded = supported.length > UPLOAD_POLICY.MAX_PHOTOS_PER_BATCH;
    const acceptedFiles = limitExceeded
        ? supported.slice(0, UPLOAD_POLICY.MAX_PHOTOS_PER_BATCH)
        : supported;
    return {
        acceptedFiles,
        rejectedCount,
        limitExceeded,
    };
}
