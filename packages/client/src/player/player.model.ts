import type { GameStateEntities } from '@/battle/stores/battle.store';
import type { CardViewModel } from '@/card/card.model';
import type { InputDispatcher } from '@game/engine/src/input/input-system';
import type { SerializedPlayer } from '@game/engine/src/player/player.entity';

export class PlayerViewModel {
  constructor(
    private data: SerializedPlayer,
    private entityDictionary: GameStateEntities,
    private dispatcher: InputDispatcher
  ) {}

  equals(unit: PlayerViewModel | SerializedPlayer) {
    return this.id === unit.id;
  }

  get id() {
    return this.data.id;
  }

  get name() {
    return this.data.name;
  }

  get currentHp() {
    return this.data.currentHp;
  }

  get maxHp() {
    return this.data.maxHp;
  }

  get mana() {
    return this.data.mana;
  }

  get maxMana() {
    return this.data.maxMana;
  }

  get destiny() {
    return this.data.destiny;
  }

  get handSize() {
    return this.data.handSize;
  }

  get remainingCardsInDeck() {
    return this.data.remainingCardsInDeck;
  }

  get canPerformResourceAction() {
    return this.data.canPerformResourceAction;
  }

  get isPlayer1() {
    return this.data.isPlayer1;
  }

  getHand() {
    return this.data.hand.map(cardId => {
      return this.entityDictionary[cardId] as CardViewModel;
    });
  }

  getDiscardPile() {
    return this.data.discardPile.map(cardId => {
      return this.entityDictionary[cardId] as CardViewModel;
    });
  }

  getBanishPile() {
    return this.data.banishPile.map(cardId => {
      return this.entityDictionary[cardId] as CardViewModel;
    });
  }

  getCurrentlyPlayedCard() {
    if (!this.data.currentlyPlayedCard) return null;
    return this.entityDictionary[
      this.data.currentlyPlayedCard
    ] as CardViewModel;
  }

  getOpponent() {
    const entity = Object.values(this.entityDictionary).find(
      entity => entity instanceof PlayerViewModel && entity.id !== this.id
    );
    return entity as PlayerViewModel;
  }

  getDestinyDeck() {
    return this.data.destinyDeck.map(cardId => {
      return this.entityDictionary[cardId] as CardViewModel;
    });
  }

  endTurn() {
    this.dispatcher({
      type: 'endTurn',
      payload: {
        playerId: this.data.id
      }
    });
  }

  playCard(index: number) {
    const card = this.getHand()[index];
    if (!card) return;
    if (!card.canPlay) return;

    this.dispatcher({
      type: 'playCard',
      payload: {
        playerId: this.data.id,
        index: index
      }
    });
  }

  playDestinyCard(index: number) {
    const card = this.getDestinyDeck()[index];
    if (!card) return;
    if (!card.canPlay) return;
    this.dispatcher({
      type: 'playDestinyCard',
      payload: {
        playerId: this.data.id,
        index: index
      }
    });
  }

  replaceResourceAction(index: number) {
    this.dispatcher({
      type: 'resourceActionReplaceCard',
      payload: {
        playerId: this.id,
        index: index
      }
    });
  }

  drawResourceAction() {
    this.dispatcher({
      type: 'resourceActionDraw',
      payload: {
        playerId: this.id
      }
    });
  }

  gainDestinyResourceAction(indices: number[]) {
    this.dispatcher({
      type: 'resourceActionGainDestiny',
      payload: {
        playerId: this.id,
        indices: indices
      }
    });
  }
}
