import { z } from 'zod';
import { defaultInputSchema, Input } from '../input';
import { GAME_PHASES } from '../../game/game.enums';
import { assert } from '@game/shared';
import {
  InvalidCardIndexError,
  NotTurnPlayerError,
  TooManyResourceActionError
} from '../input-errors';
import { PlayerAlreadyPerformedResourceActionError } from '../../player/player-errors';
import { defaultConfig } from '../../config';

const schema = defaultInputSchema.extend({
  indices: z
    .number()
    .array()
    .min(defaultConfig.DESTINY_RESOURCE_ACTION_MIN_BANISHED_CARDS)
    .max(defaultConfig.DESTINY_RESOURCE_ACTION_MAX_BANISHED_CARDS)
});

export class ResourceActionGainDestinyInput extends Input<typeof schema> {
  readonly name = 'resourceActionGainDestiny';

  readonly allowedPhases = [GAME_PHASES.MAIN];

  protected payloadSchema = schema;

  impl() {
    assert(
      this.game.gamePhaseSystem.turnPlayer.equals(this.player),
      new NotTurnPlayerError()
    );

    assert(
      this.payload.indices.every(index => this.player.cards.hand.length > index),
      new InvalidCardIndexError()
    );

    assert(this.player.canPerformResourceAction(), new TooManyResourceActionError());

    this.player.resourceActionGainDestiny(this.payload.indices);
  }
}
