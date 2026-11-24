/**
 * Application Port: SampleGeneratorPort
 * Contract for generating non-repeating curated aesthetic sample photos.
 */
export class SampleGeneratorPort {
  async generate(_count, _excludeNames) {
    throw new Error("SampleGeneratorPort.generate() must be implemented by adapter");
  }
  reset() {
    throw new Error("SampleGeneratorPort.reset() must be implemented by adapter");
  }
}
