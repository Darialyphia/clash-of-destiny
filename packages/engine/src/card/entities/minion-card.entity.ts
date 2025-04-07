import type { Game } from '../../game/game';
import type { Player } from '../../player/player.entity';
import { Interceptable } from '../../utils/interceptable';
import type { MinionBlueprint, SpellBlueprint, UnitBlueprint } from '../card-blueprint';
import { type CardOptions } from './card.entity';
import {
  makeUnitCardInterceptors,
  UnitCard,
  type SerializedUnitCard,
  type UnitCardEventMap,
  type UnitCardInterceptors
} from './unit-card.entity';

export type SerializedMinionCard = SerializedUnitCard & {
  atk: number;
  maxHp: number;
  job: string;
};
export type MinionCardEventMap = UnitCardEventMap;
export type MinionCardInterceptors = UnitCardInterceptors & {
  canPlay: Interceptable<boolean, MinionCard>;
};

export class MinionCard extends UnitCard<
  SerializedMinionCard,
  MinionCardEventMap,
  MinionCardInterceptors,
  UnitBlueprint & MinionBlueprint
> {
  constructor(game: Game, player: Player, options: CardOptions<SpellBlueprint>) {
    super(
      game,
      player,
      { ...makeUnitCardInterceptors(), canPlay: new Interceptable() },
      options
    );
    this.blueprint.onInit(this.game, this);
  }
  canPlay(): boolean {
    return this.interceptors.canPlay.getValue(
      this.fulfillsAffinity && this.fulfillsResourceCost,
      this
    );
  }

  serialize(): SerializedMinionCard {
    return {
      ...this.serializeBase(),
      atk: this.atk,
      maxHp: this.maxHp,
      job: this.blueprint.job
    };
  }
}
