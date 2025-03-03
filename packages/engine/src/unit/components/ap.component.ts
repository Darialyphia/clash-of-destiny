export type ApComponentOptions = {
  initialValue: number;
};

export class ApComponent {
  private _current: number;

  constructor(options: ApComponentOptions) {
    this._current = options.initialValue;
  }

  get current() {
    return this._current;
  }

  get isDead() {
    return this._current === 0;
  }

  setTo(value: number, max: number) {
    this._current = Math.min(Math.max(value, 0), max);
  }

  add(amount: number, max: number) {
    this._current = Math.min(this._current + amount, max);
  }

  remove(amount: number) {
    this._current = Math.max(this._current - amount, 0);
  }
}
