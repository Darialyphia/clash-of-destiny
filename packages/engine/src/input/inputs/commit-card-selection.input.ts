import { defaultInputSchema, Input } from '../input';
import { GAME_PHASES } from '../../game/game.enums';
import { z } from 'zod';
import { assert } from '@game/shared';
import { InvalidInteractionStateError, NotTurnPlayerError } from '../input-errors';
import { INTERACTION_STATE_TRANSITIONS } from '../../game/systems/interaction.system';

const schema = defaultInputSchema.extend({
  ids: z.array(z.string())
});

export class CommitCardSelectionCardInput extends Input<typeof schema> {
  readonly name = 'commitCardSelection';

  readonly allowedPhases = [GAME_PHASES.MAIN];

  protected payloadSchema = schema;

  impl() {
    assert(
      this.game.gamePhaseSystem.turnPlayer.equals(this.player),
      new NotTurnPlayerError()
    );

    assert(
      this.game.interaction.can(INTERACTION_STATE_TRANSITIONS.COMMIT_CARD_SELECTION),
      new InvalidInteractionStateError()
    );

    this.game.interaction.commitCardSelection(this.payload.ids);
  }
}
