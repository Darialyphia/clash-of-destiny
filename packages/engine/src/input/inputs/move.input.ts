import { z } from 'zod';
import { defaultInputSchema, Input } from '../input';
import { assert } from '@game/shared';
import { GAME_PHASES } from '../../game/systems/game-phase.system';
import { NotActivePlayerError, IllegalMovementError } from '../input-errors';

const schema = defaultInputSchema.extend({
  x: z.number(),
  y: z.number()
});

export class MoveInput extends Input<typeof schema> {
  readonly name = 'move';

  readonly allowedPhases = [GAME_PHASES.BATTLE];

  protected payloadSchema = schema;

  impl() {
    assert(
      this.game.turnSystem.activeUnit.player.equals(this.player),
      new NotActivePlayerError()
    );
    assert(
      this.game.turnSystem.activeUnit.canMoveTo(this.payload),
      new IllegalMovementError(this.payload)
    );

    this.game.turnSystem.activeUnit.move(this.payload);
  }
}
