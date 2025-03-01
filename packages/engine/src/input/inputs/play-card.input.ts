import { z } from 'zod';
import { defaultInputSchema, Input } from '../input';
import { GAME_PHASES } from '../../game/systems/game-phase.system';
import { assert } from '@game/shared';
import { NotActivePlayerError } from '../input-errors';

const schema = defaultInputSchema.extend({
  index: z.number(),
  target: z.object({
    x: z.number(),
    y: z.number()
  })
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

    this.player.playCardAtIndex(this.payload.index);
    this.game.interaction.addTarget({
      type: 'cell',
      cell: this.payload.target
    });
  }
}
