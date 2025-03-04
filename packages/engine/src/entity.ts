import type { AnyObject } from '@game/shared';
import type { inferInterceptor, Interceptable } from './utils/interceptable';
import {
  TypedSerializableEvent,
  TypedSerializableEventEmitter
} from './utils/typed-emitter';

export type EmptyEventMap = Record<string, never>;
export type EmptyInterceptables = Record<string, never>;
export type AnyEntity = Entity<AnyObject, AnyObject>;

export class InterceptableEvent extends TypedSerializableEvent<
  { key: string },
  { key: string }
> {
  constructor(payload: { key: string }) {
    super(payload);
  }

  get key() {
    return this.data.key;
  }

  serialize(): { key: string } {
    return this.data;
  }
}

export const INTERCEPTOR_EVENTS = {
  ADD_INTERCEPTOR: 'add_interceptor',
  REMOVE_INTERCEPTOR: 'remove_interceptor'
} as const;

export type InterceptableEventMap = {
  [INTERCEPTOR_EVENTS.ADD_INTERCEPTOR]: InterceptableEvent;
  [INTERCEPTOR_EVENTS.REMOVE_INTERCEPTOR]: InterceptableEvent;
};

export abstract class Entity<
  TE extends Record<Exclude<string, keyof InterceptableEventMap>, any>,
  TI extends Record<string, Interceptable<any, any>>
> {
  readonly id: string;

  protected readonly emitter = new TypedSerializableEventEmitter<
    TE & InterceptableEventMap
  >();

  protected interceptors: TI;

  constructor(id: string, interceptables: TI) {
    this.id = id;
    this.interceptors = interceptables;
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

  equals(e: { id: string }) {
    return this.id == e.id;
  }

  addInterceptor<T extends keyof TI>(
    key: T,
    interceptor: inferInterceptor<TI[T]>,
    priority?: number
  ) {
    this.interceptors[key].add(interceptor, priority);
    // @ts-expect-error
    this.emitter.emit(INTERCEPTOR_EVENTS.ADD_INTERCEPTOR, { key });
    return () => this.removeInterceptor(key, interceptor);
  }

  removeInterceptor<T extends keyof TI>(key: T, interceptor: inferInterceptor<TI[T]>) {
    this.interceptors[key].remove(interceptor);
    // @ts-expect-error
    this.emitter.emit(INTERCEPTOR_EVENTS.REMOVE_INTERCEPTOR, { key });
  }

  shutdown() {
    this.emitter.removeAllListeners();
  }
}
