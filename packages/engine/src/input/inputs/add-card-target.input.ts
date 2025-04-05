import { assert } from '@game/shared';
import { defaultInputSchema, Input } from '../input';
import { z } from 'zod';
import { InvalidInteractionStateError, NotTurnPlayerError } from '../input-errors';
import { INTERACTION_STATES } from '../../game/systems/interaction.system';
import { GAME_PHASES } from '../../game/game.enums';

const schema = defaultInputSchema.extend({
  x: z.number(),
  y: z.number()
});

export class AddCardTargetCardInput extends Input<typeof schema> {
  readonly name = 'addCardTarget';

  readonly allowedPhases = [GAME_PHASES.DESTINY, GAME_PHASES.MAIN];

  protected payloadSchema = schema;

  impl() {
    assert(
      this.game.gamePhaseSystem.turnPlayer.equals(this.player),
      new NotTurnPlayerError()
    );
    assert(
      this.game.interaction.context.state === INTERACTION_STATES.SELECTING_TARGETS,
      new InvalidInteractionStateError()
    );
    console.log('commit', performance.now());

    this.game.interaction.addTarget({
      type: 'cell',
      cell: this.payload
    });
  }
}
