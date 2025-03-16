import { isString, type Constructor, type Nullable } from '@game/shared';
import { Modifier, type ModifierTarget } from './modifier.entity';

export class ModifierManager<T extends ModifierTarget> {
  private _modifiers: Modifier<T>[] = [];

  constructor(private target: T) {}

  has(modifierOrId: string | Modifier<T, any> | Constructor<Modifier<T>>) {
    if (modifierOrId instanceof Modifier) {
      return this._modifiers.some(modifier => modifier.equals(modifierOrId));
    } else if (isString(modifierOrId)) {
      return this._modifiers.some(modifier =>
        modifier.equals({ id: modifierOrId } as Modifier<T>)
      );
    } else {
      return this._modifiers.some(modifier => modifier.constructor === modifierOrId);
    }
  }

  get<TArg extends string | Modifier<T, any> | Constructor<Modifier<T>>>(
    modifierOrType: TArg
  ): TArg extends Constructor<Modifier<T>>
    ? Nullable<InstanceType<TArg>>
    : Nullable<Modifier<T>> {
    if (modifierOrType instanceof Modifier) {
      return this._modifiers.find(modifier => modifier.equals(modifierOrType)) as any;
    } else if (isString(modifierOrType)) {
      return this._modifiers.find(
        modifier => modifier.modifierType === modifierOrType
      ) as any;
    } else {
      return this._modifiers.find(
        modifier => modifier.constructor === modifierOrType
      ) as any;
    }
  }

  add(modifier: Modifier<T>) {
    if (this.has(modifier)) {
      this.get(modifier.modifierType)!.reapplyTo(this.target, modifier.stacks);
    } else {
      this._modifiers.push(modifier);
      modifier.applyTo(this.target);
    }
  }

  remove(modifierOrType: string | Modifier<T> | Constructor<Modifier<T>>) {
    const idx = this._modifiers.findIndex(mod => {
      if (modifierOrType instanceof Modifier) {
        return mod.equals(modifierOrType);
      } else if (isString(modifierOrType)) {
        return modifierOrType === mod.modifierType;
      } else {
        return mod.constructor === modifierOrType;
      }
    });
    if (idx < 0) return;

    const [modifier] = this._modifiers.splice(idx, 1);
    modifier.remove();
  }

  get modifiers() {
    return [...this._modifiers];
  }
}
