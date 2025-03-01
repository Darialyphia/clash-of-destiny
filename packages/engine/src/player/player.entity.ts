import { Entity } from '../entity';
import { type Game } from '../game/game';
import {
  assert,
  isDefined,
  type Nullable,
  type Point,
  type Serializable
} from '@game/shared';
import {
  PlayCardEvent,
  PlayerAfterReplaceCardEvent,
  PlayerBeforeReplaceCardEvent,
  PlayerEndTurnEvent,
  PlayerManaChangeEvent,
  PlayerMulliganEvent,
  PlayerStartTurnEvent,
  type PlayerEventMap
} from './player.events';
import { PLAYER_EVENTS } from './player-enums';
import { GamePlayerEvent } from '../game/game.events';
import type { CardOptions } from '../card/entities/card.entity';
import type { CardBlueprint, UnitBlueprint } from '../card/card-blueprint';
import type { SerializedArtifactCard } from '../card/entities/artifact-card.entity';
import type { SerializedSpellCard } from '../card/entities/spell-card.entity';
import type { SerializedUnitCard, UnitCard } from '../card/entities/unit-card.entity';
import { CardManagerComponent } from '../card/components/card-manager.component';
import type { DeckCard } from '../card/entities/deck.entity';
import { Interceptable } from '../utils/interceptable';
import { ManaManagerComponent } from './components/mana-manager.component';
import type { Unit } from '../unit/entities/unit.entity';
import { CARD_EVENTS } from '../card/card.enums';
import type { PlayerArtifact, SerializedPlayerArtifact } from './player-artifact.entity';

export type PlayerOptions = {
  id: string;
  name: string;
  deck: { general: CardOptions; cards: CardOptions[] };
  generalPosition: Point;
  isPlayer1: boolean;
};

export type SerializedPlayer = {
  id: string;
  name: string;
  hand: Array<SerializedUnitCard | SerializedSpellCard | SerializedArtifactCard>;
  hp: number;
  currentMana: number;
  maxMana: number;
  deckSize: number;
  remainingCardsInDeck: number;
  discardPile: Array<SerializedUnitCard | SerializedSpellCard | SerializedArtifactCard>;
  canReplace: boolean;
  isActive: boolean;
  equipedArtifacts: SerializedPlayerArtifact[];
};

const makeInterceptors = () => {
  return {
    maxReplaces: new Interceptable<number>(),
    spellPower: new Interceptable<number>(),
    canReplace: new Interceptable<boolean>()
  };
};

type PlayerInterceptors = ReturnType<typeof makeInterceptors>;
export class Player
  extends Entity<PlayerEventMap, PlayerInterceptors>
  implements Serializable<SerializedPlayer>
{
  private game: Game;

  private readonly cards: CardManagerComponent;

  private readonly manaManager: ManaManagerComponent;

  private mulliganIndices: number[] = [];

  private _hasMulliganed = false;

  currentlyPlayedCard: Nullable<DeckCard> = null;
  currentyPlayedCardIndexInHand: Nullable<number> = null;

  private resourceActionsTaken = 0;

  private cardsReplacedThisTurn = 0;

  readonly generalPosition: Point;

  general!: Unit;

  artifacts: PlayerArtifact[] = [];

  private cancelCardCleanups: Array<() => void> = [];

  readonly isPlayer1: boolean;
  constructor(
    game: Game,
    private options: PlayerOptions
  ) {
    super(options.id, makeInterceptors());
    this.game = game;
    this.isPlayer1 = options.isPlayer1;
    this.generalPosition = options.generalPosition;
    this.cards = new CardManagerComponent(game, this, {
      deck: options.deck.cards,
      maxHandSize: this.game.config.MAX_HAND_SIZE,
      shouldShuffleDeck: this.game.config.SHUFFLE_DECK_AT_START_OF_GAME
    });

    this.draw(
      this.isPlayer1
        ? this.game.config.PLAYER_1_INITIAL_HAND_SIZE
        : this.game.config.PLAYER_2_INITIAL_HAND_SIZE
    );

    const startingMana = this.isPlayer1
      ? this.game.config.PLAYER_1_INITIAL_MANA
      : this.game.config.PLAYER_2_INITIAL_MANA;
    this.manaManager = new ManaManagerComponent(startingMana, startingMana);
    this.forwardListeners();
    this.placeGeneral(options.deck.general);
  }

  serialize() {
    return {
      id: this.id,
      name: this.options.name,
      hand: this.hand.map(card => card.serialize()),
      discardPile: Array.from(this.discardPile, card => card.serialize()),
      hp: this.general.hp,
      currentMana: this.mana,
      maxMana: this.maxMana,
      deckSize: this.deckSize,
      remainingCardsInDeck: this.remainingCardsInDeck,
      canReplace: this.canReplace,
      isActive: this.isActive,
      equipedArtifacts: this.artifacts.map(artifact => artifact.serialize())
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

  get opponent() {
    return this.game.playerSystem.players.find(p => !p.equals(this))!;
  }

  get isActive() {
    return this.game.turnSystem.activePlayer.equals(this);
  }

  get maxHandSize() {
    return this.game.config.MAX_HAND_SIZE;
  }

  get hand() {
    return this.cards.hand;
  }

  get deck() {
    return this.cards.deck;
  }

  get discardPile() {
    return this.cards.discardPile;
  }

  get deckSize() {
    return this.cards.deckSize;
  }

  get remainingCardsInDeck() {
    return this.cards.remainingCardsInDeck;
  }

  get spellPower() {
    return this.interceptors.spellPower.getValue(0, {});
  }

  get canReplace() {
    return this.interceptors.canReplace.getValue(
      this.cardsReplacedThisTurn < this.maxReplaces,
      {}
    );
  }

  get maxReplaces() {
    return this.interceptors.maxReplaces.getValue(
      this.game.config.MAX_CARD_REPLACES_PER_TURN,
      {}
    );
  }

  get remainingReplaces() {
    return this.maxReplaces - this.cardsReplacedThisTurn;
  }

  get mana() {
    return this.manaManager.amount;
  }

  get maxMana() {
    return this.manaManager.maxAmount;
  }

  spendMana(amount: number) {
    if (amount === 0) return;
    this.emitter.emit(
      PLAYER_EVENTS.BEFORE_MANA_CHANGE,
      new PlayerManaChangeEvent({ amount })
    );
    this.manaManager.spend(amount);
    this.emitter.emit(
      PLAYER_EVENTS.AFTER_MANA_CHANGE,
      new PlayerManaChangeEvent({ amount })
    );
  }

  gainMana(amount: number) {
    if (amount === 0) return;
    this.emitter.emit(
      PLAYER_EVENTS.BEFORE_MANA_CHANGE,
      new PlayerManaChangeEvent({ amount })
    );
    this.manaManager.gain(amount);
    this.emitter.emit(
      PLAYER_EVENTS.AFTER_MANA_CHANGE,
      new PlayerManaChangeEvent({ amount })
    );
  }

  canSpendMana(amount: number) {
    return this.mana >= amount;
  }

  get getCardAt() {
    return this.cards.getCardAt.bind(this.cards);
  }

  get draw() {
    return this.cards.draw.bind(this.cards);
  }

  get discard() {
    return this.cards.discard.bind(this.cards);
  }

  get isHandFull() {
    return this.cards.isHandFull;
  }

  get addToHand() {
    return this.cards.addToHand.bind(this.cards);
  }

  get hasMulliganed() {
    return this._hasMulliganed;
  }

  commitMulliganIndices(indices: number[]) {
    this.mulliganIndices = indices;
    this._hasMulliganed = true;
    this.emitter.emit(PLAYER_EVENTS.MULLIGAN, new PlayerMulliganEvent({ indices }));
  }

  mulligan() {
    for (const index of this.mulliganIndices) {
      this.cards.replaceCardAt(index);
    }
  }

  generateCard<T extends CardBlueprint = CardBlueprint>(blueprintId: string) {
    const blueprint = this.game.cardPool[blueprintId] as T;
    const card = this.game.cardFactory<T>(this.game, this, {
      id: this.game.cardIdFactory(blueprint.id, this.id),
      blueprint: blueprint
    });

    return card;
  }

  playCardAtIndex(index: number) {
    const card = this.cards.getCardAt(index);
    if (!card) return;

    this.playCardFromHand(card);
  }

  private onBeforePlayFromHand(card: DeckCard) {
    this.emitter.emit(PLAYER_EVENTS.BEFORE_PLAY_CARD, new PlayCardEvent({ card }));
    this.spendMana(card.manaCost);
  }

  private onAfterPlayFromHand(card: DeckCard) {
    this.currentlyPlayedCard = null;
    this.currentyPlayedCardIndexInHand = null;
    this.emitter.emit(PLAYER_EVENTS.AFTER_PLAY_CARD, new PlayCardEvent({ card }));
  }

  playCardFromHand(card: DeckCard) {
    this.currentlyPlayedCard = card;
    this.currentyPlayedCardIndexInHand = this.cards.hand.indexOf(card);
    this.cancelCardCleanups = [
      card.once(CARD_EVENTS.BEFORE_PLAY, this.onBeforePlayFromHand.bind(this, card)),
      card.once(CARD_EVENTS.AFTER_PLAY, this.onAfterPlayFromHand.bind(this, card))
    ];
    this.cards.play(card);
  }

  summonUnitFromBlueprint(blueprint: UnitBlueprint, position: Point) {
    const card = this.generateCard(blueprint.id) as UnitCard;
    card.playWithTargets([{ type: 'cell', cell: position }]);
  }

  summonUnitFromDiscardPile(card: UnitCard, position: Point) {
    this.cards.removeFromDiscardPile(card);
    card.playWithTargets([{ type: 'cell', cell: position }]);
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

  sendToDiscardPile(card: DeckCard) {
    this.cards.sendToDiscardPile(card);
  }

  replaceCardAtIndex(index: number) {
    const card = this.getCardAt(index);
    assert(card, `Card not found at index ${index}`);
    this.emitter.emit(
      PLAYER_EVENTS.BEFORE_REPLACE_CARD,
      new PlayerBeforeReplaceCardEvent({ card })
    );
    const replacement = this.cards.replaceCardAt(index);
    this.cardsReplacedThisTurn++;
    this.emitter.emit(
      PLAYER_EVENTS.AFTER_REPLACE_CARD,
      new PlayerAfterReplaceCardEvent({ card, replacement })
    );
  }

  get shouldDraw() {
    return this.game.turnSystem.elapsedTurns === 0
      ? this.isPlayer1
        ? this.game.config.PLAYER_1_SHOULD_DRAW_ON_FIRST_TURN
        : this.game.config.PLAYER_2_SHOULD_DRAW_ON_FIRST_TURN
      : true;
  }

  get units() {
    return this.game.unitSystem.units.filter(u => u.player.equals(this));
  }

  get enemyUnits() {
    return this.game.unitSystem.units.filter(u => !u.player.equals(this));
  }

  private placeGeneral(options: CardOptions) {
    const generalCard = this.game.cardFactory(this.game, this, options) as UnitCard;
    generalCard.playWithTargets([{ type: 'cell', cell: this.generalPosition }]);
    this.general = generalCard.unit;
  }

  get canEquipArtifact() {
    return this.artifacts.length < this.game.config.MAX_EQUIPED_ARTIFACTS;
  }

  equipArtifact(artifact: PlayerArtifact) {
    this.artifacts.push(artifact);

    artifact.equip();
  }

  unequipArtifact(artifact: PlayerArtifact) {
    const index = this.artifacts.findIndex(a => a.equals(artifact));
    if (index === -1) return;

    this.artifacts.splice(index, 1);
  }

  bounceToHand(unit: Unit) {
    this.game.unitSystem.removeUnit(unit);
    if (this.isHandFull) {
      this.cards.sendToDiscardPile(unit.card);
      return false;
    } else {
      this.addToHand(unit.card);
      return true;
    }
  }

  startTurn() {
    this.resourceActionsTaken = 0;
    this.cardsReplacedThisTurn = 0;

    if (this.shouldDraw && this.game.config.DRAW_STEP === 'turn-start') {
      this.draw(this.game.config.CARDS_DRAWN_PER_TURN);
    }

    if (
      this.game.turnSystem.elapsedTurns > 0 &&
      this.maxMana < this.game.config.MAX_MANA
    ) {
      this.manaManager.setMaxAmount(
        this.maxMana + this.game.config.MAX_MANA_INCREASE_PER_TURN
      );
    }
    this.manaManager.setTo(this.maxMana);

    this.emitter.emit(PLAYER_EVENTS.START_TURN, new PlayerStartTurnEvent({}));
  }

  endTurn() {
    if (this.shouldDraw && this.game.config.DRAW_STEP === 'turn-end') {
      this.draw(this.game.config.CARDS_DRAWN_PER_TURN);
    }

    this.emitter.emit(PLAYER_EVENTS.END_TURN, new PlayerEndTurnEvent({}));
  }
}
