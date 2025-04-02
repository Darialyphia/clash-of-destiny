import { Entity } from '../entity';
import { type Game } from '../game/game';
import {
  assert,
  isDefined,
  type EmptyObject,
  type Nullable,
  type Serializable
} from '@game/shared';
import {
  PlayerDrawEvent,
  PlayerPlayCardEvent,
  type PlayerEventMap
} from './player.events';
import { PLAYER_EVENTS } from './player-enums';
import { GamePlayerEvent } from '../game/game.events';
import { CardManagerComponent } from '../card/components/card-manager.component';
import { ArtifactManagerComponent } from './components/artifact-manager.component';
import type {
  CardBlueprint,
  DestinyDeckCardBlueprint,
  MainDeckCardBlueprint
} from '../card/card-blueprint';
import { ResourceTrackerComponent } from './components/resource-tracker.component';
import type { AnyCard } from '../card/entities/card.entity';
import { CARD_DECK_SOURCES, CARD_EVENTS } from '../card/card.enums';
import { WrongDeckSourceError } from '../card/card-errors';

export type PlayerOptions = {
  id: string;
  name: string;
  mainDeck: { cards: string[] };
  destinyDeck: { cards: string[] };
};

export type SerializedPlayer = {
  id: string;
  entityType: 'player';
  name: string;
};

type PlayerInterceptors = EmptyObject;
export class Player
  extends Entity<PlayerEventMap, PlayerInterceptors>
  implements Serializable<SerializedPlayer>
{
  private game: Game;

  readonly cards: CardManagerComponent;

  readonly artifacts: ArtifactManagerComponent;

  readonly mana: ResourceTrackerComponent;

  readonly destiny: ResourceTrackerComponent;

  currentlyPlayedCard: Nullable<AnyCard> = null;

  currentyPlayedCardIndexInHand: Nullable<number> = null;

  private cancelCardCleanups: Array<() => void> = [];

  private resourceActionsDoneThisTurn = 0;

  constructor(
    game: Game,
    private options: PlayerOptions
  ) {
    super(options.id, {});
    this.game = game;
    this.cards = new CardManagerComponent(this.game, this, {
      mainDeck: options.mainDeck.cards.map(blueprintId => ({
        id: this.game.cardIdFactory(blueprintId, this.id),
        blueprint: this.game.cardPool[blueprintId] as CardBlueprint &
          MainDeckCardBlueprint
      })),
      destinyDeck: options.destinyDeck.cards.map(blueprintId => ({
        id: this.game.cardIdFactory(blueprintId, this.id),
        blueprint: this.game.cardPool[blueprintId] as CardBlueprint &
          DestinyDeckCardBlueprint
      })),
      maxHandSize: this.game.config.MAX_HAND_SIZE,
      shouldShuffleDeck: this.game.config.SHUFFLE_DECK_ON_GAME_START
    });
    this.mana = new ResourceTrackerComponent(
      this.game.config.INITIAL_MANA,
      this.game.config.INITIAL_MANA
    );
    this.destiny = new ResourceTrackerComponent(
      this.game.config.INITIAL_DESTINY,
      this.game.config.MAX_DESTINY
    );
    this.artifacts = new ArtifactManagerComponent(this.game, this);
    this.forwardListeners();
  }

  serialize() {
    return {
      id: this.id,
      entityType: 'player' as const,
      name: this.options.name
    };
  }

  forwardListeners() {
    Object.values(PLAYER_EVENTS).forEach(eventName => {
      this.on(eventName, event => {
        this.game.emit(
          `player.${eventName}`,
          new GamePlayerEvent({ player: this, event }) as any
        );
      });
    });
  }

  get hero() {
    return this.units.find(u => u.player.equals(this) && (u.isHero || u.isShrine))!;
  }

  get opponent() {
    return this.game.playerSystem.players.find(p => !p.equals(this))!;
  }

  get units() {
    return this.game.unitSystem.units.filter(u => u.player.equals(this));
  }

  get enemyUnits() {
    return this.game.unitSystem.units.filter(u => !u.player.equals(this));
  }

  get isPlayer1() {
    return this.game.playerSystem.players[0].equals(this);
  }

  private canPlayMainDeckCard(card: AnyCard) {
    assert(isDefined(card.manaCost), new WrongDeckSourceError(card));
    return this.mana.amount >= card.manaCost;
  }

  private canPlayDestinyDeckCard(card: AnyCard) {
    assert(isDefined(card.destinyCost), new WrongDeckSourceError(card));
    return this.destiny.amount >= card.destinyCost;
  }

  canPlayCard(card: AnyCard) {
    if (card.deckSource === CARD_DECK_SOURCES.DESTINY_DECK) {
      return this.canPlayDestinyDeckCard(card);
    } else {
      return this.canPlayMainDeckCard(card);
    }
  }

  playMainDeckCardAtIndex(index: number) {
    const card = this.cards.getCardAt(index);
    if (!card) return;

    this.playCardFromHand(card);
  }

  draw(amount: number) {
    this.emitter.emit(PLAYER_EVENTS.BEFORE_DRAW, new PlayerDrawEvent({ amount }));
    this.cards.draw(amount);
    this.emitter.emit(PLAYER_EVENTS.AFTER_DRAW, new PlayerDrawEvent({ amount }));
  }

  private onBeforePlayFromHand(card: AnyCard) {
    assert(isDefined(card.manaCost), new WrongDeckSourceError(card));
    this.emitter.emit(PLAYER_EVENTS.BEFORE_PLAY_CARD, new PlayerPlayCardEvent({ card }));
    this.mana.spend(card.manaCost);
  }

  private onAfterPlayFromHand(card: AnyCard) {
    this.currentlyPlayedCard = null;
    this.currentyPlayedCardIndexInHand = null;
    this.emitter.emit(PLAYER_EVENTS.AFTER_PLAY_CARD, new PlayerPlayCardEvent({ card }));
  }

  playCardFromHand(card: AnyCard) {
    this.currentlyPlayedCard = card;
    this.currentyPlayedCardIndexInHand = this.cards.hand.indexOf(card);
    this.cancelCardCleanups = [
      card.once(CARD_EVENTS.BEFORE_PLAY, this.onBeforePlayFromHand.bind(this, card)),
      card.once(CARD_EVENTS.AFTER_PLAY, this.onAfterPlayFromHand.bind(this, card))
    ];
    this.cards.play(card);
  }

  cancelCardPlayed() {
    if (!isDefined(this.currentlyPlayedCard)) return;
    if (!isDefined(this.currentyPlayedCardIndexInHand)) return;
    this.game.interaction.cancelSelectingTargets();
    this.cards.addToHand(this.currentlyPlayedCard, this.currentyPlayedCardIndexInHand);
    this.cancelCardCleanups.forEach(cleanup => cleanup());
    this.cancelCardCleanups = [];
    this.currentlyPlayedCard = null;
    this.currentyPlayedCardIndexInHand = null;
  }

  generateCard<T extends CardBlueprint = CardBlueprint>(blueprintId: string) {
    const blueprint = this.game.cardPool[blueprintId] as T;
    const card = this.game.cardFactory<T>(this.game, this, {
      id: this.game.cardIdFactory(blueprint.id, this.id),
      blueprint: blueprint
    });

    return card;
  }

  canPerformResourceAction() {
    return (
      this.resourceActionsDoneThisTurn < this.game.config.MAX_RESOURCE_ACTIONS_PER_TURN
    );
  }

  replaceCardAtIndex(index: number) {
    this.cards.replaceCardAt(index);
    this.resourceActionsDoneThisTurn++;
  }

  startTurn() {}

  endTurn() {}
}
