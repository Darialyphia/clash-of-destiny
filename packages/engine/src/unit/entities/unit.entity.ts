import { assert, isDefined, Vec2, type Point, type Serializable } from '@game/shared';
import { Entity, INTERCEPTOR_EVENTS } from '../../entity';
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
  HeroAfterEvolveEvent,
  HeroBeforeEvolveEvent,
  UnitAfterDestroyEvent,
  UnitAfterMoveEvent,
  UnitAttackEvent,
  UnitBeforeDestroyEvent,
  UnitBeforeMoveEvent,
  UnitCreatedEvent,
  UnitDealDamageEvent,
  UnitExhaustEvent,
  UnitReceiveDamageEvent,
  UnitReceiveHealEvent,
  UnitUseAbilityEvent,
  UnitWakeUpEvent,
  type UnitEventMap
} from '../unit.events';
import { CombatDamage, type Damage } from '../../combat/damage';
import { COMBAT_EVENTS, CombatComponent } from '../../combat/combat.component';
import { PathfinderComponent } from '../../pathfinding/pathfinder.component';
import { SolidBodyPathfindingStrategy } from '../../pathfinding/strategies/solid-pathfinding.strategy';
import { UNIT_KINDS } from '../../card/card.enums';
import { HealthComponent } from '../components/health.component';
import { GAME_EVENTS, GameUnitEvent } from '../../game/game.events';
import type { Cell } from '../../board/cell';
import type { Modifier } from '../../modifier/modifier.entity';
import { ModifierManager } from '../../modifier/modifier-manager.component';
import { PointAOEShape } from '../../aoe/point.aoe-shape';
import { makeUnitInterceptors, type UnitInterceptors } from '../unit-interceptors';
import type { AnyUnitCard } from '../../card/entities/unit-card.entity';
import { SingleCounterAttackParticipantStrategy } from '../../combat/counterattack-participants';
import { HeroCard } from '../../card/entities/hero-card.entity';
import type { Ability } from '../../card/card-blueprint';
import { UnitAbilityNotFoundError, WrongUnitKindError } from '../unit-errors';

export type SerializedUnit = {
  id: string;
  entityType: 'unit';
  position: Point;
  playerId: string;
  spriteId: string;
  spriteParts: Record<string, string>;
  name: string;
  description: string;
  isHero: boolean;
  isShrine: boolean;
  isMinion: boolean;
  hp: number;
  maxHp: number;
  atk: number;
  spellPower: number;
  keywords: Array<{ id: string; name: string; description: string }>;
  isDead: boolean;
  moveZone: Array<{ point: Point; path: Point[] }>;
  attackableCells: Point[];
  modifiers: string[];
  abilities: Array<{
    id: string;
    manaCost: number;
    label: string;
    canUse: boolean;
  }>;
  isExhausted: boolean;
  card: string;
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

  private _isExhausted = false;

  private _isDead = false;

  constructor(
    game: Game,
    private _card: AnyUnitCard,
    options: UnitOptions
  ) {
    super(`${options.id}`, makeUnitInterceptors());
    this.game = game;
    this.originalPlayer = options.player;
    this.modifierManager = new ModifierManager(this);
    this.keywordManager = new KeywordManagerComponent();
    this.hp = new HealthComponent({
      initialValue: this._card.maxHp,
      max: this._card.maxHp
    });
    this.movement = new MovementComponent({
      position: options.position,
      pathfinding: new PathfinderComponent(
        this.game,
        new SolidBodyPathfindingStrategy(this.game, this)
      )
    });
    this.combat = new CombatComponent(this.game, this);

    this.game.on(GAME_EVENTS.PLAYER_START_TURN, () => {
      this.onTurnStart();
    });

    this.on(INTERCEPTOR_EVENTS.ADD_INTERCEPTOR, e => {
      if (e.key === 'maxHp') {
        this.hp.max = this._card.maxHp;
        if (this.hp.current <= 0) {
          this.destroy(this._card);
        }
      }
    });
    this.on(INTERCEPTOR_EVENTS.REMOVE_INTERCEPTOR, e => {
      if (e.key === 'maxHp') {
        this.hp.max = this._card.maxHp;
        if (this.hp.current <= 0) {
          this.destroy(this._card);
        }
      }
    });
    this.forwardEvents();
  }

  serialize(): SerializedUnit {
    return {
      id: this.id,
      entityType: 'unit' as const,
      card: this._card.id,
      position: this.position.serialize(),
      playerId: this.player.id,
      spriteId: this._card.blueprint.spriteId,
      spriteParts: this._card.blueprint.spriteParts,
      name: this._card.blueprint.name,
      description: this._card.blueprint.getDescription(this.game, this as any),
      isHero: this.isHero,
      isShrine: this.isShrine,
      isMinion: this.isMinion,
      hp: this.hp.current,
      maxHp: this.hp.max,
      atk: this.atk,
      spellPower: this.spellpower,
      keywords: this.keywords.map(keyword => ({
        id: keyword.id,
        name: keyword.name,
        description: keyword.description
      })),
      isDead: this.isDead,
      moveZone: this.isDead ? [] : this.getPossibleMoves(),
      attackableCells: this.isDead
        ? []
        : this.game.boardSystem.cells
            .filter(cell => this.canAttackAt(cell.position))
            .map(cell => cell.position.serialize()),
      modifiers: this.modifiers.map(modifier => modifier.id),
      abilities: this.card.abilities
        .filter(ability => !ability.isCardAbility)
        .map(ability => ({
          id: ability.id,
          manaCost: ability.manaCost,
          label: ability.label,
          canUse: this.canUseAbiliy(ability.id)
        })),
      isExhausted: this.isExhausted
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

  get spellpower() {
    if (this._card instanceof HeroCard) {
      return this.interceptors.spellpower.getValue(this._card.spellpower, {});
    }

    return 0;
  }

  get position() {
    return this.movement.position;
  }

  get level() {
    if (this.isMinion) return 0;
    if (this.isShrine) return this.interceptors.level.getValue(0, {});
    return this.interceptors.level.getValue((this._card as HeroCard).level, {});
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
    return this._card.blueprint.unitKind === UNIT_KINDS.HERO;
  }

  get isShrine() {
    return this._card.blueprint.unitKind === UNIT_KINDS.SHRINE;
  }

  get isMinion() {
    return this._card.blueprint.unitKind === UNIT_KINDS.MINION;
  }

  get isExhausted() {
    return this._isExhausted;
  }

  get card() {
    return this._card;
  }

  evolveHero(card: HeroCard) {
    assert(
      this.isHero || this.isShrine,
      new WrongUnitKindError(UNIT_KINDS.HERO, this._card.blueprint.unitKind)
    );
    this.emitter.emit(
      UNIT_EVENTS.BEFORE_EVOLVE_HERO,
      new HeroBeforeEvolveEvent({ newCard: card })
    );
    const prev = this._card as HeroCard;
    this._card = card;
    this.hp.max = card.maxHp;
    this.emitter.emit(
      UNIT_EVENTS.AFTER_EVOLVE_HERO,
      new HeroAfterEvolveEvent({ prevCard: prev, newCard: card })
    );
  }

  exhaust() {
    this.emitter.emit(UNIT_EVENTS.BEFORE_EXHAUST, new UnitExhaustEvent({}));
    this._isExhausted = true;
    this.emitter.emit(UNIT_EVENTS.AFTER_EXHAUST, new UnitExhaustEvent({}));
  }

  wakeUp() {
    this.emitter.emit(UNIT_EVENTS.BEFORE_WAKE_UP, new UnitWakeUpEvent({}));
    this._isExhausted = false;
    this.emitter.emit(UNIT_EVENTS.AFTER_WAKE_UP, new UnitWakeUpEvent({}));
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
        affectedUnits: this.attackAOEShape.getUnits([initialTarget.position])
      });
  }

  get enemiesInRange() {
    return this.player.enemyUnits.filter(unit =>
      this.attackTargettingPattern.canTargetAt(unit.position)
    );
  }

  get isDead() {
    return this._isDead;
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

  get atk() {
    return this.interceptors.attack.getValue(this._card.atk, {});
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

  get counterattackTargetingPattern(): TargetingStrategy {
    return this.interceptors.counterattackTargetingPattern.getValue(
      this._card.counterattackPattern,
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
      this._card.counterattackAOEShape,
      {}
    );
  }

  get attacksPerformedThisTurn() {
    return this.combat.attacksCount;
  }

  get counterAttacksPerformedThisTurn() {
    return this.combat.counterAttacksCount;
  }

  canCounterAttack(unit: Unit): boolean {
    return this.interceptors.canCounterAttack.getValue(
      !this.isShrine && !this.isExhausted,
      {
        attacker: unit
      }
    );
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

  get movementsMadeThisTurn() {
    return this.movement.movementsCount;
  }

  get canMove(): boolean {
    const baseValue =
      !this.isShrine &&
      !this.isExhausted &&
      this.movementsMadeThisTurn < this.maxMovementsPerTurn;
    return this.interceptors.canMove.getValue(baseValue, {});
  }

  canMoveThrough(unit: Unit) {
    return this.interceptors.canMoveThrough.getValue(this.isAlly(unit), { unit });
  }

  get canBeDestroyed(): boolean {
    return this.interceptors.canBeDestroyed.getValue(true, {});
  }

  canAttack(unit: Unit): boolean {
    return this.interceptors.canAttack.getValue(!this.isShrine && !this.isExhausted, {
      unit
    });
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
      target,
      source: this._card
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

  takeDamage(from: AnyCard, damage: Damage<AnyCard>): { isFatal: boolean } {
    this.combat.takeDamage(from, damage);
    if (this.hp.current > 0) return { isFatal: false };
    if (!this.canBeDestroyed) return { isFatal: false };

    if (damage instanceof CombatDamage) {
      this.game.inputSystem.schedule(() => {
        this.destroy(from);
      });
    } else {
      this.destroy(from);
    }
    return { isFatal: true };
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
    if (this.attacksPerformedThisTurn >= this.maxAttacksPerTurn) {
      this.exhaust();
    }
  }

  counterAttack(unit: Unit) {
    this.combat.counterAttack(unit);
    if (this.counterAttacksPerformedThisTurn >= this.maxCounterattacksPerTurn) {
      this.exhaust();
    }
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
    this.player.cards.sendToDiscardPile(this._card);
    this.game.unitSystem.removeUnit(this);
  }

  destroy(source: AnyCard) {
    this.emitter.emit(UNIT_EVENTS.BEFORE_DESTROY, new UnitBeforeDestroyEvent({ source }));
    if (!this.canBeDestroyed) return;
    const position = this.position.clone();
    this._isDead = true;
    this.removeFromBoard();
    this.emitter.emit(
      UNIT_EVENTS.AFTER_DESTROY,
      new UnitAfterDestroyEvent({ source, destroyedAt: position })
    );
    for (const modifier of this.modifiers) {
      this.removeModifier(modifier);
    }
  }

  onTurnStart() {
    this.combat.resetAttackCount();
    this.movement.resetMovementsCount();
    this.wakeUp();
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

  canUseAbiliy(id: string) {
    const ability = this._card.abilities.find(ability => ability.id === id) as Ability<
      this['card']
    >;
    assert(isDefined(ability), new UnitAbilityNotFoundError());

    return this.interceptors.canUseAbility.getValue(
      !this.isExhausted && this._card.canUseAbiliy(id),
      { ability: ability }
    );
  }

  useAbility(id: string) {
    this._card.useAbility(id, {
      onBeforeUse: ability => {
        this.emitter.emit(UNIT_EVENTS.BEFORE_USE_ABILITY, new UnitUseAbilityEvent({}));
      },
      onAfterUse: ability => {
        if (ability.shouldExhaust) {
          this.exhaust();
        }
        this.emitter.emit(UNIT_EVENTS.AFTER_USE_ABILITY, new UnitUseAbilityEvent({}));
      }
    });
  }
}
