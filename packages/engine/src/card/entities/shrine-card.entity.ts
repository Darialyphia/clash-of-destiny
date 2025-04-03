import type { Game } from '../../game/game';
import type { Player } from '../../player/player.entity';
import { UNIT_EVENTS } from '../../unit/unit-enums';
import { Interceptable } from '../../utils/interceptable';
import type {
  ShrineBlueprint,
  MinionBlueprint,
  SpellBlueprint,
  UnitBlueprint
} from '../card-blueprint';
import { CARD_EVENTS } from '../card.enums';
import { CardAfterPlayEvent, CardBeforePlayEvent } from '../card.events';
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

  override play() {
    const summonPosition = this.player.shrinePosition;
    this.unit = this.game.unitSystem.addUnit(this, summonPosition);

    const onLeaveBoardCleanups = [
      UNIT_EVENTS.AFTER_DESTROY,
      UNIT_EVENTS.AFTER_BOUNCE
    ].map(e =>
      this.unit.once(e, () => {
        // @ts-expect-error
        this.unit = undefined;
        onLeaveBoardCleanups.forEach(cleanup => cleanup());
      })
    );

    this.emitter.emit(
      CARD_EVENTS.BEFORE_PLAY,
      new CardBeforePlayEvent({ targets: [summonPosition] })
    );

    const aoeShape = this.blueprint.getAoe(this.game, this as any, [summonPosition]);
    this.unit.addToBoard({
      affectedCells: aoeShape.getCells([summonPosition]),
      affectedUnits: aoeShape.getUnits([summonPosition])
    });

    this.blueprint.onPlay(
      this.game,
      this as any,
      aoeShape.getCells([summonPosition]),
      aoeShape.getUnits([summonPosition])
    );

    this.emitter.emit(
      CARD_EVENTS.AFTER_PLAY,
      new CardAfterPlayEvent({ targets: [summonPosition] })
    );
  }
}
