import type { GameStateEntities } from '@/battle/stores/battle.store';
import { CellViewModel } from '@/board/cell.model';
import { CardViewModel } from '@/card/card.model';
import type { PlayerViewModel } from '@/player/player.model';
import { pointToCellId } from '@game/engine/src/board/board-utils';
import type { InputDispatcher } from '@game/engine/src/input/input-system';
import type { SerializedUnit } from '@game/engine/src/unit/entities/unit.entity';
import { type Nullable, type Point } from '@game/shared';
import type { ModifierViewModel } from './modifier.model';
import type { ArtifactViewModel } from './artifact.model';
import { UNIT_KINDS } from '@game/engine/src/card/card.enums';

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

  get spriteId() {
    return this.data.spriteId;
  }

  get spriteParts() {
    return this.data.spriteParts;
  }

  get name() {
    return this.data.name;
  }

  get hp() {
    return this.data.hp;
  }

  get maxHp() {
    return this.data.maxHp;
  }

  get atk() {
    return this.data.atk;
  }

  get spellpower() {
    return this.data.spellPower;
  }

  get isExhausted() {
    return this.data.isExhausted;
  }

  get isHero() {
    return this.getCard().unitKind === UNIT_KINDS.HERO;
  }

  get isShrine() {
    return this.getCard().unitKind === UNIT_KINDS.SHRINE;
  }

  get isMinion() {
    return this.getCard().unitKind === UNIT_KINDS.MINION;
  }

  updateSprite(spriteId: string) {
    this.data.spriteId = spriteId;
  }

  getPlayer() {
    return this.entityDictionary[this.data.playerId] as PlayerViewModel;
  }

  getMoveZone() {
    return this.data.moveZone.map(point => {
      return this.entityDictionary[pointToCellId(point.point)] as CellViewModel;
    });
  }

  getModifiers() {
    return this.data.modifiers.map(modifierId => {
      return this.entityDictionary[modifierId] as ModifierViewModel;
    });
  }

  getCard() {
    return this.entityDictionary[this.data.card] as CardViewModel;
  }

  getCell() {
    if (this.isDead) return null;
    const id = pointToCellId(this.data.position);
    return this.entityDictionary[id] as CellViewModel;
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
        unitId: this.id,
        ...destination
      }
    });
  }

  canAttackAt(cell: CellViewModel) {
    return this.data.attackableCells.some(point => {
      return cell.id === pointToCellId(point);
    });
  }

  attackAt(cell: CellViewModel) {
    this.dispatcher({
      type: 'attack',
      payload: {
        playerId: this.playerId,
        unitId: this.id,
        ...cell.position
      }
    });
  }
}
