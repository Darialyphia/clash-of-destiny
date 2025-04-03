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
  PlayerEndTurnEvent,
  PlayerPlayCardEvent,
  PlayerStartTurnEvent,
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
import { CARD_DECK_SOURCES, CARD_EVENTS, UNIT_KINDS } from '../card/card.enums';
import { WrongDeckSourceError } from '../card/card-errors';
import { ShrineCard } from '../card/entities/shrine-card.entity';
import { MissingShrineError } from './player-errors';

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
  hand: string[];
  handSize: number;
  discardPile: string[];
  banishPile: string[];
  artifacts: string[];
  mana: number;
  destiny: number;
  canPerformResourceAction: boolean;
  remainingCardsInDeck: number;
  destinyDeck: string[];
  currentlyPlayedCard?: string;
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
      name: this.options.name,
      hand: this.cards.hand.map(card => card.id),
      handSize: this.cards.hand.length,
      discardPile: Array.from(this.cards.discardPile).map(card => card.id),
      banishPile: Array.from(this.cards.banishPile).map(card => card.id),
      artifacts: this.artifacts.artifacts.map(artifact => artifact.id),
      mana: this.mana.current,
      destiny: this.destiny.current,
      canPerformResourceAction: this.canPerformResourceAction(),
      remainingCardsInDeck: this.cards.mainDeck.remaining,
      destinyDeck: this.cards.destinyDeck.cards.map(card => card.id),
      currentlyPlayedCard: this.currentlyPlayedCard?.id
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

  get isActive() {
    return this.game.gamePhaseSystem.turnPlayer.equals(this);
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

  get shrinePosition() {
    return this.isPlayer1
      ? this.game.boardSystem.map.shrinePositions[0]
      : this.game.boardSystem.map.shrinePositions[1];
  }

  initialize() {
    this.placeShrine();
  }

  placeShrine() {
    const shrine = this.cards.destinyDeck.cards.find(card => card instanceof ShrineCard);
    assert(isDefined(shrine), new MissingShrineError());
    this.playCardFromDestinyDeck(shrine);
  }

  private canPlayMainDeckCard(card: AnyCard) {
    assert(isDefined(card.manaCost), new WrongDeckSourceError(card));
    return this.mana.current >= card.manaCost;
  }

  private canPlayDestinyDeckCard(card: AnyCard) {
    assert(isDefined(card.destinyCost), new WrongDeckSourceError(card));
    return this.destiny.current >= card.destinyCost;
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

  playDestinyDeckCardAtIndex(index: number, onComplete?: () => void) {
    const card = this.cards.getCardAt(index);
    if (!card) return;

    this.playCardFromDestinyDeck(card, onComplete);
  }

  draw(amount: number) {
    this.emitter.emit(PLAYER_EVENTS.BEFORE_DRAW, new PlayerDrawEvent({ amount }));
    this.cards.draw(amount);
    this.emitter.emit(PLAYER_EVENTS.AFTER_DRAW, new PlayerDrawEvent({ amount }));
  }

  private onBeforePlayFromHand(card: AnyCard) {
    assert(isDefined(card.manaCost), new WrongDeckSourceError(card));
    this.emitter.emit(PLAYER_EVENTS.BEFORE_PLAY_CARD, new PlayerPlayCardEvent({ card }));
    this.mana.add(card.manaCost);
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

  private onBeforePlayFromDestinyDeck(card: AnyCard) {
    assert(isDefined(card.destinyCost), new WrongDeckSourceError(card));
    this.emitter.emit(PLAYER_EVENTS.BEFORE_PLAY_CARD, new PlayerPlayCardEvent({ card }));
    this.destiny.add(card.destinyCost);
  }

  private onAfterPlayFromDestinyDeck(card: AnyCard) {
    this.currentlyPlayedCard = null;
    this.currentyPlayedCardIndexInHand = null;
    this.emitter.emit(PLAYER_EVENTS.AFTER_PLAY_CARD, new PlayerPlayCardEvent({ card }));
  }

  playCardFromDestinyDeck(card: AnyCard, onComplete?: () => void) {
    this.currentlyPlayedCard = card;
    this.currentyPlayedCardIndexInHand = this.cards.destinyDeck.cards.indexOf(card);
    this.cancelCardCleanups = [
      card.once(
        CARD_EVENTS.BEFORE_PLAY,
        this.onBeforePlayFromDestinyDeck.bind(this, card)
      ),
      card.once(CARD_EVENTS.AFTER_PLAY, () => {
        this.onAfterPlayFromDestinyDeck.bind(this, card);
        onComplete?.();
      })
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

  resourceActionReplaceCardAtIndex(index: number) {
    this.cards.replaceCardAt(index);
    this.resourceActionsDoneThisTurn++;
  }

  resourceActionGainDestiny(indices: number[]) {
    indices.forEach(index => {
      const card = this.cards.getCardAt(index);
      if (!card) return;
      this.cards.removeFromHand(card);
      this.cards.sendToBanishPile(card);
    });

    this.destiny.remove(indices.length);
    this.resourceActionsDoneThisTurn++;
  }

  resourceActionDraw() {
    this.mana.add(this.game.config.DRAW_RESOURCE_ACTION_COST);
    this.cards.draw(1);
    this.resourceActionsDoneThisTurn++;
  }

  startTurn() {
    this.resourceActionsDoneThisTurn = 0;

    const drawCount =
      this.game.gamePhaseSystem.elapsedTurns === 0 && !this.isPlayer1
        ? this.game.config.PLAYER_2_CARDS_DRAWN_ON_FIRST_TURN
        : this.game.config.CARDS_DRAWN_PER_TURN;
    this.draw(drawCount);

    if (this.mana.max < this.game.config.MAX_MANA) {
      this.mana.setMax(this.mana.max + this.game.config.MAX_MANA_INCREASE_PER_TURN);
    }
    this.mana.fill();
    this.destiny.add(this.game.config.DESTINY_EARNED_PER_TURN);
    this.emitter.emit(PLAYER_EVENTS.START_TURN, new PlayerStartTurnEvent({}));
  }

  endTurn() {
    this.emitter.emit(PLAYER_EVENTS.END_TURN, new PlayerEndTurnEvent({}));
  }
}
