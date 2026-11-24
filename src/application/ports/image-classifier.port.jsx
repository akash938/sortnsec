/**
 * Application Port: ImageClassifierPort
 * Contract for image classification adapters (Gemini Vision API / Local CLIP Worker).
 */
export class ImageClassifierPort {
  initialize(_callbacks) {
    throw new Error("ImageClassifierPort.initialize() must be implemented by adapter");
  }
  classifyBatch(_items) {
    throw new Error("ImageClassifierPort.classifyBatch() must be implemented by adapter");
  }
  terminate() {
    throw new Error("ImageClassifierPort.terminate() must be implemented by adapter");
  }
}
