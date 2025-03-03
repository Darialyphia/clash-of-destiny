import {
  isDefined,
  Vec2,
  type Nullable,
  type Point,
  type Serializable
} from '@game/shared';
import { Entity, INTERCEPTOR_EVENTS } from '../../entity';
import { type AnyCard, type CardOptions } from '../../card/entities/card.entity';
import { type Game } from '../../game/game';
import { Interceptable } from '../../utils/interceptable';
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
  UnitPlayCardEvent,
  UnitReceiveDamageEvent,
  UnitReceiveHealEvent,
  UnitTurnEvent,
  type UnitEventMap
} from '../unit.events';
import type { Damage } from '../../combat/damage';
import { COMBAT_EVENTS, CombatComponent } from '../../combat/combat.component';
import { PathfinderComponent } from '../../pathfinding/pathfinder.component';
import { SolidBodyPathfindingStrategy } from '../../pathfinding/strategies/solid-pathfinding.strategy';
import { CARD_EVENTS, UNIT_KINDS } from '../../card/card.enums';
import { HealthComponent } from '../components/health.component';
import { GameUnitEvent } from '../../game/game.events';
import type { Cell } from '../../board/cell';
import type { Modifier } from '../../modifier/modifier.entity';
import { ModifierManager } from '../../modifier/modifier-manager.component';
import { ApComponent } from '../components/ap.component';
import type { UnitCard } from '../../card/entities/unit-card.entity';
import { MeleeTargetingStrategy } from '../../targeting/melee-targeting.straegy';
import { PointAOEShape } from '../../aoe/point.aoe-shape';
import { CardManagerComponent } from '../../card/components/card-manager.component';
import type {
  AbilityBlueprint,
  ArtifactBlueprint,
  QuestBlueprint
} from '../../card/card-blueprint';
import { ManaComponent } from '../components/mana.component';
import type { DeckCard } from '../../card/entities/deck.entity';
import { ArtifactManagerComponent } from '../components/artifact-manager.component';

export type SerializedUnit = {
  id: string;
  position: Point;
};

export type UnitOptions = {
  id: string;
  position: Point;
  player: Player;
  deck: {
    cards: Array<CardOptions<AbilityBlueprint | ArtifactBlueprint | QuestBlueprint>>;
  };
};

type UnitInterceptors = {
  canMove: Interceptable<boolean>;
  canMoveThrough: Interceptable<boolean, { unit: Unit }>;
  apCostPerMovement: Interceptable<number>;

  canAttack: Interceptable<boolean, { unit: Unit }>;
  canBeAttackTarget: Interceptable<boolean, { attacker: Unit }>;
  apCostPerAttack: Interceptable<number>;

  canPlayCard: Interceptable<boolean, { card: AnyCard }>;
  canBeCardTarget: Interceptable<boolean, { card: AnyCard }>;
  apCostPerCard: Interceptable<number>;
  abilityPower: Interceptable<number>;

  canReceiveModifier: Interceptable<boolean, { modifier: Modifier<Unit> }>;

  maxHp: Interceptable<number>;
  maxAp: Interceptable<number>;
  maxMp: Interceptable<number>;

  mpRegen: Interceptable<number>;

  initiative: Interceptable<number>;

  attackTargetingPattern: Interceptable<TargetingStrategy>;
  attackTargetType: Interceptable<TargetingType>;
  attackAOEShape: Interceptable<AOEShape>;

  maxAttacksPerTurn: Interceptable<number>;
  maxMovementsPerTurn: Interceptable<number>;

  player: Interceptable<Player>;

  damageDealt: Interceptable<number, { source: AnyCard; target: Unit }>;
  damageReceived: Interceptable<
    number,
    { amount: number; source: AnyCard; damage: Damage<AnyCard> }
  >;

  healReceived: Interceptable<number, { source: AnyCard }>;
  healDealt: Interceptable<number, { target: Unit }>;
};

const makeInterceptors = (): UnitInterceptor => {
  return {
    canMove: new Interceptable<boolean>(),
    canMoveThrough: new Interceptable<boolean, { unit: Unit }>(),
    apCostPerMovement: new Interceptable<number>(),

    canAttack: new Interceptable<boolean, { unit: Unit }>(),
    canBeAttackTarget: new Interceptable<boolean, { attacker: Unit }>(),
    apCostPerAttack: new Interceptable<number>(),

    canPlayCard: new Interceptable<boolean, { card: AnyCard }>(),
    canBeCardTarget: new Interceptable<boolean, { card: AnyCard }>(),
    apCostPerCard: new Interceptable<number>(),
    abilityPower: new Interceptable<number>(),

    canReceiveModifier: new Interceptable<boolean, { modifier: Modifier<Unit> }>(),

    maxHp: new Interceptable<number>(),
    maxAp: new Interceptable<number>(),
    maxMp: new Interceptable<number>(),

    mpRegen: new Interceptable<number>(),
    initiative: new Interceptable<number>(),

    attackTargetingPattern: new Interceptable<TargetingStrategy>(),
    attackTargetType: new Interceptable<TargetingType>(),
    attackAOEShape: new Interceptable<AOEShape>(),

    maxAttacksPerTurn: new Interceptable<number>(),
    maxMovementsPerTurn: new Interceptable<number>(),

    player: new Interceptable<Player>(),

    damageDealt: new Interceptable<number, { source: AnyCard; target: Unit }>(),
    damageReceived: new Interceptable<
      number,
      { amount: number; source: AnyCard; damage: Damage<AnyCard> }
    >(),
    healDealt: new Interceptable<number, { target: Unit }>(),
    healReceived: new Interceptable<number, { source: AnyCard }>()
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

  private readonly modifierManager: ModifierManager<Unit>;

  private readonly hpManager: HealthComponent;

  private readonly apManager: ApComponent;

  private readonly mpManager: ManaComponent;

  private readonly cards: CardManagerComponent;

  private readonly artifacts: ArtifactManagerComponent;

  readonly movement: MovementComponent;

  readonly keywordManager: KeywordManagerComponent;

  private readonly combat: CombatComponent;

  currentlyPlayedCard: Nullable<DeckCard> = null;

  currentyPlayedCardIndexInHand: Nullable<number> = null;

  private cancelCardCleanups: Array<() => void> = [];

  constructor(game: Game, card: UnitCard, options: UnitOptions) {
    super(`${options.id}_${card.blueprintId}`, makeInterceptors());
    this.game = game;
    this.card = card;
    this.originalPlayer = options.player;
    this.modifierManager = new ModifierManager(this);
    this.keywordManager = new KeywordManagerComponent();
    this.hpManager = new HealthComponent({ initialValue: card.maxHp });
    this.apManager = new ApComponent({ initialValue: game.config.MAX_AP });
    this.mpManager = new ManaComponent({ initialValue: game.config.INITIAL_MP });
    this.cards = new CardManagerComponent(this.game, this.player, {
      deck: options.deck.cards,
      maxHandSize: this.game.config.MAX_HAND_SIZE,
      shouldShuffleDeck: this.game.config.SHUFFLE_DECK_ON_GAME_START
    });
    this.artifacts = new ArtifactManagerComponent(this.game, this);
    this.movement = new MovementComponent({
      position: options.position,
      pathfinding: new PathfinderComponent(
        this.game,
        new SolidBodyPathfindingStrategy(this.game, this)
      )
    });
    this.combat = new CombatComponent(this.game, this);

    // this.player.on(PLAYER_EVENTS.START_TURN, () => {
    //   this.onTurnStart();
    // });
    this.on(INTERCEPTOR_EVENTS.ADD_INTERCEPTOR, event => {
      if (event.key === 'maxHp') {
        this.checkHp({ source: this.card });
      }
    });

    this.forwardEvents();
  }

  serialize(): SerializedUnit {
    // // calculate this upfront as this can be an expensive operation if we call it many times
    // // moves the unit could make if she wasnt exhausted / provoked / etc
    // const potentialMoves = this.getPossibleMoves(this.speed, true);
    // // moves the unit can actually make
    // const possibleMoves = this.getPossibleMoves(this.speed);

    return {
      id: this.id,
      position: this.position.serialize()
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

  get isActive() {
    return this.game.turnSystem.activeUnit.equals(this);
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

  get abilityPower() {
    return this.interceptors.abilityPower.getValue(0, {});
  }

  get mp() {
    return this.mpManager.current;
  }

  get maxMp() {
    return this.interceptors.maxMp.getValue(this.game.config.MAX_MP, {});
  }

  spendMp(amount: number) {
    if (amount === 0) return;
    this.mpManager.remove(amount);
  }

  gainMp(amount: number) {
    if (amount === 0) return;
    this.mpManager.add(amount, this.maxMp);
  }

  get mpRegen() {
    return this.interceptors.mpRegen.getValue(this.game.config.MP_REGEN_PER_TURN, {});
  }

  canSpendMp(amount: number) {
    return this.mp >= amount;
  }

  get ap() {
    return this.apManager.current;
  }

  get maxAp() {
    return this.interceptors.maxAp.getValue(this.game.config.MAX_AP, {});
  }

  spendAp(amount: number) {
    if (amount === 0) return;
    this.apManager.remove(amount);
  }

  gainAp(amount: number) {
    if (amount === 0) return;
    this.apManager.add(amount, this.maxAp);
  }

  canSpendAp(amount: number) {
    return this.ap >= amount;
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

  get isHero() {
    return this.card.blueprint.unitKind === UNIT_KINDS.HERO;
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
    return this.hpManager.current <= 0;
  }

  get maxHp() {
    return this.interceptors.maxHp.getValue(this.card.maxHp, {});
  }

  get hp() {
    return this.interceptors.maxHp.getValue(this.hpManager.current, {});
  }

  get initiative() {
    return this.interceptors.initiative.getValue(this.card.initiative, {});
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

  get attackTargetType(): TargetingType {
    return this.interceptors.attackTargetType.getValue(TARGETING_TYPE.ENEMY, {});
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

  get apCostPerMovement() {
    return this.interceptors.apCostPerMovement.getValue(
      this.game.config.AP_COST_PER_MOVE,
      {}
    );
  }

  get canMove(): boolean {
    return this.interceptors.canMove.getValue(
      this.remainingMovement > 0 && this.apManager.current >= this.apCostPerMovement,
      {}
    );
  }

  canMoveThrough(unit: Unit) {
    return this.interceptors.canMoveThrough.getValue(this.isAlly(unit), { unit });
  }

  get canBeDestroyed(): boolean {
    return true;
  }

  get apCostPerAttack() {
    return this.interceptors.apCostPerAttack.getValue(
      this.game.config.AP_COST_PER_ATTACK,
      {}
    );
  }

  canAttack(unit: Unit): boolean {
    return this.interceptors.canAttack.getValue(
      this.attacksPerformedThisTurn < this.maxAttacksPerTurn &&
        this.apManager.current >= this.apCostPerAttack,
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

  private checkHp({ source }: { source: AnyCard }) {
    if (this.hp <= 0) {
      this.game.inputSystem.schedule(() => {
        this.destroy(source);
      });
    }
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
    return this.movement.canMoveTo(
      point,
      this.remainingMovement / this.apCostPerMovement
    );
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

  getPossibleMoves(max?: number, force = false) {
    if (!this.canMove && !force) return [];
    return this.movement
      .getAllPossibleMoves(max ?? this.remainingMovement / this.apCostPerMovement)
      .filter(point => {
        const cell = this.game.boardSystem.getCellAt(point)!;
        return cell.isWalkable && !cell.unit;
      });
  }

  getDealtDamage(target: Unit) {
    return this.interceptors.damageDealt.getValue(this.game.config.BASE_ATTACK_DAMAGE, {
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
    this.hpManager.add(amount, this.maxHp);
    this.checkHp({ source });
  }

  removeHp(amount: number, source: AnyCard) {
    this.hpManager.remove(amount);
    this.checkHp({ source });
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

  onTurnStart() {
    this.combat.resetAttackCount();
    this.movement.resetMovementsCount();
    this.apManager.setTo(this.maxAp, this.maxAp);
    this.mpManager.add(this.mpRegen, this.maxMp);
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

  playCardAtIndex(index: number) {
    const card = this.cards.getCardAt(index);
    if (!card) return;

    this.playCardFromHand(card);
  }

  private onBeforePlayFromHand(card: DeckCard) {
    this.emitter.emit(UNIT_EVENTS.BEFORE_PLAY_CARD, new UnitPlayCardEvent({ card }));
    this.spendMp(card.manaCost);
  }

  private onAfterPlayFromHand(card: DeckCard) {
    this.currentlyPlayedCard = null;
    this.currentyPlayedCardIndexInHand = null;
    this.emitter.emit(UNIT_EVENTS.AFTER_PLAY_CARD, new UnitPlayCardEvent({ card }));
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

  get equipArtifact() {
    return this.artifacts.equipArtifact.bind(this.artifacts);
  }

  get unequipArtifact() {
    return this.artifacts.unequipArtifact.bind(this.artifacts);
  }

  starturn() {
    this.emitter.emit(UNIT_EVENTS.START_TURN, new UnitTurnEvent({}));
  }

  endTurn() {
    this.emitter.emit(UNIT_EVENTS.END_TURN, new UnitTurnEvent({}));
  }
}
