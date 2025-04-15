import type { Point } from '@game/shared';
import type { Game } from '../../game/game';
import type { SelectedTarget } from '../../game/systems/interaction.system';
import type { Player } from '../../player/player.entity';
import { Interceptable } from '../../utils/interceptable';
import type { HeroBlueprint, SpellBlueprint, UnitBlueprint } from '../card-blueprint';
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

export type SerializedHeroCard = SerializedUnitCard & {
  baseLevel: number;
  level: number;
  atk: number;
  maxHp: number;
  spellpower: number;
  job: string;
};
export type HeroCardEventMap = UnitCardEventMap;
export type HeroCardInterceptors = UnitCardInterceptors & {
  level: Interceptable<number>;
  spellpower: Interceptable<number>;
  canPlay: Interceptable<boolean, HeroCard>;
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
        spellpower: new Interceptable(),
        canPlay: new Interceptable()
      },
      options
    );
    this.blueprint.onInit(this.game, this);
  }

  get baseLevel() {
    return this.blueprint.level;
  }

  get level() {
    return this.interceptors.level.getValue(this.baseLevel, {});
  }

  get job() {
    return this.blueprint.job;
  }

  get spellpower() {
    return this.interceptors.spellpower.getValue(this.blueprint.spellpower, {});
  }

  get lineage() {
    return this.blueprint.lineage;
  }

  get fulfillsLineage() {
    if (this.player.hero.isShrine) return true;
    return (this.player.hero.card as HeroCard).lineage === this.blueprint.lineage;
  }

  get fulfillsLevel() {
    if (this.player.hero.isShrine) return this.baseLevel === 1;
    return this.baseLevel === (this.player.hero.card as HeroCard).baseLevel + 1;
  }

  override canPlay(): boolean {
    return this.interceptors.canPlay.getValue(
      this.fulfillsResourceCost && this.fulfillsLineage && this.fulfillsLevel,
      this
    );
  }

  override playWithTargets(targets: SelectedTarget[]): void {
    const points = targets.map(t => t.cell);

    this.player.hero.evolveHero(this);
    this.unit = this.player.hero;

    this.emitter.emit(
      CARD_EVENTS.BEFORE_PLAY,
      new CardBeforePlayEvent({ targets: points })
    );

    this.player.unlockedAffinities.add(this.blueprint.affinity);
    this.addToBoard(points);
    this.emitter.emit(
      CARD_EVENTS.AFTER_PLAY,
      new CardAfterPlayEvent({ targets: points })
    );
  }

  protected override addToBoard(points: Point[]) {
    const aoeShape = this.blueprint.getAoe(this.game, this as any, points);

    this.unit.addToBoard({
      affectedCells: aoeShape.getCells(points),
      affectedUnits: aoeShape.getUnits(points)
    });

    this.blueprint.onPlay(
      this.game,
      this as any,
      aoeShape.getCells(points),
      aoeShape.getUnits(points)
    );
  }

  serialize(): SerializedHeroCard {
    const base = this.serializeBase();

    return {
      ...base,
      spellpower: this.spellpower,
      atk: this.atk,
      maxHp: this.maxHp,
      level: this.level,
      baseLevel: this.baseLevel,
      job: this.blueprint.job
    };
  }
}
