import { assert } from '@game/shared';

export class ManaManagerComponent {
  private _amount: number;

  private _maxAmount: number;

  constructor(initialAmount: number, maxAmount: number) {
    this._amount = initialAmount;
    this._maxAmount = maxAmount;
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

  setMaxAmount(amount: number) {
    this._maxAmount = amount;
  }

  get maxAmount() {
    return this._maxAmount;
  }

  get amount() {
    return this._amount;
  }
}
