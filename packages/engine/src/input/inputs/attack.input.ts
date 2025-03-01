import { z } from 'zod';
import { defaultInputSchema, Input } from '../input';
import { assert, isDefined } from '@game/shared';
import { GAME_PHASES } from '../../game/systems/game-phase.system';
import {
  IllegalAttackTargetError,
  NotActivePlayerError,
  UnitNotOwnedError,
  UnknownUnitError
} from '../input-errors';

const schema = defaultInputSchema.extend({
  unitId: z.string(),
  x: z.number(),
  y: z.number()
});

export class AttackInput extends Input<typeof schema> {
  readonly name = 'attack';

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
    assert(
      this.unit.canAttackAt(this.payload),
      new IllegalAttackTargetError(this.payload)
    );

    this.unit.attack(this.payload);
  }
}
