import type { EmptyObject, Serializable, Values } from '@game/shared';
import { nanoid } from 'nanoid';
import type {
  ArtifactCard,
  SerializedArtifactCard
} from '../../card/entities/artifact-card.entity';
import type { Modifier, SerializedModifier } from '../../modifier/modifier.entity';
import { Entity } from '../../entity';
import type { Game } from '../../game/game';
import { ModifierManager } from '../../modifier/modifier-manager.component';
import { TypedSerializableEvent } from '../../utils/typed-emitter';

export const ARTIFACT_EVENTS = {
  EQUIPED: 'equiped',

  BEFORE_DESTROY: 'before_destroy',
  AFTER_DESTROY: 'after_destroy'
} as const;

export type ArtifactEvent = Values<typeof ARTIFACT_EVENTS>;

export type ArtifactEventMap = {
  [ARTIFACT_EVENTS.EQUIPED]: ArtifactEquipedEvent;

  [ARTIFACT_EVENTS.BEFORE_DESTROY]: ArtifactDestroyEvent;
  [ARTIFACT_EVENTS.AFTER_DESTROY]: ArtifactDestroyEvent;
};

export type ArtifactOptions = {
  card: ArtifactCard;
  unitId: string;
};

export type ArtifactInterceptor = EmptyObject;

export type SerializedArtifact = {
  id: string;
  card: SerializedArtifactCard;
  modifiers: SerializedModifier[];
};

export class Artifact
  extends Entity<ArtifactEventMap, ArtifactInterceptor>
  implements Serializable<SerializedArtifact>
{
  readonly card: ArtifactCard;

  private unitId: string;

  private modifierManager: ModifierManager<Artifact>;

  constructor(
    protected game: Game,
    options: ArtifactOptions
  ) {
    super(`${options.unitId}-artifact-${nanoid(6)}`, {});
    this.card = options.card;
    this.unitId = options.unitId;
    this.modifierManager = new ModifierManager(this);
  }

  serialize() {
    return {
      id: this.id,
      card: this.card.serialize(),
      modifiers: this.modifiers.map(modifier => modifier.serialize())
    };
  }

  get unit() {
    return this.game.unitSystem.getUnitById(this.unitId)!;
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

  addModifier(modifier: Modifier<Artifact>) {
    this.modifierManager.add(modifier);

    return () => this.removeModifier(modifier.id);
  }

  equip() {
    this.emitter.emit(ARTIFACT_EVENTS.EQUIPED, new ArtifactEquipedEvent({}));
  }

  destroy() {
    this.emitter.emit(ARTIFACT_EVENTS.BEFORE_DESTROY, new ArtifactDestroyEvent({}));

    this.unit.unequipArtifact(this.card.artifactKind);

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
