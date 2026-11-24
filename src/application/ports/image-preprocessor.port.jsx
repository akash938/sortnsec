/**
 * Application Port: ImagePreprocessorPort
 * Contract for image downscaling and dimension extraction adapters.
 */
export class ImagePreprocessorPort {
  async preprocess(_file, _maxDimension) {
    throw new Error("ImagePreprocessorPort.preprocess() must be implemented by adapter");
  }
}
