export class GameError extends Error {
  public isGameError = true;
  constructor(message: string) {
    super(message);
  }
}
