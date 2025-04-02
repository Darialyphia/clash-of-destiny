import { Vec2, type Point, type Point3D, type Serializable } from '@game/shared';
import { Entity } from '../../entity';
import { type AnyCard } from '../../card/entities/card.entity';
import { type Game } from '../../game/game';
import { MOVE_EVENTS, MovementComponent } from '../components/movement.component';
import type { Player } from '../../player/player.entity';
import type { AOEShape } from '../../aoe/aoe-shapes';
import {
  TARGETING_TYPE,
  type TargetingStrategy,
  type TargetingType
} from '../../targeting/targeting-strategy';
import { UNIT_EVENTS } from '../unit-enums';
import { KeywordManagerComponent } from '../../card/components/keyword-manager.component';
import {
  UnitAfterDestroyEvent,
  UnitAfterMoveEvent,
  UnitAttackEvent,
  UnitBeforeDestroyEvent,
  UnitBeforeMoveEvent,
  UnitCreatedEvent,
  UnitDealDamageEvent,
  UnitReceiveDamageEvent,
  UnitReceiveHealEvent,
  UnitTurnEvent,
  type UnitEventMap
} from '../unit.events';
import type { Damage } from '../../combat/damage';
import { COMBAT_EVENTS, CombatComponent } from '../../combat/combat.component';
import { PathfinderComponent } from '../../pathfinding/pathfinder.component';
import { SolidBodyPathfindingStrategy } from '../../pathfinding/strategies/solid-pathfinding.strategy';
import { UNIT_KINDS } from '../../card/card.enums';
import { HealthComponent } from '../components/health.component';
import { GAME_EVENTS, GameUnitEvent } from '../../game/game.events';
import type { Cell } from '../../board/cell';
import type { Modifier } from '../../modifier/modifier.entity';
import { ModifierManager } from '../../modifier/modifier-manager.component';
import { MeleeTargetingStrategy } from '../../targeting/melee-targeting.straegy';
import { PointAOEShape } from '../../aoe/point.aoe-shape';
import { makeUnitInterceptors, type UnitInterceptors } from '../unit-interceptors';
import type { MinionCard } from '../../card/entities/minion-card.entity';
import type { HeroCard } from '../../card/entities/hero-card.entity';
import type { ShrineCard } from '../../card/entities/shrine-card.entity';

export type SerializedUnit = {
  id: string;
  entityType: 'unit';
  position: Point;
  playerId: string;
  iconId: string;
  spriteId: string;
  spriteParts: Record<string, string>;
  name: string;
  description: string;
  hp: number;
  maxHp: number;
  atk: number;
  spellPower: number;
  keywords: Array<{ id: string; name: string; description: string }>;
  isDead: boolean;
  moveZone: Array<{ point: Point; path: Point[] }>;
  attackableCells: Point[];
  modifiers: string[];
};

export type UnitOptions = {
  id: string;
  position: Point;
  player: Player;
};

export class Unit
  extends Entity<UnitEventMap, UnitInterceptors>
  implements Serializable<SerializedUnit>
{
  private game: Game;

  readonly originalPlayer: Player;

  private readonly modifierManager: ModifierManager<Unit>;

  readonly hp: HealthComponent;

  readonly movement: MovementComponent;

  readonly keywordManager: KeywordManagerComponent;

  private readonly combat: CombatComponent;

  constructor(
    game: Game,
    readonly card: MinionCard | HeroCard | ShrineCard,
    options: UnitOptions
  ) {
    super(`${options.id}`, makeUnitInterceptors());
    this.game = game;
    this.originalPlayer = options.player;
    this.modifierManager = new ModifierManager(this);
    this.keywordManager = new KeywordManagerComponent();
    this.hp = new HealthComponent({
      initialValue: this.card.blueprint.maxHp,
      max: this.card.blueprint.maxHp
    });
    this.movement = new MovementComponent({
      position: options.position,
      pathfinding: new PathfinderComponent(
        this.game,
        new SolidBodyPathfindingStrategy(this.game, this)
      )
    });
    this.combat = new CombatComponent(this.game, this);

    this.game.on(GAME_EVENTS.TURN_START, () => {
      this.onTurnStart();
    });

    this.forwardEvents();
  }

  serialize(): SerializedUnit {
    return {
      id: this.id,
      entityType: 'unit' as const,
      position: this.position.serialize(),
      playerId: this.player.id,
      iconId: this.card.blueprint.iconId,
      spriteId: this.card.blueprint.spriteId,
      spriteParts: this.card.blueprint.spriteParts,
      name: this.card.blueprint.name,
      description: this.card.blueprint.getDescription(this.game, this as any),
      hp: this.hp.current,
      maxHp: this.hp.max,
      atk: this.atk,
      spellPower: this.spellPower,
      keywords: this.keywords.map(keyword => ({
        id: keyword.id,
        name: keyword.name,
        description: keyword.description
      })),
      isDead: this.isDead,
      moveZone: this.getPossibleMoves(),
      attackableCells: this.game.boardSystem.cells
        .filter(cell => this.canAttackAt(cell.position))
        .map(cell => cell.position.serialize()),
      modifiers: this.modifiers.map(modifier => modifier.id)
    };
  }

  private forwardEvents() {
    this.movement.on(MOVE_EVENTS.BEFORE_MOVE, e => {
      this.emitter.emit(UNIT_EVENTS.BEFORE_MOVE, e);
    });
    this.movement.on(MOVE_EVENTS.AFTER_MOVE, e => {
      this.emitter.emit(UNIT_EVENTS.AFTER_MOVE, e);
    });
    this.combat.on(COMBAT_EVENTS.BEFORE_ATTACK, e =>
      this.emitter.emit(UNIT_EVENTS.BEFORE_ATTACK, new UnitAttackEvent(e.data))
    );
    this.combat.on(COMBAT_EVENTS.AFTER_ATTACK, e =>
      this.emitter.emit(UNIT_EVENTS.AFTER_ATTACK, new UnitAttackEvent(e.data))
    );
    this.combat.on(COMBAT_EVENTS.BEFORE_DEAL_DAMAGE, e =>
      this.emitter.emit(UNIT_EVENTS.BEFORE_DEAL_DAMAGE, new UnitDealDamageEvent(e.data))
    );
    this.combat.on(COMBAT_EVENTS.AFTER_DEAL_DAMAGE, e =>
      this.emitter.emit(UNIT_EVENTS.AFTER_DEAL_DAMAGE, new UnitDealDamageEvent(e.data))
    );
    this.combat.on(COMBAT_EVENTS.BEFORE_RECEIVE_DAMAGE, e =>
      this.emitter.emit(
        UNIT_EVENTS.BEFORE_RECEIVE_DAMAGE,
        new UnitReceiveDamageEvent({ ...e.data, target: this })
      )
    );
    this.combat.on(COMBAT_EVENTS.AFTER_RECEIVE_DAMAGE, e =>
      this.emitter.emit(
        UNIT_EVENTS.AFTER_RECEIVE_DAMAGE,
        new UnitReceiveDamageEvent({ ...e.data, target: this })
      )
    );
    Object.values(UNIT_EVENTS).forEach(eventName => {
      this.on(eventName, event => {
        this.game.emit(
          `unit.${eventName}`,
          new GameUnitEvent({ unit: this, event }) as any
        );
      });
    });
  }

  get player() {
    return this.interceptors.player.getValue(this.originalPlayer, {});
  }

  get spellPower() {
    return this.interceptors.spellPower.getValue(0, {});
  }

  get position() {
    return this.movement.position;
  }

  get keywords() {
    return [...new Set([...this.keywordManager.keywords])];
  }

  get addKeyword() {
    return this.keywordManager.add.bind(this.keywordManager);
  }

  get removeKeyword() {
    return this.keywordManager.remove.bind(this.keywordManager);
  }

  get isHero() {
    return this.card.blueprint.unitKind === UNIT_KINDS.HERO;
  }

  get isShrine() {
    return this.card.blueprint.unitKind === UNIT_KINDS.SHRINE;
  }

  get isMinion() {
    return this.card.blueprint.unitKind === UNIT_KINDS.MINION;
  }

  canBeAttackedBy(unit: Unit): boolean {
    return this.interceptors.canBeAttackTarget.getValue(!this.isDead, { attacker: unit });
  }

  canBeTargetedByCard(card: AnyCard): boolean {
    return this.interceptors.canBeCardTarget.getValue(!this.isDead, { card });
  }

  get enemiesInRange() {
    return this.player.enemyUnits.filter(unit =>
      this.attackTargettingPattern.canTargetAt(unit.position)
    );
  }

  get isDead() {
    return this.hp.current <= 0;
  }

  get maxMovementsPerTurn() {
    return this.interceptors.maxMovementsPerTurn.getValue(
      this.game.config.MAX_MOVEMENT_PER_TURN,
      {}
    );
  }

  get maxAttacksPerTurn() {
    return this.interceptors.maxAttacksPerTurn.getValue(
      this.game.config.MAX_ATTACKS_PER_TURN,
      {}
    );
  }

  get attackTargettingPattern(): TargetingStrategy {
    return this.interceptors.attackTargetingPattern.getValue(
      new MeleeTargetingStrategy(this.game, this, {
        type: this.attackTargetType,
        allowCenter: false,
        allowDiagonals: false
      }),
      {}
    );
  }

  get atk() {
    return this.interceptors.atk.getValue(this.card.atk, {});
  }

  get attackTargetType(): TargetingType {
    return this.interceptors.attackTargetType.getValue(TARGETING_TYPE.ENEMY_UNIT, {});
  }

  get attackAOEShape(): AOEShape {
    return this.interceptors.attackAOEShape.getValue(
      new PointAOEShape(this.game, this.player, this.attackTargetType),
      {}
    );
  }

  get attacksPerformedThisTurn() {
    return this.combat.attacksCount;
  }

  get movementsMadeThisTurn() {
    return this.movement.movementsCount;
  }

  get canMove(): boolean {
    return this.interceptors.canMove.getValue(this.remainingMovement > 0, {});
  }

  canMoveThrough(unit: Unit) {
    return this.interceptors.canMoveThrough.getValue(this.isAlly(unit), { unit });
  }

  get canBeDestroyed(): boolean {
    return this.interceptors.canBeDestroyed.getValue(true, {});
  }

  canAttack(unit: Unit): boolean {
    return this.interceptors.canAttack.getValue(
      this.attacksPerformedThisTurn < this.maxAttacksPerTurn,
      { unit }
    );
  }

  get isAt() {
    return this.movement.isAt.bind(this.movement);
  }

  isBehind(unit: Unit) {
    return this.game.unitSystem.getEntityBehind(unit)?.equals(this);
  }

  isInFront(unit: Unit) {
    return this.game.unitSystem.getEntityInFront(unit)?.equals(this);
  }

  isAbove(unit: Unit) {
    return this.game.unitSystem.getEntityAbove(unit)?.equals(this);
  }

  isBelow(unit: Unit) {
    return this.game.unitSystem.getEntityBelow(unit)?.equals(this);
  }

  get remainingMovement() {
    return this.maxMovementsPerTurn - this.movementsMadeThisTurn;
  }

  addToBoard(opts: { affectedCells: Cell[]; affectedUnits: Unit[] }) {
    this.emitter.emit(UNIT_EVENTS.CREATED, new UnitCreatedEvent(opts));
  }

  shutdown() {
    this.emitter.removeAllListeners();
    this.movement.shutdown();
  }

  isEnemy(unit: Unit) {
    return !this.player.equals(unit.player);
  }

  isAlly(unit: Unit) {
    return this.player.equals(unit.player);
  }

  get speed() {
    return this.interceptors.movementReach.getValue(
      this.game.config.UNIT_MOVEMENT_REACH,
      {}
    );
  }
  canMoveTo(point: Point) {
    if (!this.canMove) return false;
    return this.movement.canMoveTo(point, this.speed);
  }

  move(to: Point) {
    this.movement.move(to);
  }

  deployAt(cell: Cell) {
    if (cell.unit) {
      this.swapPosition(cell.unit);
    } else {
      this.teleport(cell.position);
    }
  }

  swapPosition(unit: Unit) {
    const prevPosition = this.position.clone();
    const prevUnitPosition = unit.position.clone();
    this.teleport(prevUnitPosition);
    unit.teleport(prevPosition);
  }

  teleport(to: Point) {
    this.emitter.emit(
      UNIT_EVENTS.BEFORE_TELEPORT,
      new UnitBeforeMoveEvent({
        position: this.position,
        path: [this.position, Vec2.fromPoint(to)]
      })
    );

    const prevPosition = this.movement.position.clone();
    this.movement.position.x = to.x;
    this.movement.position.y = to.y;

    this.emitter.emit(
      UNIT_EVENTS.AFTER_TELEPORT,
      new UnitAfterMoveEvent({
        position: this.position,
        previousPosition: prevPosition,
        path: [this.position, Vec2.fromPoint(to)]
      })
    );
  }

  get getPathTo() {
    return this.movement.getPathTo.bind(this.movement);
  }

  getPossibleMoves() {
    if (!this.canMove) return [];
    return this.movement.getAllPossibleMoves(this.speed).filter(move => {
      const cell = this.game.boardSystem.getCellAt(move.point)!;
      return cell.isWalkable && !cell.unit;
    });
  }

  getDealtDamage(target: Unit) {
    return this.interceptors.damageDealt.getValue(this.atk, {
      target
    });
  }

  getReceivedDamage<T>(amount: number, damage: Damage<T>, from: AnyCard) {
    return this.interceptors.damageReceived.getValue(amount, {
      source: from,
      damage,
      amount
    });
  }

  get dealDamage() {
    return this.combat.dealDamage.bind(this.combat);
  }

  get takeDamage() {
    return this.combat.takeDamage.bind(this.combat);
  }

  heal(source: AnyCard, amount: number) {
    if (this.hp.current === this.hp.max) return;
    this.emitter.emit(
      UNIT_EVENTS.BEFORE_RECEIVE_HEAL,
      new UnitReceiveHealEvent({ from: source, amount })
    );
    this.hp.add(amount);
    this.emitter.emit(
      UNIT_EVENTS.AFTER_RECEIVE_HEAL,
      new UnitReceiveHealEvent({ from: source, amount })
    );
  }

  attack(point: Point) {
    this.combat.attack(point);
  }

  canAttackAt(point: Point) {
    if (this.position.equals(point)) {
      return false;
    }
    const target = this.game.unitSystem.getUnitAt(point);
    if (!target) return false;

    if (!this.canAttack(target) || !target.canBeAttackedBy(this)) {
      return false;
    }

    return this.attackTargettingPattern.canTargetAt(point);
  }

  canAttackFromSimulatedPosition(point: Point, position: Point) {
    const copy = this.position.clone();
    this.movement.position.x = position.x;
    this.movement.position.y = position.y;
    const canAttack = this.attackTargettingPattern.isWithinRange(point);
    this.movement.position = copy;
    return canAttack;
  }

  removeFromBoard() {
    for (const modifier of this.modifiers) {
      this.removeModifier(modifier);
    }
    this.game.unitSystem.removeUnit(this);
  }

  destroy(source: Unit) {
    this.emitter.emit(UNIT_EVENTS.BEFORE_DESTROY, new UnitBeforeDestroyEvent({ source }));
    if (!this.canBeDestroyed) return;
    const position = this.position;
    this.removeFromBoard();
    this.emitter.emit(
      UNIT_EVENTS.AFTER_DESTROY,
      new UnitAfterDestroyEvent({ source, destroyedAt: position })
    );
  }

  onTurnStart() {
    this.combat.resetAttackCount();
    this.movement.resetMovementsCount();
  }

  get removeModifier() {
    return this.modifierManager.remove.bind(this.modifierManager);
  }

  get hasModifier() {
    return this.modifierManager.has.bind(this.modifierManager);
  }

  get getModifier() {
    return this.modifierManager.get.bind(this.modifierManager);
  }

  get modifiers() {
    return this.modifierManager.modifiers;
  }

  addModifier(modifier: Modifier<Unit>) {
    const canAdd = this.interceptors.canReceiveModifier.getValue(true, { modifier });
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    if (!canAdd) return () => {};

    this.modifierManager.add(modifier);

    return () => this.removeModifier(modifier);
  }

  starturn() {
    this.emitter.emit(UNIT_EVENTS.START_TURN, new UnitTurnEvent({}));
  }

  endTurn() {
    this.emitter.emit(UNIT_EVENTS.END_TURN, new UnitTurnEvent({}));
  }
}
