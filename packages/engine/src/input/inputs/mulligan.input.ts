import { defaultInputSchema, Input } from '../input';
import { GAME_PHASES } from '../../game/systems/game-phase.system';
import { z } from 'zod';
import { assert } from '@game/shared';
import { AlreadyMulliganedError, TooManyMulliganedCardsError } from '../input-errors';

const schema = defaultInputSchema.extend({
  indices: z.number().array()
});

export class MulliganInput extends Input<typeof schema> {
  readonly name = 'mulligan';

  readonly allowedPhases = [GAME_PHASES.MULLIGAN];

  protected payloadSchema = schema;

  impl() {
    assert(!this.player.hasMulliganed, new AlreadyMulliganedError());
    assert(
      this.payload.indices.length <= this.game.config.MAX_MULLIGANED_CARDS,
      new TooManyMulliganedCardsError()
    );

    this.player.commitMulliganIndices(this.payload.indices);

    if (this.game.playerSystem.players.every(p => p.hasMulliganed)) {
      this.game.gamePhaseSystem.startBattle();
    }
  }
}
