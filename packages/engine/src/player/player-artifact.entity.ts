import { nanoid } from 'nanoid';
import type { EmptyObject, Serializable, Values } from '@game/shared';
import { TypedSerializableEvent } from '../utils/typed-emitter';
import { Entity } from '../entity';
import type { Game } from '../game/game';
import type {
  ArtifactCard,
  SerializedArtifactCard
} from '../card/entities/artifact-card.entity';
import { Interceptable } from '../utils/interceptable';
import { UNIT_EVENTS } from '../unit/unit-enums';
import type { UnitReceiveDamageEvent } from '../unit/unit.events';
import { ModifierManager } from '../modifier/modifier-manager.component';
import type { Modifier, SerializedModifier } from '../modifier/modifier.entity';

export const ARTIFACT_EVENTS = {
  EQUIPED: 'equiped',

  BEFORE_DURABILITY_CHANGE: 'before_durability_change',
  AFTER_DURABILITY_CHANGE: 'after_durability_change',

  BEFORE_DESTROY: 'before_destroy',
  AFTER_DESTROY: 'after_destroy'
} as const;

export type ArtifactEvent = Values<typeof ARTIFACT_EVENTS>;

export type ArtifactEventMap = {
  [ARTIFACT_EVENTS.EQUIPED]: ArtifactEquipedEvent;

  [ARTIFACT_EVENTS.BEFORE_DURABILITY_CHANGE]: ArtifactBeforeDurabilityChangeEvent;
  [ARTIFACT_EVENTS.AFTER_DURABILITY_CHANGE]: ArtifactAfterDurabilityChangeEvent;

  [ARTIFACT_EVENTS.BEFORE_DESTROY]: ArtifactDestroyEvent;
  [ARTIFACT_EVENTS.AFTER_DESTROY]: ArtifactDestroyEvent;
};

export type PlayerArtifactOptions = {
  card: ArtifactCard;
  playerId: string;
};

const makeInterceptors = () => {
  return {
    shouldLoseDurabilityOnGeneralDamage: new Interceptable<boolean>()
  };
};

export type PlayerArtifactInterceptor = ReturnType<typeof makeInterceptors>;

export type SerializedPlayerArtifact = {
  id: string;
  card: SerializedArtifactCard;
  durability: number;
  maxDurability: number;
  modifiers: SerializedModifier[];
};

export class PlayerArtifact
  extends Entity<ArtifactEventMap, PlayerArtifactInterceptor>
  implements Serializable<SerializedPlayerArtifact>
{
  readonly card: ArtifactCard;

  private playerId: string;

  private modifierManager: ModifierManager<PlayerArtifact>;

  durability: number;

  constructor(
    protected game: Game,
    options: PlayerArtifactOptions
  ) {
    super(`${options.playerId}-artifact-${nanoid(6)}`, makeInterceptors());
    this.card = options.card;
    this.durability = this.card.durability;
    this.playerId = options.playerId;
    this.modifierManager = new ModifierManager(this);
  }

  serialize() {
    return {
      id: this.id,
      card: this.card.serialize(),
      durability: this.durability,
      maxDurability: this.maxDurability,
      modifiers: this.modifiers.map(modifier => modifier.serialize())
    };
  }

  get maxDurability() {
    return this.card.durability;
  }

  get player() {
    return this.game.playerSystem.getPlayerById(this.playerId)!;
  }

  get shouldLoseDurabilityOnGeneralDamage(): boolean {
    return this.interceptors.shouldLoseDurabilityOnGeneralDamage.getValue(true, {});
  }

  private onGeneralDamageTaken(event: UnitReceiveDamageEvent) {
    if (event.data.damage.getFinalAmount(this.player.general) === 0) return;
    if (this.shouldLoseDurabilityOnGeneralDamage) {
      this.loseDurability();
    }
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

  addModifier(modifier: Modifier<PlayerArtifact>) {
    this.modifierManager.add(modifier);

    return () => this.removeModifier(modifier.id);
  }

  equip() {
    this.player.general.on(
      UNIT_EVENTS.AFTER_RECEIVE_DAMAGE,
      this.onGeneralDamageTaken.bind(this)
    );
    this.emitter.emit(ARTIFACT_EVENTS.EQUIPED, new ArtifactEquipedEvent({}));
  }

  destroy() {
    this.emitter.emit(ARTIFACT_EVENTS.BEFORE_DESTROY, new ArtifactDestroyEvent({}));

    this.player.general.off(
      UNIT_EVENTS.AFTER_RECEIVE_DAMAGE,
      this.onGeneralDamageTaken.bind(this)
    );
    this.player.unequipArtifact(this);

    this.emitter.emit(ARTIFACT_EVENTS.AFTER_DESTROY, new ArtifactDestroyEvent({}));
  }

  loseDurability() {
    this.emitter.emit(
      ARTIFACT_EVENTS.BEFORE_DURABILITY_CHANGE,
      new ArtifactBeforeDurabilityChangeEvent({})
    );
    const current = this.durability;
    this.durability--;
    this.emitter.emit(
      ARTIFACT_EVENTS.AFTER_DURABILITY_CHANGE,
      new ArtifactAfterDurabilityChangeEvent({
        oldDurability: current,
        newDurability: this.durability
      })
    );

    if (this.durability === 0) {
      this.destroy();
    }
  }

  gainDurability() {
    this.emitter.emit(
      ARTIFACT_EVENTS.BEFORE_DURABILITY_CHANGE,
      new ArtifactBeforeDurabilityChangeEvent({})
    );
    const current = this.durability;
    this.durability = Math.min(this.durability + 1, this.maxDurability);
    this.emitter.emit(
      ARTIFACT_EVENTS.AFTER_DURABILITY_CHANGE,
      new ArtifactAfterDurabilityChangeEvent({
        oldDurability: current,
        newDurability: this.durability
      })
    );
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

export class ArtifactBeforeDurabilityChangeEvent extends TypedSerializableEvent<
  EmptyObject,
  EmptyObject
> {
  serialize() {
    return {};
  }
}

export class ArtifactAfterDurabilityChangeEvent extends TypedSerializableEvent<
  { oldDurability: number; newDurability: number },
  { oldDurability: number; newDurability: number }
> {
  serialize() {
    return {
      oldDurability: this.data.oldDurability,
      newDurability: this.data.newDurability
    };
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
