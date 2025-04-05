import type { Game } from '../../game/game';
import type { Player } from '../../player/player.entity';
import { Interceptable } from '../../utils/interceptable';
import type { ShrineBlueprint, SpellBlueprint, UnitBlueprint } from '../card-blueprint';
import { type CardOptions } from './card.entity';
import {
  makeUnitCardInterceptors,
  UnitCard,
  type SerializedUnitCard,
  type UnitCardEventMap,
  type UnitCardInterceptors
} from './unit-card.entity';

export type SerializedShrineCard = SerializedUnitCard & {
  baseLevel: number;
  level: number;
  maxHp: number;
};
export type ShrineCardEventMap = UnitCardEventMap;
export type ShrineCardInterceptors = UnitCardInterceptors & {
  level: Interceptable<number>;
};

export class ShrineCard extends UnitCard<
  SerializedShrineCard,
  ShrineCardEventMap,
  ShrineCardInterceptors,
  UnitBlueprint & ShrineBlueprint
> {
  constructor(game: Game, player: Player, options: CardOptions<SpellBlueprint>) {
    super(
      game,
      player,
      { ...makeUnitCardInterceptors(), level: new Interceptable() },
      options
    );
  }

  get baseLevel() {
    return this.blueprint.level;
  }

  get level() {
    return this.interceptors.level.getValue(this.baseLevel, {});
  }

  serialize(): SerializedShrineCard {
    const base = this.serializeBase();

    return {
      ...base,
      level: this.level,
      baseLevel: this.baseLevel,
      maxHp: this.blueprint.maxHp
    };
  }

  override canPlay(): boolean {
    return true;
  }

  override play() {
    this.playWithTargets([{ type: 'cell', cell: this.player.shrinePosition }]);
  }
}
