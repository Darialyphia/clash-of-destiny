import { type EmptyObject, type Point, type Serializable } from '@game/shared';
import { Entity } from '../entity';
import type { Game } from '../game/game';
import { Position } from '../utils/position.component';
import { TERRAINS, type MapBlueprint, type Terrain } from './map-blueprint';

export type SerializedCoords = `${string}:${string}`;

export type CellOptions = MapBlueprint['cells'][number] & {
  id: string;
  position: Point;
};

export type SerializedCell = {
  entityType: 'cell';
  id: string;
  position: Point;
  terrain: Terrain;
  player: 'p1' | 'p2' | null;
  isWalkable: boolean;
  unit: string | null;
  interactable: string | null;
  spriteId: string;
};

export class Cell
  extends Entity<EmptyObject, EmptyObject>
  implements Serializable<SerializedCell>
{
  readonly position: Position;

  readonly terrain: Terrain;

  // obstacle: Obstacle | null;

  constructor(
    private game: Game,
    public options: CellOptions
  ) {
    super(options.id, {});
    this.terrain = options.terrain;
    this.position = Position.fromPoint(options.position);
  }

  serialize() {
    return {
      id: this.id,
      entityType: 'cell' as const,
      position: this.position.serialize(),
      terrain: this.terrain,
      player: this.options.player,
      isWalkable: this.isWalkable,
      unit: this.unit?.id ?? null,
      spriteId: this.options.spriteId,
      interactable: this.interactable?.id ?? null
    };
  }

  get x() {
    return this.position.x;
  }

  get y() {
    return this.position.y;
  }

  get neighbors(): Cell[] {
    return this.game.boardSystem.getNeighbors(this);
  }

  isNeightbor(point: Point) {
    return this.position.isNearby(point);
  }

  get isWalkable() {
    if (this.terrain !== TERRAINS.GROUND) return false;

    if (this.interactable && this.interactable.isWalkable) return false;

    return true;
  }

  get unit() {
    return this.game.unitSystem.getUnitAt(this);
  }

  get interactable() {
    return this.game.interactableSystem.getAt(this);
  }

  get player() {
    if (this.options.player === 'p1') return this.game.playerSystem.player1;
    if (this.options.player === 'p2') return this.game.playerSystem.player2;
    return null;
  }
}
