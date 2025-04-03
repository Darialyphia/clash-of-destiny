import { z } from 'zod';
import { defaultInputSchema, Input } from '../input';
import { assert, isDefined } from '@game/shared';
import { GAME_PHASES } from '../../game/game.enums';
import {
  IllegalAbilityError,
  NotTurnPlayerError,
  UnitNotOwnedError,
  UnknownUnitError
} from '../input-errors';

const schema = defaultInputSchema.extend({
  unitId: z.string(),
  index: z.number()
});

export class UseUnitAbilityInput extends Input<typeof schema> {
  readonly name = 'useUnitAbility';

  readonly allowedPhases = [GAME_PHASES.MAIN];

  protected payloadSchema = schema;

  private get unit() {
    return this.game.unitSystem.getUnitById(this.payload.unitId);
  }

  impl() {
    assert(
      this.game.gamePhaseSystem.turnPlayer.equals(this.player),
      new NotTurnPlayerError()
    );

    assert(isDefined(this.unit), new UnknownUnitError(this.payload.unitId));
    assert(this.unit.player.equals(this.player), new UnitNotOwnedError());

    assert(this.unit.canUseAbiliy(this.payload.index), new IllegalAbilityError());

    this.unit.useAbility(this.payload.index);
  }
}
