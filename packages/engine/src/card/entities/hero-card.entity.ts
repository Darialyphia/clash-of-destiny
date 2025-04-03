import type { Game } from '../../game/game';
import type { Player } from '../../player/player.entity';
import { Interceptable } from '../../utils/interceptable';
import type { HeroBlueprint, SpellBlueprint, UnitBlueprint } from '../card-blueprint';
import { type CardOptions } from './card.entity';
import {
  makeUnitCardInterceptors,
  UnitCard,
  type SerializedUnitCard,
  type UnitCardEventMap,
  type UnitCardInterceptors
} from './unit-card.entity';

export type SerializedHeroCard = SerializedUnitCard & {
  baseLevel: number;
  level: number;
};
export type HeroCardEventMap = UnitCardEventMap;
export type HeroCardInterceptors = UnitCardInterceptors & {
  level: Interceptable<number>;
  spellpower: Interceptable<number>;
};

export class HeroCard extends UnitCard<
  SerializedHeroCard,
  HeroCardEventMap,
  HeroCardInterceptors,
  UnitBlueprint & HeroBlueprint
> {
  constructor(game: Game, player: Player, options: CardOptions<SpellBlueprint>) {
    super(
      game,
      player,
      {
        ...makeUnitCardInterceptors(),
        level: new Interceptable(),
        spellpower: new Interceptable()
      },
      options
    );
  }

  get baseLevel() {
    return this.blueprint.level;
  }

  get level() {
    return this.interceptors.level.getValue(this.baseLevel, {});
  }

  get spellpower() {
    return this.interceptors.spellpower.getValue(this.blueprint.spellpower, {});
  }

  serialize(): SerializedHeroCard {
    const base = this.serializeBase();

    return {
      ...base,
      level: this.level,
      baseLevel: this.baseLevel
    };
  }
}
