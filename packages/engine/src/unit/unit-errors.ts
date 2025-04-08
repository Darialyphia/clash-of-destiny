import type { UnitKind } from '../card/card.enums';

export class UnitAbilityNotFoundError extends Error {
  constructor() {
    super(`Unit ability not found`);
  }
}

export class WrongUnitKindError extends Error {
  constructor(expected: UnitKind, actual: UnitKind) {
    super(`Expected unit kind ${expected}, but got ${actual}`);
  }
}
