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
