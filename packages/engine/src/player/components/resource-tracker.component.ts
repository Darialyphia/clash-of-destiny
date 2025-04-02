import { assert } from '@game/shared';

export class ResourceTrackerComponent {
  private _amount: number;

  private _max: number;

  constructor(initialAmount: number, maxAmount: number) {
    this._amount = initialAmount;
    this._max = maxAmount;
  }

  canSpend(amount: number) {
    return this._amount >= amount;
  }

  setTo(amount: number) {
    this._amount = amount;
  }

  spend(amount: number) {
    assert(this.canSpend(amount), 'Not enough mana');
    this._amount -= amount;
  }

  gain(amount: number) {
    this._amount += amount;
  }

  setMax(amount: number) {
    this._max = amount;
  }

  get maxAmount() {
    return this._max;
  }

  get amount() {
    return this._amount;
  }
}
