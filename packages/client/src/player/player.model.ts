import type { GameStateEntities } from '@/battle/stores/battle.store';
import type { CardViewModel } from '@/card/card.model';
import type { ArtifactViewModel } from '@/unit/artifact.model';
import type { InputDispatcher } from '@game/engine/src/input/input-system';
import type { SerializedPlayer } from '@game/engine/src/player/player.entity';
import { objectEntries } from '@game/shared';

export class PlayerViewModel {
  private getEntities: () => GameStateEntities;

  constructor(
    private data: SerializedPlayer,
    entityDictionary: GameStateEntities,
    private dispatcher: InputDispatcher
  ) {
    this.getEntities = () => entityDictionary;
  }

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

  get destiny() {
    return this.data.destiny;
  }

  get unlockedAffinities() {
    return this.data.unlockedAffinities;
  }

  get handSize() {
    return this.data.handSize;
  }

  get remainingCardsInDeck() {
    return this.data.remainingCardsInDeck;
  }

  get canReplace() {
    return this.data.canReplace;
  }

  get canPerformResourceAction() {
    return this.data.canPerformResourceAction;
  }

  get isPlayer1() {
    return this.data.isPlayer1;
  }

  getHand() {
    return this.data.hand.map(cardId => {
      return this.getEntities()[cardId] as CardViewModel;
    });
  }

  getDiscardPile() {
    return this.data.discardPile.map(cardId => {
      return this.getEntities()[cardId] as CardViewModel;
    });
  }

  getBanishPile() {
    return this.data.banishPile.map(cardId => {
      return this.getEntities()[cardId] as CardViewModel;
    });
  }

  getCurrentlyPlayedCard() {
    if (!this.data.currentlyPlayedCard) return null;
    return this.getEntities()[this.data.currentlyPlayedCard] as CardViewModel;
  }

  getOpponent() {
    const entity = Object.values(this.getEntities()).find(
      entity => entity instanceof PlayerViewModel && entity.id !== this.id
    );
    return entity as PlayerViewModel;
  }

  getDestinyDeck() {
    return this.data.destinyDeck.map(cardId => {
      return this.getEntities()[cardId] as CardViewModel;
    });
  }

  getArtifacts() {
    return this.data.artifacts.map(cardId => {
      return this.getEntities()[cardId] as ArtifactViewModel;
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
