import { z } from 'zod';
import { defaultInputSchema, Input } from '../input';
import { GAME_PHASES } from '../../game/game.enums';
import { assert } from '@game/shared';
import { IllegalCardPlayedError, NotTurnPlayerError } from '../input-errors';

const schema = defaultInputSchema.extend({
  index: z.number()
});

export class PlayCardInput extends Input<typeof schema> {
  readonly name = 'playCard';

  readonly allowedPhases = [GAME_PHASES.MAIN];

  protected payloadSchema = schema;

  impl() {
    assert(
      this.game.gamePhaseSystem.turnPlayer.equals(this.player),
      new NotTurnPlayerError()
    );

    const card = this.player.cards.getCardAt(this.payload.index);
    assert(this.player.canPlayCard(card), new IllegalCardPlayedError());

    this.player.playMainDeckCardAtIndex(this.payload.index);
  }
}
