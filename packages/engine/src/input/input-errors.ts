import type { Point } from '@game/shared';

export class InputError extends Error {
  constructor(message: string) {
    super(`Input error: ${message}`);
  }
}

export class InvalidInteractionStateError extends InputError {
  constructor() {
    super('Invalid interaction state');
  }
}

export class AlreadyMulliganedError extends InputError {
  constructor() {
    super('Player has already mulliganed.');
  }
}

export class TooManyMulliganedCardsError extends InputError {
  constructor() {
    super('Too many cards mulliganed.');
  }
}

export class NotturnPlayerError extends InputError {
  constructor() {
    super('You are not the active player.');
  }
}

export class TooManyReplacesError extends InputError {
  constructor() {
    super('You cannot replace any more cards this turn.');
  }
}

export class InvalidCardIndexError extends InputError {
  constructor() {
    super('Invalid card index');
  }
}

export class WrongGamePhaseError extends InputError {
  constructor() {
    super('You cannot do this action in the current game phase.');
  }
}

export class MissingPayloadError extends InputError {
  constructor() {
    super('Input payload is required');
  }
}

export class UnknownPlayerError extends InputError {
  constructor(playerId: string) {
    super(`Unknown player id: ${playerId}`);
  }
}

export class UnknownUnitError extends InputError {
  constructor(unitId: string) {
    super(`Unknown unit id: ${unitId}`);
  }
}

export class UnitNotOwnedError extends InputError {
  constructor() {
    super('You do not own this unit.');
  }
}

export class IllegalAttackTargetError extends InputError {
  constructor(point: Point) {
    super(`Cannot attack at position ${point.x}:${point.y}`);
  }
}

export class IllegalMovementError extends InputError {
  constructor(point: Point) {
    super(`Cannot move at position ${point.x}:${point.y}`);
  }
}

export class TooManyTargetsError extends InputError {
  constructor() {
    super('You cannot add more targets');
  }
}

export class IllegalTargetError extends InputError {
  constructor() {
    super('Illegal target');
  }
}

export class InvalidDeploymentError extends InputError {
  constructor() {
    super('Invalid deployment');
  }
}

export class CannotLevelUpError extends InputError {
  constructor() {
    super('Cannot level up');
  }
}

export class IllegalCardPlayedError extends InputError {
  constructor() {
    super('Cannot play this card');
  }
}
