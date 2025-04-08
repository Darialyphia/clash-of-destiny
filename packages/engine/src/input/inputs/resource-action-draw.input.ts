import { defaultInputSchema, Input } from '../input';
import { GAME_PHASES } from '../../game/game.enums';
import { assert } from '@game/shared';
import { NotTurnPlayerError } from '../input-errors';
import { PlayerAlreadyPerformedResourceActionError } from '../../player/player-errors';

const schema = defaultInputSchema;

export class ResourceActionDrawInput extends Input<typeof schema> {
  readonly name = 'resourceActionDraw';

  readonly allowedPhases = [GAME_PHASES.MAIN];

  protected payloadSchema = schema;

  impl() {
    assert(
      this.game.gamePhaseSystem.turnPlayer.equals(this.player),
      new NotTurnPlayerError()
    );

    assert(
      this.player.canPerformResourceAction,
      new PlayerAlreadyPerformedResourceActionError()
    );

    this.player.resourceActionDraw();
  }
}
