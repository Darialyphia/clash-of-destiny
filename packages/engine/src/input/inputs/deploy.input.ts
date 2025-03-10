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

    const isDistinctPoints =
      new Set(
        this.payload.deployment.map(deployment => `${deployment.x}:${deployment.y}`)
      ).size === this.payload.deployment.length;
    assert(isDistinctPoints, new InvalidDeploymentError());

    const isValid = this.payload.deployment.every(deployment => {
      const hero = this.player.heroes.find(h => h.unit.id === deployment.heroId);
      if (!hero) return false;
      const cell = this.game.boardSystem.getCellAt(deployment);

      return cell?.player?.equals(this.player);
    });

    assert(isValid, new InvalidDeploymentError());
    this.player.commitDeployment(this.payload.deployment);

    if (this.game.playerSystem.players.every(p => p.isReadyToDeploy)) {
      this.game.gamePhaseSystem.startBattle();
    }
  }
}
