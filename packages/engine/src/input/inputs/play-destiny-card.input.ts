import { z } from 'zod';
import { defaultInputSchema, Input } from '../input';
import { GAME_PHASES } from '../../game/game.enums';
import { assert } from '@game/shared';
import { IllegalCardPlayedError, NotTurnPlayerError } from '../input-errors';

const schema = defaultInputSchema.extend({
  index: z.number()
});

export class PlayDestinyCardInput extends Input<typeof schema> {
  readonly name = 'playDestinyCard';

  readonly allowedPhases = [GAME_PHASES.DESTINY];

  protected payloadSchema = schema;

  impl() {
    assert(
      this.game.gamePhaseSystem.turnPlayer.equals(this.player),
      new NotTurnPlayerError()
    );

    const card = this.player.cards.getDestinyCardAt(this.payload.index);
    assert(card, new IllegalCardPlayedError());
    assert(this.player.canPlayCard(card), new IllegalCardPlayedError());

    this.game.gamePhaseSystem.playDestinyCard(this.payload.index);
  }
}
