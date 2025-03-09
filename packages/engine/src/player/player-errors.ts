export class NoDeploymentError extends Error {
  constructor() {
    super('Deployment has nto been commited yet');
  }
}
