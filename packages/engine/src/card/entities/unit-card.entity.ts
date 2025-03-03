import type { Game } from '../../game/game';
import type { Player } from '../../player/player.entity';
import type { Unit } from '../../unit/entities/unit.entity';
import type { UnitBlueprint } from '../card-blueprint';
import { CARD_KINDS } from '../card.enums';
import type { CardEventMap } from '../card.events';
import { Card, type CardOptions, type SerializedCard } from './card.entity';

export type SerializedUnitCard = SerializedCard & {
  kind: typeof CARD_KINDS.UNIT;
};
export type UnitCardEventMap = CardEventMap;
export type UnitCardInterceptors = Record<string, never>;

export class UnitCard extends Card<
  SerializedCard,
  UnitCardEventMap,
  UnitCardInterceptors,
  UnitBlueprint
> {
  readonly unit!: Unit;

  constructor(game: Game, unit: Unit, options: CardOptions<UnitBlueprint>) {
    super(game, unit, {}, options);
  }

  canPlay(): boolean {
    return true;
  }

  play() {}

  serialize(): SerializedUnitCard {
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

  get maxHp() {
    return this.blueprint.maxHp;
  }

  get initiative() {
    return this.blueprint.initiative;
  }
}
