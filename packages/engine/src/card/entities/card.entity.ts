import { type JSONObject } from '@game/shared';
import { Entity } from '../../entity';
import type { Game } from '../../game/game';
import type { CardBlueprint } from '../card-blueprint';
import { CARD_EVENTS, type CardKind, type Rarity } from '../card.enums';
import { CardAddtoHandEvent, type CardEventMap } from '../card.events';
import { KeywordManagerComponent } from '../components/keyword-manager.component';
import type { Modifier } from '../../modifier/modifier.entity';
import { ModifierManager } from '../../modifier/modifier-manager.component';
import type { Unit } from '../../unit/entities/unit.entity';

export type CardOptions<T extends CardBlueprint = CardBlueprint> = {
  id: string;
  blueprint: T;
};

export type AnyCard = Card<any, any, any, any>;

export type SerializedCard = {
  id: string;
  blueprintId: string;
  description: string;
  name: string;
  kind: CardKind;
  setId: string;
  rarity: Rarity;
};

export abstract class Card<
  TSerialized extends JSONObject,
  TEventMap extends CardEventMap,
  TInterceptors extends Record<string, any> = Record<string, any>,
  TBlueprint extends CardBlueprint = CardBlueprint
> extends Entity<TEventMap, TInterceptors> {
  protected game: Game;

  blueprint: TBlueprint;

  unit: Unit;

  protected keywordManager = new KeywordManagerComponent();

  protected modifierManager: ModifierManager<AnyCard>;

  constructor(game: Game, unit: Unit, interceptors: TInterceptors, options: CardOptions) {
    super(options.id, interceptors);
    this.game = game;
    this.unit = unit;
    // @ts-expect-error
    this.blueprint = options.blueprint;
    this.modifierManager = new ModifierManager(this);
  }

  get blueprintId() {
    return this.blueprint.id;
  }

  get kind() {
    return this.blueprint.kind;
  }

  get name() {
    return this.blueprint.name;
  }

  get description() {
    return this.blueprint.description;
  }

  get rarity() {
    return this.blueprint.rarity;
  }

  get keywords() {
    return this.keywordManager.keywords;
  }

  get addKeyword() {
    return this.keywordManager.add.bind(this.keywordManager);
  }

  get removeKeyword() {
    return this.keywordManager.remove.bind(this.keywordManager);
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

  addModifier(modifier: Modifier<AnyCard>) {
    this.modifierManager.add(modifier);

    return () => this.removeModifier(modifier.id);
  }

  addtoHand() {
    this.emitter.emit(CARD_EVENTS.ADD_TO_HAND, new CardAddtoHandEvent({}));
  }

  discard() {
    this.emitter.emit(CARD_EVENTS.DISCARD, new CardAddtoHandEvent({}));
  }

  replace() {
    this.emitter.emit(CARD_EVENTS.REPLACE, new CardAddtoHandEvent({}));
  }

  abstract canPlay(): boolean;

  abstract play(): void;

  abstract serialize(): TSerialized;

  shutdown() {
    this.emitter.removeAllListeners();
  }
}
