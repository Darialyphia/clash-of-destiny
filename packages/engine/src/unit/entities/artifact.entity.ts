import type { EmptyObject, Serializable, Values } from '@game/shared';
import { nanoid } from 'nanoid';
import type { ArtifactCard } from '../../card/entities/artifact-card.entity';
import type { Modifier } from '../../modifier/modifier.entity';
import { Entity } from '../../entity';
import type { Game } from '../../game/game';
import { ModifierManager } from '../../modifier/modifier-manager.component';
import { TypedSerializableEvent } from '../../utils/typed-emitter';
import { Interceptable } from '../../utils/interceptable';
import type { Damage } from '../../combat/damage';
import { UNIT_EVENTS } from '../unit-enums';
import { ARTIFACT_KINDS } from '../../card/card.enums';

export const ARTIFACT_EVENTS = {
  EQUIPED: 'equiped',

  BEFORE_DESTROY: 'before_destroy',
  AFTER_DESTROY: 'after_destroy',

  DURABILITY_CHANGE: 'durability_change'
} as const;

export type ArtifactEvent = Values<typeof ARTIFACT_EVENTS>;

export type ArtifactEventMap = {
  [ARTIFACT_EVENTS.EQUIPED]: ArtifactEquipedEvent;

  [ARTIFACT_EVENTS.BEFORE_DESTROY]: ArtifactDestroyEvent;
  [ARTIFACT_EVENTS.AFTER_DESTROY]: ArtifactDestroyEvent;

  [ARTIFACT_EVENTS.DURABILITY_CHANGE]: ArtifactDurabilityChangeEvent;
};

export type ArtifactOptions = {
  card: ArtifactCard;
  unitId: string;
};

export type ArtifactInterceptor = {
  shouldLosedurabilityOnAttack: Interceptable<boolean>;
  shouldLosedurabilityOnDamage: Interceptable<boolean, Damage<any>>;
  maxDurability: Interceptable<number>;
  canLoseDurability: Interceptable<boolean>;
};

const makeInterceptors = (): ArtifactInterceptor => ({
  shouldLosedurabilityOnAttack: new Interceptable(),
  shouldLosedurabilityOnDamage: new Interceptable(),
  maxDurability: new Interceptable(),
  canLoseDurability: new Interceptable()
});

export type SerializedArtifact = {
  id: string;
  entityType: 'artifact';
  card: string;
  modifiers: string[];
};

export class Artifact
  extends Entity<ArtifactEventMap, ArtifactInterceptor>
  implements Serializable<SerializedArtifact>
{
  readonly card: ArtifactCard;

  private unitId: string;

  private modifierManager: ModifierManager<Artifact>;

  private _durability: number;

  private cleanups: Array<() => void> = [];
  constructor(
    protected game: Game,
    options: ArtifactOptions
  ) {
    super(`${options.unitId}-artifact-${nanoid(6)}`, makeInterceptors());
    this.card = options.card;
    this._durability = this.card.durability;
    this.unitId = options.unitId;
    this.modifierManager = new ModifierManager(this);
    this.cleanups.push(
      this.unit.on(UNIT_EVENTS.AFTER_ATTACK, () => {
        if (this.shouldLosedurabilityOnAttack) {
          this.loseDurability(1);
        }
      })
    );
    this.cleanups.push(
      this.unit.on(UNIT_EVENTS.AFTER_RECEIVE_DAMAGE, event => {
        if (this.shouldLosedurabilityOnDamage(event.data.damage)) {
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
      modifiers: this.modifiers.map(modifier => modifier.id)
    };
  }

  get unit() {
    return this.game.unitSystem.getUnitById(this.unitId)!;
  }

  get canLoseDurability() {
    return this.interceptors.canLoseDurability.getValue(true, {});
  }

  get shouldLosedurabilityOnAttack() {
    return this.interceptors.shouldLosedurabilityOnAttack.getValue(
      this.canLoseDurability && this.card.artifactKind === ARTIFACT_KINDS.WEAPON,
      {}
    );
  }

  shouldLosedurabilityOnDamage(damage: Damage<any>) {
    return this.interceptors.shouldLosedurabilityOnDamage.getValue(
      this.canLoseDurability && this.card.artifactKind === ARTIFACT_KINDS.ARMOR,
      damage
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

    return () => this.removeModifier(modifier.id);
  }

  equip() {
    this.emitter.emit(ARTIFACT_EVENTS.EQUIPED, new ArtifactEquipedEvent({}));
  }

  destroy() {
    this.emitter.emit(ARTIFACT_EVENTS.BEFORE_DESTROY, new ArtifactDestroyEvent({}));

    this.unit.artifacts.unequip(this.card.artifactKind);
    this.unit.cards.sendToDiscardPile(this.card);

    this.emitter.emit(ARTIFACT_EVENTS.AFTER_DESTROY, new ArtifactDestroyEvent({}));
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
