export class NotEnoughManaError extends Error {
  constructor() {
    super('Not enough mana');
  }
}

export class CardNotFoundError extends Error {
  constructor() {
    super('Card not found');
  }
}
