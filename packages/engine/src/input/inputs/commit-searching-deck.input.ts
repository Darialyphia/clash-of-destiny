import { defaultInputSchema, Input } from '../input';
import { GAME_PHASES } from '../../game/systems/game-phase.system';
import { z } from 'zod';
import { assert } from '@game/shared';
import { INTERACTION_STATE_TRANSITIONS } from '../../game/systems/interaction.system';
import { NotActivePlayerError, InvalidInteractionStateError } from '../input-errors';

const schema = defaultInputSchema.extend({
  ids: z.array(z.string())
});

export class CommitSearchingDeckCardInput extends Input<typeof schema> {
  readonly name = 'commitSearchingDeck';

  readonly allowedPhases = [GAME_PHASES.BATTLE];

  protected payloadSchema = schema;

  impl() {
    assert(
      this.game.turnSystem.activePlayer.equals(this.player),
      new NotActivePlayerError()
    );

    assert(
      this.game.interaction.can(INTERACTION_STATE_TRANSITIONS.COMMIT_SEARCHING_DECK),
      new InvalidInteractionStateError()
    );

    this.game.interaction.commitSearchingDeck(this.payload.ids);
  }
}
