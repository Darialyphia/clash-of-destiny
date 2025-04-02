import { z } from 'zod';
import { defaultInputSchema, Input } from '../input';
import { GAME_PHASES } from '../../game/systems/game-phase.system';
import { assert } from '@game/shared';
import { IllegalCardPlayedError, NotActivePlayerError } from '../input-errors';

const schema = defaultInputSchema.extend({
  index: z.number()
});

export class PlayCardInput extends Input<typeof schema> {
  readonly name = 'playCard';

  readonly allowedPhases = [GAME_PHASES.BATTLE];

  protected payloadSchema = schema;

  impl() {
    assert(
      this.game.turnSystem.activePlayer.equals(this.player),
      new NotActivePlayerError()
    );

    const card = this.player.cards.getCardAt(this.payload.index);
    assert(this.player.canPlayCard(card), new IllegalCardPlayedError());

    this.player.playMainDeckCardAtIndex(this.payload.index);
  }
}
