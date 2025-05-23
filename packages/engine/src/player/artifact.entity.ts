import {
  assert,
  isDefined,
  type EmptyObject,
  type Serializable,
  type Values
} from '@game/shared';
import { nanoid } from 'nanoid';
import type { ArtifactCard } from '../card/entities/artifact-card.entity';
import type { Modifier } from '../modifier/modifier.entity';
import { Entity } from '../entity';
import type { Game } from '../game/game';
import { ModifierManager } from '../modifier/modifier-manager.component';
import { TypedSerializableEvent } from '../utils/typed-emitter';
import { Interceptable } from '../utils/interceptable';
import type { Damage } from '../combat/damage';
import { UNIT_EVENTS } from '../unit/unit-enums';
import type { Ability } from '../card/card-blueprint';
import { ArtifactAbilityNotFoundError } from './player-errors';
import type { Unit } from '../unit/entities/unit.entity';

export const ARTIFACT_EVENTS = {
  EQUIPED: 'equiped',

  BEFORE_DESTROY: 'before_destroy',
  AFTER_DESTROY: 'after_destroy',

  DURABILITY_CHANGE: 'durability_change',

  BEFORE_USE_ABILITY: 'before_use_ability',
  AFTER_USE_ABILITY: 'after_use_ability',

  BEFORE_EXHAUST: 'before_exhaust',
  AFTER_EXHAUST: 'after_exhaust',

  BEFORE_WAKE_UP: 'before_wake_up',
  AFTER_WAKE_UP: 'after_wake_up'
} as const;

export type ArtifactEvent = Values<typeof ARTIFACT_EVENTS>;

export type ArtifactEventMap = {
  [ARTIFACT_EVENTS.EQUIPED]: ArtifactEquipedEvent;

  [ARTIFACT_EVENTS.BEFORE_DESTROY]: ArtifactDestroyEvent;
  [ARTIFACT_EVENTS.AFTER_DESTROY]: ArtifactDestroyEvent;

  [ARTIFACT_EVENTS.DURABILITY_CHANGE]: ArtifactDurabilityChangeEvent;

  [ARTIFACT_EVENTS.BEFORE_USE_ABILITY]: ArtifactUseAbilityEvent;
  [ARTIFACT_EVENTS.AFTER_USE_ABILITY]: ArtifactUseAbilityEvent;

  [ARTIFACT_EVENTS.BEFORE_EXHAUST]: ArtifactExhaustEvent;
  [ARTIFACT_EVENTS.AFTER_EXHAUST]: ArtifactExhaustEvent;
  [ARTIFACT_EVENTS.BEFORE_WAKE_UP]: ArtifactWakeUpEvent;
  [ARTIFACT_EVENTS.AFTER_WAKE_UP]: ArtifactWakeUpEvent;
};

export type ArtifactOptions = {
  card: ArtifactCard;
};

export type ArtifactInterceptor = {
  shouldLosedurabilityOnAttack: Interceptable<boolean, Unit>;
  shouldLosedurabilityOnDamage: Interceptable<boolean, Damage<any>>;
  maxDurability: Interceptable<number>;
  canLoseDurability: Interceptable<boolean>;
  canUseAbility: Interceptable<boolean, { ability: Ability<ArtifactCard> }>;
};

const makeInterceptors = (): ArtifactInterceptor => ({
  shouldLosedurabilityOnAttack: new Interceptable(),
  shouldLosedurabilityOnDamage: new Interceptable(),
  maxDurability: new Interceptable(),
  canLoseDurability: new Interceptable(),
  canUseAbility: new Interceptable()
});

export type SerializedArtifact = {
  id: string;
  entityType: 'artifact';
  card: string;
  modifiers: string[];
  durability: number;
  maxDurability: number;
  isExhausted: boolean;
  abilities: Array<{
    id: string;
    manaCost: number;
    label: string;
    canUse: boolean;
  }>;
};

export class Artifact
  extends Entity<ArtifactEventMap, ArtifactInterceptor>
  implements Serializable<SerializedArtifact>
{
  readonly card: ArtifactCard;

  private modifierManager: ModifierManager<Artifact>;

  private _durability: number;

  private _isExhausted = false;

  private cleanups: Array<() => void> = [];
  constructor(
    protected game: Game,
    options: ArtifactOptions
  ) {
    super(`${options.card.player.id}-artifact-${nanoid(6)}`, makeInterceptors());
    this.card = options.card;
    this._durability = this.card.durability;
    this.modifierManager = new ModifierManager(this);

    this.cleanups.push(
      this.player.hero.on(UNIT_EVENTS.AFTER_RECEIVE_DAMAGE, event => {
        if (event.data.damage.getFinalAmount(this.player.hero) <= 0) return;
        if (this.shouldLosedurabilityOnDamage(event.data.damage)) {
          this.loseDurability(1);
        }
      }),
      this.player.hero.on(UNIT_EVENTS.AFTER_ATTACK, event => {
        const target = this.game.unitSystem.getUnitAt(event.data.target);
        if (!target) return;
        if (this.shouldLoseDurabilityOnAttack(target)) {
          this.loseDurability(1);
        }
      })
    );
  }

  serialize() {
    return {
      id: this.id,
      entityType: 'artifact' as const,
      card: this.card.id,
      modifiers: this.modifiers.map(modifier => modifier.id),
      durability: this.durability,
      maxDurability: this.maxDurability,
      isExhausted: this.isExhausted,
      abilities: this.card.abilities
        .filter(ability => !ability.isCardAbility)
        .map(ability => ({
          id: ability.id,
          manaCost: ability.manaCost,
          label: ability.label,
          canUse: this.canUseAbiliy(ability.id)
        }))
    };
  }

  get player() {
    return this.card.player;
  }

  get canLoseDurability() {
    return this.interceptors.canLoseDurability.getValue(true, {});
  }

  shouldLosedurabilityOnDamage(damage: Damage<any>) {
    if (!this.canLoseDurability) return false;
    return this.interceptors.shouldLosedurabilityOnDamage.getValue(true, damage);
  }

  shouldLoseDurabilityOnAttack(target: Unit) {
    if (!this.canLoseDurability) return false;
    return this.interceptors.shouldLosedurabilityOnAttack.getValue(false, target);
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

  get durability() {
    return this._durability;
  }

  get maxDurability() {
    return this.interceptors.maxDurability.getValue(this.card.durability, {});
  }

  get modifiers() {
    return this.modifierManager.modifiers;
  }

  gainDurability(amount: number) {
    const previousDurability = this.durability;
    this._durability = Math.min(this.maxDurability, this._durability + amount);
    this.emitter.emit(
      ARTIFACT_EVENTS.DURABILITY_CHANGE,
      new ArtifactDurabilityChangeEvent({
        durability: this.durability,
        previousDurability
      })
    );
  }

  loseDurability(amount: number) {
    const previousDurability = this.durability;
    this._durability = Math.max(0, this._durability - amount);
    this.emitter.emit(
      ARTIFACT_EVENTS.DURABILITY_CHANGE,
      new ArtifactDurabilityChangeEvent({
        durability: this.durability,
        previousDurability
      })
    );
    if (this.durability === 0) {
      this.destroy();
    }
  }

  addModifier(modifier: Modifier<Artifact>) {
    this.modifierManager.add(modifier);

    return () => this.removeModifier(modifier);
  }

  equip() {
    this.emitter.emit(ARTIFACT_EVENTS.EQUIPED, new ArtifactEquipedEvent({}));
  }

  destroy() {
    this.emitter.emit(ARTIFACT_EVENTS.BEFORE_DESTROY, new ArtifactDestroyEvent({}));

    this.player.artifacts.unequip(this);
    this.player.cards.sendToDiscardPile(this.card);

    this.emitter.emit(ARTIFACT_EVENTS.AFTER_DESTROY, new ArtifactDestroyEvent({}));
    for (const modifier of this.modifiers) {
      this.removeModifier(modifier);
    }
  }

  get isExhausted() {
    return this._isExhausted;
  }

  exhaust() {
    this.emitter.emit(ARTIFACT_EVENTS.BEFORE_EXHAUST, new ArtifactExhaustEvent({}));
    this._isExhausted = true;
    this.emitter.emit(ARTIFACT_EVENTS.AFTER_EXHAUST, new ArtifactExhaustEvent({}));
  }

  wakeUp() {
    this.emitter.emit(ARTIFACT_EVENTS.BEFORE_WAKE_UP, new ArtifactWakeUpEvent({}));
    this._isExhausted = false;
    this.emitter.emit(ARTIFACT_EVENTS.AFTER_WAKE_UP, new ArtifactWakeUpEvent({}));
  }

  canUseAbiliy(id: string) {
    const ability = this.card.abilities.find(ability => ability.id === id);
    assert(isDefined(ability), new ArtifactAbilityNotFoundError());

    return this.interceptors.canUseAbility.getValue(
      !this.isExhausted && this.card.canUseAbiliy(id),
      { ability: ability }
    );
  }

  useAbility(id: string) {
    this.card.useAbility(id, {
      onBeforeUse: () => {
        this.emitter.emit(
          ARTIFACT_EVENTS.BEFORE_USE_ABILITY,
          new ArtifactUseAbilityEvent({})
        );
      },
      onAfterUse: ability => {
        if (ability.shouldExhaust) {
          this.exhaust();
        }
        this.emitter.emit(
          ARTIFACT_EVENTS.AFTER_USE_ABILITY,
          new ArtifactUseAbilityEvent({})
        );
      }
    });
  }
}

export class ArtifactEquipedEvent extends TypedSerializableEvent<
  EmptyObject,
  EmptyObject
> {
  serialize() {
    return {};
  }
}

export class ArtifactDestroyEvent extends TypedSerializableEvent<
  EmptyObject,
  EmptyObject
> {
  serialize() {
    return {};
  }
}

export class ArtifactDurabilityChangeEvent extends TypedSerializableEvent<
  { durability: number; previousDurability: number },
  { durability: number; previousDurability: number }
> {
  serialize() {
    return {
      durability: this.data.durability,
      previousDurability: this.data.previousDurability
    };
  }
}

export class ArtifactUseAbilityEvent extends TypedSerializableEvent<
  EmptyObject,
  EmptyObject
> {
  serialize() {
    return {};
  }
}

export class ArtifactExhaustEvent extends TypedSerializableEvent<
  EmptyObject,
  EmptyObject
> {
  serialize() {
    return {};
  }
}
export class ArtifactWakeUpEvent extends TypedSerializableEvent<
  EmptyObject,
  EmptyObject
> {
  serialize() {
    return {};
  }
}
