import { z } from 'zod';
import { defaultInputSchema, Input } from '../input';
import { assert, isDefined } from '@game/shared';
import { GAME_PHASES } from '../../game/game.enums';
import {
  IllegalAbilityError,
  NotTurnPlayerError,
  UnknownArtifactError
} from '../input-errors';

const schema = defaultInputSchema.extend({
  artifactId: z.string(),
  abilityId: z.string()
});

export class UseArtifactAbilityInput extends Input<typeof schema> {
  readonly name = 'useArtifactAbility';

  readonly allowedPhases = [GAME_PHASES.MAIN];

  protected payloadSchema = schema;

  private get artifact() {
    return this.player.artifacts.getArtifactById(this.payload.artifactId);
  }

  impl() {
    assert(
      this.game.gamePhaseSystem.turnPlayer.equals(this.player),
      new NotTurnPlayerError()
    );

    assert(isDefined(this.artifact), new UnknownArtifactError(this.payload.artifactId));

    assert(this.artifact.canUseAbiliy(this.payload.abilityId), new IllegalAbilityError());

    this.artifact.useAbility(this.payload.abilityId);
  }
}
