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
  x: z.number(),
  y: z.number()
});

export class AttackInput extends Input<typeof schema> {
  readonly name = 'attack';

  readonly allowedPhases = [GAME_PHASES.BATTLE];

  protected payloadSchema = schema;

  impl() {
    assert(
      this.game.turnSystem.activeUnit.player.equals(this.player),
      new NotActivePlayerError()
    );

    assert(
      this.game.turnSystem.activeUnit.canAttackAt(this.payload),
      new IllegalAttackTargetError(this.payload)
    );

    this.game.turnSystem.activeUnit.attack(this.payload);
  }
}
