import { z } from 'zod';
import { defaultInputSchema, Input } from '../input';
import { GAME_PHASES } from '../../game/systems/game-phase.system';
import { assert } from '@game/shared';
import {
  InvalidCardIndexError,
  NotActivePlayerError,
  TooManyReplacesError
} from '../input-errors';

const schema = defaultInputSchema.extend({
  index: z.number()
});

export class ReplaceCardInput extends Input<typeof schema> {
  readonly name = 'replaceCard';

  readonly allowedPhases = [GAME_PHASES.BATTLE];

  protected payloadSchema = schema;

  impl() {
    assert(
      this.game.turnSystem.activeUnit.player.equals(this.player),
      new NotActivePlayerError()
    );

    assert(
      this.game.turnSystem.activeUnit.cards.hand.length > this.payload.index,
      new InvalidCardIndexError()
    );

    assert(this.game.turnSystem.activeUnit.canReplace(), new TooManyReplacesError());
    this.game.turnSystem.activeUnit.replaceCardAtIndex(this.payload.index);
  }
}
