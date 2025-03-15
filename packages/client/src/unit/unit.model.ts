import type { GameStateEntities } from '@/battle/stores/battle.store';
import { CellViewModel } from '@/board/cell.model';
import { CardViewModel } from '@/card/card.model';
import type { PlayerViewModel } from '@/player/player.model';
import { pointToCellId } from '@game/engine/src/board/board-utils';
import type { InputDispatcher } from '@game/engine/src/input/input-system';
import type { SerializedUnit } from '@game/engine/src/unit/entities/unit.entity';
import { waitFor, type Nullable, type Point } from '@game/shared';

export class UnitViewModel {
  isAnimating = false;

  moveIntent: Nullable<{ point: Point; path: Point[] }> = null;

  constructor(
    private data: SerializedUnit,
    private entityDictionary: GameStateEntities,
    private dispatcher: InputDispatcher
  ) {}

  equals(unit: UnitViewModel | SerializedUnit) {
    return this.id === unit.id;
  }

  get id() {
    return this.data.id;
  }

  get playerId() {
    return this.data.playerId;
  }

  get isDead() {
    return this.data.isDead;
  }

  get position() {
    return this.data.position;
  }

  set position(val: Point) {
    this.data.position = val;
  }

  get iconId() {
    return this.data.iconId;
  }

  get iconPath() {
    return `/assets/icons/${this.iconId}.png`;
  }

  get spriteId() {
    return this.data.spriteId;
  }

  get spriteParts() {
    return this.data.spriteParts;
  }

  get name() {
    return this.data.name;
  }

  get handSize() {
    return this.data.handSize;
  }

  get hp() {
    return this.data.hp;
  }

  get maxHp() {
    return this.data.maxHp;
  }

  get ap() {
    return this.data.ap;
  }

  get maxAp() {
    return this.data.maxAp;
  }

  get mp() {
    return this.data.mp;
  }

  get maxMp() {
    return this.data.maxMp;
  }

  get exp() {
    return this.data.exp;
  }

  get expToNextLevel() {
    return this.data.expToNextLevel;
  }

  get canLevelUp() {
    return this.data.canLevelup;
  }

  get isMaxLevel() {
    return this.data.isMaxLevel;
  }

  get remainingCardsInDeck() {
    return this.data.remainingCardsInDeck;
  }
  getPlayer() {
    return this.entityDictionary[this.data.playerId] as PlayerViewModel;
  }

  getMoveZone() {
    return this.data.moveZone.map(point => {
      return this.entityDictionary[pointToCellId(point.point)] as CellViewModel;
    });
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

  getCell() {
    const id = pointToCellId(this.data.position);
    return this.entityDictionary[id] as CellViewModel;
  }

  deploy() {
    this.dispatcher({
      type: 'deployUnit',
      payload: {
        playerId: this.playerId,
        heroId: this.id,
        ...this.position
      }
    });
  }

  canMoveTo(cell: CellViewModel) {
    return this.data.moveZone.some(point => {
      return (
        point.point.x === cell.position.x && point.point.y === cell.position.y
      );
    });
  }

  moveTowards(point: Point) {
    const destination = this.data.moveZone.find(
      p => p.point.x === point.x && p.point.y === point.y
    );
    if (destination) {
      this.moveIntent = destination;
    }
  }

  async commitMove() {
    if (!this.moveIntent) return;
    const destination = this.moveIntent.point;
    this.moveIntent = null;

    this.dispatcher({
      type: 'move',
      payload: {
        playerId: this.playerId,
        ...destination
      }
    });
  }

  endTurn() {
    this.dispatcher({
      type: 'endTurn',
      payload: {
        playerId: this.playerId
      }
    });
  }

  canAttackAt(cell: CellViewModel) {
    return this.data.attackableCells.some(point => {
      return cell.id === pointToCellId(point);
    });
  }

  attackAt(cell: CellViewModel) {
    console.log('attack at', cell.position);
    this.dispatcher({
      type: 'attack',
      payload: {
        playerId: this.playerId,
        ...cell.position
      }
    });
  }

  playCard(index: number) {
    this.dispatcher({
      type: 'playCard',
      payload: {
        playerId: this.playerId,
        index: index
      }
    });
  }

  get canReplace() {
    return this.data.canReplace;
  }

  replaceCard(index: number) {
    this.dispatcher({
      type: 'replaceCard',
      payload: {
        playerId: this.playerId,
        index: index
      }
    });
  }

  levelUp() {
    this.dispatcher({
      type: 'levelUp',
      payload: {
        playerId: this.playerId
      }
    });
  }
}
