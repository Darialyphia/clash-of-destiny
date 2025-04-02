import { assert } from '@game/shared';
import { GAME_PHASES } from '../../game/systems/game-phase.system';
import { defaultInputSchema, Input } from '../input';
import { z } from 'zod';
import { InvalidInteractionStateError, NotActivePlayerError } from '../input-errors';
import { INTERACTION_STATES } from '../../game/systems/interaction.system';

const schema = defaultInputSchema.extend({
  x: z.number(),
  y: z.number()
});

export class AddCardTargetCardInput extends Input<typeof schema> {
  readonly name = 'addCardTarget';

  readonly allowedPhases = [GAME_PHASES.BATTLE];

  protected payloadSchema = schema;

  impl() {
    assert(
      this.game.turnSystem.activePlayer.equals(this.player),
      new NotActivePlayerError()
    );
    assert(
      this.game.interaction.context.state === INTERACTION_STATES.SELECTING_TARGETS,
      new InvalidInteractionStateError()
    );

    this.game.interaction.addTarget({
      type: 'cell',
      cell: this.payload
    });
  }
}
