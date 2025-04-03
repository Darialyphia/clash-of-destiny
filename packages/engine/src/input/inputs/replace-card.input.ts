import { z } from 'zod';
import { defaultInputSchema, Input } from '../input';
import { GAME_PHASES } from '../../game/game.enums';
import { assert } from '@game/shared';
import {
  InvalidCardIndexError,
  NotTurnPlayerError,
  TooManyReplacesError
} from '../input-errors';
import { PlayerAlreadyPerformedResourceActionError } from '../../player/player-errors';

const schema = defaultInputSchema.extend({
  index: z.number()
});

export class ReplaceCardInput extends Input<typeof schema> {
  readonly name = 'replaceCard';

  readonly allowedPhases = [GAME_PHASES.MAIN];

  protected payloadSchema = schema;

  impl() {
    assert(
      this.game.gamePhaseSystem.turnPlayer.equals(this.player),
      new NotTurnPlayerError()
    );

    assert(
      this.player.cards.hand.length > this.payload.index,
      new InvalidCardIndexError()
    );

    assert(
      this.player.canPerformResourceAction,
      new PlayerAlreadyPerformedResourceActionError()
    );
    // this.game.gamePhaseSystem.activeUnit.replaceCardAtIndex(this.payload.index);
  }
}
