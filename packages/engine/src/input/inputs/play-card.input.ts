import { z } from 'zod';
import { defaultInputSchema, Input } from '../input';
import { GAME_PHASES } from '../../game/systems/game-phase.system';
import { assert } from '@game/shared';
import { NotActivePlayerError } from '../input-errors';

const schema = defaultInputSchema.extend({
  index: z.number()
});

export class PlayCardInput extends Input<typeof schema> {
  readonly name = 'playCard';

  readonly allowedPhases = [GAME_PHASES.BATTLE];

  protected payloadSchema = schema;

  impl() {
    assert(
      this.game.turnSystem.activeUnit.player.equals(this.player),
      new NotActivePlayerError()
    );

    this.game.turnSystem.activeUnit.playCardAtIndex(this.payload.index);
  }
}
