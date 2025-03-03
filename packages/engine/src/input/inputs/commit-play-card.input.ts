import { defaultInputSchema, Input } from '../input';
import { GAME_PHASES } from '../../game/systems/game-phase.system';
import { assert } from '@game/shared';
import { InvalidInteractionStateError, NotActivePlayerError } from '../input-errors';
import { INTERACTION_STATE_TRANSITIONS } from '../../game/systems/interaction.system';

const schema = defaultInputSchema;

export class CommitPlayCardInput extends Input<typeof schema> {
  readonly name = 'commitPlayCard';

  readonly allowedPhases = [GAME_PHASES.BATTLE];

  protected payloadSchema = schema;

  impl() {
    assert(
      this.game.turnSystem.activeUnit.player.equals(this.player),
      new NotActivePlayerError()
    );

    assert(
      this.game.interaction.can(INTERACTION_STATE_TRANSITIONS.COMMIT_SELECTING_TARGETS),
      new InvalidInteractionStateError()
    );

    this.game.interaction.commitTargets();
  }
}
