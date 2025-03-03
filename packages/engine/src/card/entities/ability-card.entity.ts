import type { Game } from '../../game/game';
import type { Player } from '../../player/player.entity';
import type { Unit } from '../../unit/entities/unit.entity';
import type { AbilityBlueprint } from '../card-blueprint';
import { CARD_KINDS } from '../card.enums';
import type { CardEventMap } from '../card.events';
import { Card, type CardOptions, type SerializedCard } from './card.entity';

export type SerializedAbilityCard = SerializedCard & { kind: typeof CARD_KINDS.ABILITY };
export type AbilityCardEventMap = CardEventMap;
export type AbilityCardInterceptors = Record<string, never>;

export class AbilityCard extends Card<
  SerializedCard,
  AbilityCardEventMap,
  AbilityCardInterceptors,
  AbilityBlueprint
> {
  constructor(game: Game, unit: Unit, options: CardOptions<AbilityBlueprint>) {
    super(game, unit, {}, options);
  }

  canPlay(): boolean {
    return this.manaCost <= this.unit.mp;
  }

  play() {}

  get manaCost() {
    return this.blueprint.manaCost;
  }

  serialize(): SerializedAbilityCard {
    return {
      id: this.id,
      blueprintId: this.blueprint.id,
      kind: this.blueprint.kind,
      setId: this.blueprint.setId,
      name: this.blueprint.name,
      description: this.blueprint.description,
      rarity: this.blueprint.rarity
    };
  }
}
