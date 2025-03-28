import type { AnyObject } from '@game/shared';

export type Interceptor<TValue, TContext extends AnyObject> = (
  value: Readonly<TValue>,
  ctx: Readonly<TContext>
) => TValue;

export type inferInterceptor<T> =
  T extends Interceptable<infer Value, infer Ctx> ? Interceptor<Value, Ctx> : never;

export type inferInterceptorValue<T> =
  T extends Interceptable<infer Value, any> ? Value : never;

export type inferInterceptorCtx<T> =
  T extends Interceptable<any, infer Ctx> ? Ctx : never;

export class Interceptable<TValue, TContext extends AnyObject = Record<string, never>> {
  listeners: { interceptor: Interceptor<TValue, TContext>; priority: number }[] = [];

  add(interceptor: Interceptor<TValue, TContext>, priority = 1) {
    this.listeners.push({ interceptor, priority });
  }

  remove(interceptor: Interceptor<TValue, TContext>) {
    const idx = this.listeners.findIndex(el => el.interceptor === interceptor);
    if (idx < 0) return;

    this.listeners.splice(idx, 1);
  }

  clear() {
    this.listeners = [];
  }

  getValue(initialValue: TValue, ctx: Readonly<TContext>) {
    return this.listeners
      .sort((a, b) => a.priority - b.priority)
      .reduce((value, listener) => listener.interceptor(value, ctx), initialValue);
  }
}
