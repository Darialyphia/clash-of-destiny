import type { EmptyObject } from '@game/shared';
import type { PLAYER_EVENTS } from './player-enums';
import { TypedSerializableEvent } from '../utils/typed-emitter';

export class PlayerDeployEvent extends TypedSerializableEvent<EmptyObject, EmptyObject> {
  serialize() {
    return {};
  }
}
export type PlayerEventMap = {
  [PLAYER_EVENTS.DEPLOY]: PlayerDeployEvent;
};
