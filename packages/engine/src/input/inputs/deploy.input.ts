import { z } from 'zod';
import { defaultInputSchema, Input } from '../input';
import { assert } from '@game/shared';
import { GAME_PHASES } from '../../game/systems/game-phase.system';
import { InvalidDeploymentError } from '../input-errors';

const schema = defaultInputSchema.extend({
  deployment: z.array(
    z.object({
      heroId: z.string(),
      x: z.number(),
      y: z.number()
    })
  )
});

export class DeployInput extends Input<typeof schema> {
  readonly name = 'deploy';

  readonly allowedPhases = [GAME_PHASES.DEPLOY];

  protected payloadSchema = schema;

  impl() {
    assert(
      this.payload.deployment.length === this.player.heroes.length,
      new InvalidDeploymentError()
    );

    this.player.commitDeployment(this.payload.deployment);

    if (this.game.playerSystem.players.every(p => p.isReadyToDeploy)) {
      this.game.gamePhaseSystem.startBattle();
    }
  }
}
