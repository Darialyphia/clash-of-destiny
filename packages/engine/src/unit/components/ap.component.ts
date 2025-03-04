export type ApComponentOptions = {
  initialValue: number;
  max: number;
};

export class ApComponent {
  private _current: number;
  max: number;

  constructor(options: ApComponentOptions) {
    this._current = options.initialValue;
    this.max = options.max;
  }

  get current() {
    return this._current;
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
