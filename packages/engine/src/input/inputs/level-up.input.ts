import { defaultInputSchema, Input } from '../input';
import { GAME_PHASES } from '../../game/systems/game-phase.system';
import { CannotLevelUpError, NotActivePlayerError } from '../input-errors';
import { assert } from '@game/shared';

const schema = defaultInputSchema;

export class LevelUpInput extends Input<typeof schema> {
  readonly name = 'levelUp';

  readonly allowedPhases = [GAME_PHASES.BATTLE];

  protected payloadSchema = schema;

  impl() {
    assert(
      this.game.turnSystem.activeUnit.player.equals(this.player),
      new NotActivePlayerError()
    );
    assert(this.game.turnSystem.activeUnit.canLevelUp, new CannotLevelUpError());

    this.game.turnSystem.activeUnit.levelUp();
  }
}
