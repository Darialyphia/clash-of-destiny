import { Vec2, type Point, type Values } from '@game/shared';
import {
  TypedSerializableEvent,
  TypedSerializableEventEmitter
} from '../../utils/typed-emitter';
import { cellIdToPoint } from '../../board/board-utils';
import type { SerializedCoords } from '../../board/cell';
import type { PathfinderComponent } from '../../pathfinding/pathfinder.component';
import { Position } from '../../utils/position.component';

export type MovementComponentOptions = {
  position: Point;
  pathfinding: PathfinderComponent;
};

export const MOVE_EVENTS = {
  BEFORE_MOVE: 'before_move',
  AFTER_MOVE: 'after_move'
} as const;

export type MoveEvent = Values<typeof MOVE_EVENTS>;

export class BeforeMoveEvent extends TypedSerializableEvent<
  { position: Vec2; path: Vec2[] },
  { position: Point; path: Point[] }
> {
  serialize() {
    return {
      position: this.data.position.serialize(),
      path: this.data.path.map(vec => vec.serialize())
    };
  }
}

export class AfterMoveEvent extends TypedSerializableEvent<
  { position: Vec2; previousPosition: Vec2; path: Vec2[] },
  { position: Point; previousPosition: Point; path: Point[] }
> {
  serialize() {
    return {
      position: this.data.position.serialize(),
      previousPosition: this.data.previousPosition.serialize(),
      path: this.data.path.map(vec => vec.serialize())
    };
  }
}

export type MoveEventMap = {
  [MOVE_EVENTS.BEFORE_MOVE]: BeforeMoveEvent;
  [MOVE_EVENTS.AFTER_MOVE]: AfterMoveEvent;
};

export class MovementComponent {
  position: Position;

  private pathfinding: PathfinderComponent;

  private emitter = new TypedSerializableEventEmitter<MoveEventMap>();

  private _movementsCount = 0;

  constructor(options: MovementComponentOptions) {
    this.position = Position.fromPoint(options.position);
    this.pathfinding = options.pathfinding;
  }

  get on() {
    return this.emitter.on.bind(this.emitter);
  }

  get once() {
    return this.emitter.once.bind(this.emitter);
  }

  get off() {
    return this.emitter.off.bind(this.emitter);
  }

  get x() {
    return this.position.x;
  }

  get y() {
    return this.position.y;
  }

  get movementsCount() {
    return this._movementsCount;
  }

  isAt(point: Point) {
    return this.position.equals(point);
  }

  resetMovementsCount() {
    this._movementsCount = 0;
  }

  setMovementCount(count: number) {
    this._movementsCount = count;
  }

  getAllPossibleMoves(maxDistance: number) {
    const distanceMap = this.pathfinding.getDistanceMap(this.position, maxDistance);
    return Object.entries(distanceMap.costs)
      .filter(([, cost]) => cost <= maxDistance)
      .map(([cellId]) => cellIdToPoint(cellId as SerializedCoords));
  }

  canMoveTo(point: Point, maxDistance: number) {
    const path = this.pathfinding.getPathTo(this.position, point);
    if (!path) return false;
    return path.distance <= maxDistance;
  }

  getPathTo(point: Point, maxDistance?: number) {
    return this.pathfinding.getPathTo(this, point, maxDistance);
  }

  move(to: Point) {
    const path = this.pathfinding.getPathTo(this, to);
    if (!path) return;

    this.emitter.emit(
      MOVE_EVENTS.BEFORE_MOVE,
      new BeforeMoveEvent({
        position: this.position,
        path: path.path.map(Vec2.fromPoint)
      })
    );
    const currentPosition = this.position;

    for (const point of path.path) {
      this.position = Position.fromPoint(point);
    }

    this._movementsCount++;

    this.emitter.emit(
      MOVE_EVENTS.AFTER_MOVE,
      new AfterMoveEvent({
        position: this.position,
        previousPosition: currentPosition,
        path: path.path.map(Vec2.fromPoint)
      })
    );

    return path;
  }

  shutdown() {
    this.emitter.removeAllListeners();
  }
}
