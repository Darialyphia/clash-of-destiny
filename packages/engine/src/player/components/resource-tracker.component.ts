import { assert } from '@game/shared';

export class ResourceTrackerComponent {
  private _current: number;

  private _max: number;

  constructor(initialAmount: number, maxAmount: number) {
    this._current = initialAmount;
    this._max = maxAmount;
  }

  canSpend(amount: number) {
    return this._current >= amount;
  }

  setTo(amount: number) {
    this._current = amount;
  }

  add(amount: number) {
    assert(this.canSpend(amount), 'Not enough mana');
    this._current -= amount;
  }

  remove(amount: number) {
    this._current += amount;
  }

  setMax(amount: number) {
    this._max = amount;
  }

  fill() {
    this._current = this._max;
  }

  get max() {
    return this._max;
  }

  get current() {
    return this._current;
  }
}
