import { assert } from '@game/shared';
import { defaultInputSchema, Input } from '../input';
import { GAME_PHASES } from '../../game/game.enums';
import { NotturnPlayerError } from '../input-errors';

const schema = defaultInputSchema;

export class EndTurnInput extends Input<typeof schema> {
  readonly name = 'endTurn';

  readonly allowedPhases = [GAME_PHASES.MAIN];

  protected payloadSchema = schema;

  impl() {
    assert(
      this.game.gamePhaseSystem.turnPlayer.equals(this.player),
      new NotturnPlayerError()
    );

    this.game.gamePhaseSystem.turnPlayer.endTurn();
  }
}
