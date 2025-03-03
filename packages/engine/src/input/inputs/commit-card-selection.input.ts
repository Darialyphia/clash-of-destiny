import { defaultInputSchema, Input } from '../input';
import { GAME_PHASES } from '../../game/systems/game-phase.system';
import { z } from 'zod';
import { assert } from '@game/shared';
import { InvalidInteractionStateError, NotActivePlayerError } from '../input-errors';
import { INTERACTION_STATE_TRANSITIONS } from '../../game/systems/interaction.system';

const schema = defaultInputSchema.extend({
  ids: z.array(z.string())
});

export class CommitCardSelectionCardInput extends Input<typeof schema> {
  readonly name = 'commitCardSelection';

  readonly allowedPhases = [GAME_PHASES.BATTLE];

  protected payloadSchema = schema;

  impl() {
    assert(
      this.game.turnSystem.activeUnit.player.equals(this.player),
      new NotActivePlayerError()
    );

    assert(
      this.game.interaction.can(INTERACTION_STATE_TRANSITIONS.COMMIT_CARD_SELECTION),
      new InvalidInteractionStateError()
    );

    this.game.interaction.commitCardSelection(this.payload.ids);
  }
}
