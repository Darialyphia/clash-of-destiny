import { Card, type CardOptions, type SerializedCard } from './card.entity';
import { Interceptable } from '../../utils/interceptable';
import type { SpellBlueprint } from '../card-blueprint';
import {
  CardAfterPlayEvent,
  CardBeforePlayEvent,
  type CardEventMap
} from '../card.events';
import type { Game } from '../../game/game';
import { GameCardEvent } from '../../game/game.events';
import type { Player } from '../../player/player.entity';
import { CARD_EVENTS } from '../card.enums';
import type { SelectedTarget } from '../../game/systems/interaction.system';
import { NotEnoughManaError } from '../card-errors';
import { assert } from '@game/shared';

export type SerializedSpellCard = SerializedCard & { manaCost: number };

const makeInterceptors = () => ({
  manaCost: new Interceptable<number>()
});

export type SpellCardInterceptor = ReturnType<typeof makeInterceptors>;

export class SpellCard extends Card<
  SerializedSpellCard,
  CardEventMap,
  SpellCardInterceptor,
  SpellBlueprint
> {
  constructor(game: Game, player: Player, options: CardOptions) {
    super(game, player, makeInterceptors(), options);
    this.forwardListeners();
    this.blueprint.onInit(this.game, this);
  }

  get hasEnoughMana() {
    return this.manaCost <= this.player.mana;
  }

  selectTargets(onComplete: (targets: SelectedTarget[]) => void) {
    this.game.interaction.startSelectingTargets({
      player: this.player,
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
    assert(this.hasEnoughMana, new NotEnoughManaError());
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
  }

  get manaCost() {
    return this.interceptors.manaCost.getValue(this.blueprint.manaCost, {});
  }

  serialize(): SerializedSpellCard {
    return {
      id: this.id,
      name: this.name,
      blueprintId: this.blueprint.id,
      description: this.description,
      kind: this.kind,
      canPlay: this.hasEnoughMana,
      manaCost: this.manaCost,
      rarity: this.rarity,
      faction: this.faction?.serialize() ?? null,
      setId: this.blueprint.setId,
      elligibleFirstTarget: this.game.boardSystem.cells
        .filter(cell =>
          this.blueprint.followup.getTargets(this.game, this)[0]?.isElligible(cell)
        )
        .map(cell => cell.position.serialize()),
      modifiers: this.modifiers.map(modifier => modifier.serialize())
    };
  }

  forwardListeners() {
    Object.values(CARD_EVENTS).forEach(eventName => {
      this.on(eventName, event => {
        this.game.emit(
          `card.${eventName}`,
          new GameCardEvent({ card: this, event: event as any }) as any
        );
      });
    });
  }
}
