import type { Game } from '../../game/game';
import type { SelectedTarget } from '../../game/systems/interaction.system';
import type { Unit } from '../../unit/entities/unit.entity';
import type { AbilityBlueprint } from '../card-blueprint';
import { CARD_EVENTS, CARD_KINDS } from '../card.enums';
import {
  CardAfterPlayEvent,
  CardBeforePlayEvent,
  type CardEventMap
} from '../card.events';
import { Card, type CardOptions, type SerializedCard } from './card.entity';

export type SerializedAbilityCard = SerializedCard & {
  kind: typeof CARD_KINDS.ABILITY;
  manaCost: number;
  levelCost: number;
  exp: number;
  elligibleFirstTargets: string[];
  maxTargets: number;
};
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
    return this.manaCost <= this.unit.mp.current && this.levelCost <= this.unit.level;
  }

  get exp() {
    return this.blueprint.exp;
  }

  get manaCost() {
    return this.blueprint.manaCost;
  }

  get levelCost() {
    return this.blueprint.levelCost;
  }

  get followupTargets() {
    return this.blueprint.followup.getTargets(this.game, this);
  }

  selectTargets(onComplete: (targets: SelectedTarget[]) => void) {
    this.game.interaction.startSelectingTargets({
      player: this.unit.player,
      getNextTarget: targets => {
        return (
          this.blueprint.followup.getTargets(this.game, this)[targets.length] ?? null
        );
      },
      canCommit: this.blueprint.followup.canCommit,
      onComplete
    });
  }

  play() {
    this.selectTargets(this.playWithTargets.bind(this));
  }

  playWithTargets(targets: SelectedTarget[]) {
    const points = targets.map(t => t.cell);

    this.emitter.emit(
      CARD_EVENTS.BEFORE_PLAY,
      new CardBeforePlayEvent({ targets: points })
    );

    const aoeShape = this.blueprint.getAoe(this.game, this, points);
    this.blueprint.onPlay(
      this.game,
      this,
      aoeShape.getCells(points),
      aoeShape.getUnits(points)
    );

    this.emitter.emit(
      CARD_EVENTS.AFTER_PLAY,
      new CardAfterPlayEvent({ targets: points })
    );
    this.unit.gainExp(this.exp);
  }

  serialize(): SerializedAbilityCard {
    const followup = this.blueprint.followup.getTargets(this.game, this);
    const firstTarget = followup[0];
    return {
      id: this.id,
      entityType: 'card' as const,
      blueprintId: this.blueprint.id,
      iconId: this.blueprint.cardIconId,
      kind: this.blueprint.kind,
      setId: this.blueprint.setId,
      name: this.blueprint.name,
      description: this.blueprint.description,
      rarity: this.blueprint.rarity,
      unit: this.unit.id,
      manaCost: this.manaCost,
      levelCost: this.levelCost,
      exp: this.exp,
      canPlay: this.canPlay(),
      elligibleFirstTargets: this.game.boardSystem.cells
        .filter(cell => firstTarget?.isElligible(cell.position))
        .map(cell => cell.id),
      maxTargets: followup.length
    };
  }
}
