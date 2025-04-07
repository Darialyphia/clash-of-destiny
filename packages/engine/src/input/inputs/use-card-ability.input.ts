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
import { CardNotFoundError } from '../../card/card-errors';

const schema = defaultInputSchema.extend({
  cardId: z.string(),
  abilityId: z.string()
});

export class UseCardAbilityInput extends Input<typeof schema> {
  readonly name = 'useCardAbility';

  readonly allowedPhases = [GAME_PHASES.MAIN];

  protected payloadSchema = schema;

  private get card() {
    return this.player.cards.findCard(this.payload.cardId)?.card;
  }

  impl() {
    assert(
      this.game.gamePhaseSystem.turnPlayer.equals(this.player),
      new NotTurnPlayerError()
    );

    assert(isDefined(this.card), new CardNotFoundError());

    assert(this.card.canUseAbiliy(this.payload.abilityId), new IllegalAbilityError());
    this.card.useAbility(this.payload.abilityId);
  }
}
