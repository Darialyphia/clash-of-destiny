import { z } from 'zod';
import { defaultInputSchema, Input } from '../input';
import { GAME_PHASES } from '../../game/systems/game-phase.system';
import { assert } from '@game/shared';
import { NotActivePlayerError, TooManyReplacesError } from '../input-errors';

const schema = defaultInputSchema.extend({
  index: z.number()
});

export class ReplaceCardInput extends Input<typeof schema> {
  readonly name = 'replaceCard';

  readonly allowedPhases = [GAME_PHASES.BATTLE];

  protected payloadSchema = schema;

  impl() {
    assert(
      this.game.turnSystem.activePlayer.equals(this.player),
      new NotActivePlayerError()
    );
    assert(this.player.canReplace, new TooManyReplacesError());

    this.player.replaceCardAtIndex(this.payload.index);
  }
}
