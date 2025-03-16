import {
  isDefined,
  Vec2,
  type Nullable,
  type Point,
  type Serializable
} from '@game/shared';
import { Entity, InterceptableEvent, INTERCEPTOR_EVENTS } from '../../entity';
import { type AnyCard, type CardOptions } from '../../card/entities/card.entity';
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
  UnitDrawEvent,
  UnitLevelUpEvent,
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
import { GAME_EVENTS, GameUnitEvent } from '../../game/game.events';
import type { Cell } from '../../board/cell';
import type { Modifier } from '../../modifier/modifier.entity';
import { ModifierManager } from '../../modifier/modifier-manager.component';
import { ApComponent } from '../components/ap.component';
import { MeleeTargetingStrategy } from '../../targeting/melee-targeting.straegy';
import { PointAOEShape } from '../../aoe/point.aoe-shape';
import { CardManagerComponent } from '../../card/components/card-manager.component';
import type {
  AbilityBlueprint,
  ArtifactBlueprint,
  CardBlueprint,
  HeroBlueprint,
  QuestBlueprint,
  UnitBlueprint
} from '../../card/card-blueprint';
import { ManaComponent } from '../components/mana.component';
import type { DeckCard } from '../../card/entities/deck.entity';
import { ArtifactManagerComponent } from '../components/artifact-manager.component';
import { makeUnitInterceptors, type UnitInterceptors } from '../unit-interceptors';
import { QuestManagerComponent } from '../components/quest-manager.component';

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
  hand: string[];
  handSize: number;
  remainingCardsInDeck: number;
  discardPile: string[];
  canReplace: boolean;
  hp: number;
  maxHp: number;
  ap: number;
  maxAp: number;
  mp: number;
  maxMp: number;
  level: number;
  blueprintChain: Array<{
    id: string;
    name: string;
    level: number;
  }>;
  exp: number;
  expToNextLevel: number;
  canLevelup: boolean;
  isMaxLevel: boolean;
  keywords: Array<{ id: string; name: string; description: string }>;
  isDead: boolean;
  moveZone: Array<{ point: Point; path: Point[] }>;
  attackableCells: Point[];
  modifiers: string[];
  artifacts: {
    weapon: string | null;
    armor: string | null;
    relic: string | null;
  };
};

export type UnitOptions = {
  id: string;
  position: Point;
  player: Player;
  deck: {
    cards: Array<CardOptions<AbilityBlueprint | ArtifactBlueprint | QuestBlueprint>>;
  };
};

export class Unit
  extends Entity<UnitEventMap, UnitInterceptors>
  implements Serializable<SerializedUnit>
{
  private game: Game;

  readonly originalPlayer: Player;

  private readonly modifierManager: ModifierManager<Unit>;

  readonly hp: HealthComponent;

  readonly ap: ApComponent;

  readonly mp: ManaComponent;

  readonly cards: CardManagerComponent;

  readonly artifacts: ArtifactManagerComponent;

  readonly movement: MovementComponent;

  readonly quests: QuestManagerComponent;

  readonly keywordManager: KeywordManagerComponent;

  private readonly combat: CombatComponent;

  currentlyPlayedCard: Nullable<DeckCard> = null;

  currentyPlayedCardIndexInHand: Nullable<number> = null;

  private cardReplacedThisTurn = 0;

  private cancelCardCleanups: Array<() => void> = [];

  private _level = 1;

  private _exp = 0;

  constructor(
    game: Game,
    readonly blueprintChain: UnitBlueprint[],
    options: UnitOptions
  ) {
    super(`${options.id}`, makeUnitInterceptors());
    this.game = game;
    this.originalPlayer = options.player;
    this.modifierManager = new ModifierManager(this);
    this.keywordManager = new KeywordManagerComponent();
    this.hp = new HealthComponent({
      initialValue: this.blueprint.maxHp,
      max: this.blueprint.maxHp
    });
    this.ap = new ApComponent({
      initialValue: game.config.MAX_AP,
      max: game.config.MAX_AP
    });
    this.mp = new ManaComponent({
      initialValue: game.config.INITIAL_MP,
      max: game.config.MAX_MP
    });
    this.quests = new QuestManagerComponent();
    this.cards = new CardManagerComponent(this.game, this, {
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

    this.game.on(GAME_EVENTS.TURN_START, () => {
      this.onTurnStart();
    });
    this.on(INTERCEPTOR_EVENTS.ADD_INTERCEPTOR, this.onInterceptorChange.bind(this));
    this.on(INTERCEPTOR_EVENTS.REMOVE_INTERCEPTOR, this.onInterceptorChange.bind(this));

    this.forwardEvents();
  }

  serialize(): SerializedUnit {
    return {
      id: this.id,
      entityType: 'unit' as const,
      position: this.position.serialize(),
      playerId: this.player.id,
      iconId: this.blueprint.iconId,
      spriteId: this.blueprint.spriteId,
      spriteParts: this.blueprint.spriteParts,
      name: this.blueprint.name,
      description: this.blueprint.description,
      hand: this.cards.hand.map(card => card.id),
      handSize: this.cards.hand.length,
      remainingCardsInDeck: this.cards.deck.cards.length,
      discardPile: Array.from(this.cards.discardPile).map(card => card.id),
      canReplace: this.canReplace(),
      hp: this.hp.current,
      maxHp: this.hp.max,
      ap: this.ap.current,
      maxAp: this.ap.max,
      mp: this.mp.current,
      maxMp: this.mp.max,
      level: this.level,
      isMaxLevel: !this.nextBlueprint,
      blueprintChain: this.blueprintChain.map(blueprint => ({
        id: blueprint.id,
        name: blueprint.name,
        level: (blueprint as any).level
      })),
      exp: this.exp,
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
      modifiers: this.modifiers.map(modifier => modifier.id),
      expToNextLevel: this.expToNextLevel,
      canLevelup: this.canLevelUp,
      artifacts: {
        weapon: this.artifacts.artifacts.weapon?.id ?? null,
        armor: this.artifacts.artifacts.armor?.id ?? null,
        relic: this.artifacts.artifacts.relic?.id ?? null
      }
    };
  }

  private onInterceptorChange(event: InterceptableEvent) {
    if (event.key === 'maxHp') {
      this.hp.max = this.interceptors.maxHp.getValue(this.blueprint.maxHp, {});
      if (this.isDead) {
        this.game.inputSystem.schedule(() => {
          this.destroy(this);
        });
      }
    }
    if (event.key === 'maxAp') {
      this.ap.max = this.interceptors.maxAp.getValue(this.game.config.MAX_AP, {});
    }
    if (event.key === 'maxMp') {
      this.mp.max = this.interceptors.maxMp.getValue(this.game.config.MAX_MP, {});
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

  get blueprint() {
    return this.blueprintChain[this._level - 1];
  }

  get player() {
    return this.interceptors.player.getValue(this.originalPlayer, {});
  }

  get isActive() {
    return this.game.turnSystem.activeUnit.equals(this);
  }

  get abilityPower() {
    return this.interceptors.abilityPower.getValue(0, {});
  }

  get mpRegen() {
    return this.interceptors.mpRegen.getValue(this.game.config.MP_REGEN_PER_TURN, {});
  }

  canSpendMp(amount: number) {
    return this.mp.current >= amount;
  }

  canSpendAp(amount: number) {
    return this.ap.current >= amount;
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
    return this.blueprint.unitKind === UNIT_KINDS.HERO;
  }

  canBeAttackedBy(unit: Unit): boolean {
    return this.interceptors.canBeAttackTarget.getValue(!this.isDead, { attacker: unit });
  }

  canPlayCard(card: AnyCard): boolean {
    return this.interceptors.canPlayCard.getValue(
      card.canPlay() && this.ap.current < this.apCostPerCard,
      { card }
    );
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

  get initiative() {
    return this.interceptors.initiative.getValue(this.blueprint.initiative, {});
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

  get damage() {
    return this.interceptors.damage.getValue(this.game.config.BASE_ATTACK_DAMAGE, {});
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
      this.remainingMovement > 0 && this.ap.current >= this.apCostPerMovement,
      {}
    );
  }

  canMoveThrough(unit: Unit) {
    return this.interceptors.canMoveThrough.getValue(this.isAlly(unit), { unit });
  }

  get canBeDestroyed(): boolean {
    return this.interceptors.canBeDestroyed.getValue(true, {});
  }

  get apCostPerAttack() {
    return this.interceptors.apCostPerAttack.getValue(
      this.game.config.AP_COST_PER_ATTACK +
        this.attacksPerformedThisTurn * this.game.config.AP_COST_INCREASE_PER_ATTACK,
      {}
    );
  }

  canAttack(unit: Unit): boolean {
    return this.interceptors.canAttack.getValue(
      this.attacksPerformedThisTurn < this.maxAttacksPerTurn &&
        this.ap.current >= this.apCostPerAttack,
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

  canMoveTo(point: Point) {
    if (!this.canMove) return false;
    return this.movement.canMoveTo(point, this.ap.current / this.apCostPerMovement);
  }

  move(to: Point) {
    const path = this.movement.move(to);
    this.ap.remove(this.apCostPerMovement * (path?.distance ?? 0));
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
    return this.movement
      .getAllPossibleMoves(this.ap.current / this.apCostPerMovement)
      .filter(move => {
        const cell = this.game.boardSystem.getCellAt(move.point)!;
        return cell.isWalkable && !cell.unit;
      });
  }

  getDealtDamage(target: Unit) {
    return this.interceptors.damageDealt.getValue(this.damage, {
      target
    });
  }

  getReceivedDamage<T>(amount: number, damage: Damage<T>, from: Unit) {
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
      new UnitReceiveHealEvent({ from: source.unit, amount })
    );
    this.hp.add(amount);
    this.emitter.emit(
      UNIT_EVENTS.AFTER_RECEIVE_HEAL,
      new UnitReceiveHealEvent({ from: source.unit, amount })
    );
  }

  attack(point: Point) {
    this.ap.remove(this.apCostPerAttack);
    this.combat.attack(point);
    this.gainExp(this.game.config.EXP_REWARD_PER_ATTACK);
  }

  canAttackAt(point: Point) {
    if (this.position.equals(point)) {
      return false;
    }
    const target = this.game.unitSystem.getUnitAt(point);
    if (!target) return false;

    if (this.ap.current < this.apCostPerAttack) {
      return false;
    }
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
    this.cardReplacedThisTurn = 0;
    this.ap.setTo(this.ap.max);
    const isFirstTurn = this.game.turnSystem.turnCount === 1;
    if (!isFirstTurn) {
      this.mp.add(this.mpRegen);
      this.gainExp(this.game.config.EXP_REWARD_PER_TURN);
    }
    this.cards.draw(
      isFirstTurn
        ? this.game.config.INITIAL_HAND_SIZE
        : this.game.config.CARDS_DRAWN_PER_TURN
    );
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

  get apCostPerCard() {
    return this.interceptors.apCostPerCard.getValue(
      this.game.config.AP_COST_PER_CARD,
      {}
    );
  }

  playCardAtIndex(index: number) {
    const card = this.cards.getCardAt(index);
    if (!card) return;

    this.playCardFromHand(card);
  }

  draw(amount: number) {
    this.emitter.emit(UNIT_EVENTS.BEFORE_DRAW, new UnitDrawEvent({ amount }));
    this.cards.draw(amount);
    this.emitter.emit(UNIT_EVENTS.AFTER_DRAW, new UnitDrawEvent({ amount }));
  }

  private onBeforePlayFromHand(card: DeckCard) {
    this.emitter.emit(UNIT_EVENTS.BEFORE_PLAY_CARD, new UnitPlayCardEvent({ card }));
    this.mp.remove(card.manaCost);
    this.ap.remove(this.apCostPerCard);
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

  generateCard<T extends CardBlueprint = CardBlueprint>(blueprintId: string) {
    const blueprint = this.game.cardPool[blueprintId] as T;
    const card = this.game.cardFactory<T>(this.game, this, {
      id: this.game.cardIdFactory(blueprint.id, this.id),
      blueprint: blueprint
    });

    return card;
  }

  canReplace() {
    return this.cardReplacedThisTurn < this.game.config.MAX_CARD_REPLACES_PER_TURN;
  }

  replaceCardAtIndex(index: number) {
    this.cards.replaceCardAt(index);
    this.cardReplacedThisTurn++;
  }

  starturn() {
    this.emitter.emit(UNIT_EVENTS.START_TURN, new UnitTurnEvent({}));
  }

  endTurn() {
    this.emitter.emit(UNIT_EVENTS.END_TURN, new UnitTurnEvent({}));
  }

  get exp() {
    return this._exp;
  }

  get level() {
    return this._level;
  }

  get nextBlueprint() {
    return this.blueprintChain[this._level];
  }

  get expToNextLevel() {
    if (!this.nextBlueprint) return 0;
    if (this.blueprint.unitKind === UNIT_KINDS.MINION) return 0;
    if (this.nextBlueprint.unitKind === UNIT_KINDS.MINION) return 0;

    return (
      this.nextBlueprint as HeroBlueprint & { level: Exclude<HeroBlueprint['level'], 1> }
    ).neededExp;
  }

  get canLevelUp() {
    return this.exp >= this.expToNextLevel && isDefined(this.nextBlueprint);
  }

  levelUp() {
    if (!this.canLevelUp) return;

    this.emitter.emit(UNIT_EVENTS.BEFORE_LEVEL_UP, new UnitLevelUpEvent({}));

    this._exp -= this.expToNextLevel;
    this._level += 1;

    this.emitter.emit(UNIT_EVENTS.AFTER_LEVEL_UP, new UnitLevelUpEvent({}));
  }

  gainExp(amount: number) {
    if (!this.nextBlueprint) return;
    this._exp += amount;
  }
}
