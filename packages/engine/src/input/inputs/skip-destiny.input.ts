import { defaultInputSchema, Input } from '../input';
import { assert } from '@game/shared';
import { GAME_PHASES } from '../../game/game.enums';
import { NotTurnPlayerError } from '../input-errors';

const schema = defaultInputSchema;

export class SkipDestinyInput extends Input<typeof schema> {
  readonly name = 'skipDestiny';

  readonly allowedPhases = [GAME_PHASES.DESTINY];

  protected payloadSchema = schema;

  impl() {
    assert(
      this.game.gamePhaseSystem.turnPlayer.equals(this.player),
      new NotTurnPlayerError()
    );

    this.game.gamePhaseSystem.skipDestiny();
  }
}
