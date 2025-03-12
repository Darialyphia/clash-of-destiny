import { z } from 'zod';
import { defaultInputSchema, Input } from '../input';
import { assert, isDefined } from '@game/shared';
import { GAME_PHASES } from '../../game/systems/game-phase.system';
import { InvalidDeploymentError } from '../input-errors';

const schema = defaultInputSchema.extend({
  heroId: z.string(),
  x: z.number(),
  y: z.number()
});

export class DeployUnitInput extends Input<typeof schema> {
  readonly name = 'deployUnit';

  readonly allowedPhases = [GAME_PHASES.DEPLOY];

  protected payloadSchema = schema;

  impl() {
    const unit = this.player.heroes.find(h => h.unit.id === this.payload.heroId)?.unit;
    assert(unit, new InvalidDeploymentError());
    const cell = this.game.boardSystem.getCellAt(this.payload);
    assert(isDefined(cell), new InvalidDeploymentError());
    assert(cell?.player?.equals(this.player), new InvalidDeploymentError());

    unit.deployAt(cell);

    // this.player.commitDeployment(this.payload.deployment);

    // if (this.game.playerSystem.players.every(p => p.isReadyToDeploy)) {
    //   this.game.gamePhaseSystem.startBattle();
    // }
  }
}
