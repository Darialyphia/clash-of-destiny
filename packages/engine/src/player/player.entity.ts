import { Entity } from '../entity';
import { type Game } from '../game/game';
import {
  assert,
  isDefined,
  type EmptyObject,
  type Nullable,
  type Point,
  type Serializable
} from '@game/shared';
import {
  PlayerDrawEvent,
  PlayerEndTurnEvent,
  PlayerPlayCardEvent,
  PlayerResourceActionDestinyEvent,
  PlayerResourceActionEvent,
  PlayerSecretEvent,
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
import { AFFINITIES, CARD_EVENTS, type Affinity } from '../card/card.enums';
import { CardNotFoundError, WrongDeckSourceError } from '../card/card-errors';
import { ShrineCard } from '../card/entities/shrine-card.entity';
import { MissingShrineError } from './player-errors';
import type { MinionCard } from '../card/entities/minion-card.entity';
import { INTERACTION_STATE_TRANSITIONS } from '../game/systems/interaction.system';
import { SecretManagerComponent } from './components/secret-manager.component';
import { Interceptable } from '../utils/interceptable';

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
  canReplace: boolean;
  remainingCardsInDeck: number;
  destinyDeck: string[];
  currentlyPlayedCard?: string;
  maxHp: number;
  currentHp: number;
  isPlayer1: boolean;
  unlockedAffinities: Affinity[];
  turnsUntilOverdriveMode: number;
  secrets: string[];
};

type PlayerInterceptors = {
  maxReplacesPerTurn: Interceptable<number>;
  canReplace: Interceptable<boolean>;
};
const makeInterceptors = (): PlayerInterceptors => {
  return {
    maxReplacesPerTurn: new Interceptable(),
    canReplace: new Interceptable()
  };
};

export class Player
  extends Entity<PlayerEventMap, PlayerInterceptors>
  implements Serializable<SerializedPlayer>
{
  private game: Game;

  readonly cards: CardManagerComponent;

  readonly artifacts: ArtifactManagerComponent;

  readonly secrets: SecretManagerComponent;

  readonly mana: ResourceTrackerComponent;

  readonly destiny: ResourceTrackerComponent;

  currentlyPlayedCard: Nullable<AnyCard> = null;

  private cancelCardCleanups: Array<() => void> = [];

  private resourceActionsDoneThisTurn = 0;

  private replacesDoneThisTurn = 0;

  readonly unlockedAffinities = new Set<Affinity>([AFFINITIES.NORMAL]);

  constructor(
    game: Game,
    private options: PlayerOptions
  ) {
    super(options.id, makeInterceptors());
    this.game = game;
    this.cards = new CardManagerComponent(this.game, this, {
      mainDeck: options.mainDeck.cards.map(blueprintId => ({
        id: this.game.cardIdFactory(blueprintId, this.id),
        blueprint: this.game.getBlueprint(blueprintId) as CardBlueprint &
          MainDeckCardBlueprint
      })),
      destinyDeck: options.destinyDeck.cards.map(blueprintId => ({
        id: this.game.cardIdFactory(blueprintId, this.id),
        blueprint: this.game.getBlueprint(blueprintId) as CardBlueprint &
          DestinyDeckCardBlueprint
      })),
      maxHandSize: this.game.config.MAX_HAND_SIZE,
      shouldShuffleDeck: this.game.config.SHUFFLE_DECK_ON_GAME_START
    });
    this.mana = new ResourceTrackerComponent(
      this.game.config.INITIAL_MANA,
      this.game.config.MAX_MANA
    );
    this.destiny = new ResourceTrackerComponent(
      this.game.config.INITIAL_DESTINY,
      this.game.config.MAX_DESTINY
    );
    this.artifacts = new ArtifactManagerComponent(this.game, this);
    this.secrets = new SecretManagerComponent(this.game, this);
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
      canReplace: this.canReplace,
      remainingCardsInDeck: this.cards.mainDeck.remaining,
      destinyDeck: this.cards.destinyDeck.cards.map(card => card.id),
      currentlyPlayedCard: this.currentlyPlayedCard?.id,
      maxHp: this.hero?.hp.max ?? 0,
      currentHp: this.hero?.hp.current ?? 0,
      isPlayer1: this.isPlayer1,
      unlockedAffinities: Array.from(this.unlockedAffinities),
      turnsUntilOverdriveMode:
        this.game.config.ELAPSED_TURNS_TO_ACTIVATE_OVERDRIVE_MODE -
        this.game.gamePhaseSystem.elapsedTurns +
        (this.isPlayer1 ? 1 : 0),
      secrets: this.secrets.serialize()
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
    return this.game.unitSystem.unitsOnBoard.filter(u => u.player.equals(this));
  }

  get enemyUnits() {
    return this.game.unitSystem.unitsOnBoard.filter(u => !u.player.equals(this));
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

  canPlayCard(card: AnyCard) {
    return card.canPlay();
  }

  playMainDeckCardAtIndex(index: number) {
    const card = this.cards.getCardAt(index);
    if (!card) return;

    this.playCardFromHand(card);
  }

  playDestinyDeckCardAtIndex(index: number, onComplete?: () => void) {
    const card = this.cards.getDestinyCardAt(index);
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
    this.mana.remove(card.manaCost);
    this.cards.removeFromHand(card);
  }

  private onAfterPlayFromHand(card: AnyCard) {
    this.currentlyPlayedCard = null;
    this.emitter.emit(PLAYER_EVENTS.AFTER_PLAY_CARD, new PlayerPlayCardEvent({ card }));
  }

  playCardFromHand(card: AnyCard) {
    this.currentlyPlayedCard = card;
    this.cancelCardCleanups = [
      card.once(CARD_EVENTS.BEFORE_PLAY, this.onBeforePlayFromHand.bind(this, card)),
      card.once(CARD_EVENTS.AFTER_PLAY, this.onAfterPlayFromHand.bind(this, card))
    ];
    card.play();
  }

  private onBeforePlayFromDestinyDeck(card: AnyCard) {
    assert(isDefined(card.destinyCost), new WrongDeckSourceError(card));
    this.emitter.emit(PLAYER_EVENTS.BEFORE_PLAY_CARD, new PlayerPlayCardEvent({ card }));
    this.cards.removeFromDestinyDeck(card);
    this.destiny.remove(card.destinyCost);
  }

  private onAfterPlayFromDestinyDeck(card: AnyCard) {
    this.currentlyPlayedCard = null;
    this.emitter.emit(PLAYER_EVENTS.AFTER_PLAY_CARD, new PlayerPlayCardEvent({ card }));
  }

  playCardFromDestinyDeck(card: AnyCard, onComplete?: () => void) {
    this.currentlyPlayedCard = card;
    this.cancelCardCleanups = [
      card.once(
        CARD_EVENTS.BEFORE_PLAY,
        this.onBeforePlayFromDestinyDeck.bind(this, card)
      ),
      card.once(CARD_EVENTS.AFTER_PLAY, () => {
        this.onAfterPlayFromDestinyDeck(card);
        onComplete?.();
      })
    ];
    card.play();
  }

  cancelCardPlayed() {
    if (!isDefined(this.currentlyPlayedCard)) return;
    this.game.interaction.cancelSelectingTargets();
    this.cancelCardCleanups.forEach(cleanup => cleanup());
    this.cancelCardCleanups = [];
    this.currentlyPlayedCard = null;
  }

  generateCard<T extends CardBlueprint = CardBlueprint>(blueprintId: string) {
    const blueprint = this.game.cardPool[blueprintId] as T;
    const card = this.game.cardFactory<T>(this.game, this, {
      id: this.game.cardIdFactory(blueprint.id, this.id),
      blueprint: blueprint
    });

    return card;
  }

  summonMinionFromBlueprint(blueprintId: string, position: Point) {
    const card = this.generateCard(blueprintId) as MinionCard;
    if (!card.canSummonAt(position)) return;
    card.playWithTargets([{ type: 'cell', cell: position }]);
    return card.unit;
  }

  summonMinionFromCard(card: MinionCard, position: Point) {
    if (!card.canSummonAt(position)) return;
    card.playWithTargets([{ type: 'cell', cell: position }]);
    return card.unit;
  }

  canPerformResourceAction() {
    return (
      this.resourceActionsDoneThisTurn < this.game.config.MAX_RESOURCE_ACTIONS_PER_TURN
    );
  }

  get maxReplacesPerTurn() {
    return this.interceptors.maxReplacesPerTurn.getValue(
      this.game.config.MAX_REPLACES_PER_TURN,
      {}
    );
  }

  get canReplace() {
    return this.interceptors.canReplace.getValue(
      this.replacesDoneThisTurn < this.maxReplacesPerTurn,
      {}
    );
  }

  resourceActionReplaceCardAtIndex(index: number) {
    this.emitter.emit(
      PLAYER_EVENTS.BEFORE_RESOURCE_ACTION_REPLACE,
      new PlayerResourceActionEvent({})
    );
    this.cards.replaceCardAt(index);
    this.replacesDoneThisTurn++;
    this.emitter.emit(
      PLAYER_EVENTS.AFTER_RESOURCE_ACTION_REPLACE,
      new PlayerResourceActionEvent({})
    );
  }

  resourceActionGainDestiny(indices: number[]) {
    this.emitter.emit(
      PLAYER_EVENTS.BEFORE_RESOURCE_ACTION_DESTINY,
      new PlayerResourceActionDestinyEvent({ amount: indices.length })
    );
    indices
      .map(index => this.cards.getCardAt(index))
      .filter(isDefined)
      .forEach(card => {
        this.cards.removeFromHand(card);
        this.cards.sendToBanishPile(card);
      });

    this.destiny.add(indices.length);
    this.resourceActionsDoneThisTurn++;
    this.emitter.emit(
      PLAYER_EVENTS.AFTER_RESOURCE_ACTION_DESTINY,
      new PlayerResourceActionDestinyEvent({ amount: indices.length })
    );
  }

  resourceActionDraw() {
    this.emitter.emit(
      PLAYER_EVENTS.BEFORE_RESOURCE_ACTION_DRAW,
      new PlayerResourceActionEvent({})
    );
    this.mana.remove(this.game.config.DRAW_RESOURCE_ACTION_COST);
    this.cards.draw(1);
    this.resourceActionsDoneThisTurn++;
    this.emitter.emit(
      PLAYER_EVENTS.AFTER_RESOURCE_ACTION_DRAW,
      new PlayerResourceActionEvent({})
    );
  }

  triggerSecret(id: string, cb: () => void) {
    const secret = this.secrets.get(id);
    assert(isDefined(secret), new CardNotFoundError());
    this.emitter.emit(
      PLAYER_EVENTS.BEFORE_TRIGGER_SECRET,
      new PlayerSecretEvent({ card: secret.card })
    );
    this.secrets.trigger(id, cb);
    this.emitter.emit(
      PLAYER_EVENTS.AFTER_TRIGGER_SECRET,
      new PlayerSecretEvent({ card: secret.card })
    );
  }

  startTurn() {
    this.emitter.emit(PLAYER_EVENTS.START_TURN, new PlayerStartTurnEvent({}));

    this.mana.add(
      this.game.gamePhaseSystem.isOverdriveMode
        ? this.game.config.OVERDRIVE_MODE_MANA_EARNED_PER_TURN
        : this.game.config.MANA_EARNED_PER_TURN
    );
    this.destiny.add(this.game.config.DESTINY_EARNED_PER_TURN);
    this.resourceActionsDoneThisTurn = 0;
    this.replacesDoneThisTurn = 0;

    this.game.gamePhaseSystem.draw();
  }

  endTurn() {
    this.emitter.emit(PLAYER_EVENTS.END_TURN, new PlayerEndTurnEvent({}));
  }
}
