import {
  assert,
  type BetterOmit,
  type Constructor,
  type EmptyObject,
  type Serializable,
  type Values
} from '@game/shared';
import type { ModifierMixin } from './modifier-mixin';
import type { AnyCard } from '../card/entities/card.entity';
import { Entity } from '../entity';
import type { Game } from '../game/game';
import { TypedSerializableEvent } from '../utils/typed-emitter';
import { GAME_EVENTS, GameModifierEvent } from '../game/game.events';

export type ModifierInfos<TCustomEvents extends Record<string, any>> =
  TCustomEvents extends EmptyObject
    ? {
        name?: string;
        description?: string;
        customEventNames?: never;
      }
    : {
        name?: string;
        description?: string;
        customEventNames: TCustomEvents;
      };

export type ModifierOptions<
  T extends ModifierTarget,
  TCustomEvents extends Record<string, any>
> = ModifierInfos<TCustomEvents> & {
  mixins: ModifierMixin<T>[];
} & (
    | {
        stackable: true;
        initialStacks: number;
      }
    | {
        stackable: false;
      }
  );

class ModifierLifecycleEvent extends TypedSerializableEvent<EmptyObject, EmptyObject> {
  serialize() {
    return {};
  }
}

export const MODIFIER_EVENTS = {
  BEFORE_APPLIED: 'before_applied',
  AFTER_APPLIED: 'after_applied',
  BEFORE_REAPPLIED: 'before_reapplied',
  AFTER_REAPPLIED: 'after_reapplied',
  BEFORE_REMOVED: 'before_removed',
  AFTER_REMOVED: 'after_removed'
} as const;

export type ModifierEventMap = {
  [MODIFIER_EVENTS.BEFORE_APPLIED]: ModifierLifecycleEvent;
  [MODIFIER_EVENTS.AFTER_APPLIED]: ModifierLifecycleEvent;
  [MODIFIER_EVENTS.BEFORE_REAPPLIED]: ModifierLifecycleEvent;
  [MODIFIER_EVENTS.AFTER_REAPPLIED]: ModifierLifecycleEvent;
  [MODIFIER_EVENTS.BEFORE_REMOVED]: ModifierLifecycleEvent;
  [MODIFIER_EVENTS.AFTER_REMOVED]: ModifierLifecycleEvent;
};

export type ModifierEvent = Values<typeof MODIFIER_EVENTS>;

export type ModifierTarget = {
  id: string;
  removeModifier(modifierOrId: string | Modifier<any> | Constructor<Modifier<any>>): void;
};

export type SerializedModifier = {
  id: string;
  stacks: number;
  name?: string;
  description?: string;
  targetId: string;
  sourceId: string;
};

export class Modifier<
    T extends ModifierTarget,
    TEventsMap extends ModifierEventMap = ModifierEventMap
  >
  extends Entity<TEventsMap, EmptyObject>
  implements Serializable<SerializedModifier>
{
  private mixins: ModifierMixin<T>[];

  protected game: Game;

  readonly source: AnyCard;

  protected _stacks: number;

  protected stackable: boolean;

  protected _target!: T;

  private isApplied = false;

  readonly infos: { name?: string; description?: string };

  constructor(
    id: string,
    game: Game,
    source: AnyCard,
    options: ModifierOptions<
      T,
      Record<Exclude<keyof TEventsMap, keyof ModifierEventMap>, boolean>
    >
  ) {
    super(id, {});
    this.game = game;
    this.source = source;
    this.mixins = options.mixins;
    this.stackable = options.stackable;
    this._stacks = options.stackable ? options.initialStacks : -1;
    this.infos = {
      description: options.description,
      name: options.name
    };

    [
      ...Object.values(MODIFIER_EVENTS),
      ...Object.keys(options.customEventNames ?? {})
    ].forEach(eventName => {
      // @ts-expect-error we cant know the name of custom events for this modifier
      this.on(eventName, event => {
        this.game.emit(
          GAME_EVENTS.MODIFIER_EVENT,
          new GameModifierEvent({ modifier: this, eventName, event: event as any })
        );
      });
    });
  }

  addMixin(mixin: ModifierMixin<T>) {
    this.mixins.push(mixin);
    if (this.isApplied) {
      mixin.onApplied(this._target, this);
    }
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

  get target() {
    return this._target;
  }

  get stacks() {
    return this._stacks ?? 0;
  }

  addStacks(amount: number) {
    assert(this.stackable, `Modifier ${this.id} is not stackable`);
    this._stacks += amount;
  }

  removeStacks(amount: number) {
    assert(this.stackable, `Modifier ${this.id} is not stackable`);
    this._stacks -= amount;
    if (this._stacks === 0) {
      this._target.removeModifier(this.id);
    }
  }

  applyTo(target: T) {
    this.emitter.emit(MODIFIER_EVENTS.BEFORE_APPLIED, new ModifierLifecycleEvent({}));
    this._target = target;
    this.mixins.forEach(mixin => {
      mixin.onApplied(target, this);
    });
    this.isApplied = true;
    this.emitter.emit(MODIFIER_EVENTS.AFTER_APPLIED, new ModifierLifecycleEvent({}));
  }

  reapplyTo(target: T, newStacks?: number) {
    this.emitter.emit(MODIFIER_EVENTS.BEFORE_REAPPLIED, new ModifierLifecycleEvent({}));
    if (this.stackable) {
      this._stacks += newStacks ?? 1;
    }

    this.mixins.forEach(mixin => {
      mixin.onReapplied(target, this);
    });
    this.emitter.emit(MODIFIER_EVENTS.AFTER_REAPPLIED, new ModifierLifecycleEvent({}));
  }

  remove() {
    this.emitter.emit(MODIFIER_EVENTS.BEFORE_REMOVED, new ModifierLifecycleEvent({}));
    this.mixins.forEach(mixin => {
      mixin.onRemoved(this._target, this);
    });
    this.isApplied = false;
    this.emitter.emit(MODIFIER_EVENTS.AFTER_REMOVED, new ModifierLifecycleEvent({}));
  }

  serialize(): SerializedModifier {
    return {
      id: this.id,
      stacks: this.stacks,
      name: this.infos.name,
      description: this.infos.description,
      targetId: this._target.id,
      sourceId: this.source.id
    };
  }
}
