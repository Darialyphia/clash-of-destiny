export class NoDeploymentError extends Error {
  constructor() {
    super('Deployment has nto been commited yet');
  }
}

export class PlayerAlreadyPerformedResourceActionError extends Error {
  constructor() {
    super('Player already performed resource action');
  }
}

export class TooManyReplacesError extends Error {
  constructor() {
    super('Player has already performed the maximum number of replaces this turn');
  }
}

export class ArtifactAbilityNotFoundError extends Error {
  constructor() {
    super('Artifact ability not found');
  }
}

export class MissingShrineError extends Error {
  constructor() {
    super('Missing shrine');
  }
}
