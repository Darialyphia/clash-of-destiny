import { z } from 'zod';
import { defaultInputSchema, Input } from '../input';
import { assert, isDefined } from '@game/shared';
import { GAME_PHASES } from '../../game/systems/game-phase.system';
import {
  NotActivePlayerError,
  UnknownUnitError,
  UnitNotOwnedError,
  IllegalMovementError
} from '../input-errors';

const schema = defaultInputSchema.extend({
  unitId: z.string(),
  x: z.number(),
  y: z.number()
});

export class MoveInput extends Input<typeof schema> {
  readonly name = 'move';

  readonly allowedPhases = [GAME_PHASES.BATTLE];

  protected payloadSchema = schema;

  private get unit() {
    return this.game.unitSystem.getUnitById(this.payload.unitId);
  }

  impl() {
    assert(
      this.game.turnSystem.activePlayer.equals(this.player),
      new NotActivePlayerError()
    );
    assert(isDefined(this.unit), new UnknownUnitError(this.payload.unitId));
    assert(
      this.unit.player.equals(this.game.turnSystem.activePlayer),
      new UnitNotOwnedError()
    );
    assert(this.unit.canMoveTo(this.payload), new IllegalMovementError(this.payload));

    this.unit.move(this.payload);
  }
}
