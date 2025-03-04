export type ManaComponentComponentOptions = {
  initialValue: number;
  max: number;
};

export class ManaComponent {
  private _current: number;
  max: number;

  constructor(options: ManaComponentComponentOptions) {
    this._current = options.initialValue;
    this.max = options.max;
  }

  get current() {
    return this._current;
  }

  get isDead() {
    return this._current === 0;
  }

  setTo(value: number) {
    this._current = Math.min(Math.max(value, 0), this.max);
  }

  add(amount: number) {
    this._current = Math.min(this._current + amount, this.max);
  }

  remove(amount: number) {
    this._current = Math.max(this._current - amount, 0);
  }
}
