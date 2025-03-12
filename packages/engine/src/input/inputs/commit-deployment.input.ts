import { z } from 'zod';
import { defaultInputSchema, Input } from '../input';
import { assert, isDefined } from '@game/shared';
import { GAME_PHASES } from '../../game/systems/game-phase.system';
import { InvalidDeploymentError } from '../input-errors';

const schema = defaultInputSchema;

export class CommitDeploymentInput extends Input<typeof schema> {
  readonly name = 'commitDeployment';

  readonly allowedPhases = [GAME_PHASES.DEPLOY];

  protected payloadSchema = schema;

  impl() {
    this.player.commitDeployment();
  }
}
