import { Vec2, type Point, type Serializable } from '@game/shared';
import { Entity, INTERCEPTOR_EVENTS } from '../../entity';
import { type AnyCard } from '../../card/entities/card.entity';
import { type Game } from '../../game/game';
import { Interceptable } from '../../utils/interceptable';
import { MOVE_EVENTS, MovementComponent } from '../components/movement.component';
import type { Player, SerializedPlayer } from '../../player/player.entity';
import type { AOEShape } from '../../aoe/aoe-shapes';
import {
  TARGETING_TYPE,
  type TargetingStrategy,
  type TargetingType
} from '../../targeting/targeting-strategy';
import type { SerializedUnitCard, UnitCard } from '../../card/entities/unit-card.entity';
import { UNIT_EVENTS } from '../unit-enums';
import { KeywordManagerComponent } from '../../card/components/keyword-manager.component';
import { PLAYER_EVENTS } from '../../player/player-enums';
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
  type UnitEventMap
} from '../unit.events';
import type { Damage } from '../../combat/damage';
import { COMBAT_EVENTS, CombatComponent } from '../../combat/combat.component';
import { PathfinderComponent } from '../../pathfinding/pathfinder.component';
import { SolidBodyPathfindingStrategy } from '../../pathfinding/strategies/solid-pathfinding.strategy';
import { CARD_KINDS, UNIT_TYPES } from '../../card/card.enums';
import { HealthComponent } from '../components/health.component';
import { GameUnitEvent } from '../../game/game.events';
import type { Cell } from '../../board/cell';
import type { Modifier, SerializedModifier } from '../../modifier/modifier.entity';
import { ModifierManager } from '../../modifier/modifier-manager.component';
import {
  SingleCounterAttackParticipantStrategy,
  type CounterAttackParticipantStrategy
} from '../../combat/counterattack-participants';

export type SerializedUnit = {
  id: string;
  card: SerializedUnitCard;
  position: Point;
  baseAtk: number;
  atk: number;
  isGeneral: boolean;
  baseMaxHp: number;
  maxHp: number;
  currentHp: number;
  isFullHp: boolean;
  player: SerializedPlayer;
  keywords: Array<{ id: string; name: string; description: string }>;
  isExhausted: boolean;
  isDead: boolean;
  moveZone: Point[];
  dangerZone: Point[];
  attackableCells: Point[];
  modifiers: SerializedModifier[];
};

export type UnitOptions = {
  id: string;
  position: Point;
  player: Player;
};

type UnitInterceptors = {
  canMove: Interceptable<boolean>;
  canMoveThrough: Interceptable<boolean, { unit: Unit }>;
  canMoveAfterAttacking: Interceptable<boolean>;
  canAttack: Interceptable<boolean, { unit: Unit }>;
  canCounterAttack: Interceptable<boolean, { attacker: Unit }>;
  canBeAttackTarget: Interceptable<boolean, { attacker: Unit }>;
  canBeCounterattackTarget: Interceptable<boolean, { attacker: Unit }>;
  canBeCardTarget: Interceptable<boolean, { card: AnyCard }>;
  canBeDestroyed: Interceptable<boolean>;
  canReceiveModifier: Interceptable<boolean, { modifier: Modifier<Unit> }>;

  shouldDeactivateWhenSummoned: Interceptable<boolean>;

  maxHp: Interceptable<number>;
  attack: Interceptable<number>;
  speed: Interceptable<number>;

  attackTargetingPattern: Interceptable<TargetingStrategy>;
  attackTargetType: Interceptable<TargetingType>;
  attackAOEShape: Interceptable<AOEShape>;
  attackCounterattackParticipants: Interceptable<CounterAttackParticipantStrategy>;

  counterattackTargetingPattern: Interceptable<TargetingStrategy>;
  counterattackTargetType: Interceptable<TargetingType>;
  counterattackAOEShape: Interceptable<AOEShape>;

  maxAttacksPerTurn: Interceptable<number>;
  maxMovementsPerTurn: Interceptable<number>;
  maxCounterattacksPerTurn: Interceptable<number>;

  player: Interceptable<Player>;

  damageDealt: Interceptable<number, { source: AnyCard; target: Unit }>;
  damageReceived: Interceptable<
    number,
    { amount: number; source: AnyCard; damage: Damage<AnyCard> }
  >;
};

const makeInterceptors = (): UnitInterceptor => {
  return {
    canMove: new Interceptable<boolean>(),
    canMoveAfterAttacking: new Interceptable<boolean>(),
    canMoveThrough: new Interceptable<boolean, { unit: Unit }>(),
    canAttack: new Interceptable<boolean, { unit: Unit }>(),
    canCounterAttack: new Interceptable<boolean, { attacker: Unit }>(),
    canBeAttackTarget: new Interceptable<boolean, { attacker: Unit }>(),
    canBeCounterattackTarget: new Interceptable<boolean, { attacker: Unit }>(),
    canBeCardTarget: new Interceptable<boolean, { card: AnyCard }>(),
    canBeDestroyed: new Interceptable<boolean>(),
    canReceiveModifier: new Interceptable<boolean, { modifier: Modifier<Unit> }>(),

    shouldDeactivateWhenSummoned: new Interceptable<boolean>(),

    maxHp: new Interceptable<number>(),
    attack: new Interceptable<number>(),
    speed: new Interceptable<number>(),

    attackTargetingPattern: new Interceptable<TargetingStrategy>(),
    attackTargetType: new Interceptable<TargetingType>(),
    attackAOEShape: new Interceptable<AOEShape>(),
    attackCounterattackParticipants:
      new Interceptable<CounterAttackParticipantStrategy>(),

    counterattackTargetingPattern: new Interceptable<TargetingStrategy>(),
    counterattackTargetType: new Interceptable<TargetingType>(),
    counterattackAOEShape: new Interceptable<AOEShape>(),

    maxAttacksPerTurn: new Interceptable<number>(),
    maxMovementsPerTurn: new Interceptable<number>(),
    maxCounterattacksPerTurn: new Interceptable<number>(),

    player: new Interceptable<Player>(),

    damageDealt: new Interceptable<number, { source: AnyCard; target: Unit }>(),
    damageReceived: new Interceptable<
      number,
      { amount: number; source: AnyCard; damage: Damage<AnyCard> }
    >()
  };
};

export type UnitInterceptor = Unit['interceptors'];

export class Unit
  extends Entity<UnitEventMap, UnitInterceptors>
  implements Serializable<SerializedUnit>
{
  private game: Game;

  readonly originalPlayer: Player;

  readonly card: UnitCard;

  private modifierManager: ModifierManager<Unit>;

  private health: HealthComponent;

  readonly movement: MovementComponent;

  readonly keywordManager: KeywordManagerComponent;

  private readonly combat: CombatComponent;

  constructor(game: Game, card: UnitCard, options: UnitOptions) {
    super(`${options.id}_${card.blueprintId}`, makeInterceptors());
    this.game = game;
    this.card = card;
    this.originalPlayer = options.player;
    this.modifierManager = new ModifierManager(this);
    this.keywordManager = new KeywordManagerComponent();
    this.health = new HealthComponent({ initialValue: card.maxHp });
    this.movement = new MovementComponent({
      position: options.position,
      pathfinding: new PathfinderComponent(
        this.game,
        new SolidBodyPathfindingStrategy(this.game, this)
      )
    });
    this.combat = new CombatComponent(this.game, this);

    this.player.on(PLAYER_EVENTS.START_TURN, () => {
      this.onTurnStart();
    });
    this.on(INTERCEPTOR_EVENTS.ADD_INTERCEPTOR, event => {
      if (event.key === 'maxHp') {
        this.checkHp({ source: this.card });
      }
    });

    this.forwardListeners();
    this.forwardEvents();
  }

  serialize() {
    // calculate this upfront as this can be an expensive operation if we call it many times
    // moves the unit could make if she wasnt exhausted / provoked / etc
    const potentialMoves = this.getPossibleMoves(this.speed, true);
    // moves the unit can actually make
    const possibleMoves = this.getPossibleMoves(this.speed);

    return {
      id: this.id,
      card: this.card.serialize(),
      position: this.position.serialize(),
      baseAtk: this.card.baseAtk,
      atk: this.atk,
      baseMaxHp: this.card.baseMaxHp,
      maxHp: this.maxHp,
      currentHp: this.hp,
      isFullHp: this.isFullHp,
      isGeneral: this.isGeneral,
      player: this.player.serialize(),
      keywords: this.keywords.map(keyword => ({
        id: keyword.id,
        name: keyword.name,
        description: keyword.description
      })),
      isExhausted: this.isExhausted,
      isDead: this.isDead,
      moveZone: possibleMoves,
      dangerZone: this.game.boardSystem.cells
        .filter(cell => {
          return potentialMoves
            .filter(move => cell.isNeightbor(move))
            .some(point => this.canAttackFromSimulatedPosition(cell.position, point));
        })
        .map(cell => cell.position.serialize()),
      attackableCells: this.game.boardSystem.cells
        .filter(cell => this.canAttackAt(cell.position))
        .map(cell => cell.position.serialize()),
      modifiers: this.modifiers.map(modifier => modifier.serialize())
    };
  }

  private forwardListeners() {
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

  get position() {
    return this.movement.position;
  }

  get keywords() {
    return [...new Set([...this.keywordManager.keywords, ...this.card.keywords])];
  }

  get addKeyword() {
    return this.keywordManager.add.bind(this.keywordManager);
  }

  get removeKeyword() {
    return this.keywordManager.remove.bind(this.keywordManager);
  }

  get x() {
    return this.movement.x;
  }

  get y() {
    return this.movement.y;
  }

  get isUnit() {
    return this.card.kind === CARD_KINDS.UNIT;
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

  get name() {
    return this.card.name;
  }

  get description() {
    return this.card.description;
  }

  get isGeneral() {
    return this.card.unitType === UNIT_TYPES.GENERAL;
  }

  canBeAttackedBy(unit: Unit): boolean {
    return this.interceptors.canBeAttackTarget.getValue(!this.isDead, { attacker: unit });
  }

  canBeCounterattackedBy(unit: Unit): boolean {
    return this.interceptors.canBeCounterattackTarget.getValue(!this.isDead, {
      attacker: unit
    });
  }

  canBeTargetedByCard(card: AnyCard): boolean {
    return this.interceptors.canBeCardTarget.getValue(!this.isDead, { card });
  }

  getCounterattackParticipants(initialTarget: Unit) {
    return this.interceptors.attackCounterattackParticipants
      .getValue(new SingleCounterAttackParticipantStrategy(), {})
      .getCounterattackParticipants({
        attacker: this,
        initialTarget,
        affectedUnits: this.attackAOEShape.getUnits([initialTarget])
      });
  }

  get shouldDeactivateWhenSummoned(): boolean {
    return this.interceptors.shouldDeactivateWhenSummoned.getValue(!this.isGeneral, {});
  }

  get enemiesInRange() {
    return this.player.enemyUnits.filter(unit =>
      this.attackTargettingPattern.canTargetAt(unit.position)
    );
  }

  get isExhausted() {
    if (this.player.isActive) {
      return (
        this.attacksPerformedThisTurn === this.maxAttacksPerTurn &&
        // this replicates Duelyst's behavior where a unit appears greyed out if she can attack but nobody is in range
        this.movementsMadeThisTurn === this.maxMovementsPerTurn
      );
    } else {
      return this.counterAttacksPerformedThisTurn === this.maxCounterattacksPerTurn;
    }
  }

  get isDead() {
    return this.health.current <= 0;
  }

  get maxHp() {
    return this.interceptors.maxHp.getValue(this.card.maxHp, {});
  }

  get hp() {
    return this.interceptors.maxHp.getValue(this.health.current, {});
  }

  get atk() {
    return this.interceptors.attack.getValue(this.card.atk, {});
  }

  get speed() {
    return this.interceptors.speed.getValue(this.game.config.BASE_UNIT_SPEED, {});
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

  get maxCounterattacksPerTurn() {
    return this.interceptors.maxCounterattacksPerTurn.getValue(
      this.game.config.MAX_COUNTERATTACKS_PER_TURN,
      {}
    );
  }

  get attackTargettingPattern(): TargetingStrategy {
    return this.interceptors.attackTargetingPattern.getValue(this.card.attackPattern, {});
  }

  get attackTargetType(): TargetingType {
    return this.interceptors.attackTargetType.getValue(TARGETING_TYPE.ENEMY_UNIT, {});
  }

  get attackAOEShape(): AOEShape {
    return this.interceptors.attackAOEShape.getValue(this.card.attackAOEShape, {});
  }

  get counterattackTargetingPattern(): TargetingStrategy {
    return this.interceptors.counterattackTargetingPattern.getValue(
      this.card.counterattackPattern,
      {}
    );
  }

  get counterattackTargetType(): TargetingType {
    return this.interceptors.counterattackTargetType.getValue(
      TARGETING_TYPE.ENEMY_UNIT,
      {}
    );
  }

  get counterattackAOEShape(): AOEShape {
    return this.interceptors.counterattackAOEShape.getValue(
      this.card.counterattackAOEShape,
      {}
    );
  }

  get attacksPerformedThisTurn() {
    return this.combat.attacksCount;
  }

  get counterAttacksPerformedThisTurn() {
    return this.combat.counterAttacksCount;
  }

  get movementsMadeThisTurn() {
    return this.movement.movementsCount;
  }

  get canMoveAfterAttacking() {
    return this.interceptors.canMoveAfterAttacking.getValue(false, {});
  }

  get canMove(): boolean {
    return this.interceptors.canMove.getValue(
      this.movementsMadeThisTurn < this.maxMovementsPerTurn &&
        (this.attacksPerformedThisTurn > 0 ? this.canMoveAfterAttacking : true),
      {}
    );
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

  canCounterAttack(unit: Unit): boolean {
    return this.interceptors.canCounterAttack.getValue(
      this.combat.counterAttacksCount < this.maxCounterattacksPerTurn,
      { attacker: unit }
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

  private checkHp({ source }: { source: AnyCard }) {
    if (this.hp <= 0) {
      this.game.inputSystem.schedule(() => {
        this.destroy(source);
      });
    }
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
    this.combat.on(COMBAT_EVENTS.BEFORE_COUNTERATTACK, e =>
      this.emitter.emit(UNIT_EVENTS.BEFORE_COUNTERATTACK, new UnitAttackEvent(e.data))
    );
    this.combat.on(COMBAT_EVENTS.AFTER_COUNTERATTACK, e =>
      this.emitter.emit(UNIT_EVENTS.AFTER_COUNTERATTACK, new UnitAttackEvent(e.data))
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

  canMoveTo(point: Point) {
    if (!this.canMove) return false;
    return this.movement.canMoveTo(point, this.speed);
  }

  move(to: Point) {
    this.movement.move(to);
    // also check attacks made and increase to always be at least 1 less than moves
    // this enforces celerity rules of not allowing more than one move per attack
    const minAttacks = this.movementsMadeThisTurn - 1;
    if (this.attacksPerformedThisTurn < minAttacks) {
      this.combat.setAttackCount(minAttacks);
    }
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

  getPossibleMoves(max?: number, force = false) {
    if (!this.canMove && !force) return [];
    return this.movement.getAllPossibleMoves(max ?? this.speed).filter(point => {
      const cell = this.game.boardSystem.getCellAt(point)!;
      return cell.isWalkable && !cell.unit;
    });
  }

  getDealtDamage(target: Unit) {
    return this.interceptors.damageDealt.getValue(this.atk, {
      source: this.card,
      target
    });
  }

  getReceivedDamage<T extends AnyCard>(amount: number, damage: Damage<T>, from: AnyCard) {
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

  get isFullHp() {
    return this.hp === this.maxHp;
  }

  heal(source: AnyCard, amount: number) {
    if (this.isFullHp) return;
    this.emitter.emit(
      UNIT_EVENTS.BEFORE_RECEIVE_HEAL,
      new UnitReceiveHealEvent({ from: source, amount })
    );
    this.addHp(amount, source);
    this.emitter.emit(
      UNIT_EVENTS.AFTER_RECEIVE_HEAL,
      new UnitReceiveHealEvent({ from: source, amount })
    );
  }

  addHp(amount: number, source: AnyCard) {
    this.health.add(amount, this.maxHp);
    this.checkHp({ source });
  }

  removeHp(amount: number, source: AnyCard) {
    this.health.remove(amount);
    this.checkHp({ source });
  }

  attack(point: Point) {
    this.combat.attack(point);
  }

  counterAttack(unit: Unit) {
    this.combat.counterAttack(unit);
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

  canCounterAttackAt(point: Point) {
    if (this.position.equals(point)) {
      return false;
    }

    const target = this.game.unitSystem.getUnitAt(point);
    if (!target) return false;

    return (
      this.canCounterAttack(target) &&
      this.counterattackTargetingPattern.canTargetAt(point)
    );
  }

  removeFromBoard() {
    for (const modifier of this.modifiers) {
      this.removeModifier(modifier.id);
    }
    this.game.unitSystem.removeUnit(this);
  }

  destroy(source: AnyCard) {
    this.emitter.emit(UNIT_EVENTS.BEFORE_DESTROY, new UnitBeforeDestroyEvent({ source }));
    if (!this.canBeDestroyed) return;
    const position = this.position;
    this.removeFromBoard();
    this.emitter.emit(
      UNIT_EVENTS.AFTER_DESTROY,
      new UnitAfterDestroyEvent({ source, destroyedAt: position })
    );
  }

  activate() {
    this.combat.resetAttackCount();
    this.movement.resetMovementsCount();
  }

  deactivate() {
    this.combat.setAttackCount(this.maxAttacksPerTurn);
    this.movement.setMovementCount(this.maxMovementsPerTurn);
  }

  onTurnStart() {
    this.activate();
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

    return () => this.removeModifier(modifier.id);
  }
}
