import type { EmptyObject, Prettify, Values } from '@game/shared';
import { mapKeys, mapValues } from 'lodash-es';
import type { Input } from '../input/input';
import type { SerializedInput } from '../input/input-system';
import { TypedSerializableEvent } from '../utils/typed-emitter';
import type { PlayerEventMap } from '../player/player.events';
import type { Player, SerializedPlayer } from '../player/player.entity';
import { PLAYER_EVENTS } from '../player/player-enums';
import type { AnyCard } from '../card/entities/card.entity';
import type { CardEventMap } from '../card/card.events';
import type { SerializedUnit, Unit } from '../unit/entities/unit.entity';
import type { UnitEventMap } from '../unit/unit.events';
import { CARD_EVENTS } from '../card/card.enums';
import { UNIT_EVENTS } from '../unit/unit-enums';

import { type Modifier, type SerializedModifier } from '../modifier/modifier.entity';
import type { SpellCard, SerializedSpellCard } from '../card/entities/spell-card.entity';
import type {
  ArtifactCard,
  SerializedArtifactCard
} from '../card/entities/artifact-card.entity';
import {
  ARTIFACT_EVENTS,
  type Artifact,
  type ArtifactEventMap
} from '../player/artifact.entity';
import type { HeroCard, SerializedHeroCard } from '../card/entities/hero-card.entity';
import type {
  MinionCard,
  SerializedMinionCard
} from '../card/entities/minion-card.entity';
import type {
  ShrineCard,
  SerializedShrineCard
} from '../card/entities/shrine-card.entity';
import type { SecretCard } from '../card/entities/secret-card.entity';
import { GAME_PHASE_EVENTS } from './game.enums';
import type { GamePhaseEventMap } from './systems/game-phase.system';
import { InputError } from '../input/input-errors';
import type { SerializedGame } from './game';

export class GameInputEvent extends TypedSerializableEvent<
  { input: Input<any> },
  SerializedInput
> {
  serialize() {
    return this.data.input.serialize() as SerializedInput;
  }
}

export class GameInputQueueFlushedEvent extends TypedSerializableEvent<
  EmptyObject,
  EmptyObject
> {
  serialize() {
    return {};
  }
}

export class GameErrorEvent extends TypedSerializableEvent<
  { error: Error; debugDump: SerializedGame },
  { error: string; isFatal: boolean; debugDump: SerializedGame }
> {
  serialize() {
    return {
      error: this.data.error.message,
      isFatal: !(this.data.error instanceof InputError),
      debugDump: this.data.debugDump
    };
  }
}

export class GameReadyEvent extends TypedSerializableEvent<EmptyObject, EmptyObject> {
  serialize() {
    return {};
  }
}

export class GamePhaseChangeEvent extends TypedSerializableEvent<
  EmptyObject,
  EmptyObject
> {
  serialize() {
    return {};
  }
}

export class GameModifierEvent extends TypedSerializableEvent<
  {
    modifier: Modifier<any, any>;
    eventName: string;
    event: { serialize: () => any };
  },
  { modifier: SerializedModifier; eventName: string; event: any }
> {
  serialize() {
    return {
      modifier: this.data.modifier.serialize(),
      eventName: this.data.eventName,
      event: this.data.event.serialize()
    };
  }
}

export class GameStarEvent<
  T extends Exclude<GameEventName, '*'> = Exclude<GameEventName, '*'>
> extends TypedSerializableEvent<{ e: StarEvent<T> }, SerializedStarEvent> {
  get eventName() {
    return this.data.e.eventName;
  }

  get event() {
    return this.data.e.event;
  }

  serialize() {
    return {
      eventName: this.data.e.eventName,
      event: this.data.e.event.serialize()
    } as any;
  }
}

type GameCardEventSerialized<TCard extends AnyCard> = TCard extends SpellCard
  ? SerializedSpellCard
  : TCard extends HeroCard
    ? SerializedHeroCard
    : TCard extends MinionCard
      ? SerializedMinionCard
      : TCard extends ShrineCard
        ? SerializedShrineCard
        : TCard extends ArtifactCard
          ? SerializedArtifactCard
          : TCard extends SecretCard
            ? SerializedSpellCard
            : never;

type GameCardSerializedResult<
  TCard extends AnyCard,
  TMap extends CardEventMap,
  TEvent extends Values<TMap>
> =
  TEvent extends TypedSerializableEvent<any, any>
    ? ReturnType<TEvent['serialize']> & { card: GameCardEventSerialized<TCard> }
    : never;

export class GameCardEvent<
  TCard extends AnyCard,
  TMap extends CardEventMap,
  TEvent extends Values<TMap> = Values<TMap>,
  TSerialized extends GameCardSerializedResult<
    TCard,
    TMap,
    TEvent
  > = GameCardSerializedResult<TCard, TMap, TEvent>
> extends TypedSerializableEvent<{ card: TCard; event: TEvent }, TSerialized> {
  serialize() {
    if (!(this.data.event instanceof TypedSerializableEvent)) {
      throw new Error('Typescript moment');
    }
    return {
      ...(this.data.event.serialize() as any),
      player: this.data.card.serialize()
    } as TSerialized;
  }
}

type GameCardEventMap = {
  [Event in keyof CardEventMap as `card.${Event}`]: GameCardEvent<
    HeroCard | ShrineCard | MinionCard | SpellCard | ArtifactCard | SecretCard,
    CardEventMap,
    CardEventMap[Event]
  >;
};

export class GamePlayerEvent<
  TEvent extends Values<PlayerEventMap>
> extends TypedSerializableEvent<
  { player: Player; event: TEvent },
  ReturnType<TEvent['serialize']> & { player: SerializedPlayer }
> {
  serialize() {
    return {
      ...(this.data.event.serialize() as any),
      player: this.data.player.serialize()
    } as ReturnType<TEvent['serialize']> & { player: SerializedPlayer };
  }
}

type GamePlayerEventMap = {
  [Event in keyof PlayerEventMap as `player.${Event}`]: GamePlayerEvent<
    PlayerEventMap[Event]
  >;
};

export class GameUnitEvent<
  TEvent extends Values<UnitEventMap>
> extends TypedSerializableEvent<
  { unit: Unit; event: TEvent },
  ReturnType<TEvent['serialize']> & { unit: SerializedUnit }
> {
  serialize() {
    return {
      ...(this.data.event.serialize() as any),
      unit: this.data.unit.serialize()
    } as ReturnType<TEvent['serialize']> & { unit: SerializedUnit };
  }
}

type GameUnitEventMap = {
  [Event in keyof UnitEventMap as `unit.${Event}`]: GameUnitEvent<UnitEventMap[Event]>;
};

export class GameArtifactEvent<
  TEvent extends Values<ArtifactEventMap>
> extends TypedSerializableEvent<
  { artifact: Artifact; event: TEvent },
  ReturnType<TEvent['serialize']> & { artifact: SerializedArtifactCard }
> {
  serialize() {
    return {
      ...(this.data.event.serialize() as any),
      artifact: this.data.artifact.serialize()
    } as ReturnType<TEvent['serialize']> & { artifact: SerializedArtifactCard };
  }
}

type GameArtifactEventMap = {
  [Event in keyof ArtifactEventMap as `artifact.${Event}`]: GameArtifactEvent<
    ArtifactEventMap[Event]
  >;
};

type GameEventsBase = {
  'game.input-start': GameInputEvent;
  'game.input-end': GameInputEvent;
  'game.input-queue-flushed': GameInputQueueFlushedEvent;
  'game.error': GameErrorEvent;
  'game.ready': GameReadyEvent;
  'game.start-battle': GamePhaseChangeEvent;
  'game.end-battle': GamePhaseChangeEvent;
  'game.modifier-event': GameModifierEvent;
  '*': GameStarEvent;
};

export type GameEventMap = Prettify<
  GameEventsBase &
    GamePhaseEventMap &
    GamePlayerEventMap &
    GameCardEventMap &
    GameUnitEventMap &
    GameArtifactEventMap
>;
export type GameEventName = keyof GameEventMap;
export type GameEvent = Values<GameEventMap>;

export type StarEvent<
  T extends Exclude<GameEventName, '*'> = Exclude<GameEventName, '*'>
> = {
  eventName: T;
  event: GameEventMap[T];
};

export type SerializedStarEvent = Values<{
  [Name in Exclude<GameEventName, '*'>]: {
    eventName: Name;
    event: ReturnType<GameEventMap[Name]['serialize']>;
  };
}>;

const makeGlobalEvents = <TDict extends Record<string, string>, TPrefix extends string>(
  eventDict: TDict,
  prefix: TPrefix
) =>
  mapKeys(
    mapValues(eventDict, evt => `${prefix}.${evt}`),
    (value, key) => `${prefix.toUpperCase()}_${key}`
  ) as {
    [Key in string &
      keyof TDict as `${Uppercase<TPrefix>}_${Key}`]: `${TPrefix}.${TDict[Key]}`;
  };

export const GAME_EVENTS = {
  ERROR: 'game.error',
  READY: 'game.ready',
  FLUSHED: 'game.input-queue-flushed',
  INPUT_START: 'game.input-start',
  INPUT_END: 'game.input-end',
  TURN_START: GAME_PHASE_EVENTS.TURN_START,
  TURN_END: GAME_PHASE_EVENTS.TURN_END,
  BEFORE_GAME_PHASE_CHANGE: GAME_PHASE_EVENTS.BEFORE_CHANGE_PHASE,
  AFTER_GAME_PHASE_CHANGE: GAME_PHASE_EVENTS.AFTER_CHANGE_PHASE,
  OVERDRIVE_MODE: GAME_PHASE_EVENTS.OVERDRIVE_MODE,
  START_BATTLE: 'game.start-battle',
  END_BATTLE: 'game.end-battle',
  MODIFIER_EVENT: 'game.modifier-event',
  ...makeGlobalEvents(PLAYER_EVENTS, 'player'),
  ...makeGlobalEvents(UNIT_EVENTS, 'unit'),
  ...makeGlobalEvents(CARD_EVENTS, 'card'),
  ...makeGlobalEvents(ARTIFACT_EVENTS, 'artifact')
} as const satisfies Record<string, keyof GameEventMap>;
