import { defaultInputSchema, Input } from '../input';
import { GAME_PHASES } from '../../game/game.enums';
import { assert } from '@game/shared';
import { InvalidInteractionStateError, NotTurnPlayerError } from '../input-errors';
import { INTERACTION_STATE_TRANSITIONS } from '../../game/systems/interaction.system';

const schema = defaultInputSchema;

export class CommitPlayCardInput extends Input<typeof schema> {
  readonly name = 'commitPlayCard';

  readonly allowedPhases = [GAME_PHASES.DESTINY, GAME_PHASES.MAIN];

  protected payloadSchema = schema;

  impl() {
    assert(
      this.game.gamePhaseSystem.turnPlayer.equals(this.player),
      new NotTurnPlayerError()
    );
    assert(
      this.game.interaction.can(INTERACTION_STATE_TRANSITIONS.COMMIT_SELECTING_TARGETS),
      new InvalidInteractionStateError()
    );
    this.game.interaction.commitTargets();
  }
}
