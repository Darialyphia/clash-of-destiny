export class TooManyArtifactsError extends Error {
  constructor() {
    super('Cannot equip more artifacts');
  }
}
